import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,onSnapshot} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const el=id=>document.getElementById(id); let unsubscribe=null,items=[],ready=false;
el('signin').onclick=async()=>{el('error').textContent='';try{await signInWithEmailAndPassword(auth,el('email').value.trim(),el('password').value);el('password').value=''}catch(e){el('error').textContent='No fue posible ingresar. Revisa el correo y la contraseña.'}};
el('exit').onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{if(unsubscribe){unsubscribe();unsubscribe=null} ready=false;el('dashboard').hidden=true;el('exit').hidden=true;el('login').hidden=false;if(!user)return;try{const a=await getDoc(doc(db,'admins',user.uid));if(!a.exists()){await signOut(auth);el('error').textContent='Tu cuenta no está autorizada como administradora.';return}el('login').hidden=true;el('dashboard').hidden=false;el('exit').hidden=false;watch()}catch(e){await signOut(auth);el('error').textContent='No se pudo verificar el acceso. Revisa las reglas de Firestore y la conexión.'}});
function watch(){if(unsubscribe)unsubscribe();ready=false;el('status').textContent='Cargando…';unsubscribe=onSnapshot(doc(db,'catalogos',el('kind').value),snap=>{items=snap.exists()&&Array.isArray(snap.data().opciones)?snap.data().opciones:[];ready=true;el('status').textContent='';render()},()=>{ready=false;el('status').textContent='No se pudo cargar el catálogo.'})}
el('kind').onchange=watch;
function render(){const list=el('items');list.replaceChildren();items.forEach((v,i)=>{let li=document.createElement('li'),span=document.createElement('span'),edit=document.createElement('button'),del=document.createElement('button');span.textContent=v;edit.textContent='Editar';del.textContent='Eliminar';edit.onclick=()=>{let x=prompt('Nuevo nombre:',v);if(x&&x.trim()){let a=[...items];a[i]=x.trim();save(a)}};del.onclick=()=>{if(confirm('¿Eliminar '+v+'?'))save(items.filter((_,j)=>j!==i))};li.append(span,edit,del);list.append(li)})}
async function save(values){if(!ready)return;try{await setDoc(doc(db,'catalogos',el('kind').value),{opciones:values});el('status').textContent='Guardado.'}catch(e){el('status').textContent='No se pudo guardar el cambio.'}}
el('add').onclick=()=>{let v=el('newitem').value.trim();if(!v||items.includes(v))return;save([...items,v]);el('newitem').value=''};
