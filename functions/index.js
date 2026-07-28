const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {defineSecret}=require("firebase-functions/params");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore}=require("firebase-admin/firestore");
const {getStorage}=require("firebase-admin/storage");
const {DocumentProcessorServiceClient}=require("@google-cloud/documentai");
const {google}=require("googleapis");
const crypto=require("crypto");

initializeApp();

const gmailClientId=defineSecret("GMAIL_CLIENT_ID");
const gmailClientSecret=defineSecret("GMAIL_CLIENT_SECRET");
const gmailRefreshToken=defineSecret("GMAIL_REFRESH_TOKEN");
const appUrl="https://mi-medicacion-senior-lopez.web.app";
const appFromEmail="informacion.tu.medicacion@gmail.com";

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
