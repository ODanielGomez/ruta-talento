import {getFirestore,doc,getDoc,setDoc,updateDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

export async function gestionarRuta(worker){
  const db=getFirestore(),ref=doc(db,'trabajadores',worker.id),fresh=await getDoc(ref);
  if(!fresh.exists())throw new Error('La ficha ya no existe.');
  const data=fresh.data();let token=data.codigoRuta;
  if(!Array.isArray(data.competencias)||!data.competencias.length)throw new Error('Agrega competencias antes de crear el enlace.');
  const misiones=data.competencias.map(c=>({competencia:c.competencias||'',reto:c.retos||'',video:c.video||'',compromiso:c.compromiso||'',evidencia:c.evidencia||'',seguimiento:c.plazos||'',preguntas:c.preguntas||''}));
  if(!token){
    token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
    await setDoc(doc(db,'rutas',token),{nombre:data.nombre||'',misiones,completadas:[],activo:true,actualizado:serverTimestamp()});
    await updateDoc(ref,{codigoRuta:token});
  }else{
    const rutaRef=doc(db,'rutas',token),snapshot=await getDoc(rutaRef);
    if(!snapshot.exists())throw new Error('La ruta guardada no existe; no se ha modificado el avance.');
    const old=snapshot.data(),previous=Array.isArray(old.misiones)?old.misiones:[];
    const existingUnchanged=previous.length<=misiones.length&&previous.every((m,i)=>m.competencia===misiones[i].competencia);
    if(!existingUnchanged)throw new Error('Las competencias existentes cambiaron de orden, se quitaron o se renombraron. No actualizamos la ruta para proteger el avance; agregar al final sí está permitido.');
    await updateDoc(rutaRef,{nombre:data.nombre||'',misiones,actualizado:serverTimestamp()});
  }
  let url=new URL('ruta.html',location.href);url.searchParams.set('r',token);return url.href;
}
