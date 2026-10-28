import {getAuth} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,getDocs} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const actions=document.querySelector('.actions');
const button=document.createElement('button');
button.className='light';button.textContent='📥 Exportar trabajadores';
actions.append(button);
function cell(value){let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
button.onclick=async()=>{button.disabled=true;try{
  if(!getAuth().currentUser)throw new Error('Inicia sesión para exportar.');
  const snap=await getDocs(collection(getFirestore(),'trabajadores'));
  const rows=[['Nombre','Correo','Área','Cargo','Jefe','Fecha de retroalimentación','Competencias asignadas']];
  snap.forEach(d=>{const w=d.data();rows.push([w.nombre,w.correo,w.area,w.cargo,w.jefe,w.fechaRetro,(Array.isArray(w.competencias)?w.competencias:[]).map(c=>c.competencias||'').filter(Boolean).join('; ')])});
  const data='\ufeff'+rows.map(row=>row.map(cell).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));let a=document.createElement('a');a.href=url;a.download='trabajadores-ruta-talento.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}catch(e){alert('No fue posible exportar los trabajadores. Verifica tu sesión y conexión.')}finally{button.disabled=false}};
