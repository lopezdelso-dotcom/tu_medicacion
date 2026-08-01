const firebaseConfig = window.__FIREBASE_CONFIG__ || null;
const firebaseVapidKey = firebaseConfig?.vapidKey || "";
let fb = null;
const demo = !firebaseConfig;

const state = {
  user: null,
  medicines: JSON.parse(localStorage.getItem("mm_medicines") || "null") || [
    {id:"demo-1",name:"Enalapril",dose:"10 mg",time:"09:00",instructions:"Con el desayuno",confirmed:true},
    {id:"demo-2",name:"Atorvastatina",dose:"20 mg",time:"21:00",instructions:"DespuÃ©s de cenar",confirmed:true}
  ],
  intakes: JSON.parse(localStorage.getItem("mm_intakes") || "{}"),
  requests: JSON.parse(localStorage.getItem("mm_requests") || "[]")
};

const translations = {
  "Tu salud, mÃ¡s sencilla":"Your health, made simpler","Opciones de accesibilidad":"Accessibility options","Preferencias":"Preferences","Idioma":"Language","PaÃ­s del paciente":"Patient's country","EspaÃ±a":"Spain","Reino Unido":"United Kingdom","Selecciona tu paÃ­s":"Select your country","Alto contraste":"High contrast",
  "HECHO PARA TI":"MADE FOR YOU","Tu medicaciÃ³n,":"Your medication,","clara y a mano.":"clear and close at hand.","Guarda tus recetas, revisa cuÃ¡ndo tomar cada medicina y consulta informaciÃ³n oficial con tranquilidad.":"Save your prescriptions, review when to take each medicine and consult official information with confidence.","Guarda tus medicamentos, revisa cuÃ¡ndo tomar cada medicina y consulta informaciÃ³n oficial con tranquilidad.":"Save your medicines, review when to take each medicine and consult official information with confidence.",
  "Darse de alta":"Sign up","Darme de alta":"Sign me up","Ya tengo cuenta":"I have an account","Tus datos son privados y solo tÃº puedes verlos":"Your data is private and only you can see it","PR?â€œXIMA TOMA":"NEXT DOSE","1 comprimido Â· Desayuno":"1 tablet Â· Breakfast","?Å“â€œ Marcar como tomada":"?Å“â€œ Mark as taken",
  "TODO EN UN MISMO LUGAR":"EVERYTHING IN ONE PLACE","Cuidar tu salud puede ser mÃ¡s sencillo":"Looking after your health can be simpler","Herramientas claras, privadas y pensadas para utilizar desde el mÃ³vil.":"Clear, private tools designed for use on your phone.","Fotograf?a tus recetas":"Photograph your prescriptions","Incorpora una receta o informe haciendo una foto y revisa los datos antes de guardarlos.":"Add a prescription or report by taking a photo and review the details before saving.","Planifica tus tomas":"Plan your treatment","Consulta de forma sencilla quÃ© medicamento debes tomar durante los prÃ³ximos siete dÃ­as.":"Easily check which medicine to take over the next seven days.","TÃº confirmas los datos":"You confirm the details","Ninguna pauta extra?da de una fotograf?a se acepta sin que tÃº la compruebes.":"No schedule extracted from a photo is accepted until you check it.","InformaciÃ³n oficial":"Official information","Accede a prospectos e informaciÃ³n sobre efectos secundarios publicados por la AEMPS.":"Access leaflets and side-effect information published by AEMPS.","F?cil de leer":"Easy to read","Cambia el tama?o del texto y activa el alto contraste cuando lo necesites.":"Change the text size and turn on high contrast whenever you need it.","Tu informaciÃ³n es privada":"Your information is private","Cada usuario solo puede consultar sus propios datos y documentos.":"Each user can only access their own information and documents.","Empieza a organizar tu medicaciÃ³n":"Start organising your medication","Solicita el alta y revisaremos tu cuenta antes de activarla.":"Sign up and we will review your account before activating it.",
  "Cancelar":"Cancel","Nombre no reconocido":"Name not recognised","Sugerencias oficiales de CIMA":"Official CIMA suggestions",
  "Hoy":"Today","Mis medicinas":"My medicines","Documentos":"Documents","Mi perfil":"My profile","Solicitudes":"Requests","Buenos dÃ­as,":"Good morning,","Estas son tus tomas de hoy.":"Today treatment.","?â€¹ AÃ±adir desde una receta":"?â€¹ Add from a prescription","Solo se muestran pautas que tÃº hayas confirmado.":"Only schedules you have confirmed are shown.",
  "AquÃ© tienes tu medicaciÃ³n para los prÃ³ximos 7 dÃ­as.":"Here is your medication for the next 7 days.","Resumen de mi perfil":"My profile summary","Ver mi perfil":"View my profile","InformaciÃ³n privada":"Private information","Solo tÃº puedes ver estos datos.":"Only you can see this information.","MI PLAN SEMANAL":"MY WEEKLY PLAN","Pr?ximos 7 dÃ­as":"Next 7 days","?â€¹ AÃ±adir receta":"?â€¹ Add prescription","Hoy":"Today","Sin tomas programadas":"No scheduled treatment",
  "AÃ±adir receta o informe":"Add prescription or report","Haz una foto nÃ­tida. DespuÃ©s revisa cada dato antes de guardarlo.":"Take a clear photo. Then review every detail before saving.","Hacer foto o elegir archivo":"Take a photo or choose a file","JPG, PNG o PDF Â· mÃ¡ximo 10 MB":"JPG, PNG or PDF Â· 10 MB maximum","Revisa esta propuesta":"Review this suggestion","La lectura automÃ¡tica puede equivocarse. Compara los datos con tu receta.":"Automatic reading can make mistakes. Compare the details with your prescription.",
  "Nombre del medicamento":"Medicine name","Dosis":"Dose","Hora de la toma":"Dose time","Indicaciones":"Instructions","Fecha de inicio":"Start date","Fecha de fin (opcional)":"End date (optional)","He comprobado estos datos con mi receta.":"I have checked these details against my prescription.","Confirmar y guardar":"Confirm and save","Cerrar sesiÃ³n":"Sign out","Solicitudes de acceso":"Access requests","Aprueba ?nicamente identidades que hayas verificado.":"Only approve identities you have verified.",
  "Mi MedicaciÃ³n no sustituye el consejo de un mÃ©dico o farmacÃ©utico. Ante una urgencia, llama al 112.":"My Medication does not replace advice from a doctor or pharmacist. In an emergency, call 112.","CREAR UNA CUENTA":"CREATE AN ACCOUNT","Completa tus datos. Un administrador revisarÃ¡ el alta antes de activar tu cuenta.":"Enter your details. An administrator will review your registration before activating your account.","Nombre":"First name","Apellidos":"Last name","Fecha de nacimiento":"Date of birth","TelÃ©fono mÃ³vil":"Mobile phone","Correo electrÃ³nico":"Email address","ContraseÃ±a":"Password","MÃ­nimo 8 caracteres.":"At least 8 characters.","He leÃ­do y acepto la polÃ­tica de privacidad.":"I have read and accept the privacy policy.","Consiento el tratamiento de mis datos de salud para prestar el servicio.":"I consent to the processing of my health data to provide the service.","Entrar":"Sign in",
  "ADMINISTRACI?â€œN":"ADMINISTRATION","Panel de control":"Control panel","Solicitudes de alta":"Registration requests","Esta Ã¡rea estÃ¡ reservada exclusivamente para administradores.":"This area is reserved exclusively for administrators.","GESTI?â€œN DE USUARIOS":"USER MANAGEMENT","Altas pendientes":"Pending registrations","Comprueba los datos antes de aprobar una cuenta.":"Check the details before approving an account.","Pendientes":"Pending",
  "MI ESPACIO PERSONAL":"MY PERSONAL AREA","Texto":"Text","Modificar perfil":"Edit profile","MedicaciÃ³n y tomas":"Medication and treatment","MedicaciÃ³n":"Medication","Tomas":"Treatment","Cargar nueva medicaciÃ³n":"Add new medication","Tomas de hoy":"Treatment","Marca cada toma cuando la realices.":"Mark each treatment when completed.","Ver todas mis medicinas":"View all my medicines","Estas son las pautas que has confirmado.":"These are the schedules you have confirmed.","RESUMEN DEL TRATAMIENTO":"TREATMENT SUMMARY","Mi medicaciÃ³n":"My medication","Resumen de todos los medicamentos que tomas.":"Summary of all the medicines you take.","?â€¹ Cargar nuevo medicamento":"?â€¹ Add new medicine","Descartar":"Discard",
  "Consultar efectos secundarios":"View side effects","Selecciona uno de tus medicamentos confirmados.":"Select one of your confirmed medicines.","Mi medicaciÃ³n":"My medication","Todav?a no tienes medicamentos confirmados.":"You do not have any confirmed medicines yet.","RESUMEN DEL PROSPECTO OFICIAL":"OFFICIAL LEAFLET SUMMARY","Este resumen no contiene necesariamente todos los efectos adversos. Consulta el prospecto completo.":"This summary may not include every side effect. Read the full leaflet.","Volver a mi medicaciÃ³n":"Back to my medication","No se pudo cargar esta secciÃ³n del prospecto.":"This section of the leaflet could not be loaded.","Leyendo la receta?â‚¬?":"Reading the prescription?â‚¬?","Leyendo el medicamento?â‚¬?":"Reading the medicine?â‚¬?","Interpretando medicamentos y tomas?â‚¬?":"Interpreting medicines and doses?â‚¬?","Buscando coincidencias oficiales?â‚¬?":"Searching official matches?â‚¬?","No se pudo leer automÃ¡ticamente. Introduce los datos manualmente.":"Automatic reading failed. Enter the details manually.","La lectura automÃ¡tica se activarÃ¡ al conectar Firebase.":"Automatic reading will be enabled when Firebase is connected.","No se han identificado medicamentos con suficiente claridad. Introduce los datos manualmente.":"No medicines were identified clearly enough. Enter the details manually.","No se ha encontrado ning?n medicamento oficial en la imagen.":"No official medicine was found in the image.","Lectura terminada. Selecciona y revisa cada medicamento.":"Reading complete. Select and review each medicine.","Medicamentos encontrados":"Medicines found","Datos encontrados en la receta":"Details found in the prescription","Texto leÃ­do por Document AI":"Text read by Document AI","Mostrar texto completo":"Show full text","Comprobando el nombre en CIMA?â‚¬?":"Checking the name in CIMA?â‚¬?","Medicamento verificado en CIMA":"Medicine verified in CIMA","No se ha encontrado una coincidencia segura en CIMA. Revisa el nombre.":"No reliable match was found in CIMA. Check the name.","No se pudo consultar CIMA. IntÃ©ntalo de nuevo.":"CIMA could not be reached. Try again.","Medicamento encontrado":"Medicine found","Confirma si coincide con el medicamento fotografiado.":"Confirm whether this matches the photographed medicine.","Datos encontrados":"Details found","Puedes corregir cualquier campo antes de confirmar.":"You can correct any field before confirming.","Puedes corregir cualquier campo antes de guardar.":"You can correct any field before saving.","Confirmo que estos datos son correctos.":"I confirm these details are correct.","Dosis (si aparece)":"Dose (if shown)","Guardar medicamento":"Save medicine","Medicamento descartado.":"Medicine discarded.","?â€ ? Cambiar forma de carga":"?â€ ? Change upload method","Eliminar medicamento":"Delete medicine","Â¿Eliminar este medicamento?":"Delete this medicine?","Medicamento eliminado.":"Medicine deleted.","No se pudo eliminar el medicamento.":"The medicine could not be deleted.",
  "Elige cÃ³mo quieres aÃ±adir la medicaciÃ³n.":"Choose how you want to add medication","Forma de aÃ±adir medicaciÃ³n":"How to add medication","Desde una receta o informe":"From a prescription or report","Fotografiar medicamento":"Photograph medicine","Haz una foto o sube un archivo":"Take a photo or upload a file","Haz una foto de la caja o el envase":"Take a photo of the box or package","Buscar un medicamento":"Search for a medicine","Consulta la base oficial de la AEMPS":"Search the official AEMPS database","Escribe al menos 3 letras":"Enter at least 3 letters","Escribe al menos 3 letras.":"Enter at least 3 letters.","Resultados oficiales de CIMA ? Agencia Espa?ola de Medicamentos y Productos Sanitarios":"Official CIMA results Â· Spanish Agency of Medicines and Medical Devices","Buscando en la AEMPS?â‚¬?":"Searching AEMPS?â‚¬?","No se encontraron medicamentos.":"No medicines found.","No se pudo consultar CIMA en este momento.":"CIMA could not be reached right now.","Abrir buscador oficial":"Open official search","Seleccionado desde la fuente oficial CIMA":"Selected from the official CIMA source","Cargando informaciÃ³n oficial?â‚¬?":"Loading official information?â‚¬?","Caja del medicamento":"Medicine box","CIMA no dispone de foto para este medicamento":"CIMA has no photo for this medicine","Foto no disponible":"Photo unavailable","MEDICAMENTO OFICIAL":"OFFICIAL MEDICINE","Principio activo":"Active ingredient","Laboratorio":"Manufacturer","Ver ficha oficial en CIMA ?â€ â€”":"View official CIMA record ?â€ â€”","Elegir otro":"Choose another","SÃ­, es mi medicamento":"Yes, this is my medicine","Ahora indica las tomas":"Now enter the treatment","Revisa el horario en tu receta o consulta a un profesional sanitario.":"Check the schedule on your prescription or ask a healthcare professional.","He comprobado esta pauta y el horario.":"I have checked this schedule and timing.",
  "Con el desayuno":"With breakfast","DespuÃ©s de cenar":"After dinner","Seg?n indicaci?n m?dica":"As medically directed","Marcar tomada":"Mark as completed","Tomada":"Completed","?Å“â€œ Tomada":"?Å“â€œ Taken","No tienes tomas confirmadas.":"You have no confirmed treatment yet.","InformaciÃ³n oficial y prospecto en AEMPS ?â€ â€”":"Official information and leaflet from AEMPS ?â€ â€”","Aprobar":"Approve","Rechazar":"Reject","No hay solicitudes pendientes.":"There are no pending requests.","Modo demostraci?n":"Demo mode",
  "El archivo supera los 10 MB.":"The file exceeds 10 MB.","Documento protegido y cargado. Completa los datos extra?dos.":"Document securely uploaded. Complete the extracted details.","Foto preparada. En producci?n, el servidor realizar? la lectura automÃ¡tica.":"Photo ready. In production, the server will read it automatically.","MedicaciÃ³n confirmada y guardada.":"Medication confirmed and saved.","Alta enviada. El administrador debe aprobarla antes de que puedas entrar.":"Registration submitted. The administrator must approve it before you can sign in.","La foto se podrÃ¡ aÃ±adir mÃ¡s adelante.":"The photo can be added later.","Tu solicitud todavÃ­a no ha sido aprobada.":"Your request has not yet been approved.","Ej.: 10 mg":"E.g. 10 mg","Ej.: con el desayuno":"E.g. with breakfast"," + AÃ±adir nuevo medicamento":" + Add new medicine","Resumen de todos los tratamientos que tomas.":"Summary of all your treatments.","AtrÃ¡s":"Back","Nombre completo":"Full name"
  ,"Cargando solicitudes?â‚¬?":"Loading requests?â‚¬?","No se pudieron cargar las solicitudes.":"Requests could not be loaded.","Cuenta aprobada correctamente.":"Account approved successfully.","Solicitud rechazada.":"Request rejected.","No se pudo guardar la decisiÃ³n.":"The decision could not be saved.","Lectura no disponible":"Reading unavailable","Introduce los datos manualmente o prueba con otra foto.":"Enter the details manually or try another photo.","El OCR todavÃ­a no estÃ¡ conectado. Introduce los datos manualmente.":"OCR is not connected yet. Enter the details manually.","No se ha detectado texto legible. Prueba con una foto mÃ¡s nÃ­tida.":"No readable text was detected. Try a clearer photo.","Utiliza una imagen JPG o PNG para la lectura automÃ¡tica.":"Use a JPG or PNG image for automatic reading.","No se pudo verificar tu acceso. Cierra la sesiÃ³n y vuelve a entrar.":"Your access could not be verified. Sign out and sign in again.","Preferencias guardadas.":"Preferences saved.","No se pudo guardar el paÃ­s.":"The country could not be saved.","No se pudo guardar el idioma preferido.":"The preferred language could not be saved.","No se pudieron guardar las preferencias.":"Preferences could not be saved.","Fuente oficial: MHRA Products (Reino Unido)":"Official source: MHRA Products (United Kingdom)","Consulta el registro oficial de la MHRA":"Search the official MHRA register","Comprobando en la MHRA?â‚¬?":"Checking MHRA?â‚¬?","Comprueba el nombre en el registro oficial brit?nico.":"Check the name in the official UK register.","Abrir MHRA ?â€ â€”":"Open MHRA ?â€ â€”","Ya lo he comprobado":"I have checked it","MEDICAMENTO OFICIAL ? REINO UNIDO":"OFFICIAL MEDICINE ? UNITED KINGDOM","Ver informaciÃ³n oficial en MHRA ?â€ â€”":"View official MHRA information ?â€ â€”","Medicamento comprobado en MHRA":"Medicine checked in MHRA","Usar este nombre":"Use this name"
};
let language = localStorage.getItem("mm_language") || "es";
let patientCountry = localStorage.getItem("mm_country") || "ES";
const t = text => fixDisplayText(language === "en" ? (translations[text] || text) : text);
const uiText = (es,en) => language === "en" ? en : es;

