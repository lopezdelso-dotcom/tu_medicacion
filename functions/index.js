const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {onSchedule}=require("firebase-functions/v2/scheduler");
const {defineSecret}=require("firebase-functions/params");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore,FieldValue}=require("firebase-admin/firestore");
const {getStorage}=require("firebase-admin/storage");
const {getMessaging}=require("firebase-admin/messaging");
const {DocumentProcessorServiceClient}=require("@google-cloud/documentai");
const {google}=require("googleapis");
const crypto=require("crypto");

initializeApp();

const gmailClientId=defineSecret("GMAIL_CLIENT_ID");
const gmailClientSecret=defineSecret("GMAIL_CLIENT_SECRET");
const gmailRefreshToken=defineSecret("GMAIL_REFRESH_TOKEN");
const appUrl="https://mi-medicacion-senior-lopez.web.app";
const appFromEmail="informacion.tu.medicacion@gmail.com";

function madridDateParts(date=new Date()){
  const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
    timeZone:"Europe/Madrid",weekday:"short",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false
  }).formatToParts(date).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
  const weekMap={Mon:"mon",Tue:"tue",Wed:"wed",Thu:"thu",Fri:"fri",Sat:"sat",Sun:"sun"};
  return {iso:`${parts.year}-${parts.month}-${parts.day}`,weekday:weekMap[parts.weekday]||"",minutes:Number(parts.hour)*60+Number(parts.minute)};
}
function dateOnlyValue(value){
  if(!value)return "";
  if(typeof value==="string")return value.slice(0,10);
  if(value.toDate)return value.toDate().toISOString().slice(0,10);
  return "";
}
function isMedicineActiveForDate(medicine,iso,weekday){
  if(!medicine||medicine.confirmed===false)return false;
  const start=dateOnlyValue(medicine.startDate);
  const end=dateOnlyValue(medicine.endDate);
  const deleted=dateOnlyValue(medicine.deletedAt);
  if(start&&iso<start)return false;
  if(end&&iso>end)return false;
  if(deleted&&iso>=deleted)return false;
  const days=medicine.schedule?.days;
  if(Array.isArray(days)&&days.length&&!days.includes(weekday))return false;
  return true;
}
function reminderMeals(medicine){
  const meals=medicine.schedule?.meals;
  if(Array.isArray(meals)&&meals.length)return meals.filter(meal=>meal?.time);
  if(medicine.time)return [{key:"dose",label:"Toma",time:medicine.time}];
  return [];
}
function intakeDocId(iso,meal,medicineId){
  return `${iso}_${meal.key||meal.label||"dose"}_${medicineId}`;
}
function shortMedicineName(name=""){
  const tokens=String(name).trim().split(/\s+/).filter(Boolean);
  const firstDose=tokens.findIndex(token=>/^\d/.test(token));
  return tokens.slice(0,firstDose>0?Math.min(firstDose+2,tokens.length):Math.min(4,tokens.length)).join(" ")||String(name).trim();
}

