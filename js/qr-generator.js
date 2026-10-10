(()=>{
const root=$('#tool-root');if(!root)return;
if(typeof qrcode==='undefined'){root.replaceChildren(h('p',{class:'error',role:'alert'},'The QR code library could not be loaded. Please refresh the page and try again.'));return;}
qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8']; /* proper Unicode (incl. Nepali) support */
const err=m=>{throw new Error(m)};
const need=(s,m)=>{if(!String(s??'').trim())err(m)};
const esc=s=>String(s??'').replace(/([\\;,:])/g,'\\$1'); /* vCard/Wi-Fi field escaping */
const escN=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n');

const TYPES=[
 ['text','Text'],['url','URL'],['email','Email'],['phone','Phone'],['sms','SMS'],
 ['wifi','Wi-Fi'],['vcard','vCard / Contact'],['image','Image'],
];
const FIELDS={
 text:[{id:'t',label:'Text',type:'textarea',rows:5,placeholder:'Enter text to generate QR code'}],
 url:[{id:'u',label:'URL',placeholder:'https://example.com'}],
 email:[{id:'e',label:'Email Address',placeholder:'name@example.com'},{id:'sub',label:'Subject (optional)'},{id:'msg',label:'Message (optional)',type:'textarea',rows:4}],
 phone:[{id:'p',label:'Phone Number',placeholder:'+977 98XXXXXXXX'}],
 sms:[{id:'p',label:'Phone Number',placeholder:'+977 98XXXXXXXX'},{id:'msg',label:'Message',type:'textarea',rows:4}],
 wifi:[{id:'ssid',label:'Network Name (SSID)'},{id:'pass',label:'Password'},{id:'sec',label:'Security',type:'select',options:[['WPA','WPA/WPA2'],['WEP','WEP'],['nopass','None (open network)']],value:'WPA'}],
 vcard:[{id:'first',label:'First Name'},{id:'last',label:'Last Name'},{id:'org',label:'Organization'},{id:'title',label:'Job Title'},{id:'phone',label:'Phone'},{id:'email',label:'Email'},{id:'site',label:'Website'},{id:'addr',label:'Address'},{id:'city',label:'City'},{id:'country',label:'Country'}],
 image:[{id:'file',label:'Choose an image (auto-optimized for QR when needed)',type:'file',accept:'image/*'},{id:'imgurl',label:'…or an Image URL',placeholder:'https://example.com/photo.jpg'}],
};
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const isURLish=s=>/^[a-z][a-z0-9+.-]*:\/\//i.test(s)||/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(s);
const normURL=s=>/^https?:\/\//i.test(s)?s:'https://'+s;
/* Progressive resize/quality steps for image→data-URL payloads (bounded, no infinite loop). */
const OPT_STEPS=[[256,.65],[192,.55],[160,.5],[128,.45],[96,.4],[72,.35],[64,.3],[48,.25]];

function payloadFor(type,v){
 switch(type){
  case 'text': need(v.t,'Please enter some text.'); return v.t;
  case 'url': { need(v.u,'Please enter a URL.'); const s=v.u.trim(); if(!isURLish(s))err('Please enter a valid URL, for example https://example.com.'); return normURL(s); }
  case 'email': { need(v.e,'Please enter an email address.'); if(!isEmail(v.e.trim()))err('Please enter a valid email address.');
    const q=[]; if(v.sub)q.push('subject='+encodeURIComponent(v.sub)); if(v.msg)q.push('body='+encodeURIComponent(v.msg));
    return 'mailto:'+encodeURIComponent(v.e.trim())+(q.length?'?'+q.join('&'):''); }
  case 'phone': { need(v.p,'Please enter a phone number.'); const d=v.p.trim(); if(!/^\+?[0-9()\-.\s]{5,20}$/.test(d))err('Please enter a valid phone number.'); return 'tel:'+d.replace(/[()\-.\s]/g,''); }
  case 'sms': { need(v.p,'Please enter a phone number.'); const d=v.p.trim(); if(!/^\+?[0-9()\-.\s]{5,20}$/.test(d))err('Please enter a valid phone number.');
    return 'SMSTO:'+d.replace(/[()\-.\s]/g,'')+':'+(v.msg||''); }
  case 'wifi': { need(v.ssid,'Please enter the network name (SSID).'); const sec=v.sec==='nopass'?'nopass':v.sec;
    if(sec!=='nopass')need(v.pass,'Please enter the Wi-Fi password, or choose "None" for an open network.');
    return `WIFI:T:${sec};S:${esc(v.ssid)};P:${sec==='nopass'?'':esc(v.pass)};;`; }
  case 'vcard': { if(!v.first.trim()&&!v.last.trim())err('Please enter at least a first or last name.');
    const L=['BEGIN:VCARD','VERSION:3.0',`N:${escN(v.last)};${escN(v.first)}`,`FN:${escN((v.first+' '+v.last).trim())}`];
    if(v.org)L.push(`ORG:${escN(v.org)}`); if(v.title)L.push(`TITLE:${escN(v.title)}`); if(v.phone)L.push(`TEL:${escN(v.phone)}`);
    if(v.email){if(!isEmail(v.email.trim()))err('Please enter a valid contact email address.');L.push(`EMAIL:${escN(v.email)}`)}
    if(v.site)L.push(`URL:${escN(v.site)}`);
    if(v.addr||v.city||v.country)L.push(`ADR:;;${escN(v.addr)};${escN(v.city)};;;${escN(v.country)}`);
    L.push('END:VCARD'); return L.join('\n'); }
  case 'image': {
   /* File path handled in generate() with optimization + live status. URL mode only here. */
   need(v.imgurl,'Please choose an image file, or enter an Image URL.'); const s=v.imgurl.trim(); if(!isURLish(s))err('Please enter a valid image URL.'); return normURL(s);
  }
 }
}
const readFile=f=>new Promise((res,rej)=>{ if(!f.type.startsWith('image/'))return rej(new Error('Please choose a valid image file.'));
 const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('This image could not be read.'));r.readAsDataURL(f)});
const loadImgFromUrl=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('This image could not be read.'));i.src=src});
/** True if the QR library can encode payload at the given error-correction level. */
const canEncode=(payload,ecl)=>{try{const q=qrcode(0,ecl);q.addData(payload);q.make();return true}catch(e){return false}};
/**
 * Browser-side only: resize (aspect preserved) + JPEG quality steps until the data URL
 * fits in a QR at the chosen ECL. Original file is never modified.
 */