function decodeMojibakeOnce(value){
  const text=String(value||"");
  if(!/[ÃÂâ€ÅÆ]/.test(text))return text;
  try{
    const cp1252={
      0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,
      0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,0x2018:0x91,
      0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02dc:0x98,
      0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f
    };
    const bytes=Uint8Array.from([...text].map(ch=>cp1252[ch.charCodeAt(0)]??(ch.charCodeAt(0)&255)));
    return new TextDecoder("utf-8",{fatal:false}).decode(bytes);
  }catch(error){return text}
}
function decodeMojibake(value){
  let text=String(value||"");
  for(let i=0;i<3;i++){
    const next=decodeMojibakeOnce(text);
    if(next===text)break;
    text=next;
  }
  return text;
}
function fixDisplayText(value=""){
  let text=decodeMojibake(value);
  const replacements=[
    ["Medicaci?n","Medicaci\u00f3n"],["medicaci?n","medicaci\u00f3n"],["informaci?n","informaci\u00f3n"],["Informaci?n","Informaci\u00f3n"],["cu?ndo","cu\u00e1ndo"],["Men?","Men\u00fa"],["men?","men\u00fa"],["sesi?n","sesi\u00f3n"],["D?a","D\u00eda"],["d?a","d\u00eda"],["d?as","d\u00edas"],["Atr?s","Atr\u00e1s"],["A?adir","A\u00f1adir"],["a?adir","a\u00f1adir"],["c?mo","c\u00f3mo"],["m?ximo","m\u00e1ximo"],["m?s","m\u00e1s"],["m?vil","m\u00f3vil"],["t?","t\u00fa"],["T?","T\u00fa"],["qu?","qu\u00e9"],["Qu?","Qu\u00e9"],["Tel?fono","Tel\u00e9fono"],["electr?nico","electr\u00f3nico"],["Contrase?a","Contrase\u00f1a"],["contrase?a","contrase\u00f1a"],["M?nimo","M\u00ednimo"],["m?dico","m\u00e9dico"],["farmac?utico","farmac\u00e9utico"],["le?do","le\u00eddo"],["pol?tica","pol\u00edtica"],["autom?tica","autom\u00e1tica"],["activar?","activar\u00e1"],["podr?","podr\u00e1"],["todav?a","todav\u00eda"],["Todav?a","Todav\u00eda"],["Int?ntalo","Int\u00e9ntalo"],["Int?ntalo","Int\u00e9ntalo"],["brit?nico","brit\u00e1nico"],["brit?nico","brit\u00e1nico"],["S?,","S\u00ed,"],["pa?s","pa\u00eds"],["Pa?s","Pa\u00eds"],["Espa?a","Espa\u00f1a"],["Espa?ola","Espa\u00f1ola"],["est?","est\u00e1"],["est?","est\u00e1"],["Est?","Est\u00e1"],["?rea","\u00e1rea"],["c?psula","c\u00e1psula"],["n?tida","n\u00edtida"],["Despu?s","Despu\u00e9s"],["Ma?ana","Ma\u00f1ana"],["F?cil","F\u00e1cil"],["f?cil","f\u00e1cil"],["pr?ximos","pr\u00f3ximos"],["Pr?ximos","Pr\u00f3ximos"],["p?gina","p\u00e1gina"],["operaci?n","operaci\u00f3n"],["aprobaci?n","aprobaci\u00f3n"],["decisi?n","decisi\u00f3n"],["secci?n","secci\u00f3n"],["inyecci?n","inyecci\u00f3n"],["aplicaci?n","aplicaci\u00f3n"],["demostraci?n","demostraci\u00f3n"],["Modo demostraci?n","Modo demostraci\u00f3n"],["ning?n","ning\u00fan"],["Seg?n indicaci?n m?dica","Seg\u00fan indicaci\u00f3n m\u00e9dica"],["ADMINISTRACI?N","ADMINISTRACI\u00d3N"],["ADMINISTRACI??N","ADMINISTRACI\u00d3N"],["GESTI?N","GESTI\u00d3N"],["GESTI??N","GESTI\u00d3N"],["INFORMACI??N","INFORMACI\u00d3N"],["PR??XIMA","PR\u00d3XIMA"],["Posolog?a","Posolog\u00eda"],
    ["??+","\u2190"],["???","\u2190"],["???","\u2192"],["???","\u2197"],["???","\u2713"],["???","\u2630"],["????","\ud83d\udc8a"],["????","\ud83d\udcf7"],["????","\ud83d\udd0e"],["????","\ud83d\udcc5"],["????","\ud83d\udcc4"],["???","\u2026"],["???","\u2014"],["???","\u201c"],["??","+"],["???????","\ud83c\uddea\ud83c\uddf8"],["?Eliminar","\u00bfEliminar"],["?Qu","\u00bfQu"],["?Lo","\u00bfLo"],["?Cu","\u00bfCu"],["?Usar","\u00abUsar"],["nombre?","nombre\u00bb"],[" ? Agencia"," \u00b7 Agencia"],["  + Agencia"," \u00b7 Agencia"],[" ? United"," \u00b7 United"],["PDF ?","PDF \u00b7"],["PNG ?","PNG \u00b7"],[" ? "," \u00b7 "]
  ];
  replacements.forEach(([from,to])=>{text=text.split(from).join(to)});
  return text;
}
function repairVisibleText(root=document.body){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const fixed=fixDisplayText(node.nodeValue);if(fixed!==node.nodeValue)node.nodeValue=fixed});
  document.querySelectorAll('[aria-label],[alt],[title],[data-es]').forEach(el=>{
    ['aria-label','alt','title','data-es'].forEach(attr=>{if(el.hasAttribute(attr))el.setAttribute(attr,fixDisplayText(el.getAttribute(attr)))});
  });
}
function repairAppText(){repairVisibleText();forceCriticalSymbols()}
function updateReminderMenuVisibility(){
  document.querySelectorAll('.user-menu [data-view="reminders"]').forEach(button=>{button.hidden=!remindersAvailable()});
}
function forceCriticalSymbols(){
  const cp=(...codes)=>String.fromCodePoint(...codes);
  const setText=(selector,text)=>{const el=$(selector);if(el&&el.textContent!==text)el.textContent=text};
  const setHtml=(selector,html)=>{const el=$(selector);if(el&&el.innerHTML!==html)el.innerHTML=html};
  setHtml("#openUserMenu",'<span aria-hidden="true">'+cp(0x2630)+'</span><span>'+t("MenÃº")+'</span>');
  setText("#previousDayButton",cp(0x2190));
  setText("#nextDayButton",cp(0x2192));
  setText("#calendarButton",cp(0x1F4C5)+" "+t("Ver semana completa"));
  setText("#closeWeekCalendarButton",cp(0x1F4C5)+" "+(language==="en"?"View daily view":"Ver vista diaria"));
  setText("#installAppButton",language==="en"?"Install app":"Instalar app");
  setText("#savePreferencesButton",language==="en"?"Save changes":"Guardar cambios");
  setText("#changeMethodButton",(language==="en"?"Back":"Atrás"));
  setText("#scheduleBackButton",(language==="en"?"Back":"Atrás"));
  const menuLabels={
    medicines:language==="en"?"Medication":"Medicación",
    today:language==="en"?"Treatment":"Tratamiento",
    sideEffects:language==="en"?"Side effects":"Consultar efectos secundarios",
    reminders:language==="en"?"Reminders":"Recordatorios",
    compliance:language==="en"?"Adherence":"Cumplimiento",
    achievements:language==="en"?"Achievements":"Logros",
    profile:language==="en"?"Edit profile":"Editar perfil"
  };
  Object.entries(menuLabels).forEach(([view,label])=>{
    document.querySelectorAll(`.user-menu [data-view="${view}"]`).forEach(button=>{
      const icon=button.querySelector("span[aria-hidden='true']");
      const iconText=icon?icon.outerHTML:"";
      button.innerHTML=iconText+safe(label);
    });
  });
  document.querySelectorAll('[data-view="medicines"] span[aria-hidden="true"], .medicine-photo-placeholder').forEach(el=>el.textContent=cp(0x1F48A));
  document.querySelectorAll('[data-view="today"] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x2713));
  document.querySelectorAll('[data-view="sideEffects"] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x24D8));
  document.querySelectorAll('[data-view="reminders"] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x1F514));
  document.querySelectorAll('[data-view="compliance"] span[aria-hidden="true"]').forEach(el=>el.textContent="%");
  document.querySelectorAll('[data-view="achievements"] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x1F3C5));
  document.querySelectorAll('[data-view="profile"] span[aria-hidden="true"]').forEach(el=>el.textContent="+");
  document.querySelectorAll('#userAccessibilityButton span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x2699));
  document.querySelectorAll('[data-user-logout] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x2190));
  document.querySelectorAll('[data-user-logout]').forEach(button=>{
    const icon=button.querySelector("span[aria-hidden='true']");
    button.innerHTML=(icon?icon.outerHTML:"")+safe(language==="en"?"Sign out":"Cerrar sesión");
  });
  document.querySelectorAll('[data-medication-mode="upload"] span[aria-hidden="true"], #uploadChoice > span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x1F4F7));
  document.querySelectorAll('[data-medication-mode="search"] span[aria-hidden="true"]').forEach(el=>el.textContent=cp(0x1F50E));
  updateReminderMenuVisibility();
}

function repairMojibake(value=""){
  return String(value)
    .replaceAll("?Æ’?","?").replaceAll("?Æ’?","?").replaceAll("?Æ’?","?").replaceAll("?Æ’?","?").replaceAll("?Æ’?","?")
    .replaceAll("?Æ’?","?").replaceAll("?â€š?","?").replaceAll("?â€š?","?").replaceAll("?â€š?","?")
    .replaceAll("?â€š?","?â‚¬?").replaceAll("?â‚¬?","?â€ ?").replaceAll("?â‚¬?â‚¬â„¢","?â€ â€™").replaceAll("?â‚¬?","?â€ ?")
    .replaceAll("?â€œ?â‚¬Å“","?Å“â€œ").replaceAll("?Å“?","?Ëœ?").replaceAll("?Å¡?â€ž?","?Å¡â„¢")
    .replaceAll("?Å¸?â€™?","?Å¸Å’?").replaceAll("?Å¸?â‚¬Ëœ?","?Å¸â€˜?").replaceAll("?Å¸?â‚¬â„¢Å ","?Å¸â€™Å ").replaceAll("?Å¸?â‚¬Å“?","?Å¸â€œ?")
    .replaceAll("?Å¸?â‚¬Å“?â‚¬?","?Å¸â€œâ€¦").replaceAll("?Å¸?â‚¬?Å½","?Å¸â€Å½").replaceAll("?Å¸?â‚¬?â‚¬â„¢","?Å¸â€â€™").replaceAll("?Å¸?â‚¬?Å¸?â‚¬?","?Å¸â€¡?Å¸â€¡?")
    .replaceAll("?Å¸?â‚¬?Å¸?â‚¬?","?Å¸â€¡?Å¸â€¡?").replaceAll("?â‚¬?","?â€¹").replaceAll("?â‚¬Å“?Å“","?â€œËœ").replaceAll("?â€š?","?â‚¬?");
}
Object.assign(translations,{
  "Tomas":"Treatment",
  "Tomas de hoy":"Treatment",
  "MedicaciÃ³n y tomas":"Medication and treatment",
  "Sin tomas programadas":"No scheduled treatment",
  "Marca cada toma cuando la realices.":"Mark each treatment when completed.",
  "No tienes tomas confirmadas.":"You have no confirmed treatment yet.",
  "Interpretando medicamentos y tomas?â‚¬?":"Interpreting medicines and treatment?â‚¬?",
  "Ahora indica las tomas":"Now enter the treatment",
  "Sin tratamiento programado":"No scheduled treatment",
  "Pendiente de tomar":"Pending treatment",
  "Pendiente de tratamiento":"Pending treatment",
  "?â€ + AtrÃ¡s":"?â€ ? Back",
  "+ AÃ±adir nuevo medicamento":"+ Add new medicine",
  "AÃ±adir nuevo medicamento":"Add new medicine",
  "Guardar cambios":"Save changes",
  "Resumen de todos los tratamientos que tomas.":"Summary of all your treatments.",
  "Resumen de todos tus tratamientos.":"Summary of all your treatments.",
  "Configurar tomas":"Configure treatment",
  "Configurar tratamiento":"Configure treatment",
  "Tomas configuradas.":"Treatment configured.",
  "Tratamiento configurado.":"Treatment configured.",
  "Â¿Lo tomas todos los dÃ­as?":"Daily treatment?",
  "Â¿Tratamiento diario?":"Daily treatment?",
  "Frecuencia de administraci?n":"Administration frequency",
  "Â¿QuÃ© dÃ­as lo tomas?":"Which days do you follow the treatment?",
  "Â¿QuÃ© dÃ­as sigues el tratamiento?":"Which days do you follow the treatment?",
  "Â¿Cu?ndo lo tomas?":"When do you follow the treatment?",
  "Â¿Cu?ndo sigues el tratamiento?":"When do you follow the treatment?",
  "Todos los dÃ­as":"Every day",
  "Algunos dÃ­as":"Some days",
  "Elegir dÃ­as concretos":"Choose specific days",
  "De lunes a domingo":"Monday to Sunday",
  "Lunes":"Monday",
  "Martes":"Tuesday",
  "Mi?rcoles":"Wednesday",
  "Jueves":"Thursday",
  "Viernes":"Friday",
  "S?bado":"Saturday",
  "Domingo":"Sunday",
  "Fecha de inicio":"Start date",
  "Fecha de fin (opcional)":"End date (optional)",
  "InformaciÃ³n oficial y prospecto en MHRA ?â€ â€”":"Official information and leaflet from MHRA ?â€ â€”",
  "Ficha del medicamento en CIMA ?â€ â€”":"Medicine record in CIMA ?â€ â€”",
  "Buscar medicamento en CIMA ?â€ â€”":"Search medicine in CIMA ?â€ â€”",
  "AÃ±adir medicamento":"Add medicine",
  "Foto del medicamento":"Medicine photo",
  "Haz una foto a la caja o envase":"Take a photo of the box or package",
  "Hacer foto o elegir imagen":"Take photo or choose image",
  "JPG o PNG Â· mÃ¡ximo 10 MB":"JPG or PNG Â· 10 MB maximum",
  "Todos los dÃ­as":"Every day",
  "Algunos dÃ­as":"Some days",
  "Elegir dÃ­as concretos":"Choose specific days",
  "Elige los dÃ­as":"Choose the days",
  "Continuar":"Continue",
  "Elige las tomas del dÃ­a":"Choose daily treatment",
  "Elige el tratamiento del dÃ­a":"Choose daily treatment",
  "Toma adicional":"Additional treatment",
  "Tratamiento adicional":"Additional treatment",
  "Selecciona desayuno, comida y cena.":"Select breakfast, lunch and dinner.",
  "Desayuno":"Breakfast",
  "Comida":"Lunch",
  "Cena":"Dinner",
  "Selecciona los dÃ­as de la toma.":"Select the treatment days.",
  "Selecciona los dÃ­as del tratamiento.":"Select the treatment days.",
  "Selecciona desayuno, comida o cena.":"Select breakfast, lunch or dinner.",
  "MenÃº":"Menu",
  "C?mara":"Camera",
  "Galer?a":"Gallery",
  "MaÃ±ana":"Tomorrow",
  "Ayer":"Yesterday",
  "Elige una fecha":"Choose a date",
  "Ver calendario":"View calendar",
  "Ver semana completa":"View full week"
});
Object.assign(translations,{
  "He olvidado mi contrase?Æ’?a":"I forgot my password",
  "Escribe primero tu correo electr?Æ’?nico.":"Enter your email address first.",
  "Firebase no estÃ¡Æ’? conectado en esta versi?Æ’?n de la p?Æ’?gina.":"Firebase is not connected in this version of the page.",
  "Enviando enlace de recuperaci?Æ’?n?â€š?":"Sending recovery link?â‚¬?",
  "Te hemos enviado un enlace para restaurar la contrase?Æ’?a.":"We have sent you a link to reset your password.",
  "El correo electr?Æ’?nico no es v?Æ’?lido.":"The email address is not valid.",
  "No se pudo enviar el enlace. Comprueba el correo e intÃºÆ’?ntalo de nuevo.":"The link could not be sent. Check the email address and try again.",
  "El enlace para restaurar la contrase?Æ’?a no es v?Æ’?lido o ha caducado.":"The password reset link is invalid or has expired.",
  "Guardando contrase?Æ’?a?â€š?":"Saving password?â‚¬?",
  "Contrase?Æ’?a actualizada. Ya puedes entrar con la nueva contrase?Æ’?a.":"Password updated. You can now sign in with the new password.",
  "La contrase?Æ’?a debe tener al menos 8 caracteres.":"The password must be at least 8 characters.",
  "No se pudo actualizar la contrase?Æ’?a. Solicita un enlace nuevo.":"The password could not be updated. Request a new link."
});
Object.assign(translations,{
  "He olvidado mi contraseÃ±a":"I forgot my password",
  "Escribe primero tu correo electrÃ³nico.":"Enter your email address first.",
  "Firebase no estÃ¡ conectado en esta versi?n de la pÃ¡gina.":"Firebase is not connected in this version of the page.",
  "Enviando enlace de recuperaci?n?â‚¬?":"Sending recovery link?â‚¬?",
  "Te hemos enviado un enlace para restaurar la contraseÃ±a.":"We have sent you a link to reset your password.",
  "El correo electrÃ³nico no es vÃ¡lido.":"The email address is not valid.",
  "No se pudo enviar el enlace. Comprueba el correo e intÃºntalo de nuevo.":"The link could not be sent. Check the email address and try again.",
  "El enlace para restaurar la contraseÃ±a no es vÃ¡lido o ha caducado.":"The password reset link is invalid or has expired.",
  "Guardando contraseÃ±a?â‚¬?":"Saving password?â‚¬?",
  "ContraseÃ±a actualizada. Ya puedes entrar con la nueva contraseÃ±a.":"Password updated. You can now sign in with the new password.",
  "La contraseÃ±a debe tener al menos 8 caracteres.":"The password must be at least 8 characters.",
  "No se pudo actualizar la contraseÃ±a. Solicita un enlace nuevo.":"The password could not be updated. Request a new link."
});
Object.assign(translations,{
  "Modificar perfil":"Edit profile",
  "AÃ±adir o cambiar foto":"Add or change photo",
  "Fecha de nacimiento":"Date of birth",
  "TelÃ©fono mÃ³vil":"Mobile phone",
  "PaÃ­s del paciente":"Patient's country",
  "Correo electrÃ³nico":"Email address",
  "El correo se usa para entrar y no se puede cambiar desde aquÃ©.":"This email is used to sign in and cannot be changed here.",
  "Guardar cambios":"Save changes",
  "Guardando cambios?â‚¬?":"Saving changes?â‚¬?",
  "Perfil guardado.":"Profile saved.",
  "No se pudo guardar el perfil.":"The profile could not be saved.",
  "La foto de perfil no puede superar los 5 MB.":"The profile photo cannot be larger than 5 MB."
});
Object.assign(translations,{
  "Comprobando estado de la cuenta\u2026":"Checking account status\u2026",
  "Tu solicitud todav\u00eda est\u00e1 pendiente de aprobaci\u00f3n por el administrador.":"Your request is still awaiting administrator approval.",
  "Tu cuenta est\u00e1 bloqueada. Contacta con el administrador.":"Your account is blocked. Contact the administrator.",
  "No se pudo comprobar el estado de la cuenta. Int\u00e9ntalo de nuevo.":"The account status could not be checked. Try again."
});
Object.assign(translations,{
  "Calendario semanal":"Weekly calendar",
  "Semana":"Week",
  "Semana del":"Week of",
  "Sin tomas":"No treatment",
  "Sin tratamiento":"No treatment",
  "Leyenda":"Legend"
});
Object.assign(translations,{
  "InformaciÃ³n sanitaria oficial":"Official health information",
  "Si tienes s?ntomas graves o inesperados, contacta con un profesional sanitario. En urgencias, llama al 112.":"If you have severe or unexpected symptoms, contact a healthcare professional. In an emergency, call 112."
});
Object.assign(translations,{
  "Posolog?a":"Dosage",
  "Cantidad":"Amount",
  "Unidad":"Unit",
  "Comentarios":"Comments",
  "Notas opcionales":"Optional notes",
  "Ej.: tomar con agua":"E.g. take with water"
});
function applyLanguage(){
  document.documentElement.lang=language;
  document.title=language==="en"?"Your Medication":"Tu Medicación";
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let node;
  while(node=walker.nextNode()){
    if(!node.parentElement || ["SCRIPT","STYLE"].includes(node.parentElement.tagName)) continue;
    node.nodeValue=fixDisplayText(node.nodeValue);
    if(node._es===undefined) node._es=node.nodeValue;
    const raw=node._es, value=raw.trim();
    if(translations[value]) node.nodeValue=raw.replace(value,t(value));
  }
  document.querySelectorAll("input[placeholder]").forEach(el=>{el.dataset.esPlaceholder ||= el.placeholder;el.placeholder=t(el.dataset.esPlaceholder)});
  document.querySelectorAll("[data-language]").forEach(b=>{const on=b.dataset.language===language;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
  document.querySelectorAll("[data-es][data-en]").forEach(el=>el.textContent=el.dataset[language]);
  const date=document.querySelector("#todayDate"); if(date) date.textContent=new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).toUpperCase();
  updateOfficialMedicineSourceUi();
  cleanLandingCopy();
}

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let toastTimer;
const toast = (message,duration=3000) => { const el=$("#toast");clearTimeout(toastTimer);el.textContent=String(message||"").trim();if(!el.textContent){el.classList.remove("show");return}el.classList.add("show");toastTimer=setTimeout(()=>el.classList.remove("show"),duration); };
let selectedProfilePhoto=null;
let selectedEditProfilePhoto=null;
let selectedFrequency=null;
let selectedScheduleDate=new Date();
let selectedWeekStart=null;
let userLoginInProgress=false;
let pendingSignedOutCheck=null;
function handleRegisterProfilePhoto(event){const file=event.target.files[0];if(!file)return;if(file.size>5*1024*1024){event.target.value="";toast("La foto de perfil no puede superar los 5 MB.");return}selectedProfilePhoto=file;const url=URL.createObjectURL(file);const preview=$("#profilePhotoPreview");preview.innerHTML=`<img src="${url}" alt="Vista previa de la foto de perfil">`;$("img",preview).onload=()=>URL.revokeObjectURL(url)}
$("#profilePhotoInput").onchange=handleRegisterProfilePhoto;
$("#profilePhotoCameraInput").onchange=handleRegisterProfilePhoto;
async function updateUserPhoto(event){
  const file=event.target.files[0];if(!file)return;if(file.size>5*1024*1024){event.target.value="";toast("La foto de perfil no puede superar los 5 MB.");return}
  const url=URL.createObjectURL(file);setUserPhotoPreview(url,true);
  try{if(fb&&state.user){const path=`users/${state.user.uid}/profile/avatar`;await fb.uploadBytes(fb.ref(fb.storage,path),file,{contentType:file.type});await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid),{photoPath:path});state.user.photoPath=path}toast("Foto de perfil actualizada.")}catch(error){setUserPhotoPreview(null);toast("No se pudo guardar la foto.")}
}
function setUserPhotoPreview(url,revoke=false){
  const targets=["#userInitial","#menuUserPhoto"].map(id=>$(id)).filter(Boolean);
  targets.forEach(target=>{target.innerHTML=url?`<img src="${url}" alt="Foto de perfil">`:"+";const img=$("img",target);if(img&&revoke)img.onload=()=>URL.revokeObjectURL(url)});
}
function splitUserName(user=state.user||{}){
  const first=user.firstName||String(user.name||"").trim().split(/\s+/).slice(0,1).join(""),last=user.lastName||String(user.name||"").trim().split(/\s+/).slice(1).join(" ");
  return {first,last};
}
function setEditProfilePhotoPreview(url,revoke=false){
  const target=$("#editProfilePhotoPreview");if(!target)return;
  target.innerHTML=url?`<img src="${url}" alt="Foto de perfil">`:"+";
  const img=$("img",target);if(img&&revoke)img.onload=()=>URL.revokeObjectURL(url);
}
function handleEditProfilePhoto(event){
  const file=event.target.files[0];if(!file)return;
  if(file.size>5*1024*1024){event.target.value="";toast(t("La foto de perfil no puede superar los 5 MB."));return}
  selectedEditProfilePhoto=file;
  setEditProfilePhotoPreview(URL.createObjectURL(file),true);
}
function hydrateProfileForm(){
  const form=$("#profileForm");if(!form)return;
  const user=state.user||{},parts=splitUserName(user);
  form.elements.name.value=parts.first||"";
  form.elements.lastName.value=parts.last||"";
  form.elements.birthDate.value=user.birthDate||"";
  form.elements.phone.value=user.phone||"";
  form.elements.country.value=user.country||patientCountry||"ES";
  form.elements.email.value=user.email||"";
  selectedEditProfilePhoto=null;
  setEditProfilePhotoPreview(null);
  if(fb&&user.photoPath)fb.getDownloadURL(fb.ref(fb.storage,user.photoPath)).then(url=>setEditProfilePhotoPreview(url)).catch(()=>{});
}
async function saveEditableProfile(event){
  event.preventDefault();
  const form=event.target,status=$(".form-status",form),submit=$("button[type=submit]",form),data=Object.fromEntries(new FormData(form));
  const updates={firstName:data.name.trim(),lastName:data.lastName.trim(),name:`${data.name} ${data.lastName}`.trim(),birthDate:data.birthDate||"",phone:data.phone||"",country:data.country||"ES",updatedAt:new Date().toISOString()};
  submit.disabled=true;status.textContent=t("Guardando cambios\u2026");
  try{
    if(fb&&state.user){
      const userRef=fb.doc(fb.db,"users",state.user.uid);
      if(selectedEditProfilePhoto){
        const path=`users/${state.user.uid}/profile/avatar`;
        await fb.uploadBytes(fb.ref(fb.storage,path),selectedEditProfilePhoto,{contentType:selectedEditProfilePhoto.type});
        updates.photoPath=path;
      }
      await fb.updateDoc(userRef,{...updates,updatedAt:fb.serverTimestamp()});
    }
    Object.assign(state.user,updates);
    if(selectedEditProfilePhoto&&updates.photoPath)state.user.photoPath=updates.photoPath;
    setPatientCountry(updates.country,false);
    hydrateUserMenu();
    if(fb&&state.user?.photoPath)fb.getDownloadURL(fb.ref(fb.storage,state.user.photoPath)).then(url=>setUserPhotoPreview(url)).catch(()=>{});
    status.textContent=t("Perfil guardado.");
    toast(t("Perfil guardado."));
    selectedEditProfilePhoto=null;
  }catch(error){
    status.textContent=t("No se pudo guardar el perfil.");
    toast(t("No se pudo guardar el perfil."));
  }finally{submit.disabled=false}
}
$("#editProfilePhotoInput")?.addEventListener("change",handleEditProfilePhoto);
$("#editProfilePhotoCameraInput")?.addEventListener("change",handleEditProfilePhoto);
$("#profileForm")?.addEventListener("submit",saveEditableProfile);

async function initFirebase(){
  if(demo) return;
  const appMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
  const authMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
  const dbMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
  const storageMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js");
  const fnMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js");
  const msgMod=await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js").catch(()=>null);
  const app=appMod.initializeApp(firebaseConfig);
  fb={app,auth:authMod.getAuth(app),db:dbMod.getFirestore(app),storage:storageMod.getStorage(app),functions:fnMod.getFunctions(app,"europe-west1"),messagingMod:msgMod,...authMod,...dbMod,...storageMod,...fnMod};
  fb.auth.languageCode=language==="en"?"en":"es";
  try{await fb.setPersistence(fb.auth,fb.browserLocalPersistence)}catch(error){}
  fb.onAuthStateChanged(fb.auth,user=>{
    clearTimeout(pendingSignedOutCheck);
    if(userLoginInProgress)return;
    // Confirma el cierre antes de cambiar de pantalla: evita que un estado
    // transitorio de Firebase expulse al usuario mientras estÃ¡ trabajando.
    if(!user){pendingSignedOutCheck=setTimeout(()=>{if(!fb.auth.currentUser&&!userLoginInProgress&&!state.user){showLanding();showLastLoginError()}},900);return;}
    if(state.user?.uid===user.uid)return;
    if(!state.user&&!userLoginInProgress)return;
    enterAuthenticatedUser(user).then(result=>{if(!result.ok){rememberLoginError(result.message);showLanding();showLastLoginError()}});
  });
  handlePasswordActionLink();
}

function passwordResetActionSettings(){
  const cleanUrl=new URL(window.location.origin);
  cleanUrl.pathname="/reset-password";
  return {url:cleanUrl.toString(),handleCodeInApp:false};
}

async function handlePasswordActionLink(){
  if(!fb)return;
  const searchParams=new URLSearchParams(window.location.search);
  const hashParams=new URLSearchParams(window.location.hash.replace(/^#/,""));
  const getParam=name=>searchParams.get(name)||hashParams.get(name);
  if(getParam("mode")!=="resetPassword")return;
  const code=getParam("oobCode"),dialog=$("#resetPasswordDialog"),form=$("#resetPasswordForm"),status=$(".form-status",form);
  if(!code||!dialog||!form)return;
  try{await fb.verifyPasswordResetCode(fb.auth,code);}
  catch(error){status.textContent=t("El enlace para restaurar la contrase\u00f1a no es v\u00e1lido o ha caducado.");}
  openDialogById("resetPasswordDialog");
  form.onsubmit=async event=>{
    event.preventDefault();
    const submit=$("button[type=submit]",form),password=$('[name="password"]',form).value;
    submit.disabled=true;status.textContent=t("Guardando contrase\u00f1a\u2026");
    try{
      await fb.confirmPasswordReset(fb.auth,code,password);
      status.textContent=t("Contrase\u00f1a actualizada. Ya puedes entrar con la nueva contrase\u00f1a.");
      window.history.replaceState({},document.title,passwordResetActionSettings().url);
    }catch(error){
      status.textContent=error.code?.includes("weak-password")?t("La contrase\u00f1a debe tener al menos 8 caracteres."):t("No se pudo actualizar la contrase\u00f1a. Solicita un enlace nuevo.");
    }finally{submit.disabled=false}
  };
}

async function enterAuthenticatedUser(user){
  let profile;
  try{
    let snap;
    try{snap=await fb.getDocFromServer(fb.doc(fb.db,"users",user.uid));}
    catch(error){snap=await fb.getDoc(fb.doc(fb.db,"users",user.uid));}
    profile=snap.data();
  }catch(error){
    state.user=null;
    return {ok:false,message:uiText("Has iniciado sesi\u00f3n, pero no se pudo leer la aprobaci\u00f3n del usuario. Prueba a borrar cach\u00e9 o entra en una ventana de inc\u00f3gnito.","You signed in, but the user approval could not be read. Try clearing the cache or using an incognito window.")};
  }
  if(!profile){await fb.signOut(fb.auth);return {ok:false,message:uiText("No se encontr\u00f3 el perfil de esta cuenta.","The profile for this account was not found.")};}
  if(profile.status!=="approved"){
    const message=profile.status==="blocked"?uiText("Tu cuenta est\u00e1 bloqueada. Contacta con el administrador.","Your account is blocked. Contact the administrator."):uiText("Tu solicitud todav\u00eda no ha sido aprobada.","Your request has not been approved yet.");
    await fb.signOut(fb.auth);return {ok:false,message};
  }
  if(profile.role==="admin"){
    state.user=null;await fb.signOut(fb.auth);return {ok:false,message:uiText("Esta cuenta es de administraci\u00f3n. Entra desde la web de administrador.","This is an administrator account. Sign in from the administrator website.")};
  }
  state.user={uid:user.uid,email:user.email,...profile};
  if(["es","en"].includes(profile.preferredLanguage)){language=profile.preferredLanguage;localStorage.setItem("mm_language",language)}
  state.medicines=[];
  try{showApp();}
  catch(error){
    document.body.classList.remove("admin-mode");document.body.classList.add("user-mode");
    $("#landing").hidden=true;$("#appView").hidden=false;$("#adminView").hidden=true;
    openView("today");
    toast("Has accedido, pero hubo un problema al preparar la pantalla. Recarga la pÃ¡gina.",7000);
  }
  try{await loadMedicines();await loadIntakes();renderAll();}
  catch(error){state.medicines=[];try{renderAll()}catch(renderError){}toast("Has accedido, pero no se pudo cargar la medicaciÃ³n.");}
  return {ok:true};
}
const userViewIds=["today","medicines","documents","sideEffects","reminders","compliance","achievements","profile"];
let suppressHashNavigation=false;
function isInstalledAppMode(){
  return Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches||window.matchMedia?.("(display-mode: fullscreen)")?.matches||navigator.standalone);
}
function remindersAvailable(){
  return isInstalledAppMode()&&/Android/i.test(navigator.userAgent);
}
function currentHashView(){const value=window.location.hash.replace(/^#/,"");return userViewIds.includes(value)&&!(value==="reminders"&&!remindersAvailable())?value:""}
function showLanding(){
  const recentLogin=Number(sessionStorage.getItem("mm_login_success_at")||0);
  if(state.user&&Date.now()-recentLogin<8000)return;
  suppressHashNavigation=true; if(window.location.hash)window.history.replaceState({},document.title,window.location.pathname+window.location.search); suppressHashNavigation=false; document.body.classList.remove("admin-mode","user-mode");
  const landing=$("#landing"),appView=$("#appView"),adminView=$("#adminView");
  if(landing){landing.hidden=false;landing.style.display="";}
  if($(".public-features"))$(".public-features").hidden=false;
  if(appView){appView.hidden=true;appView.style.display="none";}
  if(adminView){adminView.hidden=true;adminView.style.display="none";}
  sessionStorage.removeItem("mm_login_diagnostic");
  sessionStorage.removeItem("mm_login_diagnostic_at");
  document.body.classList.remove("booting");
}
function rememberLoginError(message){if(message)sessionStorage.setItem("mm_last_login_error",message)}
function clearLoginError(){sessionStorage.removeItem("mm_last_login_error");sessionStorage.removeItem("mm_login_diagnostic");sessionStorage.removeItem("mm_login_diagnostic_at")}
function rememberLoginDiagnostic(message){if(message){sessionStorage.setItem("mm_login_diagnostic",message);sessionStorage.setItem("mm_login_diagnostic_at",String(Date.now()))}}
function showLastLoginError(){
  const message=sessionStorage.getItem("mm_last_login_error")||sessionStorage.getItem("mm_login_diagnostic");if(!message)return;
  const dialog=$("#loginDialog"),form=$("#loginForm"),status=form?$(".form-status",form):null;
  if(status)status.textContent=message;
  if(dialog&&!dialog.open)openDialogById("loginDialog",{keepForm:true});
}
function showApp(){
  document.body.classList.remove("admin-mode");document.body.classList.add("user-mode");
  document.body.classList.remove("booting");
  document.body.classList.remove("font-large","font-xlarge");
  document.documentElement.style.fontSize="";
  setHighContrast(typeof state.user?.highContrast==="boolean"?state.user.highContrast:localStorage.getItem("mm_contrast")==="true",false);
  const landing=$("#landing"),appView=$("#appView"),adminView=$("#adminView");
  if(landing){landing.hidden=true;landing.style.display="none";}
  if(appView){appView.hidden=false;appView.style.display="";}
  if($(".public-features"))$(".public-features").hidden=true;
  if(adminView){adminView.hidden=true;adminView.style.display="none";}
  if($("#profileEmailInput"))$("#profileEmailInput").value=state.user?.email || "Modo demostraci?n";
  if($("#summaryName"))$("#summaryName").textContent=state.user?.name || "Usuario";
  if($("#summaryEmail"))$("#summaryEmail").textContent=state.user?.email || "Modo demostraci?n";
  setPatientCountry(state.user?.country||patientCountry,false);
  if($("#userInitial"))$("#userInitial").textContent="+";
  if(fb&&state.user?.photoPath)fb.getDownloadURL(fb.ref(fb.storage,state.user.photoPath)).then(url=>setUserPhotoPreview(url)).catch(()=>{});
  $("#todayDate").textContent=new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).toUpperCase();
  const initialView=currentHashView();
  renderAll(); openView(initialView||"today",{replace:!!initialView});
}
function completeLoginSuccess(form,status){
  clearLoginError();
  sessionStorage.setItem("mm_login_success_at",String(Date.now()));
  const dialog=form?.closest("dialog"); if(dialog?.open)dialog.close();
  if(form)form.reset();
  if(status)status.textContent="";
  showApp();
  openView("today",{replace:true});
  document.body.classList.add("user-mode");
  document.body.classList.remove("admin-mode");
  const landing=$("#landing"),appView=$("#appView"),adminView=$("#adminView");
  if(landing){landing.hidden=true;landing.style.display="none";}
  if(appView){appView.hidden=false;appView.style.display="";}
  if(adminView){adminView.hidden=true;adminView.style.display="none";}
}
function openView(id,options={}){
  if(id==="reminders"&&!remindersAvailable())id="today";
  if(!userViewIds.includes(id)&&id!=="admin")id="today";
  $$(".view").forEach(v=>{v.hidden=v.id!==id;v.classList.toggle("active-view",v.id===id)});
  $$(".user-menu [data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  if(id==="admin") renderRequests();
  if(id==="sideEffects") renderSideEffectsMedicines();
  if(id==="reminders") renderReminders();
  if(id==="compliance") renderComplianceSummary();
  if(id==="achievements") renderAchievements();
  if(id==="profile") hydrateProfileForm();
  if(id==="documents"&&!options.keepDocumentState)resetMedicationMethodScreen();
  if(state.user&&id!=="admin"){
    const target=`#${id}`;
    if(window.location.hash!==target){
      suppressHashNavigation=true;
      const method=options.replace?"replaceState":"pushState";
      window.history[method]({view:id},document.title,target);
      suppressHashNavigation=false;
    }
  }
}
function renderAll(){ renderSchedule(); renderMedicines(); applyLanguage(); }
function renderSchedule(){
  const days=[new Date()];days[0].setHours(12,0,0,0);
  const confirmed=state.medicines.filter(m=>m.confirmed).sort((a,b)=>a.time.localeCompare(b.time));
  $("#schedule").innerHTML=days.map((date,index)=>{
    const iso=date.toISOString().slice(0,10);
    const medicines=confirmed.filter(m=>(!m.startDate||m.startDate<=iso)&&(!m.endDate||m.endDate>=iso));
    const label=index===0?t("Hoy"):new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{weekday:"long"}).format(date);
    const fullDate=new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{day:"numeric",month:"short"}).format(date);
    const doses=medicines.map(m=>`<div class="day-dose"><div class="dose-top"><b>${safe(m.time)}</b><button class="status-button" data-take data-medicine="${safe(m.id)}" data-date="${iso}">${uiText("Realizado","Completed")}</button></div><div class="dose-medicine"><strong>${safe(medicineShortName(m))}</strong><p>${safe(t(m.instructions||"Seg?n indicaci?n m?dica"))}</p></div></div>`).join("");
    return `<article class="day-group"><header class="day-heading ${index===0?"today":""}"><h3>${safe(label)}</h3><span>${safe(fullDate)}</span></header>${doses||`<p class="empty-day">${uiText("Sin tratamiento programado","No scheduled treatment")}</p>`}</article>`;
  }).join("");
  $$('[data-take]').forEach(b=>setupTakeButton(b));
}
async function recordIntake(medicineId,date,taken){
  if(!state.user)return;
  if(taken&&isFutureIntakeDate(date)){toast(uiText("No puedes marcar como realizado un tratamiento futuro.","You cannot mark future treatment as completed."));return}
  const id=intakeStorageId(medicineId,date),medicine=state.medicines.find(item=>item.id===medicineId);
  if(fb){const ref=fb.doc(fb.db,"users",state.user.uid,"intakes",id);if(taken){const intake={medicineId,medicineName:medicine?.name||"",dose:medicine?.dose||"",scheduledDate:date,scheduledTime:medicine?.time||"",status:"taken"};await fb.setDoc(ref,{...intake,takenAt:fb.serverTimestamp()});state.intakes[id]={id,...intake}}else{await fb.deleteDoc(ref);delete state.intakes[id]}}
  else{const intakes=JSON.parse(localStorage.getItem("mm_intakes")||"{}");if(taken)intakes[id]={id,medicineId,medicineName:medicine?.name,date,scheduledDate:date,status:"taken"};else delete intakes[id];state.intakes=intakes;localStorage.setItem("mm_intakes",JSON.stringify(intakes))}
}
function intakeStorageId(medicineId,dateKey){
  const key=String(dateKey||"");
  return key.endsWith(`_${medicineId}`)?key:`${key}_${medicineId}`;
}
function intakeBaseIso(date){return String(date||"").slice(0,10)}
function todayIso(){const today=new Date();today.setHours(12,0,0,0);return today.toISOString().slice(0,10)}
function yesterdayIso(){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-1);return date.toISOString().slice(0,10)}
function isFutureIntakeDate(date){const iso=intakeBaseIso(date);return Boolean(iso&&iso>todayIso())}
function setupTakeButton(button,compact=false){
  const future=isFutureIntakeDate(button.dataset.date);
  button.disabled=future;
  button.classList.toggle("future-disabled",future);
  if(future){
    button.setAttribute("aria-label",uiText("No disponible para fechas futuras","Not available for future dates"));
    button.setAttribute("title",uiText("No puedes marcar tratamientos futuros","Future treatments cannot be marked as completed"));
    return;
  }
  const initialTaken=isIntakeTaken(button.dataset.medicine,button.dataset.date);
  button.classList.toggle("taken",initialTaken);
  button.textContent=compact?(initialTaken?String.fromCodePoint(0x2713):String.fromCodePoint(0x25CB)):(initialTaken?`${String.fromCodePoint(0x2713)} ${uiText("Realizado","Completed")}`:uiText("Realizado","Completed"));
  button.setAttribute("aria-label",initialTaken?uiText("Tratamiento realizado","Treatment completed"):t("Pendiente de tratamiento"));
  button.setAttribute("aria-pressed",String(initialTaken));
  button.onclick=async()=>{
    button.classList.toggle("taken");
    const taken=button.classList.contains("taken");
    button.textContent=compact?(taken?String.fromCodePoint(0x2713):String.fromCodePoint(0x25CB)):(taken?`${String.fromCodePoint(0x2713)} ${uiText("Realizado","Completed")}`:uiText("Realizado","Completed"));
    button.setAttribute("aria-label",taken?uiText("Tratamiento realizado","Treatment completed"):t("Pendiente de tratamiento"));
    button.setAttribute("aria-pressed",String(taken));
    await recordIntake(button.dataset.medicine,button.dataset.date,taken);
  };
}
function medicineShortName(medicine){
  const raw=String(medicine?.name||"").trim().replace(/\s+/g," ");
  const dose=String(medicine?.dose||"").trim();
  if(!raw)return dose||t("Nombre no reconocido");
  const strengthMatch=raw.match(/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|ug|g|ml|ui|u\.?i\.?|%)\b/i);
  const base=strengthMatch?raw.slice(0,strengthMatch.index+strengthMatch[0].length):raw.split(/\s+(?:POLVO|COMPRIMIDOS?|CAPSULAS?|SOLUCION|INYECTABLE|VIAL|TABLETAS?|SOBRES?)\b/i)[0];
  const compact=base.trim()||raw;
  const hasDose=dose&&compact.toLowerCase().includes(dose.toLowerCase());
  return hasDose||!dose?compact:compact+" "+dose;
}
function medicineScheduleText(medicine){
  if(medicine?.schedule?.meals?.length){
    const days=(medicine.schedule.days||[]).map(d=>dayLabels[d]||d).join(", ");
    const meals=(medicine.schedule.meals||[]).map(meal=>meal.label).join(", ");
    return [days,meals].filter(Boolean).join(" ? ");
  }
  return [medicine?.time,medicine?.instructions].filter(Boolean).join(" ? ");
}
const medicineImageHydration=new Set();
async function hydrateMedicineImage(medicine){
  if(!medicine?.cimaId||(medicine.imageUrl&&medicine.activeIngredient)||medicineImageHydration.has(medicine.id))return;
  medicineImageHydration.add(medicine.id);
  try{
    const response=await fetch(`https://cima.aemps.es/cima/rest/medicamento?nregistro=${encodeURIComponent(medicine.cimaId)}`);
    if(!response.ok)return;
    const detail=await response.json(),imageUrl=findCimaPhoto(detail),activeIngredient=detail.pactivos||medicine.activeIngredient||"";
    const updates={};
    if(imageUrl&&!medicine.imageUrl){medicine.imageUrl=imageUrl;updates.imageUrl=imageUrl}
    if(activeIngredient&&!medicine.activeIngredient){medicine.activeIngredient=activeIngredient;updates.activeIngredient=activeIngredient}
    if(!Object.keys(updates).length)return;
    if(fb&&state.user)await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid,"medicines",medicine.id),updates);
    renderMedicines();
  }catch(error){}
}
function medicineImageMarkup(medicine){
  const imageUrl=medicine?.imageUrl||medicine?.medicineImageUrl||medicine?.photoUrl||"";
  if(imageUrl)return '<img class="medicine-photo" src="'+safe(imageUrl)+'" alt="'+safe(medicineShortName(medicine))+'">';
  return '<span class="medicine-photo-placeholder" aria-hidden="true">?Å¸â€™Å </span>';
}
function isMedicineArchived(medicine){return Boolean(medicine?.deletedAt)}
function activeMedicines(){const today=todayIso();return state.medicines.filter(m=>m.confirmed&&!isMedicineArchived(m)&&(!m.endDate||m.endDate>=today))}
function renderMedicines(){
  const list=$("#medicineList"),detail=$("#medicineDetail");
  const heading=$(".medicines-heading");
  if(heading)heading.hidden=false;
  if(detail){detail.hidden=true;detail.innerHTML=""}
  list.hidden=false;
  const medicines=activeMedicines();
  list.innerHTML=medicines.map(m=>{
    const title=medicineShortName(m);
    const generic=m.activeIngredient?'<small class="medicine-generic-name">'+safe(m.activeIngredient)+'</small>':"";
    return '<button type="button" class="medicine-card medicine-summary-card" data-medicine-detail="'+safe(m.id)+'">'+medicineImageMarkup(m)+'<span><b>'+safe(title)+'</b>'+generic+'</span></button>';
  }).join("")||'<div class="panel">'+t("Todav?a no tienes medicamentos confirmados.")+'</div>';
  medicines.forEach(hydrateMedicineImage);
  $$('img.medicine-photo',list).forEach(image=>image.onerror=()=>{image.outerHTML='<span class="medicine-photo-placeholder" aria-hidden="true">?Å¸â€™Å </span>'});
  $$('[data-medicine-detail]',list).forEach(button=>button.onclick=()=>showMedicineDetail(button.dataset.medicineDetail));
}
function showMedicineDetail(id){
  const medicine=state.medicines.find(item=>item.id===id),list=$("#medicineList"),detail=$("#medicineDetail");
  if(!medicine||!detail)return;
  const heading=$(".medicines-heading");
  const british=medicine.officialSource==="MHRA"||medicine.country==="GB";
  const officialUrl=british
    ? 'https://products.mhra.gov.uk/search?search='+encodeURIComponent(medicine.name)+"&page=1"
    : medicine.cimaId
      ? 'https://cima.aemps.es/cima/publico/detalle.html?nregistro='+encodeURIComponent(medicine.cimaId)
      : 'https://cima.aemps.es/cima/publico/lista.html?nombre='+encodeURIComponent(medicine.name);
  const officialLabel=british?(language==="en"?"Official information and leaflet in MHRA":"Información oficial y prospecto en MHRA"):medicine.cimaId?(language==="en"?"Medicine record in CIMA":"Ficha del medicamento en CIMA"):(language==="en"?"Search medicine in CIMA":"Buscar medicamento en CIMA");
  if(heading)heading.hidden=true;
  list.hidden=true;
  detail.hidden=false;
  const activeMarkup=medicine.activeIngredient?'<div><dt>'+t("Principio activo")+'</dt><dd>'+safe(medicine.activeIngredient)+'</dd></div>':"";
  const posologyMarkup=medicineDoseLine(medicine)?'<div><dt>'+(language==="en"?"Posology":"Posología")+'</dt><dd>'+safe(medicineDoseLine(medicine))+'</dd></div>':"";
  const commentsMarkup=medicine.comments?'<div><dt>'+t("Comentarios")+'</dt><dd>'+safe(medicine.comments)+'</dd></div>':"";
  detail.innerHTML='<button class="secondary medicine-back-button" type="button" data-back-medicines>'+(language==="en"?"Back":"Atrás")+'</button><div class="medicine-detail-card"><div class="medicine-detail-title">'+medicineImageMarkup(medicine)+'<h2>'+safe(medicineShortName(medicine))+'</h2></div><dl><div><dt>'+t("Nombre completo")+'</dt><dd>'+safe(medicine.name||"")+'</dd></div>'+activeMarkup+'<div><dt>'+t("Dosis")+'</dt><dd>'+safe(medicine.dose||"-")+'</dd></div>'+posologyMarkup+commentsMarkup+'</dl><div class="medicine-actions"><a class="official-link" target="_blank" rel="noopener" href="'+officialUrl+'">'+officialLabel+'</a><button class="primary" type="button" data-configure-schedule="'+safe(medicine.id)+'">'+t("Configurar tratamiento")+'</button><button class="delete-medicine" type="button" data-delete-medicine="'+safe(medicine.id)+'">'+t("Eliminar medicamento")+'</button></div></div>';
  $$('img.medicine-photo',detail).forEach(image=>image.onerror=()=>{image.outerHTML='<span class="medicine-photo-placeholder" aria-hidden="true"></span>'});
  $("[data-back-medicines]",detail).onclick=()=>{detail.hidden=true;detail.innerHTML="";list.hidden=false;if(heading)heading.hidden=false};
  $("[data-configure-schedule]",detail).onclick=()=>configureMedicineSchedule(medicine.id);
  $("[data-delete-medicine]",detail).onclick=()=>deleteMedicine(medicine.id);
}

async function deleteMedicine(id){
  const medicine=state.medicines.find(item=>item.id===id);
  if(!medicine)return;
  if(!window.confirm(`${t("Â¿Eliminar este medicamento?")}\n${medicine.name} ${medicine.dose||""}`))return;
  try{
    const updates={deletedAt:new Date().toISOString(),endDate:todayIso()};
    Object.assign(medicine,updates);
    if(fb&&state.user)await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid,"medicines",id),updates);
    else localStorage.setItem("mm_medicines",JSON.stringify(state.medicines));
    renderAll();
    openView("medicines",{replace:true});
    toast(t("Medicamento eliminado."));
  }catch(error){
    toast(t("No se pudo eliminar el medicamento."));
  }
}
async function renderRequests(){
  const list=$("#requestList");
  list.innerHTML="<div class='panel'>Cargando solicitudes?â‚¬?</div>";
  if(fb && state.user?.role==="admin"){
    try{
      const snap=await fb.getDocs(fb.query(fb.collection(fb.db,"users"),fb.where("status","==","pending")));
      state.requests=snap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(error){list.innerHTML="<div class='notice warning'>No se pudieron cargar las solicitudes.</div>";applyLanguage();return;}
  }
  list.innerHTML=state.requests.map(r=>`<article class="medicine-card"><h2>${safe(r.name)}</h2><div class="request-details"><p><b>Correo:</b> ${safe(r.email)}</p><p><b>TelÃ©fono:</b> ${safe(r.phone||"?â‚¬â€")}</p><p><b>Fecha de nacimiento:</b> ${safe(r.birthDate||"?â‚¬â€")}</p><p><b>PaÃ­s:</b> ${safe(r.country==="GB"?"Reino Unido":r.country==="ES"?"EspaÃ±a":"?â‚¬â€")}</p></div><div class="admin-actions"><button class="primary" data-approve="${safe(r.id)}">Aprobar</button><button class="danger" data-reject="${safe(r.id)}">Rechazar</button></div></article>`).join("")||"<div class='panel'>No hay solicitudes pendientes.</div>";
  $("#pendingCount").textContent=state.requests.length;
  $$('[data-approve]',list).forEach(button=>button.onclick=()=>decideRequest(button.dataset.approve,"approved"));
  $$('[data-reject]',list).forEach(button=>button.onclick=()=>decideRequest(button.dataset.reject,"rejected"));
  applyLanguage();
}
async function decideRequest(id,status){
  const request=state.requests.find(item=>item.id===id);
  if(!request)return;
  try{
    let approvalResult=null;
    if(fb&&status==="approved"){
      try{approvalResult=await fb.httpsCallable(fb.functions,"approveUserAccount")({uid:id});}
      catch(error){await fb.updateDoc(fb.doc(fb.db,"users",id),{status,reviewedAt:fb.serverTimestamp(),reviewedBy:state.user.uid});}
    }else if(fb)await fb.updateDoc(fb.doc(fb.db,"users",id),{status,reviewedAt:fb.serverTimestamp(),reviewedBy:state.user.uid});
    state.requests=state.requests.filter(item=>item.id!==id);
    if(demo)localStorage.setItem("mm_requests",JSON.stringify(state.requests));
    await renderRequests();
    toast(status==="approved"?(approvalResult?.data?.emailSent?"Cuenta aprobada y correo enviado.":"Cuenta aprobada correctamente."):"Solicitud rechazada.");
  }catch(error){toast("No se pudo guardar la decisiÃ³n.");}
}
async function loadMedicines(){
  if(demo||!state.user) return;
  const snap=await fb.getDocs(fb.query(fb.collection(fb.db,"users",state.user.uid,"medicines"),fb.where("confirmed","==",true)));
  state.medicines=snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadIntakes(){
  if(demo||!state.user){state.intakes=JSON.parse(localStorage.getItem("mm_intakes")||"{}");return}
  const snap=await fb.getDocs(fb.collection(fb.db,"users",state.user.uid,"intakes"));
  state.intakes={};
  snap.docs.forEach(d=>{state.intakes[d.id]={id:d.id,...d.data()}});
}
function safe(value=""){ const d=document.createElement("div"); d.textContent=fixDisplayText(value); return d.innerHTML; }
async function saveUserPreferences(updates){
  if(!fb||!state.user)return;
  const callable=fb.httpsCallable(fb.functions,"updateUserPreferences");
  await callable(updates);
  Object.assign(state.user,updates);
}
function preferencesPayload(){return {preferredLanguage:language,country:patientCountry,highContrast:localStorage.getItem("mm_contrast")==="true"}}
async function savePreferencesFromPanel(){
  const button=$("#savePreferencesButton");if(button)button.disabled=true;
  try{
    if(fb&&state.user)await saveUserPreferences(preferencesPayload());
    toast(t("Preferencias guardadas."));
    closePreferences();
  }catch(error){
    toast(t("No se pudieron guardar las preferencias."));
  }finally{
    if(button)button.disabled=false;
  }
}

function closePreferences(){const p=$("#preferencesPanel"),backdrop=$("#preferencesBackdrop");p.hidden=true;backdrop.hidden=true;$$('[aria-controls="preferencesPanel"]').forEach(item=>item.setAttribute("aria-expanded","false"))}
function toggleAccessibility(button){const p=$("#preferencesPanel"),willOpen=p.hidden;if(willOpen){$("#preferencesBackdrop").hidden=false;p.hidden=false;$$('[aria-controls="preferencesPanel"]').forEach(item=>item.setAttribute("aria-expanded","true"));p.querySelector("button")?.focus()}else closePreferences()}
if($("#accessibilityButton"))$("#accessibilityButton").onclick=event=>toggleAccessibility(event.currentTarget);
$("#userAccessibilityButton").onclick=event=>toggleAccessibility(event.currentTarget);
$("#preferencesBackdrop").onclick=closePreferences;
$("#closePreferencesButton")?.addEventListener("click",closePreferences);
document.addEventListener("pointerdown",event=>{const panel=$("#preferencesPanel");if(panel.hidden||panel.contains(event.target)||event.target.closest('[aria-controls="preferencesPanel"]'))return;closePreferences()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closePreferences()});
async function setHighContrast(enabled,persist=true){enabled=Boolean(enabled);document.body.classList.toggle("high-contrast",enabled);$("#contrastToggle").checked=enabled;localStorage.setItem("mm_contrast",String(enabled));if(persist&&fb&&state.user){try{await saveUserPreferences({highContrast:enabled})}catch(error){toast(t("No se pudieron guardar las preferencias."))}}}
$("#contrastToggle").onchange=e=>setHighContrast(e.target.checked,false);
async function setPatientCountry(country,persist=true){
  if(!["ES","GB"].includes(country))return;patientCountry=country;localStorage.setItem("mm_country",country);$$('[data-country]').forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.country===country)));
  updateOfficialMedicineSourceUi();
  if(persist&&fb&&state.user){try{await saveUserPreferences({country});toast(t("Preferencias guardadas."))}catch(error){toast(t("No se pudo guardar el paÃ­s."))}}
}
function officialMedicineSource(){return patientCountry==="GB"?"MHRA":"CIMA"}
function officialMedicineSearchUrl(name=""){return patientCountry==="GB"?`https://products.mhra.gov.uk/search?search=${encodeURIComponent(name)}&page=1`:"https://cima.aemps.es/cima/publico/home.html"}
function updateOfficialMedicineSourceUi(){
  const gb=patientCountry==="GB",sourceNote=$("#officialMedicineSourceNote"),methodNote=$("#officialSearchMethodNote"),suggestions=$("#cimaNameSuggestions");
  if(sourceNote)sourceNote.textContent=t(gb?"Fuente oficial: MHRA Products (Reino Unido)":"Resultados oficiales de CIMA ? Agencia Espa?ola de Medicamentos y Productos Sanitarios");
  if(methodNote)methodNote.textContent=t(gb?"Consulta el registro oficial de la MHRA":"Consulta la base oficial de la AEMPS");
  if(suggestions)suggestions.setAttribute("aria-label",gb?"Comprobaci?n oficial en MHRA":"Sugerencias oficiales de CIMA");
}
$$('[data-country]').forEach(button=>button.onclick=()=>setPatientCountry(button.dataset.country,false));
$("#savePreferencesButton")?.addEventListener("click",savePreferencesFromPanel);
$$('[data-open]').forEach(b=>b.onclick=()=>{document.body.classList.add("modal-open");$("#"+b.dataset.open).showModal()});
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest("dialog").close());
$$('dialog').forEach(dialog=>dialog.addEventListener("close",()=>{if(!$("dialog[open]"))document.body.classList.remove("modal-open")}));
$$('[data-view]').forEach(b=>b.onclick=()=>openView(b.dataset.view));
$$('[data-view-button]').forEach(b=>b.onclick=()=>openView(b.dataset.viewButton));
window.addEventListener("hashchange",()=>{
  if(suppressHashNavigation||!state.user||!document.body.classList.contains("user-mode"))return;
  const view=currentHashView();
  if(view)openView(view,{replace:true});
  else openView("today",{replace:true});
});
$("#documentInput").onchange=async e=>{
  const file=e.target.files[0]; if(!file)return;
  if(file.size>10*1024*1024){toast("El archivo supera los 10 MB.");return;}
  $("#uploadChoice").hidden=true;
  const preview=$("#documentPreview"),ocrStatus=$("#ocrStatus"),ocrCandidates=$("#ocrCandidates");ocrCandidates.hidden=true;ocrCandidates.innerHTML="";
  if(file.type.startsWith("image/")){const url=URL.createObjectURL(file);preview.innerHTML=`<img src="${url}" alt="Vista previa del medicamento">`;$("img",preview).onload=()=>URL.revokeObjectURL(url)}else preview.innerHTML=`<div class="document-file"><span aria-hidden="true">?Å¸â€œâ€ž</span><b>${safe(file.name)}</b></div>`;
  $("#reviewPanel").hidden=false; const f=$("#medicineForm");
  f.hidden=Boolean(fb&&state.user);
  f.startDate.value=new Date().toISOString().slice(0,10); f.name.value=""; f.dose.value=""; f.time.value="";f.instructions.value="";
  if(fb&&state.user){try{ocrStatus.textContent=t("Leyendo el medicamento?â‚¬?");const ref=fb.ref(fb.storage,`users/${state.user.uid}/documents/${crypto.randomUUID()}-${file.name}`);await fb.uploadBytes(ref,file,{contentType:file.type});ocrStatus.textContent=t("Buscando coincidencias oficiales?â‚¬?");const callable=fb.httpsCallable(fb.functions,"extractPrescription"),result=await callable({storagePath:ref.fullPath});renderOcrCandidates(result.data.candidates||[],result.data.rawText||"")}catch(error){ocrStatus.textContent=friendlyOcrError(error);$(".notice",$("#reviewPanel")).innerHTML=`<b>${t("Lectura no disponible")}</b><br>${t("Introduce los datos manualmente o prueba con otra foto.")}`;f.hidden=false;f.name.focus()}}else{ocrStatus.textContent=t("La lectura automÃ¡tica se activarÃ¡ al conectar Firebase.");$(".notice",$("#reviewPanel")).innerHTML=`<b>${t("Modo demostraci?n")}</b><br>${t("El OCR todavÃ­a no estÃ¡ conectado. Introduce los datos manualmente.")}`;toast("Foto preparada. Revisa los datos manualmente.");f.hidden=false;f.name.focus()}
};
function friendlyOcrError(error){
  const code=String(error?.code||"");
  if(code.includes("not-found"))return t("No se ha detectado texto legible. Prueba con una foto mÃ¡s nÃ­tida.");
  if(code.includes("invalid-argument"))return t("Utiliza una imagen JPG o PNG para la lectura automÃ¡tica.");
  if(code.includes("permission-denied")||code.includes("unauthenticated"))return t("No se pudo verificar tu acceso. Cierra la sesiÃ³n y vuelve a entrar.");
  return t("No se pudo leer automÃ¡ticamente. Introduce los datos manualmente.");
}
async function renderOcrCandidates(candidates,rawText=""){
  const container=$("#ocrCandidates"),status=$("#ocrStatus");
  status.textContent=patientCountry==="GB"?uiText("Revisa el nombre en la MHRA.","Check the name in MHRA."):uiText("Comprobando el nombre en CIMA\u2026","Checking the name in CIMA\u2026");
  if(patientCountry==="GB")candidates=candidates.map(candidate=>({...candidate,ocrName:candidate.name,name:candidate.name||"",cimaId:"",dose:"",frequency:"",duration:"",times:[],instructions:""}));
  else{
    const terms=[...new Set([
      ...candidates.map(candidate=>candidate.name||""),
      ...String(rawText||"").split(/[^A-Za-z?â€°?â€œ?Å¡?Å“?â€˜+0-9]+/).filter(word=>word.length>=5).slice(0,22)
    ].map(item=>item.trim()).filter(Boolean))];
    const matches=[],seen=new Set();
    for(const term of terms){
      try{
        const results=await fetchCimaResults(term,8);
        for(const item of results){const key=item.nregistro||item.nombre;if(key&&!seen.has(key)){seen.add(key);matches.push({...item,_score:scoreCimaCandidate(item,rawText,terms)})}}
      }
      catch(error){}
      if(matches.length>=24)break;
    }
    candidates=matches
      .filter(match=>match._score>0)
      .sort((a,b)=>b._score-a._score)
      .slice(0,3)
      .map(match=>({ocrName:match.nombre,name:match.nombre,cimaId:match.nregistro,dose:match.dosis||"",frequency:"",duration:"",times:[],instructions:"",score:match._score}));
  }
  const rawDetails=rawText?`<details class="ocr-raw"><summary>${t("Mostrar texto completo")}</summary><h4>${t("Texto leÃ­do por Document AI")}</h4><pre>${safe(rawText)}</pre></details>`:"";
  if(!candidates.length){status.textContent=t("No se ha encontrado ning?n medicamento oficial en la imagen.");container.hidden=!rawText;container.innerHTML=rawDetails;$("#medicineForm").hidden=false;$("#medicineForm").name.value="";$("[name=name]",$("#medicineForm")).focus();return}
  status.textContent=t("Lectura terminada. Selecciona y revisa cada medicamento.");container.hidden=false;container.innerHTML=`<h3>${t("Medicamentos encontrados")}</h3>${candidates.map((candidate,index)=>`<button type="button" class="ocr-candidate" data-ocr-candidate="${index}"><span><b>${safe(candidate.name||t("Nombre no reconocido"))}</b><small>${candidate.cimaId?safe(`${t("Medicamento verificado en CIMA")}: ${candidate.cimaId}`):safe(t("Medicamento encontrado"))}</small></span><span aria-hidden="true">?â‚¬?</span></button>`).join("")}${rawDetails}`;
  $$("[data-ocr-candidate]",container).forEach(button=>button.onclick=()=>{const candidate=candidates[Number(button.dataset.ocrCandidate)],form=$("#medicineForm");$$("[data-ocr-candidate]",container).forEach(item=>item.classList.toggle("active",item===button));form.name.value=candidate.name||"";form.cimaId.value=candidate.cimaId||"";form.officialSource.value=candidate.cimaId?"CIMA":officialMedicineSource();form.activeIngredient.value=candidate.activeIngredient||candidate.pactivos||"";patientCountry==="GB"?showCimaValidation("checking","Abre MHRA y confirma el nombre del medicamento."):candidate.cimaId?showCimaValidation("valid",`${t("Medicamento verificado en CIMA")}: ${candidate.name}`):showCimaValidation("invalid",t("No se ha encontrado una coincidencia segura en CIMA. Revisa el nombre."));form.dose.value=candidate.dose||"";form.time.value="";form.instructions.value="";form.endDate.value="";form.hidden=false;enterScheduleOnlyMode();container.hidden=true;$("#documentPreview").innerHTML="";$("#ocrStatus").textContent="";resetScheduleWizard();showScheduleStep("frequency");$("#scheduleWizard")?.scrollIntoView({behavior:"smooth",block:"start"})});
  const first=$("[data-ocr-candidate]",container);if(candidates.length===1&&first)first.click();
}
$$('[data-medication-mode]').forEach(button=>button.onclick=()=>{
  const search=button.dataset.medicationMode==="search";
  $$('[data-medication-mode]').forEach(item=>item.classList.toggle("active",item===button));
  showMedicationMethodScreen(search?"search":"upload");
  $("#reviewPanel").hidden=true;$("#reviewPanel").classList.remove("schedule-only");$(".notice",$("#reviewPanel")).innerHTML=`<b>${t("Medicamento encontrado")}</b><br>${t("Confirma si coincide con el medicamento fotografiado.")}`;
  if(search)$("#medicineSearch").focus();
});
function setDocumentsIntroVisible(visible){
  const section=$("#documents");
  if(!section)return;
  const title=$("h1",section),lead=$(":scope > p.lead",section);
  if(title)title.hidden=true;
  if(lead)lead.hidden=!visible;
}
let selectedMedicationMethod=null;
function clearMedicationDraft(){
  medicineSearchController?.abort();
  clearTimeout(medicineSearchTimer);
  const search=$("#medicineSearch");
  if(search)search.value="";
  $("#medicineSearchResults").innerHTML="";
  $("#medicineSearchStatus").textContent="";
  const searchPanel=$("#medicineSearchPanel");
  if(searchPanel)$(":scope > label",searchPanel).hidden=false;
  const selected=$("#selectedMedicine");
  selected.hidden=true;
  selected.innerHTML="";
  const input=$("#documentInput");
  if(input)input.value="";
  $("#documentPreview").innerHTML="";
  $("#ocrStatus").textContent="";
  $("#ocrCandidates").innerHTML="";
  $("#ocrCandidates").hidden=true;
  const form=$("#medicineForm");
  if(form){
    form.reset();
    form.hidden=true;
  }
  showCimaValidation("","");
  clearCimaNameSuggestions();
  resetScheduleWizard();
}
function resetMedicationMethodScreen(){
  selectedMedicationMethod=null;
  editingScheduleMedicineId=null;
  clearMedicationDraft();
  setDocumentsIntroVisible(true);
  $(".medication-methods").hidden=false;
  $("#changeMethodButton").hidden=true;
  $("#changeMethodButton").textContent=(language==="en"?"Back":"Atrás");
  $("#medicineSearchPanel").hidden=true;
  $("#uploadChoice").hidden=true;
  $("#reviewPanel").hidden=true;
  $("#reviewPanel").classList.remove("schedule-only");
  $$('[data-medication-mode]').forEach(item=>item.classList.remove("active"));
}
function showMedicationMethodScreen(mode){
  selectedMedicationMethod=mode;
  setDocumentsIntroVisible(false);
  $(".medication-methods").hidden=true;
  $("#changeMethodButton").hidden=false;
  $("#changeMethodButton").textContent=(language==="en"?"Back":"Atrás");
  $("#medicineSearchPanel").hidden=mode!=="search";
  $("#uploadChoice").hidden=mode!=="upload";
}
$("#changeMethodButton").onclick=()=>{if(selectedMedicationMethod==="schedule"){handleScheduleBack();return}if(selectedMedicationMethod)resetMedicationMethodScreen();else openView("medicines")};
let medicineSearchTimer,medicineSearchController;
$("#medicineSearch").oninput=event=>{
  clearTimeout(medicineSearchTimer);medicineSearchController?.abort();
  const query=event.target.value.trim(),status=$("#medicineSearchStatus"),results=$("#medicineSearchResults");
  results.innerHTML="";
  if(query.length<3){status.textContent=t("Escribe al menos 3 letras.");return}
  status.textContent=patientCountry==="GB"?uiText("Comprobando en la MHRA\u2026","Checking MHRA\u2026"):uiText("Buscando en la AEMPS\u2026","Searching AEMPS\u2026");
  medicineSearchTimer=setTimeout(()=>searchOfficialMedicine(query),350);
};
function searchOfficialMedicine(query){return patientCountry==="GB"?searchMhra(query):searchCima(query)}
async function searchMhra(query){
  const status=$("#medicineSearchStatus"),results=$("#medicineSearchResults");medicineSearchController=new AbortController();
  try{
    const items=await fetchMhraMedicines(query,8,medicineSearchController.signal);
    status.textContent=items.length?uiText(`${items.length} resultados oficiales`,`${items.length} official results`):uiText("No se encontraron medicamentos.","No medicines found.");
    results.innerHTML=items.map((item,index)=>`<button class="search-result mhra-result" data-mhra-result="${index}"><span class="search-result-photo">${mhraPackHtml(item,true)}</span><span><b>${safe(item.name)}</b><small>${safe(item.activeIngredient||"MHRA Products · United Kingdom")}</small></span></button>`).join("");
    $$('[data-mhra-result]',results).forEach(button=>button.onclick=()=>selectMhraMedicine(items[Number(button.dataset.mhraResult)]));
  }catch(error){
    if(error.name==="AbortError")return;
    status.innerHTML=`${uiText("No se pudo consultar MHRA en este momento.","MHRA could not be reached right now.")} <a target="_blank" rel="noopener" href="${officialMedicineSearchUrl(query)}">${uiText("Abrir buscador oficial","Open official search")}</a>`;
  }
}
async function fetchMhraMedicines(query,limit=8,signal){
  if(fb&&state.user){
    const callable=fb.httpsCallable(fb.functions,"searchMhraMedicines");
    const result=await callable({query,limit});
    return (result.data?.items||[]).slice(0,limit);
  }
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
  const response=await fetch("https://medicines.api.mhra.gov.uk/graphql",{
    method:"POST",
    mode:"cors",
    signal,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({query:graphql,variables:{searchTerm:query,first:Math.max(limit*3,12)}})
  });
  if(!response.ok)throw new Error("MHRA");
  const data=await response.json();
  const rows=data?.data?.products?.documents?.edges||[];
  const byProduct=new Map();
  for(const edge of rows){
    const node=edge.node||{};
    const name=(node.product||node.title||"").trim();
    if(!name)continue;
    const key=name.toUpperCase();
    const existing=byProduct.get(key)||{name,activeIngredient:"",url:"",docTypes:new Set(),officialSource:"MHRA",country:"GB",imageUrl:""};
    if(Array.isArray(node.activeSubstances)&&node.activeSubstances.length)existing.activeIngredient=node.activeSubstances.join(", ");
    if(node.url&&!existing.url)existing.url=node.url.startsWith("http")?node.url:`https://products.mhra.gov.uk${node.url}`;
    if(node.docType)existing.docTypes.add(node.docType);
    byProduct.set(key,existing);
  }
  return [...byProduct.values()].slice(0,limit).map(item=>({...item,docTypes:[...item.docTypes]}));
}
function mhraPackHtml(item,compact=false){
  if(item?.imageUrl)return `<img src="${safe(item.imageUrl)}" alt="${uiText("Caja del medicamento","Medicine box")}">`;
  return `<div class="generic-uk-pack ${compact?"compact-placeholder":""}" aria-label="${uiText("Imagen genérica del medicamento","Generic medicine image")}"><span class="generic-pack-pill" aria-hidden="true">💊</span><small>MHRA</small></div>`;
}
function selectMhraMedicine(item){
  const name=typeof item==="string"?item:item.name;
  const panel=$("#medicineSearchPanel"),selected=$("#selectedMedicine");
  $("#medicineSearchResults").innerHTML="";$("#medicineSearchStatus").textContent="";$(':scope > label',panel).hidden=true;selected.hidden=false;
  const active=typeof item==="object"&&item.activeIngredient?`<p><b>${t("Principio activo")}:</b> ${safe(item.activeIngredient)}</p>`:"";
  const link=typeof item==="object"&&item.url?item.url:officialMedicineSearchUrl(name);
  selected.innerHTML=`<article class="selected-medicine-card"><div class="medicine-pack">${mhraPackHtml(item)}</div><div class="selected-details"><span class="eyebrow">${uiText("MEDICAMENTO OFICIAL · REINO UNIDO","OFFICIAL MEDICINE · UNITED KINGDOM")}</span><h2>${safe(name)}</h2><div class="medicine-extra">${active}<a class="official-link" target="_blank" rel="noopener" href="${safe(link)}">${uiText("Ver información oficial en MHRA","View official MHRA information")}</a></div><div class="selected-actions"><button class="secondary" type="button" data-change-medicine>${t("Elegir otro")}</button><button class="primary" type="button" data-confirm-mhra>${language==="en"?"Yes, this is my medicine":"Sí, es mi medicamento"}</button></div></div></article>`;
  $("[data-change-medicine]",selected).onclick=resetMedicineSelection;
  $("[data-confirm-mhra]",selected).onclick=()=>confirmMhraMedicine(item);
}
function confirmMhraMedicine(item){
  const name=typeof item==="string"?item:item.name;
  const form=$("#medicineForm");form.hidden=false;form.name.value=name;form.cimaId.value="";form.officialSource.value="MHRA";form.medicineImageUrl.value=typeof item==="object"?(item.imageUrl||""):"";form.activeIngredient.value=typeof item==="object"?(item.activeIngredient||""):"";form.time.value="09:00";form.startDate.value=new Date().toISOString().slice(0,10);
  showCimaValidation("valid",`${t("Medicamento comprobado en MHRA")}: ${name}`);$(".selected-medicine-card").classList.add("confirmed");$("#reviewPanel").classList.add("schedule-only");$(".notice",$("#reviewPanel")).innerHTML=`<b>${uiText("Ahora indica el tratamiento","Now enter the treatment")}</b><br>${t("Puedes corregir cualquier campo antes de guardar.")}`;$("#reviewPanel").hidden=false;$("#reviewPanel").scrollIntoView({behavior:"smooth",block:"start"});form.time.focus();
}
async function searchCima(query){
  const status=$("#medicineSearchStatus"),results=$("#medicineSearchResults");medicineSearchController=new AbortController();
  try{
    const url=`https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(query)}&autorizados=1&comerc=1`;
    const response=await fetch(url,{signal:medicineSearchController.signal});if(!response.ok)throw new Error("CIMA");
    const data=await response.json(),items=(data.resultados||[]).slice(0,8);
    status.textContent=items.length?t(`${items.length} resultados oficiales`):t("No se encontraron medicamentos.");
    results.innerHTML=items.map((item,index)=>`<button class="search-result" data-result="${index}"><b>${safe(item.nombre)}</b><small>${safe(item.pactivos||"")}${item.labtitular?` ? ${safe(item.labtitular)}`:""}</small></button>`).join("");
    $$('[data-result]',results).forEach(button=>button.onclick=()=>selectCimaMedicine(items[Number(button.dataset.result)]));
  }catch(error){if(error.name==="AbortError")return;status.innerHTML=`${uiText("No se pudo consultar CIMA en este momento.","CIMA could not be reached right now.")} <a target="_blank" rel="noopener" href="https://cima.aemps.es/cima/publico/home.html">${t("Abrir buscador oficial")}</a>`}
}
async function selectCimaMedicine(item){
  const panel=$("#medicineSearchPanel"),selected=$("#selectedMedicine");
  $("#medicineSearchResults").innerHTML="";$("#medicineSearchStatus").textContent="";$(":scope > label",panel).hidden=true;selected.hidden=false;selected.innerHTML=`<div class="panel">${t("Cargando informaciÃ³n oficial?â‚¬?")}</div>`;
  let detail=item;
  try{const response=await fetch(`https://cima.aemps.es/cima/rest/medicamento?nregistro=${encodeURIComponent(item.nregistro)}`);if(response.ok)detail=await response.json()}catch(error){}
  const photo=findCimaPhoto(detail),principles=detail.pactivos||item.pactivos||"",laboratory=detail.labtitular||item.labtitular||"",dose=detail.dosis||item.dosis||"";
  const pack=photo?`<img src="${safe(photo)}" alt="${t("Caja del medicamento")}">`:`<div class="medicine-pack-placeholder"><span aria-hidden="true">?Å¸â€™Å </span><small>${t("CIMA no dispone de foto para este medicamento")}</small></div>`;
  const cimaLinkText=language==="en"?"View official CIMA record":"Ver ficha oficial en CIMA";
  const confirmText=language==="en"?"Yes, this is my medicine":"Sí, es mi medicamento";
  selected.innerHTML=`<article class="selected-medicine-card"><div class="medicine-pack">${pack}</div><div class="selected-details"><span class="eyebrow">${t("MEDICAMENTO OFICIAL")}</span><h2>${safe(detail.nombre||item.nombre)}</h2><div class="medicine-extra"><p><b>${t("Principio activo")}:</b> ${safe(principles||"-")}</p><p><b>${t("Dosis")}:</b> ${safe(dose||"-")}</p><p><b>${t("Laboratorio")}:</b> ${safe(laboratory||"-")}</p><a class="official-link" target="_blank" rel="noopener" href="https://cima.aemps.es/cima/publico/detalle.html?nregistro=${encodeURIComponent(item.nregistro)}">${cimaLinkText}</a></div><div class="selected-actions"><button class="secondary" type="button" data-change-medicine>${t("Elegir otro")}</button><button class="primary" type="button" data-confirm-medicine>${confirmText}</button></div></div></article>`;
  const image=$("img",selected);if(image)image.onerror=()=>{image.parentElement.innerHTML=`<div class="medicine-pack-placeholder"><span class="medicine-photo-placeholder" aria-hidden="true"></span><small>${t("Foto no disponible")}</small></div>`};
  $("[data-change-medicine]",selected).onclick=resetMedicineSelection;
  $("[data-confirm-medicine]",selected).onclick=()=>confirmCimaMedicine({...detail,nombre:detail.nombre||item.nombre,nregistro:item.nregistro,dosis:dose,imageUrl:photo||""});
}
function findCimaPhoto(data){
  const candidates=[];const visit=(value,key="")=>{if(!value)return;if(typeof value==="string"&&/(foto|imagen|\.jpe?g|\.png)/i.test(`${key} ${value}`))candidates.push(value);else if(Array.isArray(value))value.forEach(item=>visit(item,key));else if(typeof value==="object")Object.entries(value).forEach(([childKey,child])=>visit(child,childKey))};visit(data);
  for(const value of candidates){try{const url=new URL(value,"https://cima.aemps.es");if(url.protocol==="https:"&&url.hostname.endsWith("aemps.es"))return url.href}catch(error){}}return null;
}
function resetMedicineSelection(){const panel=$("#medicineSearchPanel");$(":scope > label",panel).hidden=false;$("#selectedMedicine").hidden=true;$("#selectedMedicine").innerHTML="";$("#medicineSearch").value="";$("#medicineSearchStatus").textContent=t("Escribe al menos 3 letras.");$("#medicineSearch").focus();$("#reviewPanel").hidden=true}
function confirmCimaMedicine(item){
  const form=$("#medicineForm");form.hidden=false;form.name.value=item.nombre||"";form.dose.value=item.dosis||"";form.cimaId.value=item.nregistro||"";form.officialSource.value="CIMA";form.medicineImageUrl.value=item.imageUrl||findCimaPhoto(item)||"";form.activeIngredient.value=item.pactivos||"";form.time.value="09:00";form.startDate.value=new Date().toISOString().slice(0,10);
  showCimaValidation("valid",`${t("Medicamento verificado en CIMA")}: ${item.nombre||""}`);
  $(".selected-medicine-card").classList.add("confirmed");$("#reviewPanel").classList.add("schedule-only");$(".notice",$("#reviewPanel")).innerHTML=`<b>${uiText("Ahora indica el tratamiento","Now enter the treatment")}</b><br>${t("Puedes corregir cualquier campo antes de guardar.")}`;$("#reviewPanel").hidden=false;$("#reviewPanel").scrollIntoView({behavior:"smooth",block:"start"});form.time.focus();
}
function normalizeCimaName(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\b(comprimidos?|capsulas?|sobres?|jarabe|solucion|suspension|gotas?|parches?|pomada|crema|inyectable)\b/g," ").replace(/[^a-z0-9]+/g," ").trim()}
function normalizeMedicineText(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[,;]/g,".").replace(/[^a-z0-9.%]+/g," ").trim()}
function extractStrengths(value){
  const text=normalizeMedicineText(value),matches=[...text.matchAll(/\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|ug|g|ml|ui|kui|%)\b/g)];
  return [...new Set(matches.map(match=>match[0].replace(/\s+/g," ").replace(",",".")).filter(Boolean))];
}
function scoreCimaCandidate(item,rawText="",searchTerms=[]){
  const official=normalizeMedicineText(`${item.nombre||""} ${item.pactivos||""} ${item.dosis||""}`),raw=normalizeMedicineText(rawText);
  const officialName=normalizeMedicineText(item.nombre||""),rawStrengths=extractStrengths(rawText);
  let score=0;
  for(const term of searchTerms){
    const norm=normalizeMedicineText(term);if(norm.length<3)continue;
    if(officialName.startsWith(norm))score+=80;
    else if(officialName.includes(norm))score+=45;
    if(raw.includes(norm)&&officialName.includes(norm))score+=65;
  }
  for(const token of officialName.split(" ").filter(token=>token.length>=5)){
    if(raw.includes(token))score+=25;
  }
  for(const strength of rawStrengths){
    if(official.includes(strength))score+=90;
  }
  if(/novoseven/i.test(rawText)&&/novoseven/i.test(item.nombre||""))score+=120;
  if(/2\s*mg/i.test(rawText)&&/2\s*mg/i.test(item.nombre||""))score+=100;
  if(!officialName.split(" ").some(token=>token.length>=5&&raw.includes(token)))score-=25;
  return score;
}
async function fetchCimaResults(term,limit=10){
  if(String(term||"").trim().length<3)return[];
  const response=await fetch(`https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(term.trim())}&autorizados=1&comerc=1`);
  if(!response.ok)throw new Error("CIMA");
  const data=await response.json();
  return (data.resultados||[]).slice(0,limit);
}
function findReliableCimaMatch(name,items){
  const sought=normalizeCimaName(name),tokens=sought.split(" ").filter(token=>token.length>1);if(!sought||!tokens.length)return null;
  return items.find(item=>{const official=normalizeCimaName(item.nombre);return official===sought||official.includes(sought)||tokens.every(token=>official.split(" ").includes(token))})||null;
}
async function lookupCimaMatch(name){
  if(String(name||"").trim().length<3)return null;
  const items=await fetchCimaResults(name,12);return findReliableCimaMatch(name,items);
}
function showCimaValidation(kind,message){const status=$("#cimaValidationStatus");status.className=`cima-validation ${kind||""}`;status.textContent=message||""}
async function validateCimaName(form,focusOnError=true){
  if(patientCountry==="GB"){
    const name=form.name.value.trim();
    if(name.length>=3&&form.officialSource.value==="MHRA"){showCimaValidation("valid",`${t("Medicamento comprobado en MHRA")}: ${name}`);return true}
    showCimaValidation("invalid",uiText("Elige un medicamento de la lista oficial de MHRA.","Choose a medicine from the official MHRA list."));if(focusOnError)form.name.focus();return false;
  }
  const name=form.name.value.trim();if(name.length<3){form.cimaId.value="";showCimaValidation("invalid",uiText("No se ha encontrado una coincidencia segura en CIMA. Revisa el nombre.","No reliable match was found in CIMA. Check the name."));if(focusOnError)form.name.focus();return false}
  if(form.cimaId.value){showCimaValidation("valid",t("Medicamento verificado en CIMA"));return true}
  showCimaValidation("checking",uiText("Comprobando el nombre en CIMA\u2026","Checking the name in CIMA\u2026"));
  try{const match=await lookupCimaMatch(name);if(form.name.value.trim()!==name)return false;if(!match){form.name.value="";form.cimaId.value="";form.activeIngredient.value="";showCimaValidation("invalid",uiText("No se ha encontrado una coincidencia segura en CIMA. Revisa el nombre.","No reliable match was found in CIMA. Check the name."));if(focusOnError)form.name.focus();return false}form.name.value=match.nombre;form.cimaId.value=match.nregistro||"";form.activeIngredient.value=match.pactivos||"";showCimaValidation("valid",`${t("Medicamento verificado en CIMA")}: ${match.nombre}`);return true}catch(error){showCimaValidation("invalid",uiText("No se pudo consultar CIMA. Int\u00e9ntalo de nuevo.","CIMA could not be reached. Try again."));if(focusOnError)form.name.focus();return false}
}
let cimaNameTimer,cimaNameController;
function clearCimaNameSuggestions(){clearTimeout(cimaNameTimer);cimaNameController?.abort();$("#cimaNameSuggestions").innerHTML=""}
async function loadCimaNameSuggestions(query,form){
  const suggestions=$("#cimaNameSuggestions");cimaNameController=new AbortController();showCimaValidation("checking",uiText("Comprobando el nombre en CIMA\u2026","Checking the name in CIMA\u2026"));
  if(patientCountry==="GB"){
    showCimaValidation("checking",uiText("Buscando en MHRA…","Searching MHRA…"));
    try{
      const items=await fetchMhraMedicines(query,6,cimaNameController.signal);
      if(form.name.value.trim()!==query)return;
      showCimaValidation("","");
      suggestions.innerHTML=items.map((item,index)=>`<button type="button" role="option" data-mhra-name-result="${index}"><span class="search-result-photo">${mhraPackHtml(item,true)}</span><span><b>${safe(item.name)}</b><small>${safe(item.activeIngredient||"MHRA Products · United Kingdom")}</small></span></button>`).join("")||`<div class="cima-no-results">${uiText("No se encontraron medicamentos.","No medicines found.")}</div>`;
      $$('[data-mhra-name-result]',suggestions).forEach(button=>button.onclick=()=>{const item=items[Number(button.dataset.mhraNameResult)];form.name.value=item.name||"";form.cimaId.value="";form.officialSource.value="MHRA";form.activeIngredient.value=item.activeIngredient||"";form.medicineImageUrl.value=item.imageUrl||"";clearCimaNameSuggestions();showCimaValidation("valid",`${t("Medicamento comprobado en MHRA")}: ${item.name}`);form.dose.focus()});
    }catch(error){
      if(error.name==="AbortError")return;
      showCimaValidation("invalid",uiText("No se pudo consultar MHRA. Inténtalo de nuevo.","MHRA could not be reached. Try again."));
      suggestions.innerHTML="";
    }
    return;
  }
  try{const response=await fetch(`https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(query)}&autorizados=1&comerc=1`,{signal:cimaNameController.signal});if(!response.ok)throw new Error("CIMA");const data=await response.json();if(form.name.value.trim()!==query)return;const items=(data.resultados||[]).slice(0,6);showCimaValidation("","");suggestions.innerHTML=items.map((item,index)=>`<button type="button" role="option" data-cima-name-result="${index}"><b>${safe(item.nombre)}</b><small>${safe(item.pactivos||"")}${item.labtitular?` ? ${safe(item.labtitular)}`:""}</small></button>`).join("")||`<div class="cima-no-results">${uiText("No se encontraron medicamentos.","No medicines found.")}</div>`;$$('[data-cima-name-result]',suggestions).forEach(button=>button.onclick=async()=>{const item=items[Number(button.dataset.cimaNameResult)];form.name.value=item.nombre||"";form.cimaId.value=item.nregistro||"";form.officialSource.value="CIMA";form.activeIngredient.value=item.pactivos||"";form.medicineImageUrl.value="";try{const detailResponse=await fetch(`https://cima.aemps.es/cima/rest/medicamento?nregistro=${encodeURIComponent(item.nregistro)}`);if(detailResponse.ok){const detail=await detailResponse.json();form.medicineImageUrl.value=findCimaPhoto(detail)||"";form.activeIngredient.value=detail.pactivos||form.activeIngredient.value}}catch(error){}clearCimaNameSuggestions();showCimaValidation("valid",`${t("Medicamento verificado en CIMA")}: ${item.nombre}`);form.dose.focus()})}catch(error){if(error.name==="AbortError")return;showCimaValidation("invalid",uiText("No se pudo consultar CIMA. Int\u00e9ntalo de nuevo.","CIMA could not be reached. Try again."));suggestions.innerHTML=""}
}
$("[name=name]",$("#medicineForm")).addEventListener("input",event=>{const form=event.currentTarget.form,query=event.currentTarget.value.trim();form.cimaId.value="";form.officialSource.value="";form.activeIngredient.value="";showCimaValidation("","");clearCimaNameSuggestions();if(query.length<3)return;cimaNameTimer=setTimeout(()=>loadCimaNameSuggestions(query,form),300)});
function discardMedicineDraft(){
  const form=$("#medicineForm"),input=$("#documentInput"),selected=$("#selectedMedicine"),searchPanel=$("#medicineSearchPanel");
  form.reset();form.hidden=false;input.value="";showCimaValidation("","");clearCimaNameSuggestions();
  $("#documentPreview").innerHTML="";$("#ocrStatus").textContent="";$("#ocrCandidates").innerHTML="";$("#ocrCandidates").hidden=true;
  $("#reviewPanel").hidden=true;$("#reviewPanel").classList.remove("schedule-only");
  $(".medication-methods").hidden=false;$("#changeMethodButton").hidden=false;$("#changeMethodButton").textContent=(language==="en"?"Back":"Atrás");$("#uploadChoice").hidden=true;searchPanel.hidden=true;
  const searchLabel=$(":scope > label",searchPanel);if(searchLabel)searchLabel.hidden=false;
  $("#medicineSearch").value="";$("#medicineSearchResults").innerHTML="";$("#medicineSearchStatus").textContent="";
  selected.hidden=true;selected.innerHTML="";$$('[data-medication-mode]').forEach(item=>item.classList.remove("active"));
  openView("medicines");toast(t("Medicamento descartado."));
}
$("#discardMedicineButton").onclick=discardMedicineDraft;
function renderSideEffectsMedicines(){
  setSideEffectsDetailMode(false);
  const section=$("#sideEffects");
  if(section){
    const title=$("h1",section),lead=$(".lead",section),notice=$(".effects-health-notice",section);
    if(title)title.textContent=language==="en"?"Side effects":"Consultar efectos secundarios";
    if(lead)lead.textContent=language==="en"?"Select one of your confirmed medicines.":"Selecciona uno de tus medicamentos confirmados.";
    if(notice)notice.innerHTML=`<b>${language==="en"?"Official health information":"Información sanitaria oficial"}</b><br>${language==="en"?"If you have severe or unexpected symptoms, contact a healthcare professional. In an emergency, call 112.":"Si tienes síntomas graves o inesperados, contacta con un profesional sanitario. En urgencias, llama al 112."}`;
  }
  const results=$("#effectsResults"),detail=$("#effectsDetail"),medicines=activeMedicines();detail.hidden=true;$("#effectsStatus").textContent="";
  results.innerHTML=medicines.map((item,index)=>`<button class="effects-medicine-button" data-own-medicine="${index}"><span class="effects-pill-icon" aria-hidden="true"></span><span><b>${safe(medicineShortName(item))}</b></span><span class="effects-arrow-icon" aria-hidden="true"></span></button>`).join("")||`<div class="panel">${t("Todavía no tienes medicamentos confirmados.")}</div>`;
  $$('[data-own-medicine]',results).forEach(button=>button.onclick=()=>loadSideEffects(medicines[Number(button.dataset.ownMedicine)]));
}
function setSideEffectsDetailMode(detailMode){
  const section=$("#sideEffects");
  $("h1",section).hidden=detailMode;
  $(".lead",section).hidden=detailMode;
  $(".effects-health-notice",section).hidden=detailMode;
  $("#effectsResults").hidden=detailMode;
  $("#sideEffectsBackButton").hidden=!detailMode;
  $("#sideEffectsBackButton").textContent=language==="en"?"Back":"Atrás";
  $("#sideEffectsBackButton").onclick=detailMode?renderSideEffectsMedicines:()=>openView("today");
}
$("#sideEffectsBackButton").hidden=true;
$("#sideEffectsBackButton").onclick=()=>openView("today");
$("#complianceBackButton")?.addEventListener("click",()=>openView("today"));
$("#achievementsBackButton")?.addEventListener("click",()=>openView("today"));