exports.sendMedicationReminders=onSchedule({region:"europe-west1",schedule:"every 5 minutes",timeZone:"Europe/Madrid"},async()=>{
  const db=getFirestore(),messaging=getMessaging(),now=madridDateParts(),windowStart=now.minutes+5,windowEnd=now.minutes+10;
  const users=await db.collection("users").where("status","==","approved").get();
  for(const userDoc of users.docs){
    const profile=userDoc.data();
    if(profile.role!=="user"||profile.remindersEnabled!==true)continue;
    const tokensSnap=await userDoc.ref.collection("notificationTokens").where("enabled","==",true).get();
    const tokenRows=tokensSnap.docs.map(doc=>({id:doc.id,token:doc.data().token})).filter(row=>row.token);
    if(!tokenRows.length)continue;
    const medicinesSnap=await userDoc.ref.collection("medicines").get();
    const pendingByTime=new Map();
    for(const medicineDoc of medicinesSnap.docs){
      const medicine={id:medicineDoc.id,...medicineDoc.data()};
      if(!isMedicineActiveForDate(medicine,now.iso,now.weekday))continue;
      for(const meal of reminderMeals(medicine)){
        const [hour,minute]=String(meal.time||"").split(":").map(Number);
        if(!Number.isFinite(hour)||!Number.isFinite(minute))continue;
        const mealMinutes=hour*60+minute;
        if(mealMinutes<windowStart||mealMinutes>windowEnd)continue;
        const logId=intakeDocId(now.iso,meal,medicine.id);
        const logRef=userDoc.ref.collection("reminderLogs").doc(logId);
        if((await logRef.get()).exists)continue;
        const intake=await userDoc.ref.collection("intakes").doc(logId).get();
        if(intake.exists&&intake.data().taken)continue;
        const timeKey=meal.time;
        if(!pendingByTime.has(timeKey))pendingByTime.set(timeKey,[]);
        pendingByTime.get(timeKey).push({medicine,meal,logRef,logId});
      }
    }
    const isEnglish=profile.preferredLanguage==="en";
    for(const [time,doses] of pendingByTime.entries()){
      const names=doses.map(item=>shortMedicineName(item.medicine.name||"")).filter(Boolean);
      const uniqueNames=[...new Set(names)];
      const title=isEnglish?"Medication reminder":"Recordatorio de medicación";
      const body=uniqueNames.length===1
        ? (isEnglish?`It is time for ${uniqueNames[0]}.`:`Es la hora de ${uniqueNames[0]}.`)
        : (isEnglish?`It is time for ${uniqueNames.length} medicines: ${uniqueNames.join(", ")}.`:`Es la hora de ${uniqueNames.length} medicamentos: ${uniqueNames.join(", ")}.`);
      const response=await messaging.sendEachForMulticast({
        tokens:tokenRows.map(row=>row.token),
        data:{title,body,url:`${appUrl}/#today`,tag:`medication-reminder-${now.iso}-${time}`,scheduledDate:now.iso,scheduledTime:time,medicineCount:String(uniqueNames.length)}
      });
      await Promise.all(doses.map(item=>item.logRef.set({
        medicineId:item.medicine.id,mealKey:item.meal.key||"dose",scheduledDate:now.iso,scheduledTime:time,sentAt:new Date(),successCount:response.successCount,failureCount:response.failureCount,groupedCount:doses.length
      })));
      await Promise.all(response.responses.map((result,index)=>{
        const code=result.error?.code||"";
        if(!code.includes("registration-token-not-registered")&&!code.includes("invalid-registration-token"))return null;
        return userDoc.ref.collection("notificationTokens").doc(tokenRows[index].id).set({enabled:false,disabledAt:new Date(),disableReason:code},{merge:true});
      }).filter(Boolean));
    }
  }
  return null;
});

exports.checkPasswordResetEligibility=onCall({region:"europe-west1"},async request=>{
  const email=String(request.data?.email||"").trim().toLowerCase();
  if(!email||!email.includes("@"))throw new HttpsError("invalid-argument","Correo no valido.");
  let authUser=null;
  try{authUser=await getAuth().getUserByEmail(email)}
  catch(error){
    if(error.code==="auth/user-not-found")return {eligible:true};
    throw error;
  }
  const snapshot=await getFirestore().doc(`users/${authUser.uid}`).get();
  if(!snapshot.exists)return {eligible:false,status:"pending"};
  const profile=snapshot.data();
  if(profile.role==="admin"||profile.status==="approved")return {eligible:true,status:profile.status||"approved"};
  return {eligible:false,status:profile.status||"pending"};
});

exports.getCurrentUserTreatmentData=onCall({region:"europe-west1"},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesión.");
  const db=getFirestore(),uid=request.auth.uid;
  const profileSnap=await db.doc(`users/${uid}`).get();
  if(!profileSnap.exists||profileSnap.data().status!=="approved")throw new HttpsError("permission-denied","La cuenta no está aprobada.");
  const medicinesSnap=await profileSnap.ref.collection("medicines").get();
  const intakesSnap=await profileSnap.ref.collection("intakes").get();
  const medicines=medicinesSnap.docs.map(doc=>({id:doc.id,...doc.data()}))
    .filter(medicine=>medicine.confirmed!==false&&!medicine.hiddenFromMedication)
    .map(medicine=>JSON.parse(JSON.stringify(medicine)));
  const intakes={};
  intakesSnap.docs.forEach(doc=>{intakes[doc.id]=JSON.parse(JSON.stringify({id:doc.id,...doc.data()}))});
  return {ok:true,medicines,intakes};
});