async function optimizeImageForQR(file,ecl,onStatus){
 const origUrl=await readFile(file);
 const origKB=(origUrl.length/1024).toFixed(1);
 if(canEncode(origUrl,ecl)){
  if(onStatus)onStatus(`Image ready (${origKB} KB).`);
  return{payload:origUrl,note:`Original image used (${origKB} KB).`};
 }
 if(onStatus)onStatus('Optimizing image for QR…');
 const img=await loadImgFromUrl(origUrl);
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d');
 let lastKB=origKB,best=null;
 for(let i=0;i<OPT_STEPS.length;i++){
  const[maxDim,q]=OPT_STEPS[i];
  let w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  if(!w||!h)err('This image could not be read.');
  const scale=Math.min(1,maxDim/Math.max(w,h));
  w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
  canvas.width=w;canvas.height=h;
  ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
  ctx.drawImage(img,0,0,w,h);
  let dataUrl;
  try{dataUrl=canvas.toDataURL('image/jpeg',q)}catch(e){continue}
  lastKB=(dataUrl.length/1024).toFixed(1);
  if(onStatus)onStatus(`Optimizing image for QR… (${w}×${h}, ~${lastKB} KB)`);
  if(canEncode(dataUrl,ecl)){
   best=dataUrl;
   if(onStatus)onStatus(`Image optimized: ${origKB} KB → ${lastKB} KB`);
   return{payload:dataUrl,note:`Image optimized: ${origKB} KB → ${lastKB} KB (${w}×${h}).`};
  }
 }
 err('This image is too complex to fit inside a QR code even after optimization. Try a smaller image or use Image URL mode.');
}

