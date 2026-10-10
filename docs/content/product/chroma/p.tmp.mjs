import { readFileSync, rmSync } from 'node:fs';
const API='http://localhost:3007';
const env=Object.fromEntries(readFileSync('C:/ZEN/mitsutama-compro/apps/api/.env','utf8').split(/\r?\n/).map(l=>l.match(/^(\w+)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^"|"$/g,'')]));
let login;
for (let i=0;i<12;i++){ await new Promise(r=>setTimeout(r,120000)); login=await fetch(API+'/admin/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:env.ADMIN_PASSWORD})}); console.log(new Date().toISOString(),'login',login.status); if(login.ok)break; }
if(!login?.ok){console.log('gave up');process.exit(1)}
const h={cookie:login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),'content-type':'application/json'};
console.log('import',(await fetch(API+'/admin/pages/import',{method:'POST',headers:h,body:readFileSync('pages/regenerative-battery-cell-test-system-17011.json','utf8')})).status);
const p=(await (await fetch(API+'/admin/pages',{headers:h})).json()).find(x=>x.slug==='regenerative-battery-cell-test-system-17011');
console.log('publish',(await fetch(`${API}/admin/pages/${p.id}/publish`,{method:'POST',headers:h})).status);
const d=await (await fetch(API+'/pages/products/regenerative-battery-cell-test-system-17011')).json();
console.log('live:',d.data.content.filter(b=>b.type==='SpecTable'&&b.props.title==='Regeneration').map(b=>b.props.rows.map(r=>r.value)));
rmSync('p.tmp.mjs');