exports.searchMhraMedicines=onCall({region:"europe-west1",timeoutSeconds:30},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesiÃ³n.");
  const db=getFirestore(),profile=await db.doc(`users/${request.auth.uid}`).get();
  if(!profile.exists||profile.data().status!=="approved")throw new HttpsError("permission-denied","La cuenta no estÃ¡ aprobada.");
  const query=String(request.data?.query||"").trim();
  const limit=Math.min(Math.max(Number(request.data?.limit)||8,1),12);
  if(query.length<3)throw new HttpsError("invalid-argument","Escribe al menos 3 letras.");
  const graphql=`query($searchTerm: String, $first: Int) {
    products {
      documents(search: $searchTerm, first: $first) {
        count: totalCount
        edges {
          node {
            product: productName
            activeSubstances
            title
            url
            docType
          }
        }
      }
    }
  }`;
  let rows=[];
  let response;
  try{
    response=await fetch("https://medicines.api.mhra.gov.uk/graphql",{
      method:"POST",
      headers:{"Content-Type":"application/json","User-Agent":"TuMedicacion/1.0"},
      body:JSON.stringify({query:graphql,variables:{searchTerm:query,first:Math.max(limit*3,12)}})
    });
    if(response.ok){
      const data=await response.json();
      rows=(data?.data?.products?.documents?.edges||[]).map(edge=>{
        const node=edge.node||{};
        return {name:String(node.product||node.title||"").trim(),activeIngredient:Array.isArray(node.activeSubstances)?node.activeSubstances.join(", "):"",url:node.url||"",docType:node.docType||""};
      });
    }else{
      const body=await response.text().catch(()=>"");
      console.error("MHRA GraphQL response failed; trying Azure fallback",{query,status:response.status,body:body.slice(0,500)});
    }
  }catch(error){
    console.error("MHRA GraphQL request failed; trying Azure fallback",{query,error:error.message});
  }
  if(!rows.length)rows=await searchMhraAzure(query,Math.max(limit*3,12));
  const byProduct=new Map();
  for(const node of rows){
    const name=String(node.name||node.product||node.title||"").trim();
    if(!name)continue;
    const key=name.toUpperCase();
    const existing=byProduct.get(key)||{name,activeIngredient:"",url:"",docTypes:[],officialSource:"MHRA",country:"GB",imageUrl:""};
    if(node.activeIngredient)existing.activeIngredient=node.activeIngredient;
    if(Array.isArray(node.activeSubstances)&&node.activeSubstances.length)existing.activeIngredient=node.activeSubstances.join(", ");
    if(node.url&&!existing.url)existing.url=String(node.url).startsWith("http")?node.url:`https://products.mhra.gov.uk${node.url}`;
    if(node.docType&&!existing.docTypes.includes(node.docType))existing.docTypes.push(node.docType);
    byProduct.set(key,existing);
  }
  return {items:[...byProduct.values()].slice(0,limit)};
});

function mhraAzureSearchExpression(value){
  return String(value||"").replace(/(?:[,+\-!(){}\[\]^~*?:%\/]|\s+)/g," ").trim().split(/\s+/).filter(Boolean).map(term=>`(${term}~1 || ${term}^4)`).join(" ");
}
async function searchMhraAzure(query,limit){
  const url=new URL("https://mhraproducts4853.search.windows.net/indexes/products-index/docs");
  url.searchParams.set("api-key","17CCFC430C1A78A169B392A35A99C49D");
  url.searchParams.set("api-version","2017-11-11");
  url.searchParams.set("highlight","content");
  url.searchParams.set("queryType","full");
  url.searchParams.set("$count","true");
  url.searchParams.set("$top",String(limit));
  url.searchParams.set("$skip","0");
  url.searchParams.set("search",mhraAzureSearchExpression(query)||query);
  url.searchParams.set("scoringProfile","preferKeywords");
  url.searchParams.set("searchMode","all");
  let response;
  try{
    response=await fetch(url,{method:"GET",headers:{"Content-Type":"application/json","User-Agent":"TuMedicacion/1.0"}});
  }catch(error){
    console.error("MHRA Azure request failed",{query,error:error.message});
    throw new HttpsError("unavailable","No se pudo consultar MHRA.");
  }
  if(!response.ok){
    const body=await response.text().catch(()=>"");
    console.error("MHRA Azure response failed",{query,status:response.status,body:body.slice(0,500)});
    throw new HttpsError("unavailable","No se pudo consultar MHRA.");
  }
  const data=await response.json();
  return (data.value||[]).map(row=>({
    name:String(row.product_name||decodeURIComponent(String(row.title||""))||"").trim(),
    activeIngredient:Array.isArray(row.substance_name)?row.substance_name.join(", "):String(row.substance_name||""),
    url:row.metadata_storage_path||"",
    docType:String(row.doc_type||"").slice(0,3)
  })).filter(item=>item.name);
}