function build(){
 const state={type:'text'};
 const typeSel=h('div',{class:'qr-types',role:'radiogroup','aria-label':'QR code type'},TYPES.map(([k,l])=>h('button',{type:'button',class:'chip qr-type'+(k==='text'?' active':''),'aria-pressed':String(k==='text'),onclick:()=>selectType(k)},l)));
 const fieldWrap=h('div',{class:'tool-form'});
 const size=h('select',{id:'qsize'},[128,256,320,512].map(n=>h('option',{value:n,selected:n===256?'':false},n+' px')));
 const ecl=h('select',{id:'qecl'},[['L','L — small, less recovery'],['M','M — balanced (recommended)'],['Q','Q — better recovery'],['H','H — best recovery, denser']].map(([v,l])=>h('option',{value:v,selected:v==='M'?'':false},l)));
 const fg=h('input',{id:'qfg',type:'color',value:'#111827'}),bg=h('input',{id:'qbg',type:'color',value:'#ffffff'});
 const margin=h('input',{id:'qmargin',type:'range',min:'0',max:'8',value:'4'});
 const contrastMsg=h('p',{class:'note',role:'status'});
 const opts=h('div',{class:'tool-form qr-opts'},
  h('div',{class:'field'},h('label',{for:'qsize'},'QR Size'),size),
  h('div',{class:'field'},h('label',{for:'qecl'},'Error Correction'),ecl),
  h('div',{class:'field'},h('label',{for:'qfg'},'Foreground Color'),fg),
  h('div',{class:'field'},h('label',{for:'qbg'},'Background Color'),bg),
  h('div',{class:'field'},h('label',{for:'qmargin'},'Margin / Quiet Zone'),margin),
 );
 const genBtn=h('button',{type:'button',class:'btn'},'Generate QR');
 const resetBtn=h('button',{type:'button',class:'btn secondary'},'Reset');
 const status=h('span',{class:'status',role:'status'});
 const out=h('div',{class:'result qr-result','aria-live':'polite'});
 const left=h('div',{class:'qr-left'},h('h2',{class:'sr-only',style:'position:absolute;left:-9999px'},'QR type and details'),typeSel,fieldWrap,h('h3',{},'Customize'),opts,contrastMsg,h('div',{class:'row'},genBtn,resetBtn,status));
 const right=h('div',{class:'qr-right'},out);
 root.replaceChildren(h('div',{class:'qr-grid'},left,right));

 const contrastRatio=(a,b)=>{const L=c=>{const[r,g,bl]=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*bl};
  const l1=L(a)+.05,l2=L(b)+.05;return l1>l2?l1/l2:l2/l1};
 const checkContrast=()=>{const c=contrastRatio(fg.value.slice(1),bg.value.slice(1));
  contrastMsg.textContent=c<3?'Warning: these colors are too close in contrast and this QR code may not scan reliably.':''};
 [fg,bg].forEach(i=>i.addEventListener('input',checkContrast));

 let els={},lastPayload='',lastURL=null;
 function selectType(k){state.type=k;$$('.qr-type',typeSel).forEach(b=>{const on=b.textContent===TYPES.find(t=>t[0]===k)[1];b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  els={};fieldWrap.replaceChildren();
  FIELDS[k].forEach(f=>{let i;
   if(f.type==='select')i=h('select',{id:'qr-'+f.id},f.options.map(([v,l])=>h('option',{value:v,selected:v===f.value?'':false},l)));
   else if(f.type==='textarea')i=h('textarea',{id:'qr-'+f.id,rows:f.rows||4,placeholder:f.placeholder||''});
   else i=h('input',{id:'qr-'+f.id,type:f.type||'text',placeholder:f.placeholder||'',accept:f.accept});
   els[f.id]=i;fieldWrap.append(h('div',{class:'field'},h('label',{for:'qr-'+f.id},f.label),i));
   if(f.type==='file'){const pv=h('img',{class:'preview',alt:'Selected image preview',hidden:'',style:'max-height:140px'});
    i.addEventListener('change',()=>{const file=i.files[0];if(pv.src)URL.revokeObjectURL(pv.src);if(!file){pv.hidden=true;return}pv.src=URL.createObjectURL(file);pv.hidden=false});
    fieldWrap.append(pv);}
  });
  clear();
 }
 function val(k){const f=FIELDS[k];const v={};f.forEach(x=>{const i=els[x.id];v[x.id]=x.type==='file'?(i.files[0]||null):i.value});return v}
 function clear(){out.replaceChildren(h('p',{class:'muted'},'Fill in the details and press "Generate QR" to see your code here.'));lastPayload='';if(lastURL){URL.revokeObjectURL(lastURL);lastURL=null}status.textContent=''}
 async function generate(){
  status.textContent='';let payload,optNote='';
  try{
   if(state.type==='image'){
    const v=val('image');
    if(v.file){
     const r=await optimizeImageForQR(v.file,ecl.value,msg=>{status.textContent=msg});
     payload=r.payload;optNote=r.note||'';
    }else{
     payload=payloadFor('image',v);
    }
   }else{
    payload=await payloadFor(state.type,val(state.type));
    if(payload&&payload.then)payload=await payload;
   }
   if(typeof payload!=='string'||!payload)err('Please fill in the required details.');
  }catch(e){ status.textContent='';out.replaceChildren(h('p',{class:'error',role:'alert'},e.message||'Please check your input.')); return; }
  let qr;
  try{ qr=qrcode(0,ecl.value); qr.addData(payload); qr.make(); }
  catch(e){ status.textContent='';out.replaceChildren(h('p',{class:'error',role:'alert'},'This content is too long to fit in a QR code. Please shorten it.')); return; }
  const n=qr.getModuleCount(),m=+margin.value,px=+size.value,cell=Math.max(1,Math.floor(px/(n+m*2))),W=cell*(n+m*2);
  const cv=document.createElement('canvas');cv.width=W;cv.height=W;const ctx=cv.getContext('2d');
  ctx.fillStyle=bg.value;ctx.fillRect(0,0,W,W);ctx.fillStyle=fg.value;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect((c+m)*cell,(r+m)*cell,cell,cell);
  const dataUrl=cv.toDataURL('image/png');lastPayload=payload;if(lastURL)URL.revokeObjectURL(lastURL);
  const typeLabel=TYPES.find(t=>t[0]===state.type)[1];
  status.textContent=optNote?'QR code generated successfully.':'';
  try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('qr-generate')}catch(e){}
  out.replaceChildren(
   h('div',{class:'qr-card'},
    h('img',{src:dataUrl,width:W,height:W,alt:`Generated QR code (${typeLabel})`,class:'qr-img'}),
    h('p',{},h('strong',{},'Type: '),typeLabel),
    optNote?h('p',{class:'note'},optNote):null,
    h('div',{class:'row'},
     h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('qr-download')}catch(e){}const a=h('a',{href:dataUrl,download:'toolboxy-qr-code.png'});document.body.append(a);a.click();a.remove()}},'Download PNG'),
     h('button',{type:'button',class:'btn secondary',onclick:svgDownload(qr,n,m,px,fg.value,bg.value)},'Download SVG'),
     h('button',{type:'button',class:'btn secondary',onclick:async e=>{const ok=await copyText(lastPayload);e.target.closest('.row').querySelector('.qr-copy-status').textContent=ok?'Copied!':'Copy failed.';setTimeout(()=>e.target.closest('.row').querySelector('.qr-copy-status').textContent='',2200)}},'Copy Payload'),
     h('span',{class:'status qr-copy-status',role:'status'}),
    )));
 }
 function svgDownload(qr,n,m,px,f,b){return()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('qr-download')}catch(e){}const cell=px/(n+m*2);let rects='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))rects+=`<rect x="${(c+m)*cell}" y="${(r+m)*cell}" width="${cell}" height="${cell}"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}"><rect width="${px}" height="${px}" fill="${b}"/><g fill="${f}">${rects}</g></svg>`;
  const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=h('a',{href:u,download:'toolboxy-qr-code.svg'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)};}
 genBtn.addEventListener('click',generate);
 resetBtn.addEventListener('click',()=>{selectType('text');fg.value='#111827';bg.value='#ffffff';size.value='256';ecl.value='M';margin.value='4';checkContrast();clear()});
 selectType('text');checkContrast();
}
build();
})();
