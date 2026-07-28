const config=window.__FIREBASE_CONFIG__||null;
const ADMIN_UID="VOQ4QmarX6MJNWHkwnlBidsabRk2";
let fb=null;
let initialisePromise=null;
let loginInProgress=false;
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const safe=(value="")=>{const el=document.createElement("div");el.textContent=String(value);return el.innerHTML};
const notify=message=>{const el=$("#adminToast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000)};

async function initialise(){
  const submit=$("#adminLoginForm button[type=submit]");
  try{
    if(!config)throw new Error("missing-config");
    const appMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
    const authMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
    const dbMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
    const fnMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js");
    const app=appMod.initializeApp(config,"admin-console");
    fb={auth:authMod.getAuth(app),db:dbMod.getFirestore(app),functions:fnMod.getFunctions(app,"europe-west1"),...authMod,...dbMod,...fnMod};
    submit.disabled=false;$("#adminLoginStatus").textContent="";
    fb.onAuthStateChanged(fb.auth,user=>{if(!user)showLogin();else if(!loginInProgress)verifyAdministrator(user);});
  }catch(error){
    submit.disabled=true;showLogin("No se pudo preparar el acceso seguro. Actualiza la página e inténtalo de nuevo.");
  }
}

async function verifyAdministrator(user){
  if(!user){showLogin();return}
  if(user.uid!==ADMIN_UID){
    await fb.signOut(fb.auth);showLogin("Esta cuenta no tiene permisos de administración.");return;
  }
  showPanel(user.email);
  await loadRequests();
}
function showLogin(error=""){$("#adminLogin").hidden=false;$("#standalonePanel").hidden=true;$("#adminLoginStatus").textContent=error}
function showPanel(email){$("#adminLogin").hidden=true;$("#standalonePanel").hidden=false;$("#standaloneIdentity").textContent=email}

$("#adminLoginForm").onsubmit=async event=>{
  event.preventDefault();const form=event.target,data=Object.fromEntries(new FormData(form)),submit=$("button[type=submit]",form);
  $("#adminLoginStatus").textContent="Accediendo…";submit.disabled=true;loginInProgress=true;
  try{
    await initialisePromise;
    if(!fb)throw new Error("firebase-unavailable");
    const credential=await fb.signInWithEmailAndPassword(fb.auth,data.email,data.password);
    await verifyAdministrator(credential.user);
  }catch(error){
    showLogin(error.message==="firebase-unavailable"?"No se pudo conectar con Firebase.":"Correo o contraseña incorrectos.");
  }finally{loginInProgress=false;if(fb)submit.disabled=false;}
};

async function loadRequests(){
  const list=$("#standaloneRequests");list.innerHTML="<div class='panel'>Cargando solicitudes…</div>";let requests=[];
  try{
    if(fb){const snap=await fb.getDocs(fb.query(fb.collection(fb.db,"users"),fb.where("status","==","pending")));requests=snap.docs.map(doc=>({id:doc.id,...doc.data()}))}
    else requests=JSON.parse(localStorage.getItem("mm_requests")||"[]");
  }catch(error){list.innerHTML="<div class='notice warning'>No se pudieron cargar las solicitudes.</div>";return}
  $("#standaloneCount").textContent=requests.length;
  list.innerHTML=requests.map(item=>`<article class="medicine-card"><h2>${safe(item.name)}</h2><div class="request-details"><p><b>Correo:</b> ${safe(item.email)}</p><p><b>Teléfono:</b> ${safe(item.phone||"—")}</p><p><b>Fecha de nacimiento:</b> ${safe(item.birthDate||"—")}</p><p><b>País:</b> ${safe(item.country==="GB"?"Reino Unido":item.country==="ES"?"España":"—")}</p></div><div class="admin-actions"><button class="primary" data-decision="approved" data-id="${safe(item.id)}">Aprobar</button><button class="danger" data-decision="rejected" data-id="${safe(item.id)}">Rechazar</button></div></article>`).join("")||"<div class='panel'>No hay solicitudes pendientes.</div>";
  $$('[data-decision]',list).forEach(button=>button.onclick=()=>decide(button.dataset.id,button.dataset.decision,requests));
}
async function loadUsers(){
  const list=$("#standaloneRequests");list.innerHTML="<div class='panel'>Cargando usuarios…</div>";let users=[];
  try{
    if(fb){const snap=await fb.getDocs(fb.query(fb.collection(fb.db,"users"),fb.where("role","==","user")));users=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(user=>user.status!=="pending"&&user.status!=="deleted")}
    else users=JSON.parse(localStorage.getItem("mm_users")||"[]");
  }catch(error){list.innerHTML="<div class='notice warning'>No se pudieron cargar los usuarios.</div>";return}
  $("#standaloneCount").textContent=users.length;
  list.innerHTML=users.map(user=>`<article class="medicine-card"><header><div><h2>${safe(user.name)}</h2><p>${safe(user.email)}</p></div><span class="user-status ${user.status==="blocked"?"blocked":""}">${user.status==="blocked"?"Bloqueado":"Activo"}</span></header><div class="request-details"><p><b>Teléfono:</b> ${safe(user.phone||"—")}</p><p><b>Fecha de nacimiento:</b> ${safe(user.birthDate||"—")}</p><p><b>País:</b> ${safe(user.country==="GB"?"Reino Unido":user.country==="ES"?"España":"—")}</p></div><div class="user-actions">${user.status==="blocked"?`<button class="primary" data-user-action="approved" data-id="${safe(user.id)}">Reactivar</button>`:`<button class="danger" data-user-action="blocked" data-id="${safe(user.id)}">Bloquear</button>`}<button class="danger delete-user" data-user-action="delete" data-id="${safe(user.id)}" data-name="${safe(user.name)}">Eliminar usuario</button></div></article>`).join("")||"<div class='panel'>No hay usuarios activos o bloqueados.</div>";
  $$('[data-user-action]',list).forEach(button=>button.onclick=()=>manageUser(button.dataset.id,button.dataset.userAction,button.dataset.name,users));
}
async function manageUser(id,action,name,users){
  if(action==="delete"){
    if(!window.confirm(`¿Eliminar definitivamente la cuenta de ${name}? Esta acción no se puede deshacer.`))return;
    try{if(fb)await fb.httpsCallable(fb.functions,"deleteUserAccount")({uid:id});else localStorage.setItem("mm_users",JSON.stringify(users.filter(user=>user.id!==id)));notify("Usuario eliminado definitivamente.");await loadUsers()}catch(error){notify("No se pudo eliminar el usuario.")}return;
  }
  try{if(fb)await fb.updateDoc(fb.doc(fb.db,"users",id),{status:action,statusChangedAt:fb.serverTimestamp(),statusChangedBy:fb.auth.currentUser.uid});else localStorage.setItem("mm_users",JSON.stringify(users.map(user=>user.id===id?{...user,status:action}:user)));notify(action==="blocked"?"Usuario bloqueado.":"Usuario reactivado.");await loadUsers()}catch(error){notify("No se pudo actualizar el usuario.")}
}
async function decide(id,status,requests){
  try{
    let approvalResult=null;
    if(fb&&status==="approved"){
      try{approvalResult=await fb.httpsCallable(fb.functions,"approveUserAccount")({uid:id});}
      catch(error){await fb.updateDoc(fb.doc(fb.db,"users",id),{status,reviewedAt:fb.serverTimestamp(),reviewedBy:fb.auth.currentUser.uid});}
    }else if(fb)await fb.updateDoc(fb.doc(fb.db,"users",id),{status,reviewedAt:fb.serverTimestamp(),reviewedBy:fb.auth.currentUser.uid});
    else{if(status==="approved"){const users=JSON.parse(localStorage.getItem("mm_users")||"[]");const approved=requests.find(item=>item.id===id);users.push({...approved,status:"approved"});localStorage.setItem("mm_users",JSON.stringify(users))}localStorage.setItem("mm_requests",JSON.stringify(requests.filter(item=>item.id!==id)))}
    notify(status==="approved"?(approvalResult?.data?.emailSent?"Cuenta aprobada y correo enviado.":"Cuenta aprobada."):"Solicitud rechazada.");
    await loadRequests();
  }catch(error){notify("No se pudo guardar la decisi?n.")}
}
$("#standaloneLogout").onclick=async()=>{if(fb)await fb.signOut(fb.auth);showLogin()};
$("#pendingMenu").onclick=()=>{setAdminSection("pending");loadRequests()};
$("#usersMenu").onclick=()=>{setAdminSection("users");loadUsers()};
function setAdminSection(section){const users=section==="users";$("#pendingMenu").classList.toggle("active",!users);$("#usersMenu").classList.toggle("active",users);$("#adminSectionTitle").textContent=users?"Usuarios":"Altas pendientes";$("#adminSectionDescription").textContent=users?"Bloquea, reactiva o elimina cuentas de usuario.":"Comprueba los datos antes de aprobar una cuenta.";$("#adminCountLabel").textContent=users?"Usuarios":"Pendientes"}
initialisePromise=initialise();