exports.updateUserPreferences=onCall({region:"europe-west1"},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesiÃ³n.");
  const db=getFirestore(),ref=db.doc(`users/${request.auth.uid}`),snapshot=await ref.get();
  if(!snapshot.exists||snapshot.data().status!=="approved"||snapshot.data().role!=="user")throw new HttpsError("permission-denied","La cuenta no estÃ¡ aprobada.");
  const input=request.data||{},updates={};
  if(input.country!==undefined){if(!["ES","GB"].includes(input.country))throw new HttpsError("invalid-argument","PaÃ­s no vÃ¡lido.");updates.country=input.country}
  if(input.preferredLanguage!==undefined){if(!["es","en"].includes(input.preferredLanguage))throw new HttpsError("invalid-argument","Idioma no vÃ¡lido.");updates.preferredLanguage=input.preferredLanguage}
  if(input.fontSize!==undefined){if(!["normal","large","xlarge"].includes(input.fontSize))throw new HttpsError("invalid-argument","TamaÃ±o no vÃ¡lido.");updates.fontSize=input.fontSize}
  if(input.highContrast!==undefined){if(typeof input.highContrast!=="boolean")throw new HttpsError("invalid-argument","Contraste no vÃ¡lido.");updates.highContrast=input.highContrast}
  if(!Object.keys(updates).length)throw new HttpsError("invalid-argument","No hay preferencias para guardar.");
  await ref.update(updates);
  return {ok:true,...updates};
});

exports.repairCurrentUserMedicines=onCall({region:"europe-west1"},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesión.");
  const db=getFirestore();
  const uid=request.auth.uid;
  const email=String(request.auth.token.email||"").trim().toLowerCase();
  if(!email)throw new HttpsError("invalid-argument","El usuario no tiene correo.");
  const currentRef=db.doc(`users/${uid}`);
  const current=await currentRef.get();
  if(!current.exists||current.data().status!=="approved")throw new HttpsError("permission-denied","La cuenta no está aprobada.");
  const currentMedicines=await currentRef.collection("medicines").get();
  if(!currentMedicines.empty)return {ok:true,copied:0,currentCount:currentMedicines.size,reason:"current-not-empty"};

  const emailVariants=[...new Set([email,request.auth.token.email,current.data().email].filter(Boolean).map(value=>String(value).trim()))];
  const candidates=[];
  for(const variant of emailVariants){
    const snap=await db.collection("users").where("email","==",variant).get();
    snap.docs.forEach(doc=>{if(doc.id!==uid&&!candidates.some(item=>item.id===doc.id))candidates.push(doc)});
  }

  let copied=0,sourceUid="";
  for(const candidate of candidates){
    const medicinesSnap=await candidate.ref.collection("medicines").get();
    if(medicinesSnap.empty)continue;
    sourceUid=candidate.id;
    const batch=db.batch();
    medicinesSnap.docs.forEach(doc=>{
      const data=doc.data();
      if(data.deletedAt)return;
      const target=currentRef.collection("medicines").doc(doc.id);
      batch.set(target,{...data,migratedFrom:sourceUid,migratedAt:new Date()},{merge:true});
      copied++;
    });
    if(copied){
      await batch.commit();
      break;
    }
  }
  return {ok:true,copied,currentCount:currentMedicines.size,sourceUid};
});