let currentReminderToken="";
function remindersSupported(){
  return Boolean(fb?.messagingMod&&"Notification" in window&&"serviceWorker" in navigator&&window.isSecureContext);
}
function reminderTokenDocId(token){
  return String(token||"").replace(/[^\w-]/g,"_").slice(0,180)||"device";
}
function setReminderScreenText(){
  const title=$("#reminders h1"),lead=$("#reminders .lead"),heading=$(".reminder-card h2"),copy=$(".reminder-card p"),notice=$(".reminder-notice");
  if(title)title.textContent=uiText("Recordatorios","Reminders");
  if(lead)lead.textContent=uiText("Recibe avisos en este dispositivo cuando llegue la hora del tratamiento.","Receive alerts on this device when treatment is due.");
  if(heading)heading.textContent=uiText("Notificaciones de tratamiento","Treatment notifications");
  if(copy)copy.textContent=uiText("Activa los recordatorios en tu móvil o tablet. Puedes desactivarlos cuando quieras.","Enable reminders on your phone or tablet. You can turn them off whenever you want.");
  if(notice)notice.innerHTML=`<b>${uiText("Importante","Important")}</b><br>${uiText("Los recordatorios son una ayuda. No sustituyen la pauta indicada por un profesional sanitario.","Reminders are only a support. They do not replace the schedule given by a healthcare professional.")}`;
}
async function renderReminders(){
  setReminderScreenText();
  const status=$("#reminderStatus"),enable=$("#enableRemindersButton"),disable=$("#disableRemindersButton");
  if(!status||!enable||!disable)return;
  enable.textContent=uiText("Activar recordatorios","Enable reminders");
  disable.textContent=uiText("Desactivar recordatorios","Disable reminders");
  enable.disabled=false;
  disable.disabled=false;
  if(!remindersSupported()){
    enable.hidden=true;disable.hidden=true;
    status.textContent=uiText("Este navegador no permite recordatorios push. En Android, abre la app instalada o Chrome actualizado.","This browser does not support push reminders. On Android, open the installed app or an updated Chrome.");
    return;
  }
  if(!firebaseVapidKey){
    enable.hidden=false;disable.hidden=true;enable.disabled=true;
    status.textContent=uiText("Falta cargar la clave Web Push. Cierra la app y vuelve a abrirla para actualizar la configuración.","The Web Push key has not loaded yet. Close and reopen the app to refresh the configuration.");
    return;
  }
  const permission=Notification.permission;
  enable.hidden=permission==="granted";
  disable.hidden=permission!=="granted";
  status.textContent=permission==="granted"
    ? uiText("Recordatorios activados en este dispositivo.","Reminders enabled on this device.")
    : permission==="denied"
      ? uiText("El navegador tiene bloqueadas las notificaciones. Actívalas en los ajustes de Chrome.","Notifications are blocked in the browser. Enable them in Chrome settings.")
      : uiText("Pulsa el botón para recibir avisos cuando llegue el tratamiento.","Press the button to receive an alert when treatment is due.");
}
async function enableReminders(){
  const status=$("#reminderStatus"),enable=$("#enableRemindersButton");
  if(!state.user||!fb)return;
  if(!remindersSupported()||!firebaseVapidKey){renderReminders();return}
  enable.disabled=true;
  try{
    const permission=await Notification.requestPermission();
    if(permission!=="granted"){renderReminders();return}
    const registration=await navigator.serviceWorker.register("/service-worker.js");
    await registration.update?.();
    const messaging=fb.messagingMod.getMessaging(fb.app);
    const token=await fb.messagingMod.getToken(messaging,{vapidKey:firebaseVapidKey,serviceWorkerRegistration:registration});
    if(!token)throw new Error("no-token");
    currentReminderToken=token;
    await fb.setDoc(fb.doc(fb.db,"users",state.user.uid,"notificationTokens",reminderTokenDocId(token)),{
      token,enabled:true,platform:"web-android",userAgent:navigator.userAgent,language,updatedAt:fb.serverTimestamp()
    },{merge:true});
    await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid),{remindersEnabled:true,remindersUpdatedAt:fb.serverTimestamp()});
    if(status)status.textContent=uiText("Recordatorios activados en este dispositivo.","Reminders enabled on this device.");
  }catch(error){
    if(status)status.textContent=uiText("No se pudieron activar los recordatorios. Revisa los permisos del navegador.","Reminders could not be enabled. Check browser permissions.");
  }finally{
    enable.disabled=false;
    renderReminders();
  }
}
async function disableReminders(){
  const status=$("#reminderStatus"),disable=$("#disableRemindersButton");
  if(!state.user||!fb)return;
  disable.disabled=true;
  try{
    if(currentReminderToken){
      await fb.setDoc(fb.doc(fb.db,"users",state.user.uid,"notificationTokens",reminderTokenDocId(currentReminderToken)),{enabled:false,disabledAt:fb.serverTimestamp()},{merge:true});
    }
    await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid),{remindersEnabled:false,remindersUpdatedAt:fb.serverTimestamp()});
    if(status)status.textContent=uiText("Recordatorios desactivados en este dispositivo.","Reminders disabled on this device.");
  }catch(error){
    if(status)status.textContent=uiText("No se pudieron desactivar los recordatorios.","Reminders could not be disabled.");
  }finally{
    disable.disabled=false;
    renderReminders();
  }
}
$("#enableRemindersButton")?.addEventListener("click",enableReminders);
$("#disableRemindersButton")?.addEventListener("click",disableReminders);
function cleanSideEffectPoint(text){
  return fixDisplayText(String(text||""))
    .replace(/\s+/g," ")
    .replace(/^[\s•●◦·\-.–—*]+/g,"")
    .replace(/^(?:[\s•●◦·\-.–—*]+\s*)+/g,"")
    .replace(/^(?:\u2022\s*)+/g,"")
    .replace(/\s+([,.;:])/g,"$1")
    .trim();
}
async function loadSideEffects(item){
  setSideEffectsDetailMode(true);
  $("#effectsStatus").textContent=t("Cargando el prospecto oficial?â‚¬?");const detail=$("#effectsDetail");detail.hidden=true;let registration=item.cimaId||item.nregistro;
  if(item.officialSource==="MHRA"||item.country==="GB"){
    $("#effectsStatus").textContent="";detail.innerHTML=`<h2>${safe(medicineShortName(item))}</h2><p class="eyebrow">INFORMACI?â€œN OFICIAL DE LA MHRA</p><p class="effects-summary-note">Consulta el prospecto brit?nico oficial para revisar efectos adversos y uso seguro.</p><div class="effects-source"><a class="primary" target="_blank" rel="noopener" href="${officialMedicineSearchUrl(item.name||item.nombre)}">Buscar prospecto en MHRA ?â€ â€”</a></div>`;detail.hidden=false;$("#effectsResults").innerHTML="";return;
  }
  try{
    if(!registration){const matchResponse=await fetch(`https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(item.name)}&autorizados=1&comerc=1`);if(matchResponse.ok){const matches=await matchResponse.json();registration=matches.resultados?.[0]?.nregistro}}
    if(!registration)throw new Error("CIMA");const prospectUrl=`https://cima.aemps.es/cima/dochtml/p/${encodeURIComponent(registration)}/Prospecto.html`;
    const response=await fetch(`https://cima.aemps.es/cima/rest/docSegmentado/contenido/2?nregistro=${encodeURIComponent(registration)}&seccion=4`);if(!response.ok)throw new Error("CIMA");const raw=await response.text();let data=raw;try{data=JSON.parse(raw)}catch(error){}const htmlParts=[];const visit=value=>{if(!value)return;if(typeof value==="string")htmlParts.push(value);else if(Array.isArray(value))value.forEach(visit);else if(typeof value==="object"){if(typeof value.contenido==="string")htmlParts.push(value.contenido);else Object.values(value).forEach(visit)}};visit(data);
    const parsed=new DOMParser().parseFromString(htmlParts.join("\n"),"text/html"),nodes=[...parsed.body.querySelectorAll("li")];if(!nodes.length)nodes.push(...parsed.body.querySelectorAll("p"));let points=[...new Set(nodes.map(node=>cleanSideEffectPoint(node.textContent)).filter(text=>text.length>15))];if(!points.length){const plain=parsed.body.textContent.replace(/\s+/g," ").trim();points=plain.split(/(?=(?:Muy frecuentes|Frecuentes|Poco frecuentes|Raros|Muy raros|Frecuencia no conocida|Los siguientes efectos|Otros efectos))/gi).map(cleanSideEffectPoint).filter(text=>text.length>20&&!/^Comunicaci?n de efectos/i.test(text))}points=points.slice(0,10);
    const openLeafletText=language==="en"?"Open full leaflet":"Abrir prospecto completo";
    $("#effectsStatus").textContent="";detail.innerHTML=`<h2>${safe(medicineShortName(item))}</h2><p class="eyebrow">${t("RESUMEN DEL PROSPECTO OFICIAL")}</p><p class="effects-summary-note">${t("Este resumen no contiene necesariamente todos los efectos adversos. Consulta el prospecto completo.")}</p><ul class="effects-summary-list">${points.map(point=>`<li>${safe(point)}</li>`).join("")||`<li>${t("Consulta el prospecto completo para ver los efectos adversos.")}</li>`}</ul><div class="effects-source"><a class="primary" target="_blank" rel="noopener" href="${prospectUrl}">${openLeafletText}</a></div>`;detail.hidden=false;$("#effectsResults").innerHTML="";detail.scrollIntoView({behavior:"smooth",block:"start"});
  }catch(error){$("#effectsStatus").textContent=t("No se pudo cargar esta secciÃ³n del prospecto.")}
}
$("#medicineForm").onsubmit=async e=>{e.preventDefault();const form=e.target,submit=$("button[type=submit]",form);submit.disabled=true;try{if(!await validateCimaName(form))return;const data=Object.fromEntries(new FormData(form));const med={name:data.name,dose:data.dose,time:data.time,instructions:data.instructions,startDate:data.startDate,endDate:data.endDate||null,cimaId:data.cimaId||null,officialSource:data.officialSource||officialMedicineSource(),country:patientCountry,imageUrl:data.medicineImageUrl||null,activeIngredient:data.activeIngredient||null,confirmed:true,createdAt:new Date().toISOString()};if(fb&&state.user){const ref=await fb.addDoc(fb.collection(fb.db,"users",state.user.uid,"medicines"),med);med.id=ref.id;state.medicines.push(med)}else{med.id=crypto.randomUUID();state.medicines.push(med);localStorage.setItem("mm_medicines",JSON.stringify(state.medicines))}renderAll();openView("medicines");form.reset();showCimaValidation("","");$("#reviewPanel").hidden=true;toast("MedicaciÃ³n confirmada y guardada.")}finally{submit.disabled=false}};
function ageFromBirthDate(value){
  if(!value)return null;
  const birth=new Date(`${value}T12:00:00`);
  if(Number.isNaN(birth.getTime()))return null;
  const today=new Date();
  let age=today.getFullYear()-birth.getFullYear();
  const birthdayThisYear=new Date(today.getFullYear(),birth.getMonth(),birth.getDate());
  if(today<birthdayThisYear)age--;
  return age;
}
function validateAdultBirthDate(form){
  const input=form.elements.birthDate,status=$(".form-status",form),age=ageFromBirthDate(input.value);
  const underAgeMessage=uiText("No puedes crear una cuenta si tienes menos de 18 a\u00f1os.","You cannot create an account if you are under 18.");
  if(age!==null&&age<18){
    status.textContent=underAgeMessage;
    input.setCustomValidity(underAgeMessage);
    input.reportValidity();
    return false;
  }
  input.setCustomValidity("");
  if(status.textContent===underAgeMessage)status.textContent="";
  return true;
}
$("#registerForm [name=birthDate]")?.addEventListener("change",event=>validateAdultBirthDate(event.currentTarget.form));
$("#registerForm").onsubmit=async e=>{
  e.preventDefault();
  const form=e.target,status=$(".form-status",form),submit=$("button[type=submit]",form);
  const data=Object.fromEntries(new FormData(form));
  if(!validateAdultBirthDate(form))return;
  const profile={name:`${data.name} ${data.lastName}`.trim(),firstName:data.name,lastName:data.lastName,birthDate:data.birthDate,phone:data.phone,country:data.country,preferredLanguage:language,highContrast:localStorage.getItem("mm_contrast")==="true",email:data.email,status:"pending",role:"user",privacyAcceptedAt:new Date().toISOString(),healthConsentAt:new Date().toISOString()};
  status.textContent="Creando tu cuenta?â‚¬?";submit.disabled=true;
  let photoUploadFailed=false;
  try{
    if(fb){
      userLoginInProgress=true;
      const cred=await fb.createUserWithEmailAndPassword(fb.auth,data.email,data.password);
      const userRef=fb.doc(fb.db,"users",cred.user.uid);
      await fb.setDoc(userRef,{...profile,createdAt:fb.serverTimestamp(),privacyAcceptedAt:fb.serverTimestamp(),healthConsentAt:fb.serverTimestamp()});
      if(selectedProfilePhoto){
        const path=`users/${cred.user.uid}/profile/avatar`;
        try{
          await fb.uploadBytes(fb.ref(fb.storage,path),selectedProfilePhoto,{contentType:selectedProfilePhoto.type});
          await fb.updateDoc(userRef,{photoPath:path});
        }catch(error){photoUploadFailed=true;}
      }
      await fb.signOut(fb.auth);
    }else{
      if(selectedProfilePhoto)profile.photoName=selectedProfilePhoto.name;
      state.requests.push({id:crypto.randomUUID(),...profile});
      localStorage.setItem("mm_requests",JSON.stringify(state.requests));
    }
    form.closest("dialog").close();form.reset();selectedProfilePhoto=null;showLanding();
    $("#profilePhotoPreview").textContent="+";status.textContent="";
    toast(photoUploadFailed?`${t("Alta enviada. El administrador debe aprobarla antes de que puedas entrar.")} ${t("La foto se podrÃ¡ aÃ±adir mÃ¡s adelante.")}`:t("Alta enviada. El administrador debe aprobarla antes de que puedas entrar."),7000);
  }catch(err){
    status.textContent=humanError(err.code);
    status.scrollIntoView({block:"nearest"});
  }finally{userLoginInProgress=false;submit.disabled=false;}
};
$("#loginForm").onsubmit=async e=>{
  e.preventDefault();const form=e.target,data=Object.fromEntries(new FormData(form)),status=$(".form-status",form),submit=$("button[type=submit]",form);
  status.textContent=uiText("Comprobando usuario y contrase\u00f1a\u2026","Checking email and password\u2026");submit.disabled=true;
  try{
    if(fb){
      userLoginInProgress=true;
      state.user=null;
      status.textContent=uiText("Conectando con Firebase\u2026","Connecting to Firebase\u2026");
      if(fb.auth.currentUser&&fb.auth.currentUser.email?.toLowerCase()!==String(data.email||"").toLowerCase())await fb.signOut(fb.auth);
      const credential=await fb.signInWithEmailAndPassword(fb.auth,data.email,data.password);
      status.textContent=uiText("Cuenta encontrada. Comprobando aprobaci\u00f3n\u2026","Account found. Checking approval\u2026");
      const result=await enterAuthenticatedUser(credential.user);
      if(result.ok){completeLoginSuccess(form,status);}
      else{const message=result.message||"No se pudo completar el acceso.";rememberLoginError(message);status.textContent=message;if(!form.closest("dialog").open)openDialogById("loginDialog");}
      return;
    }
    status.textContent="Firebase no estÃ¡ conectado en esta versi?n de la pÃ¡gina.";
    toast("Firebase no estÃ¡ conectado en esta versi?n de la pÃ¡gina.");
    return;
  }catch(err){status.textContent=humanError(err.code||err.message);rememberLoginError(status.textContent);toast(status.textContent,5000)}
  finally{userLoginInProgress=false;submit.disabled=false;}
};
$("#forgotPasswordButton")?.addEventListener("click",async()=>{
  const form=$("#loginForm"),email=$('[name="email"]',form).value.trim(),status=$(".form-status",form),button=$("#forgotPasswordButton");
  if(!email){status.textContent=t("Escribe primero tu correo electr\u00f3nico."); $('[name="email"]',form).focus(); return}
  if(!fb){status.textContent=t("Firebase no est\u00e1 conectado en esta versi\u00f3n de la p\u00e1gina."); return}
  fb.auth.languageCode=language==="en"?"en":"es";
  button.disabled=true;status.textContent=t("Comprobando estado de la cuenta\u2026");
  try{
    const eligibilityResult=await fb.httpsCallable(fb.functions,"checkPasswordResetEligibility")({email});
    const eligibility=eligibilityResult.data||{};
    if(!eligibility.eligible){
      status.textContent=eligibility.status==="blocked"?t("Tu cuenta est\u00e1 bloqueada. Contacta con el administrador."):t("Tu solicitud todav\u00eda est\u00e1 pendiente de aprobaci\u00f3n por el administrador.");
      return;
    }
    status.textContent=t("Enviando enlace de recuperaci\u00f3n\u2026");
    await fb.sendPasswordResetEmail(fb.auth,email,passwordResetActionSettings());
    status.textContent=t("Te hemos enviado un enlace para restaurar la contrase\u00f1a.");
  }catch(err){
    status.textContent=err.code?.includes("invalid-argument")||err.code?.includes("invalid-email")?t("El correo electr\u00f3nico no es v\u00e1lido."):err.code?.includes("functions")?t("No se pudo comprobar el estado de la cuenta. Int\u00e9ntalo de nuevo."):t("No se pudo enviar el enlace. Comprueba el correo e int\u00e9ntalo de nuevo.");
  }finally{button.disabled=false}
});
$$('[data-user-logout]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{closePreferences();if(fb)await fb.signOut(fb.auth);state.user=null;showLanding()}finally{button.disabled=false}});
$("#adminLogoutButton").onclick=async()=>{if(fb)await fb.signOut(fb.auth);state.user=null;showLanding()};
function humanError(code){
  return code==="demo-blocked"?uiText("Tu cuenta est\u00e1 bloqueada.","Your account is blocked."):
    code==="demo-pending"?uiText("Tu alta todav\u00eda est\u00e1 pendiente de aprobaci\u00f3n.","Your registration is still awaiting approval."):
    code?.includes("invalid-credential")?uiText("Correo o contrase\u00f1a incorrectos.","Incorrect email or password."):
    code?.includes("email-already")?uiText("Ya existe una cuenta con ese correo.","An account with that email already exists."):
    uiText("No se pudo completar la operaci\u00f3n. Int\u00e9ntalo de nuevo.","The operation could not be completed. Try again.");
}

localStorage.removeItem("mm_font");document.body.classList.remove("font-large","font-xlarge");document.documentElement.style.fontSize="";setHighContrast(localStorage.getItem("mm_contrast")==="true",false);
setPatientCountry(patientCountry,false);
async function setPreferredLanguage(nextLanguage,persist=true){
  if(!["es","en"].includes(nextLanguage))return;language=nextLanguage;localStorage.setItem("mm_language",language);renderAll();applyLanguage();
  if(persist&&fb&&state.user){try{await saveUserPreferences({preferredLanguage:language})}catch(error){toast(t("No se pudo guardar el idioma preferido."))}}
}
$$('[data-language]').forEach(button=>button.onclick=()=>setPreferredLanguage(button.dataset.language,false));
applyLanguage();
function openUserMenu(){forceCriticalSymbols();document.body.classList.add("user-menu-visible");$("#userMenuOverlay").hidden=false;$("#openUserMenu")?.setAttribute("aria-expanded","true")}
function closeUserMenu(){document.body.classList.remove("user-menu-visible");const overlay=$("#userMenuOverlay");if(overlay)overlay.hidden=true;$("#openUserMenu")?.setAttribute("aria-expanded","false")}
$("#openUserMenu")?.addEventListener("click",openUserMenu);
$("#closeUserMenu")?.addEventListener("click",closeUserMenu);
$("#userMenuOverlay")?.addEventListener("click",closeUserMenu);
$$(".user-menu [data-view]").forEach(button=>button.addEventListener("click",closeUserMenu));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeUserMenu()});
$("#profileCloseButton")?.addEventListener("click",()=>openView("today"));
function openDialogById(id,options={}){
  const dialog=$("#"+id);if(!dialog)return;
  if(id==="loginDialog"){
    const form=$("#loginForm"),input=$('#loginForm input[name="password"]'),button=$("#toggleLoginPassword"),status=form?$(".form-status",form):null;
    if(form&&!options.keepForm)form.reset();
    if(status&&!options.keepForm)status.textContent="";
    if(input){input.type="password";input.value="";}
    const email=$('#loginForm input[name="email"]');if(email&&!options.keepForm)email.value="";
    if(button){button.classList.remove("showing");button.setAttribute("aria-label",language==="en"?"Show password":"Mostrar contraseña")}
  }
  document.body.classList.add("modal-open");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
$$('[data-open="loginDialog"]').forEach(button=>button.addEventListener("click",event=>{event.preventDefault();openDialogById("loginDialog")}));
$("#toggleLoginPassword")?.addEventListener("click",()=>{
  const input=$('#loginForm input[name="password"]'),button=$("#toggleLoginPassword");
  if(!input||!button)return;
  const show=input.type==="password";
  input.type=show?"text":"password";
  button.classList.toggle("showing",show);
  button.setAttribute("aria-label",language==="en"?(show?"Hide password":"Show password"):(show?"Ocultar contraseña":"Mostrar contraseña"));
});
$$('[data-open="registerDialog"]').forEach(button=>button.addEventListener("click",event=>{event.preventDefault();openDialogById("registerDialog")}));
function hydrateUserMenu(){
  const name=state.user?.name||"Usuario",email=state.user?.email||"Modo demostraci?Æ’?n";
  if($("#menuUserName"))$("#menuUserName").textContent=name;
  if($("#menuUserEmail"))$("#menuUserEmail").textContent=email;
  if($("#userInitial")&&!$("#userInitial img"))$("#userInitial").textContent="+";
  if($("#menuUserPhoto")&&!$("#menuUserPhoto img"))$("#menuUserPhoto").textContent="+";
  if(fb&&state.user?.photoPath)fb.getDownloadURL(fb.ref(fb.storage,state.user.photoPath)).then(url=>setUserPhotoPreview(url)).catch(()=>{});
}
function updateMedicationCopy(){
  const title=$("#documents h1"),upload=$('[data-medication-mode="upload"]');
  if(title)title.textContent=t("AÃ±adir medicamento");
  const addMedicineButton=$(".add-medicine-button");
  if(addMedicineButton)addMedicineButton.textContent=language==="en"?"+ Add new medicine":"+ Añadir nuevo medicamento";
  const medicinesLead=$(".medicines-heading .lead");
  if(medicinesLead)medicinesLead.textContent=language==="en"?"Summary of all your treatments.":"Resumen de todos tus tratamientos.";
  if(upload){$("b",upload).textContent=t("Fotografiar medicamento");$("small",upload).textContent=t("Haz una foto de la caja o el envase")}
  const uploadLabel=$("#uploadChoice");if(uploadLabel){$("b",uploadLabel).textContent=t("Hacer foto o elegir imagen");$("small",uploadLabel).textContent=t("JPG o PNG Â· mÃ¡ximo 10 MB")}
  const menuButton=$("#openUserMenu");if(menuButton)menuButton.innerHTML=`<span aria-hidden="true">\u2630</span><span>${t("MenÃº")}</span>`;
  const calendarButton=$("#calendarButton");if(calendarButton)calendarButton.textContent=`\uD83D\uDCC5 ${t("Ver semana completa")}`;
}
function cleanLandingCopy(){
  const brand=$(".brand b");if(brand)brand.textContent=language==="en"?"My Medication":"Tu medicación";
  document.title=language==="en"?"My Medication":"Tu medicación";
  const heroTitle=$(".hero-copy h1");if(heroTitle)heroTitle.innerHTML=language==="en"?"Your medication,<br><em>clear and close.</em>":"Tu medicación,<br><em>clara y a mano.</em>";
  const heroText=$(".hero-copy p:not(.trust)");if(heroText)heroText.textContent=language==="en"?"Save your medicines and check your treatment in a simple, readable app.":"Guarda tus medicinas y consulta tu tratamiento en una app sencilla y fácil de leer.";
  const landingTitle=$(".landing-message h1");if(landingTitle)landingTitle.innerHTML=language==="en"?"Your medication,<br>always<br>on time.":"Tu medicación,<br>siempre<br>a tiempo.";
  const landingText=$(".landing-message p");if(landingText)landingText.textContent=language==="en"?"Simple reminders, treatment tracking and peace of mind for you.":"Recordatorios sencillos, seguimiento de tu tratamiento y tranquilidad para ti.";
  const registerButton=$('.actions [data-open="registerDialog"]');if(registerButton)registerButton.textContent=t("Darse de alta");
  const loginButton=$('.actions [data-open="loginDialog"]');if(loginButton)loginButton.textContent=t("Ya tengo cuenta");
  const accessLogin=$(".login-option .access-option-text");if(accessLogin)accessLogin.textContent=language==="en"?"Sign in":"Inicia sesión";
  const accessRegister=$(".register-option .access-option-text");if(accessRegister)accessRegister.textContent=language==="en"?"Register":"Regístrate";
  const loginWelcome=$("#loginDialog .login-welcome");if(loginWelcome)loginWelcome.textContent=language==="en"?"WELCOME":"BIENVENIDO";
  const loginEmailLabel=$("#loginForm label:nth-of-type(1)");if(loginEmailLabel?.firstChild)loginEmailLabel.firstChild.nodeValue=language==="en"?"Email":"Correo electrónico";
  const loginPasswordLabel=$("#loginForm label:nth-of-type(2)");if(loginPasswordLabel?.firstChild)loginPasswordLabel.firstChild.nodeValue=language==="en"?"Password":"Contraseña";
  const forgotPassword=$("#forgotPasswordButton");if(forgotPassword)forgotPassword.textContent=language==="en"?"I forgot my password":"He olvidado mi contraseña";
  const loginSubmit=$("#loginForm button[type='submit']");if(loginSubmit)loginSubmit.textContent=language==="en"?"Sign in":"Entrar";
  const passwordToggle=$("#toggleLoginPassword");if(passwordToggle){const showing=$('#loginForm input[name="password"]')?.type==="text";passwordToggle.classList.toggle("showing",!!showing);passwordToggle.setAttribute("aria-label",language==="en"?(showing?"Hide password":"Show password"):(showing?"Ocultar contraseña":"Mostrar contraseña"))}
  const skip=$(".skip");if(skip)skip.textContent=language==="en"?"Skip to content":"Saltar al contenido";
  $$("[data-language='es']").forEach(button=>{if(button.classList.contains("direct-language"))button.innerHTML="<span>"+String.fromCodePoint(0x1F1EA,0x1F1F8)+"</span>"});
  $$("[data-language='en']").forEach(button=>{if(button.classList.contains("direct-language"))button.innerHTML="<span>"+String.fromCodePoint(0x1F1EC,0x1F1E7)+"</span>"});
  $(".hero-card")?.remove();
  $(".trust")?.remove();
  $(".public-features")?.remove();
  document.querySelector("footer")?.remove();
  const landing=$("#landing");if(landing&&!landing.classList.contains("landing-access")){landing.style.minHeight="auto";landing.style.paddingBottom="1rem"}
}
const originalShowAppForMenu=showApp;
showApp=function(){originalShowAppForMenu();hydrateUserMenu();updateMedicationCopy()};
const defaultMealTimes={breakfast:"08:00",lunch:"14:00",dinner:"21:00",extra:"12:00"};
const mealTimes={...defaultMealTimes};
const mealLabels={breakfast:"Desayuno",lunch:"Comida",dinner:"Cena",extra:"Tratamiento adicional"};
const doseUnitOptions=["comprimido","cÃ¡psula","ml","gota","sobre","vial","inyecciÃ³n","parche","aplicaciÃ³n","unidad"];
const dayLabels={mon:"Lunes",tue:"Martes",wed:"Mi?Æ’?rcoles",thu:"Jueves",fri:"Viernes",sat:"S?Æ’?bado",sun:"Domingo"};
let editingScheduleMedicineId=null;
function selectedScheduleDays(){return $$('input[name="days"]:checked',$("#medicineForm")).map(input=>input.value)}
function selectedScheduleMeals(){return $$('input[name="meals"]:checked',$("#medicineForm")).map(input=>input.value)}
function inferDoseUnitFromMedicine(){
  const form=$("#medicineForm"),text=String(`${form?.name?.value||""} ${form?.dose?.value||""}`).toLowerCase();
  if(/comprim|tablet/.test(text))return "comprimido";
  if(/c[?a]ps|caps/.test(text))return "cÃ¡psula";
  if(/\bml\b|soluci|suspensi|jarabe/.test(text))return "ml";
  if(/gota/.test(text))return "gota";
  if(/sobre/.test(text))return "sobre";
  if(/vial/.test(text))return "vial";
  if(/inyect|jeringa|intraven/.test(text))return "inyecciÃ³n";
  if(/parche/.test(text))return "parche";
  return "comprimido";
}
function populateDoseUnitOptions(selected){
  const select=$('[name="doseUnit"]',$("#medicineForm"));if(!select)return;
  const preferred=selected||inferDoseUnitFromMedicine();
  const ordered=[preferred,...doseUnitOptions.filter(unit=>unit!==preferred)];
  select.innerHTML=ordered.map(unit=>`<option value="${safe(unit)}">${safe(unit)}</option>`).join("");
  select.value=preferred;
}
function padTime(value){return String(value).padStart(2,"0")}
function normaliseTimeValue(time,fallback="08:00"){return /^([01]\d|2[0-3]):[0-5]\d$/.test(time||"")?time:fallback}
function setMealTime(key,time){
  mealTimes[key]=normaliseTimeValue(time,defaultMealTimes[key]||"12:00");
  const stepper=$(`[data-time-stepper="${key}"]`);if(!stepper)return;
  const [hour,minute]=mealTimes[key].split(":");
  $("[data-time-hour]",stepper).textContent=hour;
  $("[data-time-minute]",stepper).textContent=minute;
}
function updateMealTimeVisibility(){
  $$('input[name="meals"]',$("#medicineForm")).forEach(input=>{
    const row=input.closest("[data-meal-row]"),stepper=$(`[data-time-stepper="${input.value}"]`,row);
    if(stepper)stepper.hidden=!input.checked;
    row?.classList.toggle("meal-selected",input.checked);
  });
  const continueButton=$("#goPosologyStep");if(continueButton)continueButton.disabled=!selectedScheduleMeals().length;
}
function resetMealTimes(){Object.entries(defaultMealTimes).forEach(([key,time])=>setMealTime(key,time));updateMealTimeVisibility()}
function changeMealTime(key,part,delta){
  const [h,m]=normaliseTimeValue(mealTimes[key],defaultMealTimes[key]).split(":").map(Number);
  let hour=h,minute=m;
  if(part==="hour")hour=(hour+delta+24)%24;
  else{let total=hour*60+minute+delta;total=(total+1440)%1440;hour=Math.floor(total/60);minute=total%60}
  minute=Math.round(minute/10)*10;if(minute>=60){minute=0;hour=(hour+1)%24}
  setMealTime(key,`${padTime(hour)}:${padTime(minute)}`);
}
function inferMealKeys(medicine){
  const existing=(medicine.schedule?.meals||[]).map(meal=>meal.key).filter(Boolean);
  if(existing.length)return existing;
  const text=String(medicine.instructions||"").toLowerCase();
  const keys=[];
  if(text.includes("desayuno")||text.includes("breakfast"))keys.push("breakfast");
  if(text.includes("comida")||text.includes("lunch"))keys.push("lunch");
  if(text.includes("cena")||text.includes("dinner"))keys.push("dinner");
  return keys;
}
function showScheduleStep(step){
  $$("[data-schedule-step]").forEach(section=>{const active=section.dataset.scheduleStep===step;section.hidden=!active;section.classList.toggle("active",active)});
  $("#scheduleWizard")?.setAttribute("data-current-step",step);
}
function resetScheduleWizard(){
  selectedFrequency=null;showScheduleStep("frequency");$("#weekdayPicker").hidden=true;$("#goMealsStep").disabled=true;$("#goFrequencyNextStep").disabled=true;
  $$("[data-frequency]").forEach(button=>{button.classList.remove("active");button.setAttribute("aria-pressed","false")});
  $$('input[name="days"],input[name="meals"]',$("#medicineForm")).forEach(input=>input.checked=false);
  const form=$("#medicineForm");if(form){form.doseAmount.value="";form.comments.value="";populateDoseUnitOptions()}
  $("#goPosologyStep").disabled=true;
  resetMealTimes();
}
function enterScheduleOnlyMode(){
  setDocumentsIntroVisible(false);
  selectedMedicationMethod="schedule";
  $("#changeMethodButton").hidden=false;
  $("#changeMethodButton").textContent=(language==="en"?"Back":"Atrás");
  $("#scheduleBackButton").hidden=true;
  $(".medication-methods").hidden=true;
  $("#medicineSearchPanel").hidden=true;
  $("#uploadChoice").hidden=true;
  $("#selectedMedicine").hidden=true;
  $("#reviewPanel").hidden=false;
  $("#reviewPanel").classList.add("schedule-only");
}
function configureMedicineSchedule(id){
  const medicine=state.medicines.find(item=>item.id===id),form=$("#medicineForm");
  if(!medicine||!form)return;
  editingScheduleMedicineId=id;
  openView("documents",{keepDocumentState:true});
  enterScheduleOnlyMode();
  $("#selectedMedicine").innerHTML="";
  $(".notice",$("#reviewPanel")).innerHTML=`<b>${t("Configurar tratamiento")}</b><br>${safe(medicineShortName(medicine))}`;
  form.hidden=false;
  form.name.value=medicine.name||"";
  form.dose.value=medicine.dose||"";
  form.time.value=medicine.time||"";
  form.instructions.value=medicine.instructions||"";
  form.cimaId.value=medicine.cimaId||"";
  form.officialSource.value=medicine.officialSource||officialMedicineSource();
  form.medicineImageUrl.value=medicine.imageUrl||"";
  form.activeIngredient.value=medicine.activeIngredient||"";
  form.doseAmount.value=medicine.posology?.amount||"";
  populateDoseUnitOptions(medicine.posology?.unit);
  form.comments.value=medicine.comments||medicine.posology?.comments||"";
  form.startDate.value=todayIso();
  form.endDate.value=medicine.endDate||"";
  resetScheduleWizard();
  const days=medicine.schedule?.days?.length?medicine.schedule.days:["mon","tue","wed","thu","fri","sat","sun"];
  const meals=inferMealKeys(medicine);
  const daily=days.length===7;
  selectedFrequency=daily?"daily":"custom";
  $$("[data-frequency]").forEach(button=>{const active=button.dataset.frequency===selectedFrequency;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});
  $("#weekdayPicker").hidden=daily;
  $$('input[name="days"]',form).forEach(input=>input.checked=days.includes(input.value));
  (medicine.schedule?.meals||[]).forEach(meal=>{if(meal.key)setMealTime(meal.key,meal.time||defaultMealTimes[meal.key])});
  $$('input[name="meals"]',form).forEach(input=>input.checked=meals.includes(input.value));
  updateMealTimeVisibility();
  updateFrequencyContinue();
  $("#goFrequencyNextStep").disabled=false;
  showScheduleStep("frequency");
  if(!daily)$("#weekdayPicker").hidden=false;
  $("#scheduleWizard")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function updateFrequencyContinue(){
  $("#goFrequencyNextStep").disabled=!selectedFrequency;
  $("#goMealsStep").disabled=!(selectedFrequency==="daily"||(selectedFrequency==="custom"&&selectedScheduleDays().length));
}
$$("[data-frequency]").forEach(button=>button.addEventListener("click",()=>{selectedFrequency=button.dataset.frequency;$$("[data-frequency]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active))});if(selectedFrequency==="daily")$$('input[name="days"]',$("#medicineForm")).forEach(input=>input.checked=true);else if(!editingScheduleMedicineId&&!selectedScheduleDays().length)$$('input[name="days"]',$("#medicineForm")).forEach(input=>input.checked=false);updateFrequencyContinue()}));
$$('input[name="days"]').forEach(input=>input.addEventListener("change",updateFrequencyContinue));
$$('input[name="meals"]').forEach(input=>input.addEventListener("change",updateMealTimeVisibility));
$$("[data-time-stepper] button").forEach(button=>button.addEventListener("click",event=>{
  event.preventDefault();event.stopPropagation();
  const stepper=button.closest("[data-time-stepper]");
  changeMealTime(stepper.dataset.timeStepper,button.dataset.timePart,Number(button.dataset.timeDelta||0));
}));
$("#goFrequencyNextStep")?.addEventListener("click",()=>{if(selectedFrequency==="daily"){showScheduleStep("meals");return}$("#weekdayPicker").hidden=false;showScheduleStep("days");updateFrequencyContinue()});
$("#goMealsStep")?.addEventListener("click",()=>showScheduleStep("meals"));
$("#goPosologyStep")?.addEventListener("click",()=>{populateDoseUnitOptions($('[name="doseUnit"]',$("#medicineForm"))?.value);showScheduleStep("posology")});
$("#goCommentsStep")?.addEventListener("click",()=>showScheduleStep("comments"));
function handleScheduleBack(){
  const step=$("#scheduleWizard")?.dataset.currentStep||"frequency";
  if(step==="comments"){showScheduleStep("posology");return}
  if(step==="posology"){
    if(!editingScheduleMedicineId){const form=$("#medicineForm");form.doseAmount.value="";populateDoseUnitOptions()}
    showScheduleStep("meals");
    return;
  }
  if(step==="meals"){
    if(!editingScheduleMedicineId){$$('input[name="meals"]',$("#medicineForm")).forEach(input=>input.checked=false);resetMealTimes();updateMealTimeVisibility()}
    showScheduleStep(selectedFrequency==="custom"?"days":"frequency");
    return;
  }
  if(step==="days"){
    if(!editingScheduleMedicineId){$$('input[name="days"]',$("#medicineForm")).forEach(input=>input.checked=false);updateFrequencyContinue()}
    showScheduleStep("frequency");
    return;
  }
  if(editingScheduleMedicineId){openView("medicines");showMedicineDetail(editingScheduleMedicineId);return}
  resetMedicationMethodScreen();
}
$("#scheduleBackButton")?.addEventListener("click",handleScheduleBack);
const originalDiscardMedicineDraft=discardMedicineDraft;
discardMedicineDraft=function(){editingScheduleMedicineId=null;resetScheduleWizard();originalDiscardMedicineDraft()};
const originalConfirmCimaMedicine=confirmCimaMedicine;
confirmCimaMedicine=function(item){originalConfirmCimaMedicine(item);enterScheduleOnlyMode();resetScheduleWizard();showScheduleStep("frequency");$("#scheduleWizard")?.scrollIntoView({behavior:"smooth",block:"start"})};
const originalConfirmMhraMedicine=confirmMhraMedicine;
confirmMhraMedicine=function(name){originalConfirmMhraMedicine(name);enterScheduleOnlyMode();resetScheduleWizard();showScheduleStep("frequency");$("#scheduleWizard")?.scrollIntoView({behavior:"smooth",block:"start"})};
const originalRenderOcrCandidates=renderOcrCandidates;
renderOcrCandidates=async function(candidates,rawText=""){await originalRenderOcrCandidates(candidates,rawText);resetScheduleWizard()};
const originalRenderSchedule=renderSchedule;
renderSchedule=function(){
  const hasStructured=state.medicines.some(m=>m.schedule?.meals?.length);
  if(!hasStructured)return originalRenderSchedule();
  const today=new Date();today.setHours(12,0,0,0);const iso=today.toISOString().slice(0,10);
  const weekday=["sun","mon","tue","wed","thu","fri","sat"][today.getDay()];
  const doses=state.medicines.filter(m=>m.confirmed&&(!m.startDate||m.startDate<=iso)&&(!m.endDate||m.endDate>=iso)).flatMap(m=>{
    const days=m.schedule?.days||["mon","tue","wed","thu","fri","sat","sun"];if(!days.includes(weekday))return[];
    const meals=m.schedule?.meals||[{key:"custom",label:m.instructions||"Toma",time:m.time||""}];
    return meals.map(meal=>({medicine:m,meal}));
  }).sort((a,b)=>(a.meal.time||"").localeCompare(b.meal.time||""));
  $("#schedule").innerHTML=`<article class="day-group">${doses.map(item=>`<div class="day-dose"><div class="dose-top"><b>${safe(item.meal.label||item.meal.time||"")}</b><button class="status-button" data-take data-medicine="${safe(item.medicine.id)}" data-date="${iso}_${safe(item.meal.key||item.meal.label)}">${uiText("Realizado","Completed")}</button></div><div class="dose-medicine"><strong>${safe(medicineShortName(item.medicine))}</strong><p>${safe(item.meal.time||"")}</p></div></div>`).join("")||`<p class="empty-day">${t("Sin tratamiento programado")}</p>`}</article>`;
  $$('[data-take]').forEach(b=>setupTakeButton(b));
};
function normaliseSelectedScheduleDate(){selectedScheduleDate=new Date(selectedScheduleDate);selectedScheduleDate.setHours(12,0,0,0)}
function selectedDateIso(){normaliseSelectedScheduleDate();return selectedScheduleDate.toISOString().slice(0,10)}
function cloneDay(date){const next=new Date(date);next.setHours(12,0,0,0);return next}
function weekStartFor(date){const next=cloneDay(date),day=next.getDay()||7;next.setDate(next.getDate()-day+1);return next}
function medicineCalendarColor(index){return ["#247a5a","#2f6fbb","#d8792f","#8b5cc7","#c5456b","#118a99","#ad8b22","#56606b"][index%8]}
function medicineColorMap(){
  const map={};
  state.medicines.filter(m=>m.confirmed).forEach((medicine,index)=>{map[medicine.id]=medicineCalendarColor(index)});
  return map;
}
function dosesForDate(date){
  const iso=date.toISOString().slice(0,10),weekday=["sun","mon","tue","wed","thu","fri","sat"][date.getDay()];
  return state.medicines.filter(m=>m.confirmed&&(!m.startDate||m.startDate<=iso)&&(!m.endDate||m.endDate>=iso)).flatMap(m=>{
    if(m.schedule?.meals?.length){
      const days=m.schedule.days||["mon","tue","wed","thu","fri","sat","sun"];
      if(!days.includes(weekday))return[];
      return m.schedule.meals.map(meal=>({medicine:m,meal}));
    }
    return [{medicine:m,meal:{key:"custom",label:m.instructions||t("Toma"),time:m.time||""}}];
  }).sort((a,b)=>(a.meal.time||"").localeCompare(b.meal.time||""));
}
let complianceMonth=new Date();
function yesterdayDate(){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-1);return date}
function dateFromIso(iso){const date=new Date(`${iso}T12:00:00`);return Number.isNaN(date.getTime())?null:date}
function medicineFirstDate(medicine){
  const candidates=[medicine.startDate,medicine.createdAt?.slice?.(0,10)].filter(Boolean).sort();
  return dateFromIso(candidates[0]||todayIso());
}
function scheduledItemsForMedicineDate(medicine,date){
  const iso=date.toISOString().slice(0,10),weekday=["sun","mon","tue","wed","thu","fri","sat"][date.getDay()];
  const first=medicine.startDate||medicine.createdAt?.slice?.(0,10)||"";
  if((first&&first>iso)||(medicine.endDate&&medicine.endDate<iso))return[];
  if(medicine.schedule?.meals?.length){
    const days=medicine.schedule.days||["mon","tue","wed","thu","fri","sat","sun"];
    if(!days.includes(weekday))return[];
    return medicine.schedule.meals.map(meal=>({medicine,meal}));
  }
  return [{medicine,meal:{key:"custom",label:medicine.instructions||t("Toma"),time:medicine.time||""}}];
}
function expectedIntakeKey(item,iso){return `${iso}_${item.meal.key||item.meal.label}_${item.medicine.id}`}
function isIntakeTaken(medicineId,dateKey){
  const iso=intakeBaseIso(dateKey);
  const storageId=intakeStorageId(medicineId,dateKey);
  const scheduledKey=String(dateKey||"").endsWith(`_${medicineId}`)?String(dateKey).slice(0,-String(medicineId).length-1):String(dateKey||"");
  return Object.values(state.intakes||{}).some(intake=>{
    if(intake?.status&&intake.status!=="taken")return false;
    if(intake?.medicineId!==medicineId)return false;
    const scheduled=String(intake.scheduledDate||intake.date||"");
    const intakeId=String(intake.id||"");
    const isCustom=String(dateKey||"").endsWith("_custom");
    return scheduled===dateKey||scheduled===scheduledKey||intakeId===dateKey||intakeId===storageId||intakeId===`${scheduledKey}_${medicineId}`||(isCustom&&(scheduled===iso||intakeId===`${iso}_${medicineId}`));
  });
}
function complianceStatsForMedicine(medicine,startDate,endDate){
  const stats={medicine,expected:0,taken:0,days:[]};
  const current=cloneDay(startDate),last=cloneDay(endDate);
  while(current<=last){
    const iso=current.toISOString().slice(0,10),items=scheduledItemsForMedicineDate(medicine,current);
    const expected=items.length,taken=items.filter(item=>isIntakeTaken(medicine.id,expectedIntakeKey(item,iso))).length;
    stats.expected+=expected;stats.taken+=taken;
    if(expected)stats.days.push({iso,expected,taken});
    current.setDate(current.getDate()+1);
  }
  stats.percent=stats.expected?Math.round((stats.taken/stats.expected)*100):0;
  return stats;
}
function complianceStats(medicineId=null,startDate=null,endDate=null){
  const end=endDate?cloneDay(endDate):yesterdayDate();
  const meds=state.medicines.filter(m=>m.confirmed&&(medicineId?m.id===medicineId:true));
  const stats=meds.map(m=>complianceStatsForMedicine(m,startDate||medicineFirstDate(m),end));
  const expected=stats.reduce((sum,item)=>sum+item.expected,0),taken=stats.reduce((sum,item)=>sum+item.taken,0);
  return {medicineId,medicines:stats,expected,taken,percent:expected?Math.round((taken/expected)*100):0};
}
function renderComplianceSummary(){
  complianceMonth=new Date();
  $("#complianceBackButton").hidden=true;
  $("#complianceSummary").hidden=false;$("#complianceDetail").hidden=true;
  const summary=$("#complianceSummary");
  if(summary){
    const title=$("h1",summary),lead=$(".lead",summary);
    if(title)title.textContent=language==="en"?"Adherence":"Cumplimiento";
    if(lead)lead.textContent=language==="en"?"Percentage calculated from completed treatment from the start date up to yesterday.":"Porcentaje calculado con el tratamiento realizado desde el inicio hasta ayer.";
  }
  const total=complianceStats(),rows=[{id:"total",name:language==="en"?"Total":"Total",stats:total},...activeMedicines().map(m=>({id:m.id,name:medicineShortName(m),stats:complianceStats(m.id)}))];
  $("#complianceResults").innerHTML=rows.map(row=>`<button type="button" class="compliance-card" data-compliance="${safe(row.id)}"><span><b>${safe(row.name)}</b><small>${row.stats.taken}/${row.stats.expected} ${language==="en"?"treatments completed":"tratamientos realizados"}</small></span><strong>${row.stats.percent}%</strong></button>`).join("")||`<p class="empty-day">${language==="en"?"No medicines yet.":"Todavía no hay medicamentos."}</p>`;
  $$("[data-compliance]").forEach(button=>button.onclick=()=>showComplianceDetail(button.dataset.compliance));
}
function showComplianceDetail(id){
  $("#complianceBackButton").hidden=true;
  $("#complianceSummary").hidden=true;const detail=$("#complianceDetail");detail.hidden=false;
  complianceMonth.setHours(12,0,0,0);
  const monthStart=new Date(complianceMonth.getFullYear(),complianceMonth.getMonth(),1,12),monthEnd=new Date(complianceMonth.getFullYear(),complianceMonth.getMonth()+1,0,12),yesterday=yesterdayDate();
  const end=monthEnd>yesterday?yesterday:monthEnd;
  const stats=id==="total"?complianceStats(null,monthStart,end):complianceStats(id,monthStart,end);
  const title=id==="total"?(language==="en"?"Total":"Total"):medicineShortName(state.medicines.find(m=>m.id===id));
  const monthLabel=new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{month:"long",year:"numeric"}).format(monthStart);
  const daysMap={};stats.medicines.forEach(medStats=>medStats.days.forEach(day=>{const row=daysMap[day.iso]||{expected:0,taken:0};row.expected+=day.expected;row.taken+=day.taken;daysMap[day.iso]=row}));
  const rows=Object.entries(daysMap).sort(([a],[b])=>a.localeCompare(b)).map(([iso,row])=>`<tr><td>${safe(new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{day:"numeric",weekday:"short"}).format(dateFromIso(iso)))}</td><td>${row.taken}/${row.expected}</td><td>${row.expected?Math.round(row.taken/row.expected*100):0}%</td></tr>`).join("");
  detail.innerHTML=`<button class="secondary medicine-back-button" type="button" data-back-compliance>${language==="en"?"Back":"Atrás"}</button><div class="compliance-detail-card"><h1>${safe(title)}</h1><div class="compliance-month-nav"><button type="button" data-compliance-month="-1" aria-label="${language==="en"?"Previous month":"Mes anterior"}">${String.fromCodePoint(0x2190)}</button><b>${safe(monthLabel)}</b><button type="button" data-compliance-month="1" aria-label="${language==="en"?"Next month":"Mes siguiente"}">${String.fromCodePoint(0x2192)}</button></div><div class="compliance-big-percent"><strong>${stats.percent}%</strong><span>${stats.taken}/${stats.expected} ${language==="en"?"treatments":"tratamientos"}</span></div><table class="compliance-table"><thead><tr><th>${language==="en"?"Day":"Día"}</th><th>${language==="en"?"Completed":"Realizados"}</th><th>%</th></tr></thead><tbody>${rows||`<tr><td colspan="3">${language==="en"?"No scheduled treatment this month.":"Sin tratamiento programado este mes."}</td></tr>`}</tbody></table></div>`;
  $("[data-back-compliance]",detail).onclick=renderComplianceSummary;
  $$("[data-compliance-month]",detail).forEach(button=>button.onclick=()=>{complianceMonth.setMonth(complianceMonth.getMonth()+Number(button.dataset.complianceMonth));showComplianceDetail(id)});
}
function monthStart(date){return new Date(date.getFullYear(),date.getMonth(),1,12)}
function monthEnd(date){return new Date(date.getFullYear(),date.getMonth()+1,0,12)}
function addMonths(date,delta){return new Date(date.getFullYear(),date.getMonth()+delta,1,12)}
function completedMonthStart(offset=0){const today=new Date();return new Date(today.getFullYear(),today.getMonth()-1-offset,1,12)}
function achievementMonths(count=12){count=Math.min(count,12);return Array.from({length:count},(_,index)=>addMonths(completedMonthStart(count-1),index))}
function monthStatsForMedicine(medicineId,month){return complianceStats(medicineId,monthStart(month),monthEnd(month))}
function monthStatsTotal(month){return complianceStats(null,monthStart(month),monthEnd(month))}
function dayStatsTotal(date){return complianceStats(null,date,date)}
function isPerfect(stats){return stats.expected>0&&stats.taken===stats.expected}
function currentPerfectDayStreak(){
  let streak=0;
  const date=yesterdayDate();
  for(let index=0;index<730;index++){
    const stats=dayStatsTotal(date);
    if(!stats.expected){date.setDate(date.getDate()-1);continue}
    if(isPerfect(stats))streak++;
    else break;
    date.setDate(date.getDate()-1);
  }
  return streak;
}
function achievementMilestones(earnedWeeks){
  const items=[
    {weeks:1,icon:String.fromCodePoint(0x1F949),label:language==="en"?"1 week":"1 semana"},
    {weeks:2,icon:String.fromCodePoint(0x1F948),label:language==="en"?"2 weeks":"2 semanas"},
    {weeks:3,icon:String.fromCodePoint(0x1F947),label:language==="en"?"3 weeks":"3 semanas"},
    {weeks:4,icon:String.fromCodePoint(0x1F3C6),label:language==="en"?"4 weeks":"4 semanas"},
    {weeks:5,icon:String.fromCodePoint(0x2B50),label:language==="en"?"5 weeks":"5 semanas"},
    {weeks:6,icon:String.fromCodePoint(0x1F31F),label:language==="en"?"6 weeks":"6 semanas"},
    {weeks:7,icon:String.fromCodePoint(0x1F451),label:language==="en"?"7 weeks":"7 semanas"},
    {weeks:8,icon:String.fromCodePoint(0x1F48E),label:language==="en"?"8 weeks":"8 semanas"},
    {weeks:9,icon:String.fromCodePoint(0x1F680),label:language==="en"?"9 weeks":"9 semanas"},
    {weeks:10,icon:String.fromCodePoint(0x1F3AF),label:language==="en"?"10 weeks":"10 semanas"},
    {weeks:11,icon:String.fromCodePoint(0x1F525),label:language==="en"?"11 weeks":"11 semanas"},
    {weeks:12,icon:String.fromCodePoint(0x1F308),label:language==="en"?"12 weeks":"12 semanas"}
  ];
  return items.map(item=>`<div class="achievement-milestone ${earnedWeeks>=item.weeks?"earned":"locked"}"><span>${safe(item.icon)}</span><b>${safe(item.label)}</b></div>`).join("");
}
function renderAchievements(){
  const dayStreak=currentPerfectDayStreak();
  const earnedWeeks=Math.floor(dayStreak/7);
  const streakText=language==="en"?`${dayStreak} active day${dayStreak===1?"":"s"} streak`:`Racha activa de ${dayStreak} ${dayStreak===1?"día":"días"}`;
  const section=$("#achievements");
  if(section){
    const title=$("h1",section),lead=$(".lead",section);
    if(title)title.textContent=language==="en"?"Achievements":"Logros";
    if(lead)lead.textContent=language==="en"?"Badges for full weeks with all treatment completed.":"Emblemas por semanas completas con todo el tratamiento realizado.";
  }
  $("#achievementsBackButton").hidden=true;
  $("#achievementGrid").innerHTML=`<div class="achievement-milestones">${achievementMilestones(earnedWeeks)}</div>`;
  $("#achievementStreak").innerHTML=`<h2>${safe(streakText)}</h2>`;
}
function medicineDoseLine(medicine){
  const amount=medicine?.posology?.amount,unit=medicine?.posology?.unit;
  return amount&&unit?`${amount} ${unit}`:"";
}
function renderWeekCalendar(){
  const panel=$("#weekCalendarPanel");if(!panel||panel.hidden)return;
  selectedWeekStart=weekStartFor(selectedWeekStart||selectedScheduleDate);
  const locale=language==="en"?"en-GB":"es-ES",colors=medicineColorMap();
  const end=cloneDay(selectedWeekStart);end.setDate(end.getDate()+6);
  $("#weekCalendarTitle").textContent=`${t("Semana del")} ${new Intl.DateTimeFormat(locale,{day:"numeric",month:"long"}).format(selectedWeekStart)}`;
  const days=Array.from({length:7},(_,index)=>{const date=cloneDay(selectedWeekStart);date.setDate(date.getDate()+index);return date});
  $("#weekCalendarDays").innerHTML=days.map(date=>{
    const dayLabel=new Intl.DateTimeFormat(locale,{weekday:"short",day:"numeric"}).format(date);
    const doses=dosesForDate(date);
    const iso=date.toISOString().slice(0,10);
    return `<button type="button" class="week-day-card" data-week-day="${safe(iso)}"><h3>${safe(dayLabel)}</h3>${doses.length?doses.map(item=>`<div class="week-dose-dot"><span>${safe(item.meal.time||"")}</span><i style="background:${safe(colors[item.medicine.id]||"#247a5a")}"></i></div>`).join(""):`<p>${uiText("Sin tratamiento","No treatment")}</p>`}</button>`;
  }).join("");
  $$("[data-week-day]",$("#weekCalendarDays")).forEach(button=>button.onclick=()=>{const next=new Date(`${button.dataset.weekDay}T12:00:00`);if(Number.isNaN(next.getTime()))return;selectedScheduleDate=next;hideWeekCalendar()});
  const used=state.medicines.filter(m=>m.confirmed&&days.some(day=>dosesForDate(day).some(item=>item.medicine.id===m.id)));
  $("#weekCalendarLegend").innerHTML=used.length?`<h3>${t("Leyenda")}</h3>${used.map(m=>`<div class="legend-row"><i style="background:${safe(colors[m.id]||"#247a5a")}"></i><span>${safe(medicineShortName(m))}</span></div>`).join("")}`:"";
}
function showWeekCalendar(){
  selectedWeekStart=weekStartFor(selectedScheduleDate);
  $("#today .today-toolbar").hidden=true;
  $("#calendarButton").hidden=true;
  $("#schedule").hidden=true;
  $("#weekCalendarPanel").hidden=false;
  renderWeekCalendar();
}
function hideWeekCalendar(){
  $("#weekCalendarPanel").hidden=true;
  $("#today .today-toolbar").hidden=false;
  $("#calendarButton").hidden=false;
  $("#schedule").hidden=false;
  renderSchedule();
}
function formatSelectedDate(){
  normaliseSelectedScheduleDate();
  const locale=language==="en"?"en-GB":"es-ES",today=new Date();today.setHours(12,0,0,0);
  const diff=Math.round((selectedScheduleDate-today)/86400000);
  const label=diff===0?t("Hoy"):diff===1?t("MaÃ±ana"):diff===-1?t("Ayer"):new Intl.DateTimeFormat(locale,{weekday:"long"}).format(selectedScheduleDate);
  const date=new Intl.DateTimeFormat(locale,{day:"numeric",month:"long",year:"numeric"}).format(selectedScheduleDate);
  if($("#todayDate"))$("#todayDate").textContent=date.toUpperCase();
  if($("#todayTitle"))$("#todayTitle").textContent=language==="en"?"Treatment":"Tratamiento";
}
renderSchedule=function(){
  normaliseSelectedScheduleDate();formatSelectedDate();
  const iso=selectedDateIso(),doses=dosesForDate(selectedScheduleDate);
  const grouped=doses.reduce((acc,item)=>{const key=item.meal.label||item.meal.time||t("Toma");(acc[key]||=[]).push(item);return acc},{});
  $("#schedule").innerHTML=`<article class="day-group compact-dose-list">${doses.length?Object.entries(grouped).map(([label,items])=>`<section class="dose-meal-group"><h2>${safe(label)}</h2>${items.map(item=>`<div class="day-dose compact-dose"><span class="dose-time">${safe(item.meal.time||"")}</span><div class="dose-medicine"><strong>${safe(medicineShortName(item.medicine))}</strong>${medicineDoseLine(item.medicine)?`<p>${safe(medicineDoseLine(item.medicine))}</p>`:""}</div><button class="status-button compact-check-button" data-take data-medicine="${safe(item.medicine.id)}" data-date="${iso}_${safe(item.meal.key||item.meal.label)}" aria-label="${t("Pendiente de tratamiento")}" aria-pressed="false">${String.fromCodePoint(0x25CB)}</button></div>`).join("")}</section>`).join(""):`<p class="empty-day">${uiText("Sin tratamiento programado","No scheduled treatment")}</p>`}</article>`;
  $$("[data-take]").forEach(b=>setupTakeButton(b,true));
};
$("#previousDayButton")?.addEventListener("click",()=>{normaliseSelectedScheduleDate();selectedScheduleDate.setDate(selectedScheduleDate.getDate()-1);renderSchedule()});
$("#nextDayButton")?.addEventListener("click",()=>{normaliseSelectedScheduleDate();selectedScheduleDate.setDate(selectedScheduleDate.getDate()+1);renderSchedule()});
$("#calendarButton")?.addEventListener("click",showWeekCalendar);
$("#calendarDateInput")?.addEventListener("change",event=>{if(!event.target.value)return;const next=new Date(`${event.target.value}T12:00:00`);if(Number.isNaN(next.getTime()))return;selectedScheduleDate=next;renderSchedule()});
$("#closeWeekCalendarButton")?.addEventListener("click",hideWeekCalendar);
$("#previousWeekButton")?.addEventListener("click",()=>{selectedWeekStart=weekStartFor(selectedWeekStart||selectedScheduleDate);selectedWeekStart.setDate(selectedWeekStart.getDate()-7);renderWeekCalendar()});
$("#nextWeekButton")?.addEventListener("click",()=>{selectedWeekStart=weekStartFor(selectedWeekStart||selectedScheduleDate);selectedWeekStart.setDate(selectedWeekStart.getDate()+7);renderWeekCalendar()});
$("#userAccessibilityButton")?.addEventListener("click",()=>setTimeout(closeUserMenu,0));
renderAll=function(){renderSchedule();renderMedicines();applyLanguage();formatSelectedDate();updateMedicationCopy();renderWeekCalendar()};
$("#medicineForm").onsubmit=async e=>{
  e.preventDefault();const form=e.target,submit=$("button[type=submit]",form);submit.disabled=true;
  try{
    if(!editingScheduleMedicineId&&!await validateCimaName(form))return;
    const days=selectedScheduleDays(),mealKeys=selectedScheduleMeals();
    if(!days.length){toast(uiText("Selecciona los días del tratamiento.","Select the treatment days."));showScheduleStep("frequency");return}
    if(!mealKeys.length){toast("Selecciona desayuno, comida o cena.");showScheduleStep("meals");return}
    const data=Object.fromEntries(new FormData(form));
    const meals=mealKeys.map(key=>({key,label:mealLabels[key],time:mealTimes[key]||defaultMealTimes[key]}));
    const editingId=editingScheduleMedicineId;
    const previous=editingId?state.medicines.find(item=>item.id===editingId):null;
    const posologyAmount=data.doseAmount||previous?.posology?.amount||null;
    const posologyUnit=data.doseUnit||previous?.posology?.unit||null;
    const med={name:data.name,dose:data.dose,time:meals[0]?.time||"",instructions:meals.map(item=>item.label).join(", "),schedule:{days,meals},posology:{amount:posologyAmount,unit:posologyUnit},comments:data.comments||previous?.comments||null,startDate:data.startDate,endDate:data.endDate||null,cimaId:data.cimaId||null,officialSource:data.officialSource||officialMedicineSource(),country:patientCountry,imageUrl:data.medicineImageUrl||null,activeIngredient:data.activeIngredient||null,confirmed:true,updatedAt:new Date().toISOString()};
    if(editingId){
      const index=state.medicines.findIndex(item=>item.id===editingId);
      if(index>=0){
        const previousMedicine=state.medicines[index];
        const closeUpdates={endDate:yesterdayIso(),replacedAt:new Date().toISOString()};
        const nextMed={...previousMedicine,...med,startDate:todayIso(),endDate:data.endDate||null,createdAt:new Date().toISOString(),previousMedicineId:editingId};
        delete nextMed.id;
        if(fb&&state.user){
          await fb.updateDoc(fb.doc(fb.db,"users",state.user.uid,"medicines",editingId),{...closeUpdates,replacedAt:fb.serverTimestamp()});
          const ref=await fb.addDoc(fb.collection(fb.db,"users",state.user.uid,"medicines"),{...nextMed,createdAt:fb.serverTimestamp()});
          state.medicines[index]={...previousMedicine,...closeUpdates};
          state.medicines.push({...nextMed,id:ref.id,createdAt:new Date().toISOString()});
        }else{
          state.medicines[index]={...previousMedicine,...closeUpdates};
          const newId=crypto.randomUUID();
          state.medicines.push({...nextMed,id:newId});
          localStorage.setItem("mm_medicines",JSON.stringify(state.medicines));
        }
      }
    }else if(fb&&state.user){const ref=await fb.addDoc(fb.collection(fb.db,"users",state.user.uid,"medicines"),{...med,createdAt:med.updatedAt});med.id=ref.id;state.medicines.push({...med,id:ref.id,createdAt:med.updatedAt})}else{med.id=crypto.randomUUID();med.createdAt=med.updatedAt;state.medicines.push(med);localStorage.setItem("mm_medicines",JSON.stringify(state.medicines))}
    editingScheduleMedicineId=null;
    renderAll();openView("medicines");form.reset();resetScheduleWizard();showCimaValidation("","");$("#reviewPanel").hidden=true;toast(editingId?t("Tratamiento configurado."):t("MedicaciÃ³n confirmada y guardada."));
  }finally{submit.disabled=false}
};
initFirebase();

let deferredInstallPrompt=null;
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/service-worker.js").then(registration=>registration.update?.()).catch(()=>{});
}
function isAndroidWeb(){
  return /Android/i.test(navigator.userAgent)&&!isInstalledAppMode();
}
function setupInstallAppButton(){
  const button=$("#installAppButton");
  if(!button)return;
  const update=()=>{button.hidden=!isAndroidWeb()};
  window.addEventListener("beforeinstallprompt",event=>{
    if(!isAndroidWeb())return;
    event.preventDefault();
    deferredInstallPrompt=event;
    update();
  });
  window.addEventListener("appinstalled",()=>{
    deferredInstallPrompt=null;
    update();
  });
  button.addEventListener("click",async()=>{
    if(!deferredInstallPrompt){
      const message=uiText(
        "Pulsa los tres puntos de Chrome y después pulsa “Abrir Tu Medicación”.",
        "Tap Chrome’s three-dot menu and then tap “Open Your Medication”."
      );
      toast(message);
      window.alert(message);
      return;
    }
    const promptEvent=deferredInstallPrompt;
    deferredInstallPrompt=null;
    update();
    await promptEvent.prompt();
  });
  update();
}
setupInstallAppButton();

setTimeout(()=>{repairVisibleText();forceCriticalSymbols()},250);
