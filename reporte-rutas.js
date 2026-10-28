import {getAuth} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,getDocs,doc,getDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const button=document.createElement('button');button.className='light';button.textContent='📊 Exportar avance de rutas';document.querySelector('.actions').append(button);
function cell(value){let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
button.onclick=async()=>{button.disabled=true;try{
  if(!getAuth().currentUser)throw new Error('Sesión no disponible');
  const db=getFirestore(),snap=await getDocs(collection(db,'trabajadores'));
  const records=await Promise.all(snap.docs.map(async d=>{const w=d.data();if(!w.codigoRuta)return {w,route:null};try{const r=await getDoc(doc(db,'rutas',w.codigoRuta));if(!r.exists())throw new Error('Ruta no encontrada');return {w,route:r.data()}}catch(error){return {w,error:true}}}));
  const rows=[['Trabajador','Área','Cargo','Jefe','Competencias','Actividades revisadas','Avance','Estado']];
  for(const {w,route,error} of records){let total=Array.isArray(route?.misiones)?route.misiones.length:0,done=Array.isArray(route?.completadas)?new Set(route.completadas.filter(x=>Number.isInteger(x)&&x>=0&&x<total)).size:0;let state=error?'No se pudo consultar':!w.codigoRuta?'Sin enlace':!route?'Ruta no disponible':done===total&&total>0?'Actividades revisadas':'En progreso';rows.push([w.nombre,w.area,w.cargo,w.jefe,total||((w.competencias||[]).length),done,total?Math.round(done*100/total)+'%':'',state])}
  const text='\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='avance-rutas.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}catch(e){alert('No se pudo exportar el avance. Verifica tu sesión, permisos y conexión.')}finally{button.disabled=false}};