exports.cleanupSupervisorData=onCall({region:"europe-west1",timeoutSeconds:120},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesión.");
  const db=getFirestore();
  const caller=await db.doc(`users/${request.auth.uid}`).get();
  if(!caller.exists||caller.data().role!=="admin"||caller.data().status!=="approved")throw new HttpsError("permission-denied","Acceso exclusivo para administradores.");

  const supervisorFields=[
    "supervisor","supervisors","supervisorName","supervisorEmail","supervisorPhone","supervisorStatus",
    "supervisorEnabled","supervisorAcceptedAt","supervisorInvitedAt","supervisorInvitationId",
    "supervisorInviteId","supervisorInviteToken","supervisorInviteEmail","supervisorInviteName",
    "invitedSupervisor","invitedSupervisorEmail","familySupervisor","familySupervisorEmail",
    "relativeName","relativeEmail","familyName","familyEmail"
  ];
  const subcollections=["supervisors","supervisorInvites","supervisorInvitations","familyAccess","familyInvites"];
  let usersUpdated=0,subcollectionsDeleted=0,topCollectionsDeleted=0;

  const users=await db.collection("users").get();
  for(const userDoc of users.docs){
    const updates={};
    supervisorFields.forEach(field=>{if(Object.prototype.hasOwnProperty.call(userDoc.data(),field))updates[field]=FieldValue.delete()});
    if(Object.keys(updates).length){
      await userDoc.ref.update(updates);
      usersUpdated++;
    }
    for(const name of subcollections){
      const docs=await userDoc.ref.collection(name).listDocuments();
      for(const docRef of docs){
        await db.recursiveDelete(docRef);
        subcollectionsDeleted++;
      }
    }
  }

  for(const name of ["supervisorInvites","supervisorInvitations","supervisorAccess","familyInvites"]){
    const docs=await db.collection(name).listDocuments();
    for(const docRef of docs){
      await db.recursiveDelete(docRef);
      topCollectionsDeleted++;
    }
  }

  await db.collection("adminAudit").add({action:"cleanup_supervisor_data",adminUid:request.auth.uid,usersUpdated,subcollectionsDeleted,topCollectionsDeleted,createdAt:new Date()});
  return {ok:true,usersUpdated,subcollectionsDeleted,topCollectionsDeleted};
});

exports.deleteUserAccount=onCall({region:"europe-west1"},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesiÃ³n.");
  const db=getFirestore();
  const caller=await db.doc(`users/${request.auth.uid}`).get();
  if(!caller.exists||caller.data().role!=="admin"||caller.data().status!=="approved")throw new HttpsError("permission-denied","Acceso exclusivo para administradores.");
  const uid=request.data?.uid;
  if(typeof uid!=="string"||!uid||uid===request.auth.uid)throw new HttpsError("invalid-argument","Usuario no vÃ¡lido.");
  const target=await db.doc(`users/${uid}`).get();
  if(!target.exists)throw new HttpsError("not-found","El usuario no existe.");
  if(target.data().role==="admin")throw new HttpsError("permission-denied","No se puede eliminar un administrador desde este panel.");

  await db.recursiveDelete(db.doc(`users/${uid}`));
  await getStorage().bucket().deleteFiles({prefix:`users/${uid}/`,force:true});
  try{await getAuth().deleteUser(uid)}catch(error){if(error.code!=="auth/user-not-found")throw error}
  await db.collection("adminAudit").add({action:"delete_user",targetUid:uid,adminUid:request.auth.uid,createdAt:new Date()});
  return {ok:true};
});

exports.approveUserAccount=onCall({region:"europe-west1",secrets:[gmailClientId,gmailClientSecret,gmailRefreshToken]},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesion.");
  const db=getFirestore();
  const caller=await db.doc(`users/${request.auth.uid}`).get();
  if(!caller.exists||caller.data().role!=="admin"||caller.data().status!=="approved")throw new HttpsError("permission-denied","Acceso exclusivo para administradores.");
  const uid=request.data?.uid;
  if(typeof uid!=="string"||!uid||uid===request.auth.uid)throw new HttpsError("invalid-argument","Usuario no valido.");
  const ref=db.doc(`users/${uid}`),snapshot=await ref.get();
  if(!snapshot.exists)throw new HttpsError("not-found","El usuario no existe.");
  const profile=snapshot.data();
  if(profile.role==="admin")throw new HttpsError("permission-denied","No se puede aprobar una cuenta administradora desde aqui.");
  await ref.update({status:"approved",reviewedAt:new Date(),reviewedBy:request.auth.uid,approvalEmailQueuedAt:new Date()});
  let emailSent=false,emailError="";
  try{
    await sendApprovalEmail(profile);
    emailSent=true;
    await ref.update({approvalEmailSentAt:new Date(),approvalEmailError:null});
  }catch(error){
    emailError=error.message||"No se pudo enviar el correo.";
    console.error("Approval email failed",{uid,email:profile.email,error:emailError});
    await ref.update({approvalEmailError:emailError});
  }
  await db.collection("adminAudit").add({action:"approve_user",targetUid:uid,adminUid:request.auth.uid,emailSent,createdAt:new Date()});
  return {ok:true,emailSent,emailError};
});

async function sendApprovalEmail(profile){
  if(!profile?.email)throw new Error("El usuario no tiene correo.");
  const oauth2Client=new google.auth.OAuth2(gmailClientId.value(),gmailClientSecret.value());
  oauth2Client.setCredentials({refresh_token:gmailRefreshToken.value()});
  const gmail=google.gmail({version:"v1",auth:oauth2Client});
  const lang=profile.preferredLanguage==="en"?"en":"es";
  const rawName=(profile.firstName||profile.name||"").trim();
  const subject=lang==="en"?"Your My Medication account has been approved":"Tu cuenta de Mi Medicacion ha sido aprobada";
  const greeting=lang==="en"?(rawName?`Hello ${rawName},`:"Hello,"):(rawName?`Hola ${rawName},`:"Hola,");
  const bodyText=lang==="en"
    ? `${greeting}\n\nYour account has been approved. You can now access My Medication here:\n\n${appUrl}\n\nThank you.`
    : `${greeting}\n\nTu cuenta ya ha sido aprobada. Ya puedes acceder a Mi Medicacion desde este enlace:\n\n${appUrl}\n\nGracias.`;
  const bodyHtml=lang==="en"
    ? `<p>${escapeHtml(greeting)}</p><p>Your account has been approved.</p><p><a href="${appUrl}" style="display:inline-block;background:#24594b;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">Open My Medication</a></p><p>If the button does not work, copy this link:<br><a href="${appUrl}">${appUrl}</a></p>`
    : `<p>${escapeHtml(greeting)}</p><p>Tu cuenta ya ha sido aprobada.</p><p><a href="${appUrl}" style="display:inline-block;background:#24594b;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">Entrar en Mi Medicacion</a></p><p>Si el boton no funciona, copia este enlace:<br><a href="${appUrl}">${appUrl}</a></p>`;
  const raw=buildMimeMessage({to:profile.email,from:`Mi Medicacion <${appFromEmail}>`,subject,text:bodyText,html:bodyHtml});
  await gmail.users.messages.send({userId:"me",requestBody:{raw}});
}

function buildMimeMessage({to,from,subject,text,html}){
  const boundary=`mm_${crypto.randomBytes(12).toString("hex")}`;
  const message=[
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject,"utf8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`
  ].join("\r\n");
  return Buffer.from(message).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[character]));
}

const documentAiLocation="eu";
const documentAiProcessorId="5853f1b8ba799d26";
const documentAiClient=new DocumentProcessorServiceClient({apiEndpoint:"eu-documentai.googleapis.com"});

exports.extractPrescription=onCall({region:"europe-west1",timeoutSeconds:120,memory:"1GiB"},async request=>{
  if(!request.auth)throw new HttpsError("unauthenticated","Debes iniciar sesiÃ³n.");
  const uid=request.auth.uid,storagePath=request.data?.storagePath;
  if(typeof storagePath!=="string"||!storagePath.startsWith(`users/${uid}/documents/`))throw new HttpsError("permission-denied","Documento no vÃ¡lido.");
  const db=getFirestore(),profile=await db.doc(`users/${uid}`).get();
  if(!profile.exists||profile.data().status!=="approved")throw new HttpsError("permission-denied","La cuenta no estÃ¡ aprobada.");
  const bucket=getStorage().bucket(),file=bucket.file(storagePath),[metadata]=await file.getMetadata();
  if(!metadata.contentType?.startsWith("image/"))throw new HttpsError("invalid-argument","En esta versiÃ³n la lectura automÃ¡tica admite imÃ¡genes JPG o PNG.");
  const [imageBuffer]=await file.download();
  let result;
  try{
    [result]=await documentAiClient.processDocument({
      name:`projects/${process.env.GCLOUD_PROJECT}/locations/${documentAiLocation}/processors/${documentAiProcessorId}`,
      rawDocument:{content:imageBuffer,mimeType:metadata.contentType},
      processOptions:{ocrConfig:{hints:{languageHints:["es"]}}}
    });
  }catch(error){
    console.error("Document AI processing failed",{code:error.code,message:error.message});
    throw new HttpsError("internal","No se pudo analizar la imagen con Document AI.");
  }
  const rawText=result.document?.text?.trim()||"";
  if(!rawText)throw new HttpsError("not-found","No se ha detectado texto legible. Prueba con una foto mÃ¡s nÃ­tida.");
  const candidates=extractMedicationCandidates(rawText);
  const pageQuality=(result.document?.pages||[]).map(page=>page.imageQualityScores?.qualityScore).filter(score=>typeof score==="number");
  const qualityScore=pageQuality.length?Math.min(...pageQuality):null;
  const draftRef=await db.collection(`users/${uid}/documentDrafts`).add({storagePath,status:"pending_review",ocrProvider:"document-ai",processorLocation:documentAiLocation,candidates,qualityScore,ocrCharacterCount:rawText.length,createdAt:new Date()});
  return {draftId:draftRef.id,candidates,rawText:rawText.slice(0,12000),qualityScore,warning:"Lectura de Document AI pendiente de validaciÃ³n"};
});

function extractMedicationCandidates(text){
  const lines=text.split(/\r?\n/).map(line=>line.replace(/\s+/g," ").trim()).filter(Boolean),results=[];
  const strengthPattern=/(\d+(?:[.,]\d+)?\s*(?:mg|mcg|Âµg|g|ml|ui|u\.i\.|%)(?:\s*\/\s*\d+(?:[.,]\d+)?\s*(?:ml|g))?)/i;
  const frequencyPattern=/(cada\s+\d+\s*horas?|\d+\s*(?:veces?|tomas?)\s+(?:al|por)\s+d[iÃ­]a|una\s+vez\s+al\s+d[iÃ­]a|maÃ±ana|mediod[iÃ­]a|tarde|noche|desayuno|comida|cena)/i;
  const formPattern=/\b(comprimidos?|cÃ¡psulas?|capsulas?|sobres?|jarabe|soluci[oÃ³]n|suspensi[oÃ³]n|gotas?|parches?|pomada|crema|inyectable)\b/i;
  const durationPattern=/(\d+)\s*(d[iÃ­]as?|semanas?|meses?)/i;
  const unitPattern=/(\d+(?:[.,]\d+)?)\s*(?:unidades?\s*\/\s*toma|unidades?\s+por\s+toma|comprimidos?|cÃ¡psulas?)/i;
  const ignoredPattern=/^(?:paciente|m[eÃ©]dico|prescripci[oÃ³]n|posolog[iÃ­]a|duraci[oÃ³]n|farmacia|fecha|advertencias?|enfermedad|nombre|n[uÃº]mero|cuerpo)/i;
  for(let index=0;index<lines.length;index++){
    const line=lines[index],strength=line.match(strengthPattern),form=line.match(formPattern);if(!strength&&!form)continue;
    let before=(strength?line.slice(0,strength.index):line.slice(0,form.index)).replace(/^(?:medicamento|fÃ¡rmaco|tratamiento|producto)\s*[:\-]?\s*/i,"").trim();
    if(before.length<3&&index>0&&!ignoredPattern.test(lines[index-1]))before=lines[index-1].trim();
    if(before.length<3||before.length>90||ignoredPattern.test(before)||!/[a-zÃ¡Ã©Ã­Ã³ÃºÃ±]/i.test(before))continue;
    const context=lines.slice(Math.max(0,index-2),Math.min(lines.length,index+7)).join(" "),times=[...context.matchAll(/\b(?:[01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map(match=>match[0].replace(".",":"));
    const frequency=context.match(frequencyPattern)?.[0]||"";
    const duration=context.match(durationPattern),units=context.match(unitPattern);
    const instructions=[units?.[0]||"",form?.[1]||"",duration?.[0]||""].filter(Boolean).join(" Â· ");
    const candidate={name:before,dose:strength?.[1]||"",form:form?.[1]||"",frequency,instructions,duration:duration?.[0]||"",durationAmount:duration?Number(duration[1]):null,durationUnit:duration?.[2]||"",times:[...new Set(times)],confidence:"review_required"};
    if(!results.some(item=>item.name.toLowerCase()===candidate.name.toLowerCase()&&item.dose.toLowerCase()===candidate.dose.toLowerCase()))results.push(candidate);
  }
  return results.slice(0,12);
}
