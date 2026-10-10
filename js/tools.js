(()=>{
const root=$('#tool-root');if(!root)return;
const err=m=>{throw new Error(m)};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const fin=n=>{if(!Number.isFinite(n)||Math.abs(n)>1e21)err('The result is too large to display. Please use smaller values.');return n};
const N=(v,name='value',min=-Infinity,max=Infinity)=>{const s=String(v??'').trim();if(s==='')err('Please enter a value.');const n=Number(s);if(!Number.isFinite(n))err('Please enter a valid number.');if(n<min||n>max)err(`${cap(name)} must be ${max<Infinity&&min>-Infinity?`between ${min} and ${max}`:min>-Infinity?`at least ${min}`:`at most ${max}`}.`);return n};
const P=(v,name='value')=>{const n=N(v,name);if(n<=0)err(`${cap(name)} must be greater than zero.`);return n};
const need=s=>{if(!String(s??'').trim())err('Please enter a value.')};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const D=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');if(!m)err('Please enter valid dates.');const d=new Date(+m[1],m[2]-1,+m[3]);if(d.getMonth()!==m[2]-1)err('Please enter valid dates.');return d};
const ymd=(a,b)=>{let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){y--;m+=12}return{y,m,d}};
const dd=(a,b)=>Math.round((b-a)/864e5);
const cur=n=>'Rs. '+fin(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const sm=n=>{fin(n);const a=Math.abs(n);if(a===0)return'0';if(a>=1e6)return n.toLocaleString('en-US',{maximumFractionDigits:2});if(a<1e-6)return n.toExponential(4);return Number(n.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:10})};
const num=(id,label,o={})=>({id,label,type:'number',step:'any',inputmode:'decimal',...o});
const TA=(o={})=>({id:'text',label:'Your text',type:'textarea',placeholder:'Paste or type text...',...o});
const sel=(id,label,opts,value)=>({id,label,type:'select',options:opts,value});

/* ---------- form framework: input → action → formatted result ---------- */
function build(fields,run,o={}){
  const form=h('form',{class:'tool-form',novalidate:''}),els={},resets=[];
  const out=h('div',{class:'result','aria-live':'polite'});
  let last='',url=null,seq=0,ran=false;
  const empty=()=>{out.replaceChildren(h('p',{class:'muted'},o.live?'Your result will appear here.':`Enter your details and use ${o.actions?'one of the buttons':`“${o.action||'Calculate'}”`} to see the result.`))};
  fields.forEach(f=>{
    let i;
    if(f.type==='select')i=h('select',{id:f.id},f.options.map(([v,l])=>h('option',{value:v},l)));
    else if(f.type==='textarea')i=h('textarea',{id:f.id,rows:f.rows||8,placeholder:f.placeholder||'',spellcheck:'false'});
    else i=h('input',{id:f.id,type:f.type||'text',placeholder:f.placeholder,step:f.step,min:f.min,max:f.max,accept:f.accept,inputmode:f.inputmode});
    els[f.id]=i;
    const wrap=h('div',{class:'field'+(f.type==='checkbox'?' check':'')},f.type==='checkbox'?[i,h('label',{for:f.id},f.label)]:[h('label',{for:f.id},f.label),i]);
    if(f.type==='file'){
      const info=h('p',{class:'note',role:'status'}),pv=h('img',{class:'preview',alt:'Selected image preview',hidden:''});
      const sh=()=>{const fl=i.files[0];if(pv.src)URL.revokeObjectURL(pv.src);pv.removeAttribute('src');pv.hidden=!fl;info.textContent='';if(!fl)return;pv.src=URL.createObjectURL(fl);info.textContent=`${fl.name} · ${fl.type||'unknown type'} · ${(fl.size/1024).toFixed(1)} KB`;pv.onload=()=>{info.textContent+=` · ${pv.naturalWidth} × ${pv.naturalHeight} px`}};
      i.addEventListener('change',sh);wrap.classList.add('drop');
      ['dragenter','dragover'].forEach(ev=>wrap.addEventListener(ev,e=>{e.preventDefault();wrap.classList.add('over')}));
      wrap.addEventListener('dragleave',()=>wrap.classList.remove('over'));
      wrap.addEventListener('drop',e=>{e.preventDefault();wrap.classList.remove('over');if(e.dataTransfer&&e.dataTransfer.files.length){i.files=e.dataTransfer.files;sh()}});
      wrap.append(h('p',{class:'note'},'…or drag and drop an image onto this box.'),pv,info);resets.push(sh);
    }
    form.append(wrap);
  });
  const val=f=>{const i=els[f.id];return f.type==='file'?i.files[0]:f.type==='checkbox'?i.checked:(f.type==='number'&&i.validity&&i.validity.badInput)?'invalid':i.value};
  const setDefaults=()=>{fields.forEach(f=>{const i=els[f.id];if(f.type==='checkbox')i.checked=!!f.value;else if(f.type==='file')i.value='';else i.value=f.value??''});resets.forEach(r=>r())};
  const status=h('span',{class:'status',role:'status'});
  const copyB=h('button',{type:'button',class:'btn secondary',hidden:'',onclick:async()=>{status.textContent=(await copyText(last))?'Copied!':'Copy failed. Please select the text and copy it manually.';setTimeout(()=>status.textContent='',2500)}},o.ta?'Copy':'Copy Result');
  const dlB=o.download?h('button',{type:'button',class:'btn secondary',hidden:'',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('converter-download')}catch(e){}const u=URL.createObjectURL(new Blob([last],{type:'text/plain'}));const a=h('a',{href:u,download:o.download});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}},'Download'):null;
  const show=async m=>{
    ran=true;const v={};fields.forEach(f=>v[f.id]=val(f));if(m)v.m=m;const my=++seq;let r,ex=null;
    try{r=await run(v)}catch(e){ex=e}
    if(my!==seq)return;out.replaceChildren();if(url){URL.revokeObjectURL(url);url=null}
    try{
      if(ex)throw ex;last='';
      if(r==null){empty()}else{
        const x=typeof r==='string'?{text:r}:r;
        if(x.cards){out.append(h('div',{class:'cards'},x.cards.map(([l,c,big])=>h('div',{class:'stat'+(big?' big':'')},h('span',{class:'stat-l'},l),h('strong',{},c)))));last=x.cards.map(([l,c])=>`${l}: ${c}`).join('\n')}
        if(x.table)out.append(h('div',{class:'tbl'},h('table',{},h('caption',{},x.table.title||''),h('thead',{},h('tr',{},x.table.head.map(c=>h('th',{scope:'col'},c)))),h('tbody',{},x.table.rows.map(rw=>h('tr',{},rw.map(c=>h('td',{},c))))))));
        if(x.text!=null){last=x.text;out.append(o.ta?h('textarea',{class:'code',readonly:'',rows:9,'aria-label':'Result'},x.text):h('pre',{class:'output'},x.text))}
        if(x.blob){url=URL.createObjectURL(x.blob);out.append(h('img',{class:'preview',src:url,alt:'Processed image preview'}),h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('image-download')}catch(e){}const a=h('a',{href:url,download:x.name});document.body.append(a);a.click();a.remove()}},'Download'))}
      }
    }catch(e){last='';out.append(h('p',{class:'error',role:'alert'},e.message||'Something went wrong. Please check your input.'))}
    copyB.hidden=!last;if(dlB)dlB.hidden=!last;
  };
  const again=()=>{if(ran)show()};
  form.addEventListener('submit',e=>{e.preventDefault();show()});
  const auto=()=>{if(o.live||(o.liveAfter&&ran))show()};
  form.addEventListener('input',auto);form.addEventListener('change',auto);
  const btns=h('div',{class:'row'});
  if(o.actions)o.actions.forEach(([l,m])=>btns.append(h('button',{type:'button',class:'btn',onclick:()=>show(m)},l)));
  else if(!o.live)btns.append(h('button',{type:'submit',class:'btn'},o.action||'Calculate'));
  (o.extra||[]).forEach(([l,fn])=>btns.append(h('button',{type:'button',class:'btn secondary',onclick:()=>fn(els,again)},l)));
  btns.append(h('button',{type:'button',class:'btn secondary',onclick:()=>{seq++;setDefaults();ran=false;last='';copyB.hidden=true;if(dlB)dlB.hidden=true;empty()}},o.reset||'Reset'),copyB);
  if(dlB)btns.append(dlB);btns.append(status);form.append(btns);
  root.replaceChildren(...(o.note?[h('p',{class:'note'},o.note)]:[]),form,out);setDefaults();empty();
}
const live={live:true};

/* ---------- image helpers ---------- */
const loadImg=f=>new Promise((res,rej)=>{if(!f)return rej(new Error('Please choose an image file first.'));if(!f.type.startsWith('image/'))return rej(new Error('Please choose a valid image file (JPG, PNG, WebP or similar).'));
  const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);res(i)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('This image could not be read. Please try another file.'))};i.src=u});
const toBlob=(c,t,q)=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Your browser could not create this image format.')),t,q));
const EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
const cvs=(w,hh,type)=>{if(!Number.isInteger(w)||!Number.isInteger(hh)||w<1||hh<1||w>8000||hh>8000)err('Width and height must be whole numbers between 1 and 8000 pixels.');const c=document.createElement('canvas');c.width=w;c.height=hh;const x=c.getContext('2d');if(type==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,w,hh)}return[c,x]};
const done=async(c,type,q,f,tag,extra='')=>{const b=await toBlob(c,type,q);return{text:`${c.width} × ${c.height} px · ${(b.size/1024).toFixed(1)} KB${extra}`,blob:b,name:`${f.name.replace(/\.[^.]+$/,'')}-${tag}.${EXT[type]}`}};
const fmtOpts=[['image/png','PNG'],['image/jpeg','JPG'],['image/webp','WebP']];
const FILE={id:'file',label:'Choose an image',type:'file',accept:'image/*'};
const imgNote='Your image is processed locally in your browser and is never uploaded to a server.';
const img=(fields,fn,action='Process image')=>build([FILE,...fields],async v=>{const i=await loadImg(v.file);return fn(v,i)},{action,note:imgNote});

/* ---------- text helpers ---------- */
const words=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
const b64e=s=>{const b=new TextEncoder().encode(s);let t='';for(let i=0;i<b.length;i+=8192)t+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(t)};
const b64d=s=>{const t=atob(s.replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/'));return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(t,c=>c.charCodeAt(0)))};
const fmtHTML=s=>{const t=s.replace(/>\s+</g,'><').trim().split(/(<[^>]+>)/).filter(x=>x.trim()!=='');let d=0;const V=/^<(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr|!)/i,o=[];
  for(const x of t){const p='  '.repeat(d);if(/^<\//.test(x)){d=Math.max(0,d-1);o.push('  '.repeat(d)+x)}else if(/^<[a-z]/i.test(x)&&!/\/>$/.test(x)&&!V.test(x)){o.push(p+x);d++}else o.push(p+x.trim())}return o.join('\n')};
const fmtCSS=s=>{let o='',d=0,p=0,q=null;const I=()=>'  '.repeat(d);s=s.replace(/\s+/g,' ').trim();
  for(let i=0;i<s.length;i++){const c=s[i];
    if(q){o+=c;if(c===q&&s[i-1]!=='\\')q=null;continue}
    if(c==='"'||c==="'"){q=c;o+=c;continue}
    if(c===' '&&/\n\s*$/.test(o))continue;
    if(c==='(')p++;if(c===')')p--;
    if(c==='{'&&!p){o=o.trimEnd()+' {\n';d++;o+=I()}
    else if(c==='}'&&!p){d=Math.max(0,d-1);o=o.trimEnd()+'\n'+I()+'}\n'+I()}
    else if(c===';'&&!p)o+=';\n'+I();
    else o+=c}
  return o.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()+'\n'};

/* ---------- JavaScript formatter (re-indents; never executes code) ---------- */
const fmtJS=s=>{let o='',d=0,p=0,i=0;const n=s.length,I=()=>'  '.repeat(d),nl=()=>{o=o.trimEnd()+'\n'+I()};
  while(i<n){const c=s[i],c2=s[i+1];
    if(c==='/'&&c2==='/'){const e=s.indexOf('\n',i),t=s.slice(i,e<0?n:e);o+=t;i=e<0?n:e;nl();continue}
    if(c==='/'&&c2==='*'){const e=s.indexOf('*/',i+2),t=s.slice(i,e<0?n:e+2);o+=t;i=e<0?n:e+2;nl();continue}
    if(c==='"'||c==="'"||c==='`'){let j=i+1;while(j<n&&s[j]!==c){if(s[j]==='\\')j++;j++}o+=s.slice(i,j+1);i=j+1;continue}
    if(/\s/.test(c)){if(!/\s$/.test(o))o+=' ';i++;continue}
    if(c==='(')p++;if(c===')')p--;
    if(c==='{'){o=o.trimEnd()+' {';d++;nl();i++;continue}
    if(c==='}'){d=Math.max(0,d-1);nl();o+='}';i++;const r=s.slice(i);if(/^\s*(else|catch|finally)\b/.test(r))o+=' ';else{const m=/^\s*(\S)/.exec(r);if(m&&!/[,;).\]]/.test(m[1]))nl()}continue}
    if(c===';'&&p<=0){o+=';';nl();i++;continue}
    o+=c;i++}
  return o.replace(/[ \t]+\n/g,'\n').replace(/\n\s*\n\s*\n/g,'\n\n').trim()+'\n'};

/* ---------- code editor tool with sandboxed preview ---------- */
const HOOK="<script>(function(){function s(t,a){try{parent.postMessage({tb:1,t:t,m:a.map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')},'*')}catch(e){}}['log','info','warn','error'].forEach(function(k){console[k]=function(){s(k,[].slice.call(arguments))}});window.addEventListener('error',function(e){s('error',[e.message])})})();<\/script>";
function codeTool({inputs,fmtId,format,action='Format',extras=[],preview,file='output.txt'}){
  const els={},box=h('div',{class:'code-box'});
  inputs.forEach(f=>{const t=h('textarea',{id:f.id,class:'code',rows:f.rows||8,spellcheck:'false',autocomplete:'off',placeholder:f.placeholder||''});els[f.id]=t;box.append(h('div',{class:'field'},h('label',{for:f.id},f.label),t))});
  const outT=h('textarea',{id:'code-output',class:'code',rows:10,readonly:'',placeholder:'Output appears here after you press '+action+'.'});
  const msg=h('div',{'aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const flash=t=>{st.textContent=t;setTimeout(()=>st.textContent='',2500)};
  const act=fn=>()=>{msg.replaceChildren();try{const s=els[fmtId].value;need(s);outT.value=fn(s)}catch(e){outT.value='';msg.replaceChildren(h('p',{class:'error',role:'alert'},e.message||'Something went wrong.'))}};
  const bar=h('div',{class:'row'},h('button',{type:'button',class:'btn',onclick:act(format)},action),extras.map(([l,fn])=>h('button',{type:'button',class:'btn secondary',onclick:act(fn)},l)));
  let clearPv=()=>{};
  bar.append(h('button',{type:'button',class:'btn secondary',onclick:()=>{Object.values(els).forEach(t=>t.value='');outT.value='';msg.replaceChildren();clearPv()}},'Clear'),
    h('button',{type:'button',class:'btn secondary',onclick:async()=>{if(!outT.value)return flash('Nothing to copy yet.');flash((await copyText(outT.value))?'Copied!':'Copy failed.')}},'Copy Code'),
    h('button',{type:'button',class:'btn secondary',onclick:()=>{if(!outT.value)return flash('Nothing to download yet.');try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('converter-download')}catch(e){}const u=URL.createObjectURL(new Blob([outT.value],{type:'text/plain'})),a=h('a',{href:u,download:file});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}},'Download'),st);
  const codePane=h('div',{},box,bar,msg,h('div',{class:'field'},h('label',{for:'code-output'},'OUTPUT'),outT));
  if(!preview){root.replaceChildren(codePane);return}
  /* sandboxed preview: user code runs ONLY inside this iframe (opaque origin, no allow-same-origin) and only after Run Preview */
  const frame=h('iframe',{class:'pv-frame',title:'Sandboxed preview',sandbox:'allow-scripts',referrerpolicy:'no-referrer'});
  const handle=h('div',{class:'pv-handle',role:'slider',tabindex:'0','aria-label':'Resize preview width (drag, or use left and right arrow keys)','aria-valuemin':'240','aria-valuemax':'2400','aria-valuenow':'0','aria-orientation':'horizontal'});
  const vp=h('div',{class:'pv-vp'},frame,handle),stage=h('div',{class:'pv-stage'},vp),info=h('p',{class:'pv-info',role:'status'});
  const con=h('pre',{class:'output console',id:'console-out',tabindex:'0','aria-label':'Console output'}),pmsg=h('div',{'aria-live':'polite'});
  let mode='responsive',dev=[];
  const upd=()=>{const w=Math.round(vp.getBoundingClientRect().width);info.textContent=`Preview: ${mode[0].toUpperCase()+mode.slice(1)} · Width: ${mode==='responsive'?`100% (${w}px)`:`${w}px`}`;handle.setAttribute('aria-valuenow',String(w))};
  const setMode=(m,px)=>{mode=m;vp.style.width=px?px+'px':'100%';dev.forEach(([b,k])=>b.setAttribute('aria-pressed',String(k===m)));upd()};
  dev=[['Responsive','responsive',0],['Mobile','mobile',390],['Tablet','tablet',768],['Desktop','desktop',1280]].map(([l,k,px])=>[h('button',{type:'button',class:'btn secondary','aria-pressed':String(k==='responsive'),onclick:()=>setMode(k,px)},l),k]);
  if('ResizeObserver'in window)new ResizeObserver(upd).observe(vp);
  const resizeTo=w=>setMode('custom',Math.max(240,Math.min(2400,Math.round(w))));
  handle.addEventListener('pointerdown',e=>{e.preventDefault();const x0=e.clientX,w0=vp.getBoundingClientRect().width;handle.setPointerCapture(e.pointerId);frame.classList.add('dragging');
    const mv=ev=>resizeTo(w0+(ev.clientX-x0)),up=()=>{frame.classList.remove('dragging');handle.removeEventListener('pointermove',mv);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up)};
    handle.addEventListener('pointermove',mv);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up)});
  handle.addEventListener('keydown',e=>{const w=vp.getBoundingClientRect().width;if(e.key==='ArrowRight'){e.preventDefault();resizeTo(w+16)}if(e.key==='ArrowLeft'){e.preventDefault();resizeTo(w-16)}});
  const CSP=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; script-src 'unsafe-inline'; form-action 'none'">`;
  const g=id=>els[id]?els[id].value:'';
  const run=()=>{pmsg.replaceChildren();con.textContent='';
    if(!(g('html')+g('css')+g('js')).trim()){pmsg.append(h('p',{class:'error',role:'alert'},'Please enter some code to preview.'));return}
    const css=g('css'),js=g('js');
    frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${CSP}<style>body{font-family:system-ui,sans-serif;margin:12px}</style>${css?`<style>${css.replace(/<\/style/gi,'<\\/style')}</style>`:''}</head><body>${g('html')}${js?HOOK+'<script>'+js.replace(/<\/script/gi,'<\\/script')+'<\/script>':''}</body></html>`;upd()};
  window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||!e.data||e.data.tb!==1||con.textContent.length>20000)return;con.textContent+=`[${String(e.data.t).slice(0,8)}] ${String(e.data.m).slice(0,2000)}\n`});
  clearPv=()=>{frame.srcdoc='';con.textContent='';pmsg.replaceChildren()};
  const pbox=h('div',{class:'pv-box'}),fsB=h('button',{type:'button',class:'btn secondary'},'Full Screen');
  let fake=false;const isFs=()=>document.fullscreenElement===pbox||fake;
  const sync=()=>{fsB.textContent=isFs()?'Exit Full Screen':'Full Screen';pbox.classList.toggle('pv-fs',isFs());upd()};
  const exitFs=()=>{fake=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});sync()};
  fsB.onclick=async()=>{if(isFs())return exitFs();try{if(pbox.requestFullscreen){await pbox.requestFullscreen()}else{fake=true}}catch(e){fake=true}sync()};
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)fake=false;sync()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fake)exitFs()});
  const tools=h('div',{class:'row pv-tools',role:'group','aria-label':'Preview controls'},h('button',{type:'button',class:'btn',onclick:run},'Run Preview'),dev.map(x=>x[0]),h('button',{type:'button',class:'btn secondary',onclick:()=>{if(frame.srcdoc)run();else pmsg.replaceChildren(h('p',{class:'error',role:'alert'},'Press Run Preview first.'))}},'Refresh Preview'),fsB,h('button',{type:'button',class:'btn secondary',onclick:clearPv},'Reset Preview'));
  pbox.append(tools,pmsg,info,stage,h('label',{for:'console-out'},'Console'),con);
  const pvPane=h('div',{hidden:''},h('p',{class:'note'},'The preview runs in an isolated sandboxed frame and cannot access ToolBoxy. Nothing runs until you press Run Preview.'),pbox);
  const tb=[['Code',codePane],['Preview',pvPane]].map(([l,p])=>{const b=h('button',{type:'button',class:'btn','aria-pressed':l==='Code'?'true':'false'},l);b.onclick=()=>{tb.forEach(x=>{x[0].setAttribute('aria-pressed',String(x[0]===b));x[1].hidden=x[1]!==p});upd()};return[b,p]});
  root.replaceChildren(h('div',{class:'tabs',role:'group','aria-label':'Code or preview'},tb.map(x=>x[0])),codePane,pvPane);
}
const jp=s=>{try{return JSON.parse(s)}catch(e){err(`Invalid JSON: ${e.message}`)}};

/* ---------- converters ---------- */
const sm2=n=>sm(n);
const conv=(list,a,b,note)=>{const M=Object.fromEntries(list.map(x=>[x[0],x])),o=list.map(x=>[x[0],`${x[2]} (${x[3]})`]);
  build([sel('f','Convert From',o,a),num('v','Value',{placeholder:'e.g. 100'}),sel('t','Convert To',o,b)],v=>{const x=N(v.v),F=M[v.f],U=M[v.t],r=fin(x*F[1]/U[1]);
    return{cards:[['Result',`${sm(x)} ${F[3]} = ${sm(r)} ${U[3]}`,1],['Conversion rate',`1 ${F[3]} = ${sm(F[1]/U[1])} ${U[3]}`]]}},
    {action:'Convert',liveAfter:1,note,extra:[['Swap Units',(els,again)=>{[els.f.value,els.t.value]=[els.t.value,els.f.value];again()}]]})};
const LEN=[['mm',.001,'Millimeter','mm'],['cm',.01,'Centimeter','cm'],['m',1,'Meter','m'],['km',1000,'Kilometer','km'],['in',.0254,'Inch','in'],['ft',.3048,'Foot','ft'],['yd',.9144,'Yard','yd'],['mi',1609.344,'Mile','mi']];
const WGT=[['mg',1e-6,'Milligram','mg'],['g',.001,'Gram','g'],['kg',1,'Kilogram','kg'],['t',1000,'Metric Ton','t'],['oz',.028349523125,'Ounce','oz'],['lb',.45359237,'Pound','lb'],['st',6.35029318,'Stone','st']];
const ARE=[['m2',1,'Square Meter','m²'],['km2',1e6,'Square Kilometer','km²'],['cm2',1e-4,'Square Centimeter','cm²'],['mm2',1e-6,'Square Millimeter','mm²'],['ft2',.09290304,'Square Foot','ft²'],['yd2',.83612736,'Square Yard','yd²'],['mi2',2589988.110336,'Square Mile','mi²'],['in2',6.4516e-4,'Square Inch','in²'],['ha',1e4,'Hectare','ha'],['ac',4046.8564224,'Acre','ac']];
const VOL=[['ml',.001,'Milliliter','mL'],['l',1,'Liter','L'],['m3',1000,'Cubic Meter','m³'],['cm3',.001,'Cubic Centimeter','cm³'],['ft3',28.316846592,'Cubic Foot','ft³'],['in3',.016387064,'Cubic Inch','in³'],['gal',3.785411784,'Gallon (US)','gal'],['qt',.946352946,'Quart (US)','qt'],['pt',.473176473,'Pint (US)','pt'],['cup',.2365882365,'Cup (US)','cup']];
const SPD=[['ms',1,'Meter per Second','m/s'],['kmh',1/3.6,'Kilometer per Hour','km/h'],['mph',.44704,'Mile per Hour','mph'],['kn',1852/3600,'Knot','kn'],['fps',.3048,'Foot per Second','ft/s']];
const TIM=[['ms',.001,'Millisecond','ms'],['s',1,'Second','s'],['min',60,'Minute','min'],['h',3600,'Hour','h'],['d',86400,'Day','d'],['w',604800,'Week','wk']];
const DAT=[['bit',.125,'Bit','bit'],['B',1,'Byte','B'],['KB',1024,'Kilobyte','KB'],['MB',1048576,'Megabyte','MB'],['GB',1073741824,'Gigabyte','GB'],['TB',1099511627776,'Terabyte','TB'],['PB',1125899906842624,'Petabyte','PB']];


/* ---------- tools ---------- */
const T={
'age-calculator':()=>build([{id:'dob',label:'Date of Birth',type:'date'},{id:'on',label:'Calculate As Of Date',type:'date',value:today()}],v=>{
  const a=D(v.dob),b=D(v.on);if(a>b)err('Date of birth must be before the calculation date.');
  const r=ymd(a,b),d=dd(a,b),nx=new Date(b.getFullYear(),a.getMonth(),a.getDate());if(nx<b)nx.setFullYear(nx.getFullYear()+1);const n=dd(b,nx);
  return{cards:[['Age',`${r.y} Years ${r.m} Months ${r.d} Days`,1],['Total Months',fmt(r.y*12+r.m,0)],['Total Weeks',fmt(Math.floor(d/7),0)],['Total Days',fmt(d,0)],['Next Birthday',`${nx.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} (${n===0?'today':`in ${fmt(n,0)} days`})`]]}},{action:'Calculate Age'}),
'percentage-calculator':()=>build([sel('mode','Calculation',[['of','What is X% of Y?'],['is','X is what percent of Y?'],['inc','Percentage increase from X to Y'],['dec','Percentage decrease from X to Y']],'of'),num('a','Value X',{placeholder:'e.g. 25'}),num('b','Value Y',{placeholder:'e.g. 800'})],v=>{
  const a=N(v.a),b=N(v.b);
  if(v.mode==='of')return{cards:[['Result',`${sm(a)}% of ${sm(b)} = ${sm(a*b/100)}`,1]]};
  if(v.mode==='is'){if(b===0)err('Value Y cannot be zero.');return{cards:[['Result',`${sm(a)} is ${sm(a/b*100)}% of ${sm(b)}`,1]]}}
  if(a===0)err('Value X cannot be zero.');const c=(b-a)/Math.abs(a)*100;
  if(v.mode==='inc'&&c<=0)err('Value Y must be greater than value X for an increase.');
  if(v.mode==='dec'&&c>=0)err('Value Y must be smaller than value X for a decrease.');
  return{cards:[['Result',`${v.mode==='inc'?'Increase':'Decrease'} of ${sm(Math.abs(c))}%`,1],['Change',`${sm(a)} → ${sm(b)} (${sm(b-a)})`]]}},{action:'Calculate'}),
'discount-calculator':()=>build([num('p','Original Price',{placeholder:'e.g. 10000'}),num('d','Discount Percentage (%)',{placeholder:'e.g. 20'})],v=>{
  const p=N(v.p,'original price',0),d=N(v.d,'discount percentage',0,100),s=p*d/100;
  return{cards:[['Original Price',cur(p)],['Discount',`${sm(d)}%`],['Discount Amount',cur(s)],['Final Price',cur(p-s),1]]}},{action:'Calculate Discount'}),
'bmi-calculator':()=>build([num('w','Weight (kg)',{placeholder:'e.g. 70'}),num('h','Height (cm)',{placeholder:'e.g. 175'})],v=>{
  const w=P(v.w,'weight'),hh=P(v.h,'height');if(hh<50||hh>272)err('Height must be between 50 and 272 cm.');const b=w/((hh/100)**2);
  return{cards:[['BMI',b.toFixed(1),1],['Category',b<18.5?'Underweight':b<25?'Normal weight':b<30?'Overweight':'Obese']],text:`BMI: ${b.toFixed(1)}`}},{action:'Calculate BMI',note:'BMI is a general screening number, not a medical diagnosis.'}),
'emi-calculator':()=>build([num('p','Loan Amount',{placeholder:'e.g. 100000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 10'}),num('n','Loan Tenure',{step:'1',placeholder:'e.g. 12'}),sel('u','Tenure Unit',[['m','Months'],['y','Years']],'m')],v=>{
  const p=P(v.p,'loan amount'),a=N(v.r,'interest rate',0,100);let n=P(v.n,'loan tenure');if(v.u==='y')n*=12;if(!Number.isInteger(n))err('Loan tenure must be a whole number of months.');if(n>600)err('Loan tenure must be 50 years or less.');
  const r=a/1200,e=fin(r===0?p/n:p*r*(1+r)**n/((1+r)**n-1));let bal=p,yi=0,yp=0;const rows=[];
  for(let m=1;m<=n;m++){const i=bal*r,pr=e-i;bal=Math.max(0,bal-pr);yi+=i;yp+=pr;if(m%12===0||m===n){rows.push([`Year ${Math.ceil(m/12)}`,cur(yp),cur(yi),cur(bal)]);yi=0;yp=0}}
  return{cards:[['Monthly EMI',cur(e),1],['Total Interest',cur(e*n-p)],['Total Payment',cur(e*n)]],table:{title:'Yearly amortization',head:['Period','Principal paid','Interest paid','Balance'],rows}}},{action:'Calculate EMI'}),
'simple-interest-calculator':()=>build([num('p','Principal',{placeholder:'e.g. 1000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 5'}),num('t','Time',{placeholder:'e.g. 3'}),sel('u','Time Unit',[['y','Years'],['m','Months']],'y')],v=>{
  const p=P(v.p,'principal'),r=N(v.r,'interest rate',0),t=P(v.t,'time'),y=v.u==='m'?t/12:t,i=p*r*y/100;
  return{cards:[['Principal',cur(p)],['Interest',cur(i)],['Total Amount',cur(p+i),1]]}},{action:'Calculate'}),
'compound-interest-calculator':()=>build([num('p','Principal',{placeholder:'e.g. 1000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 5'}),num('t','Time (years)',{placeholder:'e.g. 10'}),sel('n','Compounding Frequency',[['1','Yearly'],['2','Half-yearly'],['4','Quarterly'],['12','Monthly'],['365','Daily']],'1')],v=>{
  const p=P(v.p,'principal'),r=N(v.r,'interest rate',0),t=P(v.t,'time'),n=+v.n;if(t>50)err('Time must be 50 years or less.');
  const A=y=>p*(1+r/100/n)**(n*y),a=fin(A(t)),rows=[];for(let y=1;y<=Math.ceil(t);y++){const b=A(Math.min(y,t));rows.push([`Year ${y}`,cur(b),cur(b-p)])}
  return{cards:[['Principal',cur(p)],['Interest Earned',cur(a-p)],['Final Amount',cur(a),1]],table:{title:'Growth summary',head:['Period','Balance','Interest so far'],rows}}},{action:'Calculate'}),
'date-difference':()=>build([{id:'a',label:'Start Date',type:'date'},{id:'b',label:'End Date',type:'date',value:today()}],v=>{
  const a=D(v.a),b=D(v.b);if(b<a)err('End date must be after the start date.');const r=ymd(a,b),d=dd(a,b);
  return{cards:[['Years',fmt(r.y,0)],['Months',fmt(r.m,0)],['Days',fmt(r.d,0)],['Total Days',fmt(d,0),1],['Total Weeks',fmt(d/7,2)]]}},{action:'Calculate Difference'}),
'average-calculator':()=>build([TA({label:'Numbers (separated by commas, spaces or new lines)',placeholder:'e.g. 10, 20, 30, 40, 50',rows:5})],v=>{
  need(v.text);const a=v.text.split(/[\s,;]+/).filter(Boolean).map(Number);if(a.some(x=>!Number.isFinite(x)))err('Please enter a valid number list, separated by commas, spaces or new lines.');
  const s=[...a].sort((x,y)=>x-y),m=s.length>>1,med=s.length%2?s[m]:(s[m-1]+s[m])/2,sum=fin(a.reduce((x,y)=>x+y,0));
  return{cards:[['Average',sm(sum/a.length),1],['Count',fmt(a.length,0)],['Sum',sm(sum)],['Minimum',sm(s[0])],['Maximum',sm(s[s.length-1])],['Median',sm(med)]]}},{action:'Calculate Average',reset:'Clear'}),
'time-calculator':()=>{const z=n=>String(n).padStart(2,'0'),g=x=>{const s=String(x??'').trim();if(s==='')return 0;const n=Number(s);if(!Number.isInteger(n)||n<0)err('Please enter whole numbers of 0 or more.');return n},F=(id,l)=>num(id,l,{step:'1',min:0,placeholder:'0'});
  build([F('h1','Hours (first time)'),F('m1','Minutes (first time)'),F('s1','Seconds (first time)'),sel('op','Operation',[['+','Add (+)'],['-','Subtract (−)']],'+'),F('h2','Hours (second time)'),F('m2','Minutes (second time)'),F('s2','Seconds (second time)')],v=>{
    const a=g(v.h1)*3600+g(v.m1)*60+g(v.s1),b=g(v.h2)*3600+g(v.m2)*60+g(v.s2);if(!a&&!b)err('Please enter a value.');const r=v.op==='+'?a+b:a-b;if(r<0)err('The result would be negative. Try a smaller second time.');
    return{cards:[['Result (HH:MM:SS)',`${z(Math.floor(r/3600))}:${z(Math.floor(r%3600/60))}:${z(r%60)}`,1],['Total Hours',sm(r/3600)],['Total Minutes',sm(r/60)],['Total Seconds',fmt(r,0)]]}},{action:'Calculate'})},

'word-counter':()=>build([TA()],v=>{const t=v.text;if(!t.trim())return null;const w=t.trim().split(/\s+/).length;
  return{cards:[['Words',fmt(w,0),1],['Characters',fmt([...t].length,0)],['Characters without spaces',fmt([...t.replace(/\s/g,'')].length,0)],['Lines',fmt(t.split('\n').length,0)],['Paragraphs',fmt(t.split(/\n\s*\n/).filter(x=>x.trim()).length,0)],['Sentences',fmt((t.match(/[.!?]+(\s|$)/g)||[]).length||1,0)],['Reading time',`about ${Math.max(1,Math.ceil(w/200))} min`]]}},{live:true,reset:'Clear'}),
'character-counter':()=>build([TA()],v=>{const t=v.text;if(!t)return null;return{cards:[['Characters',fmt([...t].length,0),1],['Characters without spaces',fmt([...t.replace(/\s/g,'')].length,0)],['Lines',fmt(t.split('\n').length,0)],['UTF-8 bytes',fmt(new TextEncoder().encode(t).length,0)]]}},{live:true,reset:'Clear'}),
'case-converter':()=>build([TA()],v=>{need(v.text);const t=v.text,c=x=>x[0].toUpperCase()+x.slice(1).toLowerCase(),w=words(t);
  return{text:{up:t.toUpperCase(),low:t.toLowerCase(),title:t.toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase()),sent:t.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase()),camel:w.map((x,i)=>i?c(x):x.toLowerCase()).join(''),snake:w.map(x=>x.toLowerCase()).join('_'),kebab:w.map(x=>x.toLowerCase()).join('-')}[v.m]}},
  {ta:1,reset:'Clear',download:'converted.txt',actions:[['UPPERCASE','up'],['lowercase','low'],['Title Case','title'],['Sentence case','sent'],['camelCase','camel'],['snake_case','snake'],['kebab-case','kebab']]}),
'text-reverser':()=>build([TA(),sel('m','Reverse',[['c','Characters'],['w','Word order'],['l','Line order']],'c')],v=>{need(v.text);const t=v.text;return{text:v.m==='c'?[...t].reverse().join(''):v.m==='w'?t.split(/\s+/).filter(Boolean).reverse().join(' '):t.split('\n').reverse().join('\n')}},{ta:1,reset:'Clear',download:'reversed.txt',action:'Reverse Text'}),
'remove-duplicate-lines':()=>build([TA({label:'Your lines (one per line)'}),{id:'cs',label:'Case-sensitive',type:'checkbox',value:true},{id:'tr',label:'Ignore leading and trailing spaces',type:'checkbox',value:true}],v=>{
  need(v.text);const seen=new Set(),o=[],all=v.text.split('\n');all.forEach(l=>{let k=v.tr?l.trim():l;if(!v.cs)k=k.toLowerCase();if(!seen.has(k)){seen.add(k);o.push(v.tr?l.trim():l)}});
  return{cards:[['Duplicate lines removed',fmt(all.length-o.length,0)]],text:o.join('\n')}},{ta:1,reset:'Clear',download:'unique-lines.txt',action:'Remove Duplicates'}),
'text-sorter':()=>build([TA({label:'Your lines (one per line)'}),sel('m','Sort',[['az','A → Z'],['za','Z → A'],['len','By length'],['num','Numerically'],['rev','Reverse current order']],'az')],v=>{
  need(v.text);const l=v.text.split('\n').filter(x=>x.trim()),c=(a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}),n=x=>{const f=parseFloat(x);return Number.isNaN(f)?Infinity:f};
  if(v.m==='az')l.sort(c);else if(v.m==='za')l.sort((a,b)=>c(b,a));else if(v.m==='len')l.sort((a,b)=>a.length-b.length||c(a,b));else if(v.m==='num')l.sort((a,b)=>n(a)===n(b)?0:n(a)<n(b)?-1:1);else l.reverse();
  return{text:l.join('\n')}},{ta:1,reset:'Clear',download:'sorted.txt',action:'Sort Lines'}),
'slug-generator':()=>build([TA({label:'Title or text',rows:3,placeholder:'e.g. Hello, World! Café Guide'})],v=>{
  if(!v.text.trim())return null;const s=v.text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');if(!s)err('No letters or numbers (A–Z, 0–9) were found to build a slug.');return{text:s}},{live:true,ta:1,reset:'Clear'}),
'text-cleaner':()=>build([TA(),{id:'trim',label:'Trim spaces at the start and end of each line',type:'checkbox',value:true},{id:'sp',label:'Collapse repeated spaces',type:'checkbox',value:true},{id:'bl',label:'Remove blank lines',type:'checkbox',value:true},{id:'html',label:'Remove HTML tags',type:'checkbox',value:false}],v=>{
  need(v.text);let t=v.text;if(v.html)t=t.replace(/<[^>]*>/g,'');if(v.sp)t=t.replace(/[ \t]{2,}/g,' ');if(v.trim)t=t.split('\n').map(x=>x.trim()).join('\n');if(v.bl)t=t.split('\n').filter(x=>x.trim()).join('\n');return{text:t}},{ta:1,reset:'Clear',download:'cleaned.txt',action:'Clean Text'}),

'json-formatter':()=>codeTool({inputs:[{id:'in',label:'INPUT CODE',placeholder:'{"name":"ToolBoxy","tools":["calculator","converter"]}',rows:10}],fmtId:'in',format:s=>JSON.stringify(jp(s),null,2),extras:[['Minify',s=>JSON.stringify(jp(s))]],file:'formatted.json'}),
'json-validator':()=>codeTool({inputs:[{id:'in',label:'INPUT CODE',placeholder:'{"valid": true}',rows:10}],fmtId:'in',action:'Validate',format:s=>{const j=jp(s);return `✔ Valid JSON\nRoot type: ${Array.isArray(j)?'array':j===null?'null':typeof j}`},file:'validation.txt'}),
'html-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (Format uses this editor)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (optional, used in preview)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (optional, used in preview)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'html',format:fmtHTML,preview:'js',file:'formatted.html'}),
'css-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (optional, used in preview)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (Format uses this editor)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (optional, used in preview)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'css',format:fmtCSS,preview:'js',file:'formatted.css'}),
'js-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (optional, used in preview)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (optional, used in preview)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (Format uses this editor)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'js',format:fmtJS,preview:'js',file:'formatted.js'}),
'base64-encoder':()=>build([TA({label:'Text to encode'})],v=>{need(v.text);return{text:b64e(v.text)}},{ta:1,reset:'Clear',download:'encoded.txt',action:'Encode'}),
'base64-decoder':()=>build([TA({label:'Base64 to decode'})],v=>{need(v.text);try{return{text:b64d(v.text)}}catch{err('Please enter valid Base64 text (letters, numbers, + / and = only, decoding to UTF-8 text).')}},{ta:1,reset:'Clear',download:'decoded.txt',action:'Decode'}),
'url-encoder':()=>build([TA({label:'Text or URL to encode',rows:5}),sel('m','Mode',[['c','Encode a value (encodeURIComponent)'],['u','Encode a full URL (encodeURI)']],'c')],v=>{need(v.text);return{text:v.m==='c'?encodeURIComponent(v.text):encodeURI(v.text)}},{ta:1,reset:'Clear',download:'encoded.txt',action:'Encode'}),
'url-decoder':()=>build([TA({label:'Encoded text or URL',rows:5})],v=>{need(v.text);try{return{text:decodeURIComponent(v.text.replace(/\+/g,' '))}}catch{err('This text contains a malformed % sequence and cannot be decoded.')}},{ta:1,reset:'Clear',download:'decoded.txt',action:'Decode'}),
'uuid-generator':()=>build([num('n','How many UUIDs? (1–50)',{value:5,step:'1',min:1,max:50})],v=>{
  const n=N(v.n,'number of UUIDs',1,50);if(!Number.isInteger(n))err('Please enter a whole number between 1 and 50.');
  const g=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=crypto.getRandomValues(new Uint8Array(1))[0]&15;return(c==='x'?r:(r&3)|8).toString(16)});
  return{text:Array.from({length:n},g).join('\n')}},{ta:1,action:'Generate',download:'uuids.txt'}),

'image-resizer':()=>img([num('w','New width (px)',{step:'1',placeholder:'e.g. 1200'}),num('h','New height (px, optional when keeping ratio)',{step:'1',placeholder:'e.g. 800'}),{id:'k',label:'Keep aspect ratio',type:'checkbox',value:true},sel('t','Output format',fmtOpts,'image/png')],async(v,i)=>{
  let w=v.w?N(v.w,'width'):0,hh=v.h?N(v.h,'height'):0;if(!w&&!hh)err('Please enter a width or a height.');
  if(v.k){if(w)hh=Math.round(i.height*w/i.width);else w=Math.round(i.width*hh/i.height)}else if(!w||!hh)err('Please enter both width and height, or turn on "Keep aspect ratio".');
  const[c,x]=cvs(Math.round(w),Math.round(hh),v.t);x.drawImage(i,0,0,c.width,c.height);return done(c,v.t,.92,v.file,'resized',`\nOriginal: ${i.width} × ${i.height} px`)},'Resize image'),
'image-compressor':()=>img([{id:'q',label:'Quality (10–95)',type:'number',value:70,min:10,max:95,step:'1'},sel('t','Output format',[['image/jpeg','JPG'],['image/webp','WebP']],'image/jpeg')],async(v,i)=>{
  const q=N(v.q,'quality',10,95),[c,x]=cvs(i.width,i.height,v.t);x.drawImage(i,0,0);const r=await done(c,v.t,q/100,v.file,'compressed'),o=v.file.size,n=r.blob.size;
  r.text+=`\nOriginal: ${(o/1024).toFixed(1)} KB\n${n<o?`Saved ${((1-n/o)*100).toFixed(0)}%`:'The new file is not smaller. Try a lower quality or WebP.'}`;return r},'Compress image'),
'image-cropper':()=>img([num('x','Left (x, px)',{value:0,step:'1'}),num('y','Top (y, px)',{value:0,step:'1'}),num('w','Crop width (px)',{step:'1'}),num('h','Crop height (px)',{step:'1'}),sel('t','Output format',fmtOpts,'image/png')],async(v,i)=>{
  const x=N(v.x,'left position',0),y=N(v.y,'top position',0),w=P(v.w,'crop width'),hh=P(v.h,'crop height');
  if(x+w>i.width||y+hh>i.height)err(`The crop area goes outside the image. This image is ${i.width} × ${i.height} px.`);
  const[c,g]=cvs(w,hh,v.t);g.drawImage(i,x,y,w,hh,0,0,w,hh);return done(c,v.t,.92,v.file,'cropped')},'Crop image'),
'jpg-to-png':()=>img([],async(v,i)=>{if(!/jpe?g/.test(v.file.type))err('Please choose a JPG/JPEG image.');const[c,x]=cvs(i.width,i.height,'image/png');x.drawImage(i,0,0);return done(c,'image/png',1,v.file,'converted')},'Convert to PNG'),
'png-to-jpg':()=>img([{id:'q',label:'JPG quality (10–100)',type:'number',value:90,min:10,max:100,step:'1'}],async(v,i)=>{if(v.file.type!=='image/png')err('Please choose a PNG image.');const q=N(v.q,'quality',10,100),[c,x]=cvs(i.width,i.height,'image/jpeg');x.drawImage(i,0,0);return done(c,'image/jpeg',q/100,v.file,'converted','\nTransparent areas were filled with white.')},'Convert to JPG'),
'image-to-base64':()=>build([FILE],v=>new Promise((res,rej)=>{const f=v.file;if(!f)return rej(new Error('Please choose an image file first.'));if(!f.type.startsWith('image/'))return rej(new Error('Please choose a valid image file.'));if(f.size>5*1048576)return rej(new Error('Please choose an image smaller than 5 MB.'));
  const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('This image could not be read.'));r.readAsDataURL(f)}),{action:'Convert to Base64',download:'image-base64.txt',note:imgNote}),

'length-converter':()=>conv(LEN,'m','ft'),'weight-converter':()=>conv(WGT,'kg','lb'),'area-converter':()=>conv(ARE,'m2','ft2'),
'volume-converter':()=>conv(VOL,'l','gal'),'speed-converter':()=>conv(SPD,'kmh','mph'),'time-converter':()=>conv(TIM,'h','min'),
'data-storage-converter':()=>conv(DAT,'GB','MB','Binary system: 1 KB = 1,024 bytes, 1 MB = 1,024 KB, 1 GB = 1,024 MB and so on. 1 byte = 8 bits.'),
'temperature-converter':()=>{const o=[['C','Celsius (°C)'],['F','Fahrenheit (°F)'],['K','Kelvin (K)']],toC={C:x=>x,F:x=>(x-32)*5/9,K:x=>x-273.15},fr={C:c=>c,F:c=>c*9/5+32,K:c=>c+273.15},S={C:'°C',F:'°F',K:'K'};
  build([sel('f','Convert From',o,'C'),num('v','Temperature',{placeholder:'e.g. 25'}),sel('t','Convert To',o,'F')],v=>{const x=N(v.v,'temperature'),c=toC[v.f](x);if(c<-273.15-1e-9)err('Temperature cannot be below absolute zero.');
    return{cards:[['Result',`${sm(x)} ${S[v.f]} = ${sm(fr[v.t](c))} ${S[v.t]}`,1]]}},{action:'Convert',liveAfter:1,extra:[['Swap Units',(els,again)=>{[els.f.value,els.t.value]=[els.t.value,els.f.value];again()}]]})},

'password-generator':()=>{
  const chars={U:'ABCDEFGHJKLMNPQRSTUVWXYZ',L:'abcdefghijkmnopqrstuvwxyz',N:'23456789',S:'!@#$%^&*-_=+?',A:'ILO01ol'};
  build([num('len','Password length (8–64)',{value:16,step:1,min:8,max:64}),
    {id:'up',label:'Uppercase (A–Z)',type:'checkbox',value:true},{id:'lo',label:'Lowercase (a–z)',type:'checkbox',value:true},
    {id:'nu',label:'Numbers (0–9)',type:'checkbox',value:true},{id:'sy',label:'Symbols',type:'checkbox',value:true},
    {id:'ex',label:'Exclude ambiguous characters (I, L, O, 0, 1, l, o)',type:'checkbox',value:true}],v=>{
    const len=N(v.len,'length',8,64);if(!Number.isInteger(len))err('Length must be a whole number.');
    let pool='';if(v.up)pool+=v.ex?chars.U:chars.U+chars.A.slice(0,3);if(v.lo)pool+=v.ex?chars.L:chars.L+chars.A.slice(3);if(v.nu)pool+=v.ex?chars.N:chars.N+'01';if(v.sy)pool+=chars.S;
    if(!pool)err('Select at least one character type.');
    const buf=new Uint32Array(len);crypto.getRandomValues(buf);
    let pw='';for(let i=0;i<len;i++)pw+=pool[buf[i]%pool.length];
    const types=[v.up,v.lo,v.nu,v.sy].filter(Boolean).length;
    const str=len>=16&&types>=3?'Strong':len>=12&&types>=2?'Good':len>=8?'Fair':'Weak';
    return{cards:[['Password',pw,1],['Strength',str],['Length',String(len)]]}},{action:'Generate',note:'Passwords are generated locally with cryptographically secure randomness and never leave your browser.'})},

'random-number-generator':()=>build([num('min','Minimum',{value:1,step:1}),num('max','Maximum',{value:100,step:1}),num('qty','How many numbers? (1–100)',{value:1,step:1,min:1,max:100}),
  {id:'dup',label:'Allow duplicates',type:'checkbox',value:true}],v=>{
  const a=N(v.min,'minimum'),b=N(v.max,'maximum'),q=N(v.qty,'quantity',1,100);
  if(!Number.isInteger(q))err('Quantity must be a whole number.');
  if(a>b)err('Minimum must be less than or equal to maximum.');
  const range=Math.floor(b)-Math.ceil(a)+1;if(range<1)err('Invalid range.');
  if(!v.dup&&q>range)err(`Cannot generate ${q} unique numbers in a range of only ${range} values.`);
  const out=[];
  if(v.dup){const buf=new Uint32Array(q);crypto.getRandomValues(buf);for(let i=0;i<q;i++)out.push(Math.ceil(a)+buf[i]%range)}
  else{const pool=[];for(let i=Math.ceil(a);i<=Math.floor(b);i++)pool.push(i);
    for(let i=pool.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
    out.push(...pool.slice(0,q))}
  return{text:out.join('\n'),cards:[['Count',String(out.length)],['Range',`${a} – ${b}`]]}},{ta:1,action:'Generate',download:'random-numbers.txt',note:'Uses browser cryptographically secure randomness.'}),

'lorem-ipsum-generator':()=>{
  const words='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  const sent=(n)=>{let s=[];for(let i=0;i<n;i++)s.push(words[Math.floor(Math.random()*words.length)]);s[0]=s[0][0].toUpperCase()+s[0].slice(1);return s.join(' ')+'.'};
  build([sel('mode','Generate by',[['p','Paragraphs'],['s','Sentences'],['w','Words']],'p'),num('n','Count (1–50)',{value:3,step:1,min:1,max:50})],v=>{
    const n=N(v.n,'count',1,50);if(!Number.isInteger(n))err('Count must be a whole number.');
    let t='';
    if(v.mode==='w'){const a=[];for(let i=0;i<n;i++)a.push(words[i%words.length]);t=a.join(' ')}
    else if(v.mode==='s'){const a=[];for(let i=0;i<n;i++)a.push(sent(8+Math.floor(Math.random()*8)));t=a.join(' ')}
    else{const a=[];for(let i=0;i<n;i++){const ss=[];for(let j=0;j<3+Math.floor(Math.random()*3);j++)ss.push(sent(8+Math.floor(Math.random()*8)));a.push(ss.join(' '))}t=a.join('\n\n')}
    return{text:t}},{ta:1,action:'Generate',download:'lorem-ipsum.txt'})},

'csv-to-json':()=>{
  const parseCSV=s=>{const rows=[];let row=[],cell='',q=false;
    for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
      if(q){if(c==='"'&&n==='"'){cell+='"';i++}else if(c==='"')q=false;else cell+=c}
      else{if(c==='"')q=true;else if(c===','||c==='\n'||(c==='\r'&&n==='\n')){row.push(cell);cell='';if(c==='\n'||c==='\r'){rows.push(row);row=[]}if(c==='\r')i++}else cell+=c}}
    if(cell||row.length){row.push(cell);rows.push(row)}return rows.filter(r=>r.some(x=>x!==''))};
  build([TA({label:'Paste CSV data',placeholder:'name,age,city\nAlice,30,Kathmandu\nBob,25,Pokhara',rows:10}),
    {id:'hdr',label:'First row is header',type:'checkbox',value:true}],v=>{
    need(v.text);const rows=parseCSV(v.text.trim());if(!rows.length)err('No CSV data found.');
    let json;
    if(v.hdr){const h=rows[0];if(rows.length<2)err('Need at least a header and one data row.');
      json=rows.slice(1).map(r=>{const o={};h.forEach((k,i)=>o[k||`col${i+1}`]=r[i]??'');return o})}
    else json=rows;
    return{text:JSON.stringify(json,null,2)}},{ta:1,action:'Convert',download:'data.json',reset:'Clear',note:'Conversion runs entirely in your browser.'})},

'text-to-ascii':()=>build([TA({label:'Text to convert',rows:4,placeholder:'Hello'}),sel('fmt','Output format',[['dec','Decimal'],['hex','Hexadecimal'],['bin','Binary'],['all','All (table)']],'all')],v=>{
  need(v.text);const t=v.text,lines=[];
  for(const ch of t){const cp=ch.codePointAt(0);const isAsc=cp<=127;
    const d=String(cp),hx='0x'+cp.toString(16).toUpperCase(),bn=cp.toString(2).padStart(isAsc?8:16,'0');
    if(v.fmt==='dec')lines.push(d);else if(v.fmt==='hex')lines.push(hx);else if(v.fmt==='bin')lines.push(bn);
    else lines.push(`${ch==='\n'?'\\n':ch==='\t'?'\\t':ch===' '?'(space)':ch}\t${d}\t${hx}\t${bn}${isAsc?'':'  (Unicode, not ASCII)'}`)}
  if(v.fmt==='all')return{text:'Char\tDec\tHex\tBinary\n'+lines.join('\n')};
  return{text:lines.join(' ')}},{ta:1,action:'Convert',download:'ascii.txt',reset:'Clear',note:'ASCII covers code points 0–127. Higher values are Unicode and are labeled accordingly.'}),

'color-picker':()=>{
  const hex2rgb=h=>{h=h.replace(/^#/,'').trim();if(h.length===3)h=h.split('').map(c=>c+c).join('');if(!/^[0-9a-fA-F]{6}$/.test(h))return null;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
  const rgb2hsl=(r,g,b)=>{r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2;let h=0,s=0;if(M!==m){const d=M-m;s=l>0.5?d/(2-M-m):d/(M+m);h=M===r?((g-b)/d+(g<b?6:0)):M===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[Math.round(h*360),Math.round(s*100),Math.round(l*100)]};
  const hsl2rgb=(h,s,l)=>{s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return l-a*Math.max(Math.min(k-3,9-k,1),-1)};return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)]};
  const form=h('form',{class:'tool-form',novalidate:''});
  const cp=h('input',{id:'cp',type:'color',value:'#2563eb'}),hx=h('input',{id:'hx',type:'text',value:'#2563eb',placeholder:'#2563eb'}),
    r=h('input',{id:'r',type:'number',min:0,max:255,value:37}),g=h('input',{id:'g',type:'number',min:0,max:255,value:99}),b=h('input',{id:'b',type:'number',min:0,max:255,value:235}),
    hh=h('input',{id:'hh',type:'number',min:0,max:360,value:221}),ss=h('input',{id:'ss',type:'number',min:0,max:100,value:84}),ll=h('input',{id:'ll',type:'number',min:0,max:100,value:53});
  const sw=h('div',{class:'preview',style:'width:100%;height:80px;border-radius:8px;background:#2563eb;border:1px solid var(--border)',role:'img','aria-label':'Color preview'});
  const out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const show=(R,G,B)=>{const hex='#'+[R,G,B].map(x=>x.toString(16).padStart(2,'0')).join('');const[H,S,L]=rgb2hsl(R,G,B);
    cp.value=hex;hx.value=hex;r.value=R;g.value=G;b.value=B;hh.value=H;ss.value=S;ll.value=L;sw.style.background=hex;
    out.replaceChildren(h('div',{class:'cards'},
      h('div',{class:'stat big'},h('span',{class:'stat-l'},'HEX'),h('strong',{},hex)),
      h('div',{class:'stat'},h('span',{class:'stat-l'},'RGB'),h('strong',{},`rgb(${R}, ${G}, ${B})`)),
      h('div',{class:'stat'},h('span',{class:'stat-l'},'HSL'),h('strong',{},`hsl(${H}, ${S}%, ${L}%)`))))};
  const fromHex=()=>{const rgb=hex2rgb(hx.value);if(!rgb){out.replaceChildren(h('p',{class:'error',role:'alert'},'Enter a valid 3 or 6 digit HEX color (e.g. #2563eb).'));return}show(...rgb)};
  const fromRgb=()=>{const R=N(r.value,'R',0,255),G=N(g.value,'G',0,255),B=N(b.value,'B',0,255);show(Math.round(R),Math.round(G),Math.round(B))};
  const fromHsl=()=>{const H=N(hh.value,'H',0,360),S=N(ss.value,'S',0,100),L=N(ll.value,'L',0,100);show(...hsl2rgb(H,S,L))};
  form.append(
    h('div',{class:'field'},h('label',{for:'cp'},'Pick a color'),cp),
    h('div',{class:'field'},h('label',{for:'hx'},'HEX'),hx),
    h('div',{class:'row'},
      h('div',{class:'field'},h('label',{for:'r'},'R'),r),h('div',{class:'field'},h('label',{for:'g'},'G'),g),h('div',{class:'field'},h('label',{for:'b'},'B'),b)),
    h('div',{class:'row'},
      h('div',{class:'field'},h('label',{for:'hh'},'H'),hh),h('div',{class:'field'},h('label',{for:'ss'},'S (%)'),ss),h('div',{class:'field'},h('label',{for:'ll'},'L (%)'),ll)),
    sw,
    h('div',{class:'row'},
      h('button',{type:'button',class:'btn',onclick:()=>{try{fromHex()}catch(e){out.replaceChildren(h('p',{class:'error',role:'alert'},e.message))}}},'Apply HEX'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{try{fromRgb()}catch(e){out.replaceChildren(h('p',{class:'error',role:'alert'},e.message))}}},'Apply RGB'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{try{fromHsl()}catch(e){out.replaceChildren(h('p',{class:'error',role:'alert'},e.message))}}},'Apply HSL'),
      h('button',{type:'button',class:'btn secondary',onclick:async()=>{const t=hx.value;st.textContent=(await copyText(t))?'Copied HEX!':'Copy failed.';setTimeout(()=>st.textContent='',2000)}},'Copy HEX'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{cp.value='#2563eb';hx.value='#2563eb';show(37,99,235)}},'Reset'),st));
  cp.addEventListener('input',()=>{const rgb=hex2rgb(cp.value);if(rgb)show(...rgb)});
  hx.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();fromHex()}});
  root.replaceChildren(h('p',{class:'note'},'Pick a color or enter HEX, RGB or HSL values. All conversion happens in your browser.'),form,out);show(37,99,235)},

'utm-builder':()=>build([
  {id:'url',label:'Website URL',type:'text',placeholder:'https://example.com/page'},
  {id:'source',label:'utm_source (required)',type:'text',placeholder:'e.g. google, newsletter, facebook'},
  {id:'medium',label:'utm_medium (required)',type:'text',placeholder:'e.g. cpc, email, social'},
  {id:'campaign',label:'utm_campaign (required)',type:'text',placeholder:'e.g. spring_sale'},
  {id:'term',label:'utm_term (optional)',type:'text',placeholder:'e.g. running+shoes'},
  {id:'content',label:'utm_content (optional)',type:'text',placeholder:'e.g. logolink'}
],v=>{
  need(v.url);need(v.source);need(v.medium);need(v.campaign);
  let base;try{base=new URL(v.url.trim().startsWith('http')?v.url.trim():'https://'+v.url.trim())}catch{err('Please enter a valid website URL.')}
  const p=base.searchParams;p.set('utm_source',v.source.trim());p.set('utm_medium',v.medium.trim());p.set('utm_campaign',v.campaign.trim());
  if(v.term.trim())p.set('utm_term',v.term.trim());else p.delete('utm_term');
  if(v.content.trim())p.set('utm_content',v.content.trim());else p.delete('utm_content');
  return{text:base.toString()}},{ta:1,action:'Generate URL',download:'utm-url.txt',reset:'Clear',note:'UTM parameters help track campaign traffic in analytics tools. They do not improve SEO by themselves.'}),

'whitespace-remover':()=>build([TA({label:'Text to clean',rows:10}),
  {id:'trim',label:'Trim leading and trailing whitespace on each line',type:'checkbox',value:true},
  {id:'sp',label:'Collapse multiple spaces into one',type:'checkbox',value:true},
  {id:'bl',label:'Remove duplicate blank lines',type:'checkbox',value:true},
  {id:'tabs',label:'Convert tabs to spaces',type:'checkbox',value:false}],v=>{
  need(v.text);let t=v.text;
  if(v.tabs)t=t.replace(/\t/g,'  ');
  if(v.sp)t=t.replace(/[ \t]{2,}/g,' ');
  if(v.trim)t=t.split('\n').map(l=>l.trim()).join('\n');
  if(v.bl)t=t.replace(/\n{3,}/g,'\n\n');
  return{text:t,cards:[['Characters before',fmt([...v.text].length,0)],['Characters after',fmt([...t].length,0)]]}},{ta:1,action:'Clean Whitespace',download:'cleaned.txt',reset:'Clear'}),

'barcode-generator':()=>{
  const loadJs=()=>new Promise((res,rej)=>{if(window.JsBarcode)return res();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';s.onload=res;s.onerror=()=>rej(new Error('Could not load barcode library. Check your connection.'));document.head.append(s)});
  const form=h('form',{class:'tool-form',novalidate:''});
  const type=h('select',{id:'btype'},[['CODE128','CODE128'],['CODE39','CODE39'],['EAN13','EAN-13'],['EAN8','EAN-8'],['UPC','UPC-A']].map(([v,l])=>h('option',{value:v},l)));
  const val=h('input',{id:'bval',type:'text',placeholder:'e.g. 123456789012'});
  const out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  /* SVG must be created in the SVG namespace so serialization has a single xmlns (avoids "Attribute xmlns redefined"). */
  const makeSvg=()=>{const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('id','bc-svg');el.setAttribute('style','max-width:100%;height:auto;background:#fff;padding:12px;border-radius:8px');return el};
  let svg=makeSvg();
  const smart=(t)=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd(t||'image-download')}catch(e){}};
  /* Serialize with exactly one xmlns on the root <svg>. */
  const svgString=el=>{
    const clone=el.cloneNode(true);
    clone.removeAttribute('xmlns');
    if(clone.removeAttributeNS)try{clone.removeAttributeNS('http://www.w3.org/2000/xmlns/','xmlns')}catch(e){}
    let s=new XMLSerializer().serializeToString(clone);
    s=s.replace(/\sxmlns(?::\w+)?="[^"]*"/g,'');
    s=s.replace(/<svg\b/,'<svg xmlns="http://www.w3.org/2000/svg"');
    if(!/^<\?xml/.test(s))s='<?xml version="1.0" encoding="UTF-8"?>\n'+s;
    return s;
  };
  const dl=(href,name)=>{const a=h('a',{href,download:name});document.body.append(a);a.click();a.remove()};
  const gen=async()=>{out.replaceChildren();try{
    await loadJs();const t=type.value,v=val.value.trim();if(!v)err('Please enter a value for the barcode.');
    if(t==='EAN13'&&!/^\d{12,13}$/.test(v))err('EAN-13 requires 12 or 13 digits.');
    if(t==='EAN8'&&!/^\d{7,8}$/.test(v))err('EAN-8 requires 7 or 8 digits.');
    if(t==='UPC'&&!/^\d{11,12}$/.test(v))err('UPC-A requires 11 or 12 digits.');
    svg=makeSvg();
    JsBarcode(svg,v,{format:t,displayValue:true,fontSize:16,height:80,margin:10,xmlDocument:document});
    /* Strip any extra xmlns JsBarcode may have written so the live preview is clean too. */
    svg.removeAttribute('xmlns');
    if(svg.removeAttributeNS)try{svg.removeAttributeNS('http://www.w3.org/2000/xmlns/','xmlns')}catch(e){}
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    out.append(svg);
    const pngBtn=h('button',{type:'button',class:'btn',onclick:()=>{
      smart();
      const s=svgString(svg),img=new Image();
      img.onload=()=>{const c=document.createElement('canvas');c.width=img.width||svg.width.baseVal.value||img.naturalWidth;c.height=img.height||svg.height.baseVal.value||img.naturalHeight;
        const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);
        dl(c.toDataURL('image/png'),'barcode.png')};
      img.onerror=()=>{st.textContent='PNG export failed. Try again.';setTimeout(()=>st.textContent='',2500)};
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
    }},'Download PNG');
    const svgBtn=h('button',{type:'button',class:'btn secondary',onclick:()=>{
      smart();
      const s=svgString(svg);
      const blob=new Blob([s],{type:'image/svg+xml;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      dl(url,'barcode.svg');
      setTimeout(()=>URL.revokeObjectURL(url),2000);
    }},'Download SVG');
    out.append(h('div',{class:'row',style:'margin-top:1rem'},pngBtn,svgBtn,st));
  }catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Could not generate barcode.'))}};
  form.append(
    h('div',{class:'field'},h('label',{for:'btype'},'Barcode type'),type),
    h('div',{class:'field'},h('label',{for:'bval'},'Value / text'),val),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Generate'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{val.value='';out.replaceChildren(h('p',{class:'muted'},'Enter a value and press Generate.'))}},'Reset')));
  form.addEventListener('submit',e=>{e.preventDefault();gen()});
  root.replaceChildren(h('p',{class:'note'},'Barcodes are generated in your browser. Supported: CODE128, CODE39, EAN-13, EAN-8, UPC-A.'),form,out);
  out.append(h('p',{class:'muted'},'Enter a value and press Generate.'))},

'pdf-merger':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library. Check your connection.'));document.head.append(s)});
  let files=[];
  const list=h('div',{class:'file-list','aria-live':'polite'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'pdfs',type:'file',accept:'application/pdf,.pdf',multiple:''});
  const render=()=>{list.replaceChildren();if(!files.length){list.append(h('p',{class:'muted'},'No files selected yet.'));return}
    files.forEach((f,i)=>{
      const row=h('div',{class:'row',style:'align-items:center;gap:.5rem;margin:.4rem 0;flex-wrap:wrap'},
        h('span',{},`${i+1}. ${f.name} (${(f.size/1024).toFixed(1)} KB)`),
        h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];render()}},'aria-label':`Move ${f.name} up`},'↑'),
        h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i<files.length-1){[files[i+1],files[i]]=[files[i],files[i+1]];render()}},'aria-label':`Move ${f.name} down`},'↓'),
        h('button',{type:'button',class:'btn secondary',onclick:()=>{files.splice(i,1);render()},'aria-label':`Remove ${f.name}`},'Remove'));
      list.append(row)})};
  const merge=async()=>{out.replaceChildren();if(files.length<2){out.append(h('p',{class:'error',role:'alert'},'Please select at least 2 PDF files to merge.'));return}
    try{const {PDFDocument}=await loadPdf();const merged=await PDFDocument.create();
      for(const f of files){const buf=await f.arrayBuffer();let doc;try{doc=await PDFDocument.load(buf)}catch{err(`Could not read “${f.name}”. Make sure it is a valid PDF.`)}
        const pages=await merged.copyPages(doc,doc.getPageIndices());pages.forEach(p=>merged.addPage(p))}
      const bytes=await merged.save();const blob=new Blob([bytes],{type:'application/pdf'});
      const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Merged ${files.length} files into one PDF (${(blob.size/1024).toFixed(1)} KB).`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'merged.pdf'});document.body.append(a);a.click();a.remove()}},'Download Merged PDF'),st);
    }catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Merge failed.'))}};
  const drop=h('div',{class:'field drop'},h('label',{for:'pdfs'},'Choose PDF files'),input,h('p',{class:'note'},'…or drag and drop PDF files onto this box.'));
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
  drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');const added=[...e.dataTransfer.files].filter(f=>f.type==='application/pdf'||/\.pdf$/i.test(f.name));if(!added.length){out.replaceChildren(h('p',{class:'error',role:'alert'},'Please drop PDF files only.'));return}files=files.concat(added);render()});
  input.addEventListener('change',()=>{files=files.concat([...input.files]);input.value='';render()});
  const form=h('form',{class:'tool-form',novalidate:''},drop,h('p',{class:'note'},'Selected files (drag order or use ↑ ↓ to reorder):'),list,
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Merge PDFs'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{files=[];render();out.replaceChildren(h('p',{class:'muted'},'Select files to merge.'))}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();merge()});
  root.replaceChildren(h('p',{class:'note'},'PDFs are merged entirely in your browser. Files are never uploaded to a server.'),form,out);
  render();out.append(h('p',{class:'muted'},'Select at least 2 PDF files, reorder if needed, then Merge.'))},

'pdf-splitter':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library. Check your connection.'));document.head.append(s)});
  let file=null,pageCount=0;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const range=h('input',{id:'range',type:'text',placeholder:'e.g. 1-3, 5, 7-9'});
  const parseRange=(s,max)=>{const set=new Set();
    s.split(',').map(x=>x.trim()).filter(Boolean).forEach(part=>{
      if(/^\d+$/.test(part)){const n=+part;if(n<1||n>max)err(`Page ${n} is out of range (1–${max}).`);set.add(n)}
      else if(/^(\d+)-(\d+)$/.test(part)){let[,a,b]=part.match(/^(\d+)-(\d+)$/);a=+a;b=+b;if(a>b)[a,b]=[b,a];if(a<1||b>max)err(`Range ${part} is out of range (1–${max}).`);for(let i=a;i<=b;i++)set.add(i)}
      else err(`Invalid page range “${part}”. Use formats like 1, 1-3, or 1,3-5.`)});
    if(!set.size)err('Please enter at least one page number or range.');
    return[...set].sort((a,b)=>a-b)};
  input.addEventListener('change',async()=>{file=input.files[0]||null;pageCount=0;info.textContent='';out.replaceChildren();
    if(!file)return;if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name)){info.textContent='';out.append(h('p',{class:'error',role:'alert'},'Please choose a valid PDF file.'));file=null;return}
    try{const {PDFDocument}=await loadPdf();const doc=await PDFDocument.load(await file.arrayBuffer());pageCount=doc.getPageCount();
      info.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB · ${pageCount} page${pageCount===1?'':'s'}`}
    catch{out.append(h('p',{class:'error',role:'alert'},'Could not read this PDF. Make sure it is a valid, non-encrypted file.'));file=null}});
  const split=async()=>{out.replaceChildren();if(!file||!pageCount){out.append(h('p',{class:'error',role:'alert'},'Please choose a PDF file first.'));return}
    try{const pages=parseRange(range.value.trim(),pageCount);const {PDFDocument}=await loadPdf();
      const src=await PDFDocument.load(await file.arrayBuffer());const outDoc=await PDFDocument.create();
      const copied=await outDoc.copyPages(src,pages.map(p=>p-1));copied.forEach(p=>outDoc.addPage(p));
      const bytes=await outDoc.save();const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Extracted ${pages.length} page${pages.length===1?'':'s'}: ${pages.join(', ')} (${(blob.size/1024).toFixed(1)} KB).`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'split.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'),st);
    }catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Split failed.'))}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'field'},h('label',{for:'range'},'Pages to extract (e.g. 1, 1-3, 1,3-5)'),range),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Extract Pages'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;pageCount=0;range.value='';info.textContent='';out.replaceChildren(h('p',{class:'muted'},'Choose a PDF and enter page ranges.'))}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();split()});
  root.replaceChildren(h('p',{class:'note'},'PDF splitting runs entirely in your browser. Your file is never uploaded.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a PDF, enter page numbers or ranges, then Extract.'))}
,
/* ========== 24 NEW TOOLS ========== */

'pdf-to-jpg':()=>{
  const loadPdfJs=()=>new Promise((res,rej)=>{if(window.pdfjsLib)return res(window.pdfjsLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';res(window.pdfjsLib)};s.onerror=()=>rej(new Error('Could not load PDF.js. Check your connection.'));document.head.append(s)});
  let file=null,pdf=null,pageCount=0;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'}),prev=h('div',{class:'row',style:'flex-wrap:wrap;gap:.5rem;margin-top:.5rem'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const quality=h('input',{id:'q',type:'number',value:'85',min:'40',max:'100',step:'1'});
  const pagesIn=h('input',{id:'pages',type:'text',placeholder:'all, or 1,2,5-8'});
  input.addEventListener('change',async()=>{file=input.files[0]||null;pdf=null;pageCount=0;info.textContent='';out.replaceChildren();prev.replaceChildren();
    if(!file)return;
    if(file.size>40*1024*1024){out.append(h('p',{class:'error',role:'alert'},'File is larger than 40 MB. Browser memory may fail. Try a smaller PDF.'));return}
    try{st.textContent='Loading PDF…';const lib=await loadPdfJs();const buf=await file.arrayBuffer();pdf=await lib.getDocument({data:buf}).promise;pageCount=pdf.numPages;
      info.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB · ${pageCount} page${pageCount===1?'':'s'}`;st.textContent=''}catch(e){out.append(h('p',{class:'error',role:'alert'},'Could not read this PDF. It may be encrypted or corrupted.'));file=null;st.textContent=''}});
  const parsePages=(s,max)=>{if(!s||/^all$/i.test(s.trim()))return Array.from({length:max},(_,i)=>i+1);
    const set=new Set();s.split(',').map(x=>x.trim()).filter(Boolean).forEach(part=>{
      if(/^\d+$/.test(part)){const n=+part;if(n<1||n>max)err(`Page ${n} out of range (1–${max})`);set.add(n)}
      else if(/^(\d+)-(\d+)$/.test(part)){let[,a,b]=part.match(/^(\d+)-(\d+)$/);a=+a;b=+b;if(a>b)[a,b]=[b,a];if(a<1||b>max)err(`Range ${part} out of range`);for(let i=a;i<=b;i++)set.add(i)}
      else err(`Invalid page “${part}”`)});
    if(!set.size)err('Enter pages or “all”');return[...set].sort((a,b)=>a-b)};
  const convert=async()=>{out.replaceChildren();prev.replaceChildren();if(!pdf){out.append(h('p',{class:'error',role:'alert'},'Choose a PDF first.'));return}
    try{const pages=parsePages(pagesIn.value,pageCount);const q=Math.min(100,Math.max(40,+quality.value||85))/100;
      st.textContent=`Rendering 0/${pages.length}…`;
      const blobs=[];
      for(let i=0;i<pages.length;i++){const p=pages[i];st.textContent=`Rendering page ${p} (${i+1}/${pages.length})…`;
        const page=await pdf.getPage(p);const scale=2;const vp=page.getViewport({scale});
        const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
        await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
        const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',q));blobs.push({blob,page:p,name:`toolboxy-pdf-to-jpg-page-${p}.jpg`});
        const url=URL.createObjectURL(blob);const img=h('img',{src:url,alt:`Page ${p}`,style:'max-width:140px;border:1px solid var(--border);border-radius:6px'});
        const dl=h('button',{type:'button',class:'btn secondary',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:`toolboxy-pdf-to-jpg-page-${p}.jpg`});document.body.append(a);a.click();a.remove()}},`Page ${p}`);
        prev.append(h('div',{style:'text-align:center'},img,h('br'),dl));
        c.width=0;c.height=0}
      st.textContent='Done.';
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Converted ${blobs.length} page(s) to JPG.`),prev,
        blobs.length>1?h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}blobs.forEach(({blob,name})=>{const u=URL.createObjectURL(blob);const a=h('a',{href:u,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2e3)})}},'Download All JPGs'):null,st);
    }catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Conversion failed.'));st.textContent=''}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'field'},h('label',{for:'pages'},'Pages (all or 1,2,5-8)'),pagesIn),
    h('div',{class:'field'},h('label',{for:'q'},'JPG quality (40–100)'),quality),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Convert to JPG'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;pdf=null;pageCount=0;pagesIn.value='';info.textContent='';out.replaceChildren();prev.replaceChildren();st.textContent=''}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();convert()});
  root.replaceChildren(h('p',{class:'note'},'Your PDF is rendered to JPG entirely in your browser. Files are never uploaded to ToolBoxy servers.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a PDF, pick pages and quality, then convert.'))},

'jpg-to-pdf':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  let files=[];
  const list=h('div',{class:'file-list','aria-live':'polite'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'imgs',type:'file',accept:'image/jpeg,.jpg,.jpeg',multiple:''});
  const orient=h('select',{id:'orient'},[h('option',{value:'portrait'},'Portrait'),h('option',{value:'landscape'},'Landscape')]);
  const size=h('select',{id:'size'},[['a4','A4'],['letter','Letter'],['fit','Fit to image']].map(([v,l])=>h('option',{value:v},l)));
  const render=()=>{list.replaceChildren();if(!files.length){list.append(h('p',{class:'muted'},'No images yet.'));return}
    files.forEach((f,i)=>{list.append(h('div',{class:'row',style:'align-items:center;gap:.5rem;margin:.35rem 0;flex-wrap:wrap'},
      h('span',{},`${i+1}. ${f.name} (${(f.size/1024).toFixed(1)} KB)`),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];render()}}},'↑'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i<files.length-1){[files[i+1],files[i]]=[files[i],files[i+1]];render()}}},'↓'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{files.splice(i,1);render()}},'Remove')))})};
  const convert=async()=>{out.replaceChildren();if(!files.length){out.append(h('p',{class:'error',role:'alert'},'Add at least one JPG.'));return}
    try{st.textContent='Building PDF…';const {PDFDocument}=await loadPdf();const doc=await PDFDocument.create();
      const sizes={a4:[595.28,841.89],letter:[612,792]};
      for(const f of files){const bytes=new Uint8Array(await f.arrayBuffer());let img;try{img=await doc.embedJpg(bytes)}catch{err(`Could not embed “${f.name}”. Use a valid JPG.`)}
        let pw,ph;if(size.value==='fit'){pw=img.width;ph=img.height}else{[pw,ph]=sizes[size.value];if(orient.value==='landscape')[pw,ph]=[ph,pw]}
        const page=doc.addPage([pw,ph]);const scale=Math.min(pw/img.width,ph/img.height);const w=img.width*scale,hh=img.height*scale;
        page.drawImage(img,{x:(pw-w)/2,y:(ph-hh)/2,width:w,height:hh})}
      const pdfBytes=await doc.save();const blob=new Blob([pdfBytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      st.textContent='';out.append(h('p',{},`Created PDF with ${files.length} page(s) · ${(blob.size/1024).toFixed(1)} KB`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-images.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Failed'));st.textContent=''}};
  const drop=h('div',{class:'field drop'},h('label',{for:'imgs'},'Choose JPG images'),input,h('p',{class:'note'},'…or drag and drop JPG files here.'));
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
  drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');const added=[...e.dataTransfer.files].filter(f=>/jpe?g/i.test(f.type)||/\.jpe?g$/i.test(f.name));files=files.concat(added);render()});
  input.addEventListener('change',()=>{files=files.concat([...input.files]);input.value='';render()});
  const form=h('form',{class:'tool-form',novalidate:''},drop,list,
    h('div',{class:'field'},h('label',{for:'size'},'Page size'),size),
    h('div',{class:'field'},h('label',{for:'orient'},'Orientation'),orient),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Create PDF'),h('button',{type:'button',class:'btn secondary',onclick:()=>{files=[];render();out.replaceChildren()}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();convert()});
  root.replaceChildren(h('p',{class:'note'},'Images are combined into a PDF in your browser. Nothing is uploaded.'),form,out);
  render();out.append(h('p',{class:'muted'},'Add JPGs, reorder, then create the PDF.'))},

'image-to-pdf':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  let files=[];
  const list=h('div',{class:'file-list','aria-live':'polite'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'imgs',type:'file',accept:'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',multiple:''});
  const size=h('select',{id:'size'},[['a4','A4'],['letter','Letter'],['fit','Fit to image']].map(([v,l])=>h('option',{value:v},l)));
  const orient=h('select',{id:'orient'},[h('option',{value:'portrait'},'Portrait'),h('option',{value:'landscape'},'Landscape')]);
  const render=()=>{list.replaceChildren();if(!files.length){list.append(h('p',{class:'muted'},'No images yet.'));return}
    files.forEach((f,i)=>{list.append(h('div',{class:'row',style:'align-items:center;gap:.5rem;margin:.35rem 0;flex-wrap:wrap'},
      h('span',{},`${i+1}. ${f.name}`),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];render()}}},'↑'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{if(i<files.length-1){[files[i+1],files[i]]=[files[i],files[i+1]];render()}}},'↓'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{files.splice(i,1);render()}},'Remove')))})};
  const convert=async()=>{out.replaceChildren();if(!files.length){out.append(h('p',{class:'error',role:'alert'},'Add at least one image.'));return}
    try{st.textContent='Building PDF…';const {PDFDocument}=await loadPdf();const doc=await PDFDocument.create();
      const sizes={a4:[595.28,841.89],letter:[612,792]};
      for(const f of files){const bytes=new Uint8Array(await f.arrayBuffer());let img;
        if(/png/i.test(f.type)||/\.png$/i.test(f.name))img=await doc.embedPng(bytes);
        else if(/webp/i.test(f.type)||/\.webp$/i.test(f.name)){
          const bitmap=await createImageBitmap(f);const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);
          const pngBlob=await new Promise(r=>c.toBlob(r,'image/png'));img=await doc.embedPng(new Uint8Array(await pngBlob.arrayBuffer()));bitmap.close();c.width=0} 
        else img=await doc.embedJpg(bytes);
        let pw,ph;if(size.value==='fit'){pw=img.width;ph=img.height}else{[pw,ph]=sizes[size.value];if(orient.value==='landscape')[pw,ph]=[ph,pw]}
        const page=doc.addPage([pw,ph]);const scale=Math.min(pw/img.width,ph/img.height);const w=img.width*scale,hh=img.height*scale;
        page.drawImage(img,{x:(pw-w)/2,y:(ph-hh)/2,width:w,height:hh})}
      const pdfBytes=await doc.save();const blob=new Blob([pdfBytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      st.textContent='';out.append(h('p',{},`Created PDF with ${files.length} page(s) · ${(blob.size/1024).toFixed(1)} KB`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-images.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Failed'));st.textContent=''}};
  const drop=h('div',{class:'field drop'},h('label',{for:'imgs'},'Choose images (JPG, PNG, WebP)'),input,h('p',{class:'note'},'…or drag and drop images here.'));
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
  drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');files=files.concat([...e.dataTransfer.files].filter(f=>/image\/(jpeg|png|webp)/i.test(f.type)||/\.(jpe?g|png|webp)$/i.test(f.name)));render()});
  input.addEventListener('change',()=>{files=files.concat([...input.files]);input.value='';render()});
  const form=h('form',{class:'tool-form',novalidate:''},drop,list,
    h('div',{class:'field'},h('label',{for:'size'},'Page size'),size),
    h('div',{class:'field'},h('label',{for:'orient'},'Orientation'),orient),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Create PDF'),h('button',{type:'button',class:'btn secondary',onclick:()=>{files=[];render();out.replaceChildren()}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();convert()});
  root.replaceChildren(h('p',{class:'note'},'Images are combined into a PDF in your browser. Nothing is uploaded.'),form,out);
  render();out.append(h('p',{class:'muted'},'Add images, reorder, then create the PDF.'))},

'pdf-compressor':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  const loadPdfJs=()=>new Promise((res,rej)=>{if(window.pdfjsLib)return res(window.pdfjsLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';res(window.pdfjsLib)};s.onerror=()=>rej(new Error('Could not load PDF.js'));document.head.append(s)});
  let file=null;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const preset=h('select',{id:'preset'},[['low','Low compression (better quality)'],['medium','Medium'],['high','High compression (smaller file)']].map(([v,l])=>h('option',{value:v},l)));
  preset.value='medium';
  input.addEventListener('change',()=>{file=input.files[0]||null;info.textContent=file?`${file.name} · ${(file.size/1024).toFixed(1)} KB`:'';out.replaceChildren()});
  const compress=async()=>{out.replaceChildren();if(!file){out.append(h('p',{class:'error',role:'alert'},'Choose a PDF first.'));return}
    if(file.size>30*1024*1024){out.append(h('p',{class:'error',role:'alert'},'File > 30 MB may exhaust browser memory. Try a smaller file.'));return}
    try{st.textContent='Analyzing PDF…';const scales={low:1.2,medium:1.0,high:0.75};const q={low:0.85,medium:0.7,high:0.5};
      const sc=scales[preset.value],qual=q[preset.value];
      const lib=await loadPdfJs();const {PDFDocument}=await loadPdf();
      const buf=await file.arrayBuffer();const src=await lib.getDocument({data:buf}).promise;const n=src.numPages;
      const outDoc=await PDFDocument.create();
      for(let i=1;i<=n;i++){st.textContent=`Compressing page ${i}/${n}…`;
        const page=await src.getPage(i);const vp=page.getViewport({scale:sc});
        const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
        await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
        const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',qual));const bytes=new Uint8Array(await blob.arrayBuffer());
        const img=await outDoc.embedJpg(bytes);const pg=outDoc.addPage([img.width,img.height]);
        pg.drawImage(img,{x:0,y:0,width:img.width,height:img.height});c.width=0;c.height=0}
      const bytes=await outDoc.save();const outBlob=new Blob([bytes],{type:'application/pdf'});
      const orig=file.size,neu=outBlob.size,pct=((1-neu/orig)*100).toFixed(1);
      st.textContent='';
      if(neu>=orig){out.append(h('p',{class:'error',role:'alert'},`Output (${(neu/1024).toFixed(1)} KB) is not smaller than original (${(orig/1024).toFixed(1)} KB). This PDF may already be optimized or text-based. Image re-encoding did not reduce size.`));return}
      const url=URL.createObjectURL(outBlob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Original: ${(orig/1024).toFixed(1)} KB → Compressed: ${(neu/1024).toFixed(1)} KB (−${pct}%)`),
        h('p',{class:'note'},'Image-heavy pages were re-encoded. Text-only PDFs may not shrink much. Visual quality may decrease with higher compression.'),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-compressed.pdf'});document.body.append(a);a.click();a.remove()}},'Download Compressed PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Compression failed'));st.textContent=''}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'field'},h('label',{for:'preset'},'Compression level'),preset),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Compress PDF'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;info.textContent='';out.replaceChildren()}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();compress()});
  root.replaceChildren(h('p',{class:'note'},'Compression runs in your browser. Your PDF is never uploaded. Image-heavy PDFs shrink more; pure-text PDFs may not.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a PDF and compression level.'))},

'pdf-to-text':()=>{
  const loadPdfJs=()=>new Promise((res,rej)=>{if(window.pdfjsLib)return res(window.pdfjsLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';res(window.pdfjsLib)};s.onerror=()=>rej(new Error('Could not load PDF.js'));document.head.append(s)});
  let file=null;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const ta=h('textarea',{id:'txt',rows:14,readonly:'',placeholder:'Extracted text will appear here…',spellcheck:'false'});
  input.addEventListener('change',()=>{file=input.files[0]||null;info.textContent=file?`${file.name} · ${(file.size/1024).toFixed(1)} KB`:'';ta.value='';out.replaceChildren()});
  const extract=async()=>{out.replaceChildren();if(!file){out.append(h('p',{class:'error',role:'alert'},'Choose a PDF first.'));return}
    try{st.textContent='Extracting text…';const lib=await loadPdfJs();const pdf=await lib.getDocument({data:await file.arrayBuffer()}).promise;
      const parts=[];let chars=0;
      for(let i=1;i<=pdf.numPages;i++){st.textContent=`Page ${i}/${pdf.numPages}…`;const page=await pdf.getPage(i);const content=await page.getTextContent();
        const text=content.items.map(it=>it.str).join(' ').replace(/\s+/g,' ').trim();
        if(text){parts.push(`--- Page ${i} ---\n${text}`);chars+=text.length}}
      st.textContent='';
      if(!parts.length){out.append(h('p',{class:'error',role:'alert'},'This PDF appears to contain no selectable text. It may be scanned/image-only. OCR is not available in this browser-only tool.'));ta.value='';return}
      const full=parts.join('\n\n');ta.value=full;
      const words=full.split(/\s+/).filter(Boolean).length;
      out.append(h('p',{},`${pdf.numPages} page(s) · ${chars.toLocaleString()} characters · ~${words.toLocaleString()} words`),
        h('div',{class:'row'},h('button',{type:'button',class:'btn secondary',onclick:async()=>{st.textContent=(await copyText(full))?'Copied!':'Copy failed';setTimeout(()=>st.textContent='',2e3)}},'Copy Text'),
          h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const blob=new Blob([full],{type:'text/plain'});const u=URL.createObjectURL(blob);const a=h('a',{href:u,download:'toolboxy-pdf-text.txt'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2e3)}},'Download TXT'),st))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Extraction failed'));st.textContent=''}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Extract Text'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;info.textContent='';ta.value='';out.replaceChildren()}},'Clear')),
    h('div',{class:'field'},h('label',{for:'txt'},'Extracted text'),ta));
  form.addEventListener('submit',e=>{e.preventDefault();extract()});
  root.replaceChildren(h('p',{class:'note'},'Text is extracted in your browser. Scanned/image-only PDFs have no selectable text; OCR is not included.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a text-based PDF and extract.'))},

'pdf-page-extractor':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  let file=null,pageCount=0;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const range=h('input',{id:'range',type:'text',placeholder:'e.g. 1-3, 5, 7-9'});
  const parseRange=(s,max)=>{const set=new Set();
    s.split(',').map(x=>x.trim()).filter(Boolean).forEach(part=>{
      if(/^\d+$/.test(part)){const n=+part;if(n<1||n>max)err(`Page ${n} out of range (1–${max})`);set.add(n)}
      else if(/^(\d+)-(\d+)$/.test(part)){let[,a,b]=part.match(/^(\d+)-(\d+)$/);a=+a;b=+b;if(a>b)[a,b]=[b,a];if(a<1||b>max)err(`Range ${part} out of range`);for(let i=a;i<=b;i++)set.add(i)}
      else err(`Invalid range “${part}”`)});
    if(!set.size)err('Enter at least one page or range');return[...set].sort((a,b)=>a-b)};
  input.addEventListener('change',async()=>{file=input.files[0]||null;pageCount=0;info.textContent='';out.replaceChildren();
    if(!file)return;try{const {PDFDocument}=await loadPdf();const doc=await PDFDocument.load(await file.arrayBuffer());pageCount=doc.getPageCount();
      info.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB · ${pageCount} page${pageCount===1?'':'s'}`}catch{out.append(h('p',{class:'error',role:'alert'},'Could not read this PDF.'));file=null}});
  const extract=async()=>{out.replaceChildren();if(!file||!pageCount){out.append(h('p',{class:'error',role:'alert'},'Choose a PDF first.'));return}
    try{const pages=parseRange(range.value.trim(),pageCount);const {PDFDocument}=await loadPdf();
      const src=await PDFDocument.load(await file.arrayBuffer());const outDoc=await PDFDocument.create();
      const copied=await outDoc.copyPages(src,pages.map(p=>p-1));copied.forEach(p=>outDoc.addPage(p));
      const bytes=await outDoc.save();const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Extracted ${pages.length} page(s): ${pages.join(', ')} · ${(blob.size/1024).toFixed(1)} KB`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-extracted-pages.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Failed'))}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'field'},h('label',{for:'range'},'Pages to extract (e.g. 1, 1-3, 1,3-5)'),range),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Extract Pages'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;pageCount=0;range.value='';info.textContent='';out.replaceChildren()}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();extract()});
  root.replaceChildren(h('p',{class:'note'},'Page extraction runs entirely in your browser. Your file is never uploaded.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a PDF and enter page numbers or ranges.'))},

'pdf-rotate':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  let file=null,pageCount=0;
  const info=h('p',{class:'note',role:'status'}),out=h('div',{class:'result','aria-live':'polite'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const angle=h('select',{id:'ang'},[['90','90° clockwise'],['180','180°'],['270','270° clockwise']].map(([v,l])=>h('option',{value:v},l)));
  const pagesIn=h('input',{id:'pages',type:'text',placeholder:'all, or 1,2,5-8'});
  input.addEventListener('change',async()=>{file=input.files[0]||null;pageCount=0;info.textContent='';out.replaceChildren();
    if(!file)return;try{const {PDFDocument}=await loadPdf();const doc=await PDFDocument.load(await file.arrayBuffer());pageCount=doc.getPageCount();
      info.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB · ${pageCount} page${pageCount===1?'':'s'}`}catch{out.append(h('p',{class:'error',role:'alert'},'Could not read this PDF.'));file=null}});
  const parsePages=(s,max)=>{if(!s||/^all$/i.test(s.trim()))return Array.from({length:max},(_,i)=>i+1);
    const set=new Set();s.split(',').map(x=>x.trim()).filter(Boolean).forEach(part=>{
      if(/^\d+$/.test(part)){const n=+part;if(n<1||n>max)err(`Page ${n} out of range`);set.add(n)}
      else if(/^(\d+)-(\d+)$/.test(part)){let[,a,b]=part.match(/^(\d+)-(\d+)$/);a=+a;b=+b;if(a>b)[a,b]=[b,a];for(let i=a;i<=b;i++){if(i<1||i>max)err('Range out of bounds');set.add(i)}}
      else err(`Invalid “${part}”`)});
    if(!set.size)err('Enter pages or all');return[...set]};
  const rotate=async()=>{out.replaceChildren();if(!file||!pageCount){out.append(h('p',{class:'error',role:'alert'},'Choose a PDF first.'));return}
    try{const pages=parsePages(pagesIn.value,pageCount);const deg=+angle.value;const {PDFDocument,degrees}=await loadPdf();
      const doc=await PDFDocument.load(await file.arrayBuffer());
      pages.forEach(p=>{const page=doc.getPage(p-1);page.setRotation(degrees((page.getRotation().angle+deg)%360))});
      const bytes=await doc.save();const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Rotated ${pages.length} page(s) by ${deg}° · ${(blob.size/1024).toFixed(1)} KB`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-rotated.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Failed'))}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('div',{class:'field'},h('label',{for:'pages'},'Pages (all or 1,2,5-8)'),pagesIn),
    h('div',{class:'field'},h('label',{for:'ang'},'Rotation'),angle),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Rotate PDF'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;pageCount=0;pagesIn.value='';info.textContent='';out.replaceChildren()}},'Clear')));
  form.addEventListener('submit',e=>{e.preventDefault();rotate()});
  root.replaceChildren(h('p',{class:'note'},'Rotation is applied in your browser. Your PDF is never uploaded.'),form,out);
  out.append(h('p',{class:'muted'},'Choose a PDF, select pages and angle.'))},

'pdf-page-reorder':()=>{
  const loadPdf=()=>new Promise((res,rej)=>{if(window.PDFLib)return res(window.PDFLib);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>res(window.PDFLib);s.onerror=()=>rej(new Error('Could not load PDF library.'));document.head.append(s)});
  let file=null,order=[];
  const info=h('p',{class:'note',role:'status'}),list=h('div',{class:'file-list','aria-live':'polite'}),out=h('div',{class:'result','aria-live':'polite'});
  const input=h('input',{id:'pdf',type:'file',accept:'application/pdf,.pdf'});
  const render=()=>{list.replaceChildren();if(!order.length){list.append(h('p',{class:'muted'},'Load a PDF to see pages.'));return}
    order.forEach((p,i)=>{list.append(h('div',{class:'row',style:'align-items:center;gap:.5rem;margin:.35rem 0;flex-wrap:wrap'},
      h('span',{},`Position ${i+1}: Page ${p}`),
      h('button',{type:'button',class:'btn secondary','aria-label':`Move page ${p} up`,onclick:()=>{if(i>0){[order[i-1],order[i]]=[order[i],order[i-1]];render()}}},'↑'),
      h('button',{type:'button',class:'btn secondary','aria-label':`Move page ${p} down`,onclick:()=>{if(i<order.length-1){[order[i+1],order[i]]=[order[i],order[i+1]];render()}}},'↓'),
      h('button',{type:'button',class:'btn secondary','aria-label':`Remove page ${p}`,onclick:()=>{order.splice(i,1);render()}},'Remove')))})};
  input.addEventListener('change',async()=>{file=input.files[0]||null;order=[];info.textContent='';out.replaceChildren();render();
    if(!file)return;try{const {PDFDocument}=await loadPdf();const doc=await PDFDocument.load(await file.arrayBuffer());const n=doc.getPageCount();
      order=Array.from({length:n},(_,i)=>i+1);info.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB · ${n} pages`;render()}catch{out.append(h('p',{class:'error',role:'alert'},'Could not read this PDF.'));file=null}});
  const buildPdf=async()=>{out.replaceChildren();if(!file||!order.length){out.append(h('p',{class:'error',role:'alert'},'Load a PDF and keep at least one page.'));return}
    try{const {PDFDocument}=await loadPdf();const src=await PDFDocument.load(await file.arrayBuffer());const outDoc=await PDFDocument.create();
      const copied=await outDoc.copyPages(src,order.map(p=>p-1));copied.forEach(p=>outDoc.addPage(p));
      const bytes=await outDoc.save();const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);
      try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-generate')}catch(e){}
      out.append(h('p',{},`Reordered PDF · ${order.length} page(s) · ${(blob.size/1024).toFixed(1)} KB`),
        h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('pdf-download')}catch(e){}const a=h('a',{href:url,download:'toolboxy-reordered.pdf'});document.body.append(a);a.click();a.remove()}},'Download PDF'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Failed'))}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'pdf'},'Choose a PDF'),input,info),
    h('p',{class:'note'},'Reorder pages with ↑ ↓ or remove pages from the output:'),list,
    h('div',{class:'row'},h('button',{type:'button',class:'btn',onclick:buildPdf},'Generate Reordered PDF'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{input.value='';file=null;order=[];info.textContent='';render();out.replaceChildren()}},'Clear')));
  root.replaceChildren(h('p',{class:'note'},'Page reordering runs in your browser. Your file is never uploaded.'),form,out);
  render();out.append(h('p',{class:'muted'},'Load a PDF, reorder or remove pages, then generate.'))},

/* IMAGE TOOLS */
'webp-to-jpg':()=>img([{id:'q',label:'JPG quality (10–100)',type:'number',value:90,min:10,max:100,step:'1'}],async(v,i)=>{
  if(!/webp/i.test(v.file.type)&&!/\.webp$/i.test(v.file.name))err('Please choose a WebP image.');
  const q=N(v.q,'quality',10,100);const[c,x]=cvs(i.width,i.height,'image/jpeg');x.drawImage(i,0,0);
  return done(c,'image/jpeg',q/100,v.file,'converted','\nTransparent areas were filled with white (JPG does not support transparency).')},'Convert to JPG'),

'jpg-to-webp':()=>img([{id:'q',label:'WebP quality (10–100)',type:'number',value:80,min:10,max:100,step:'1'}],async(v,i)=>{
  if(!/jpe?g/i.test(v.file.type)&&!/\.jpe?g$/i.test(v.file.name))err('Please choose a JPG image.');
  const q=N(v.q,'quality',10,100);const[c,x]=cvs(i.width,i.height,'image/webp');x.drawImage(i,0,0);
  const r=await done(c,'image/webp',q/100,v.file,'converted');const o=v.file.size,n=r.blob.size;
  r.text+=`\nOriginal: ${(o/1024).toFixed(1)} KB → Output: ${(n/1024).toFixed(1)} KB`;return r},'Convert to WebP'),

'png-to-webp':()=>img([{id:'q',label:'WebP quality (10–100, lower = smaller)',type:'number',value:80,min:10,max:100,step:'1'}],async(v,i)=>{
  if(v.file.type!=='image/png'&&!/\.png$/i.test(v.file.name))err('Please choose a PNG image.');
  const q=N(v.q,'quality',10,100);const[c,x]=cvs(i.width,i.height,'image/webp');x.drawImage(i,0,0);
  const r=await done(c,'image/webp',q/100,v.file,'converted');const o=v.file.size,n=r.blob.size;
  r.text+=`\nOriginal: ${(o/1024).toFixed(1)} KB → Output: ${(n/1024).toFixed(1)} KB\nTransparency is preserved when the browser supports it.`;return r},'Convert to WebP'),

'heic-to-jpg':()=>{
  const loadHeic=()=>new Promise((res,rej)=>{if(window.heic2any)return res(window.heic2any);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';s.onload=()=>res(window.heic2any);s.onerror=()=>rej(new Error('Could not load HEIC decoder. Check connection or try another browser.'));document.head.append(s)});
  let files=[];
  const list=h('div',{class:'file-list','aria-live':'polite'}),out=h('div',{class:'result','aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const input=h('input',{id:'heic',type:'file',accept:'.heic,.heif,image/heic,image/heif',multiple:''});
  const quality=h('input',{id:'q',type:'number',value:'90',min:'40',max:'100',step:'1'});
  const render=()=>{list.replaceChildren();if(!files.length){list.append(h('p',{class:'muted'},'No HEIC files yet.'));return}
    files.forEach((f,i)=>list.append(h('div',{class:'row',style:'align-items:center;gap:.5rem;margin:.3rem 0'},
      h('span',{},`${f.name} (${(f.size/1024).toFixed(1)} KB)`),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{files.splice(i,1);render()}},'Remove'))))};
  input.addEventListener('change',()=>{files=files.concat([...input.files]);input.value='';render()});
  const convert=async()=>{out.replaceChildren();if(!files.length){out.append(h('p',{class:'error',role:'alert'},'Add at least one HEIC/HEIF file.'));return}
    try{const heic2any=await loadHeic();const q=(+quality.value||90)/100;const results=[];
      for(let i=0;i<files.length;i++){const f=files[i];st.textContent=`Converting ${i+1}/${files.length}: ${f.name}…`;
        if(f.size>25*1024*1024){out.append(h('p',{class:'error',role:'alert'},`“${f.name}” is > 25 MB and may fail. Skipping.`));continue}
        let blob;try{blob=await heic2any({blob:f,toType:'image/jpeg',quality:q});if(Array.isArray(blob))blob=blob[0]}catch(e){out.append(h('p',{class:'error',role:'alert'},`Could not convert “${f.name}”. This browser may not support this HEIC variant.`));continue}
        const url=URL.createObjectURL(blob);const name=`toolboxy-${f.name.replace(/\.(heic|heif)$/i,'')}.jpg`;
        results.push({blob,url,name});
        out.append(h('div',{style:'margin:.5rem 0'},h('img',{src:url,alt:name,style:'max-width:200px;border-radius:6px'}),h('br'),
          h('button',{type:'button',class:'btn secondary',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('image-download')}catch(e){}const a=h('a',{href:url,download:name});document.body.append(a);a.click();a.remove()}},`Download ${name}`)))}
      st.textContent=results.length?`Done · ${results.length} file(s)`:'';
      if(results.length>1)out.append(h('button',{type:'button',class:'btn',onclick:()=>{try{window.ToolBoxyAds&&window.ToolBoxyAds.showSmartlinkAd&&window.ToolBoxyAds.showSmartlinkAd('image-download')}catch(e){}results.forEach(({url,name})=>{const a=h('a',{href:url,download:name});document.body.append(a);a.click();a.remove()})}},'Download All'))}catch(e){out.append(h('p',{class:'error',role:'alert'},e.message||'Conversion failed'));st.textContent=''}};
  const form=h('form',{class:'tool-form',novalidate:''},
    h('div',{class:'field drop'},h('label',{for:'heic'},'Choose HEIC/HEIF photos'),input,h('p',{class:'note'},'iPhone photos in HEIC format. Processing is local.'),list),
    h('div',{class:'field'},h('label',{for:'q'},'JPG quality (40–100)'),quality),
    h('div',{class:'row'},h('button',{type:'submit',class:'btn'},'Convert to JPG'),
      h('button',{type:'button',class:'btn secondary',onclick:()=>{files=[];render();out.replaceChildren();st.textContent=''}},'Clear')),st);
  form.addEventListener('submit',e=>{e.preventDefault();convert()});
  root.replaceChildren(h('p',{class:'note'},'HEIC conversion runs in your browser via a local decoder. Files are never uploaded. Some older browsers may not support HEIC.'),form,out);
  render();out.append(h('p',{class:'muted'},'Add HEIC files and convert.'))},

'image-metadata-remover':()=>img([],async(v,i)=>{
  const type=v.file.type||'image/jpeg';const outType=/png/i.test(type)?'image/png':/webp/i.test(type)?'image/webp':'image/jpeg';
  const[c,x]=cvs(i.width,i.height,outType);x.drawImage(i,0,0);
  const r=await done(c,outType,outType==='image/jpeg'?0.92:0.92,v.file,'clean');
  r.text+=`\nMetadata (EXIF/GPS/etc.) is stripped by re-encoding through canvas. Original file is unchanged.`;
  return r},'Remove metadata & download'),

'image-resolution-changer':()=>img([
  num('w','Width (px)',{step:'1',placeholder:'e.g. 1920'}),
  num('h','Height (px)',{step:'1',placeholder:'e.g. 1080'}),
  {id:'k',label:'Keep aspect ratio',type:'checkbox',value:true},
  sel('preset','Preset (optional)',[['','Custom'],['1920x1080','1920 × 1080'],['1280x720','1280 × 720'],['800x600','800 × 600'],['640x480','640 × 480']],'')],
  async(v,i)=>{
    let w=0,hh=0;
    if(v.preset){const[a,b]=v.preset.split('x').map(Number);w=a;hh=b}
    else{w=v.w?N(v.w,'width'):0;hh=v.h?N(v.h,'height'):0}
    if(!w&&!hh)err('Enter width and/or height, or pick a preset.');
    if(v.k){if(w)hh=Math.round(i.height*w/i.width);else w=Math.round(i.width*hh/i.height)}
    else if(!w||!hh)err('Enter both dimensions, or enable Keep aspect ratio.');
    const type=v.file.type||'image/png';const outType=/jpe?g/i.test(type)?'image/jpeg':/webp/i.test(type)?'image/webp':'image/png';
    const[c,x]=cvs(Math.round(w),Math.round(hh),outType);x.drawImage(i,0,0,c.width,c.height);
    const r=await done(c,outType,0.92,v.file,'resized');
    r.text+=`\nOriginal: ${i.width} × ${i.height} px → New: ${c.width} × ${c.height} px\nNote: Changing pixel dimensions resamples the image. DPI/PPI metadata is separate and is not increased to create detail.`;
    return r},'Change resolution'),

/* DEVELOPER TOOLS */
'json-to-csv':()=>build([TA({label:'JSON input (array of objects)',placeholder:'[{"name":"Alice","age":30},{"name":"Bob","age":25}]',rows:10})],v=>{
  need(v.text);let data;try{data=JSON.parse(v.text)}catch(e){err('Invalid JSON: '+e.message)}
  if(!Array.isArray(data)){if(data&&typeof data==='object')data=[data];else err('JSON must be an array of objects (or a single object).')}
  if(!data.length)err('Array is empty.');
  const flat=o=>{const out={};const walk=(obj,pref='')=>{Object.keys(obj||{}).forEach(k=>{const key=pref?pref+'.'+k:k;const val=obj[k];
    if(val!==null&&typeof val==='object'&&!Array.isArray(val))walk(val,key);else out[key]=Array.isArray(val)?JSON.stringify(val):val})};walk(o);return out};
  const rows=data.map(flat);const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const esc=s=>{const t=String(s??'');return /[",\n\r]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t};
  const csv=[keys.join(',')].concat(rows.map(r=>keys.map(k=>esc(r[k])).join(','))).join('\n');
  return{text:csv}},{ta:1,action:'Convert to CSV',download:'toolboxy-data.csv',reset:'Clear',note:'Nested objects are flattened with dot keys. Arrays become JSON strings.'}),

'json-to-yaml':()=>{
  const loadYaml=()=>new Promise((res,rej)=>{if(window.jsyaml)return res(window.jsyaml);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';s.onload=()=>res(window.jsyaml);s.onerror=()=>rej(new Error('Could not load YAML library.'));document.head.append(s)});
  build([TA({label:'JSON input',placeholder:'{"name":"ToolBoxy","tools":54}',rows:10})],async v=>{
    need(v.text);let data;try{data=JSON.parse(v.text)}catch(e){err('Invalid JSON: '+e.message)}
    const yaml=await loadYaml();return{text:yaml.dump(data,{indent:2,lineWidth:100})}},{ta:1,action:'Convert to YAML',download:'toolboxy-output.yaml',reset:'Clear'})},

'yaml-to-json':()=>{
  const loadYaml=()=>new Promise((res,rej)=>{if(window.jsyaml)return res(window.jsyaml);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';s.onload=()=>res(window.jsyaml);s.onerror=()=>rej(new Error('Could not load YAML library.'));document.head.append(s)});
  build([TA({label:'YAML input',placeholder:'name: ToolBoxy\ntools: 54',rows:10})],async v=>{
    need(v.text);const yaml=await loadYaml();let data;try{data=yaml.load(v.text)}catch(e){err('Invalid YAML: '+e.message)}
    return{text:JSON.stringify(data,null,2)}},{ta:1,action:'Convert to JSON',download:'toolboxy-output.json',reset:'Clear'})},

'html-to-markdown':()=>{
  const loadTd=()=>new Promise((res,rej)=>{if(window.TurndownService)return res(window.TurndownService);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/turndown@7.2.0/dist/turndown.js';s.onload=()=>res(window.TurndownService);s.onerror=()=>rej(new Error('Could not load Turndown.'));document.head.append(s)});
  build([TA({label:'HTML input',placeholder:'<h1>Hello</h1><p>World</p>',rows:10})],async v=>{
    need(v.text);const TD=await loadTd();const td=new TD({headingStyle:'atx',codeBlockStyle:'fenced'});
    return{text:td.turndown(v.text)}},{ta:1,action:'Convert to Markdown',download:'toolboxy-output.md',reset:'Clear'})},

'markdown-to-html':()=>{
  const loadMarked=()=>new Promise((res,rej)=>{if(window.marked)return res(window.marked);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js';s.onload=()=>res(window.marked);s.onerror=()=>rej(new Error('Could not load marked.'));document.head.append(s)});
  const sanitize=html=>{const d=document.createElement('div');d.innerHTML=html;
    d.querySelectorAll('script,iframe,object,embed,link,meta').forEach(el=>el.remove());
    d.querySelectorAll('*').forEach(el=>{[...el.attributes].forEach(a=>{if(/^on/i.test(a.name)||(/^(href|src)$/i.test(a.name)&&/^\s*javascript:/i.test(a.value)))el.removeAttribute(a.name)})});
    return d.innerHTML};
  build([TA({label:'Markdown input',placeholder:'# Hello\n\n**World**',rows:10})],async v=>{
    need(v.text);const marked=await loadMarked();const raw=marked.parse(v.text,{gfm:true,breaks:false});
    const safe=sanitize(raw);return{text:safe}},{ta:1,action:'Convert to HTML',download:'toolboxy-output.html',reset:'Clear',note:'Output HTML is sanitized (scripts and event handlers removed). Preview is not executed.'})},

'css-minifier':()=>build([TA({label:'CSS input',placeholder:'body {\n  color: red;\n  margin: 0;\n}',rows:12}),{id:'keep',label:'Keep important comments (/*! … */)',type:'checkbox',value:false}],v=>{
  need(v.text);let s=v.text;
  // Preserve strings and comments carefully
  const parts=[];s=s.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,m=>{parts.push(m);return `\x00${parts.length-1}\x00`});
  if(!v.keep)s=s.replace(/\x00(\d+)\x00/g,(m,i)=>{const p=parts[+i];return p.startsWith('/*')&&!p.startsWith('/*!')?'':m});
  s=s.replace(/\s+/g,' ').replace(/\s*([{}:;,>~+])\s*/g,'$1').replace(/;}/g,'}').replace(/^\s+|\s+$/g,'');
  s=s.replace(/\x00(\d+)\x00/g,(m,i)=>parts[+i]);
  const o=v.text.length,n=s.length;return{text:s,cards:[['Original',o+' chars'],['Minified',n+' chars'],['Saved',((1-n/o)*100).toFixed(1)+'%']]}},
  {ta:1,action:'Minify CSS',download:'toolboxy-minified.css',reset:'Clear',note:'Conservative minifier: whitespace and safe semicolons removed. Strings preserved.'}),

'js-minifier':()=>{
  const loadTerser=()=>new Promise((res,rej)=>{if(window.Terser)return res(window.Terser);const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/terser@5.31.0/dist/bundle.min.js';s.onload=()=>res(window.Terser);s.onerror=()=>rej(new Error('Could not load Terser.'));document.head.append(s)});
  build([TA({label:'JavaScript input',placeholder:'function hello() {\n  console.log("hi");\n}',rows:12})],async v=>{
    need(v.text);const Terser=await loadTerser();
    let result;try{result=await Terser.minify(v.text,{compress:true,mangle:true})}catch(e){err('Minify error: '+(e.message||e))}
    if(result.error)err('Minify error: '+result.error.message);
    const s=result.code||'';const o=v.text.length,n=s.length;
    return{text:s,cards:[['Original',o+' chars'],['Minified',n+' chars'],['Saved',o?((1-n/o)*100).toFixed(1)+'%':'0%']]}},
  {ta:1,action:'Minify JS',download:'toolboxy-minified.js',reset:'Clear',note:'Uses Terser in your browser. Your code is never executed or uploaded.'})},

'html-minifier':()=>build([TA({label:'HTML input',placeholder:'<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>',rows:12})],v=>{
  need(v.text);let s=String(v.text);
  const parts=[];
  try{
    s=s.replace(/<(script|style|pre|textarea|code)(\s[^>]*)?>[\s\S]*?<\/\1>/gi,m=>{parts.push(m);return '\x00'+String(parts.length-1)+'\x00'});
    s=s.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
    s=s.replace(/\x00(\d+)\x00/g,(m,i)=>parts[+i]||'');
  }catch(e){err('Could not minify this HTML. Check for unclosed tags in script/style blocks.');}
  const o=v.text.length,n=s.length;
  const saved=o>0?((1-n/o)*100).toFixed(1)+'%':'0%';
  return{text:s,cards:[['Original',o+' chars'],['Minified',n+' chars'],['Saved',saved]]}},
  {ta:1,action:'Minify HTML',download:'toolboxy-minified.html',reset:'Clear',note:'Whitespace and comments removed. Contents of script/style/pre/code preserved.'}),

'jwt-decoder':()=>{
  const b64url=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';try{return decodeURIComponent(atob(s).split('').map(c=>'%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))}catch{return atob(s)}};
  build([TA({label:'JWT token',placeholder:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.sig',rows:4})],v=>{
    need(v.text);const t=v.text.trim();const parts=t.split('.');
    if(parts.length<2)err('Malformed JWT: expected header.payload[.signature]');
    let header,payload;
    try{header=JSON.parse(b64url(parts[0]))}catch{err('Could not decode header (invalid Base64URL or JSON)')}
    try{payload=JSON.parse(b64url(parts[1]))}catch{err('Could not decode payload (invalid Base64URL or JSON)')}
    const lines=[];
    lines.push('=== HEADER ===');lines.push(JSON.stringify(header,null,2));
    lines.push('');lines.push('=== PAYLOAD ===');lines.push(JSON.stringify(payload,null,2));
    if(parts[2]){lines.push('');lines.push('=== SIGNATURE ===');lines.push(parts[2]);lines.push('(signature shown as-is; not verified)')}
    if(payload.exp!=null){const d=new Date(payload.exp*1000);const now=Date.now();lines.push('');lines.push('exp: '+d.toISOString()+(now>d.getTime()?' (EXPIRED)':' (valid until '+d.toLocaleString()+')'))}
    if(payload.iat!=null)lines.push('iat: '+new Date(payload.iat*1000).toISOString());
    if(payload.nbf!=null)lines.push('nbf: '+new Date(payload.nbf*1000).toISOString());
    return{text:lines.join('\n')}},{ta:1,action:'Decode JWT',reset:'Clear',note:'Decoding does NOT verify the signature. Never paste tokens you would not want exposed on this device. Nothing is uploaded or stored.'})}

};
try{(T[root.dataset.tool]||(()=>err('This tool could not be loaded.')))()}catch(e){root.replaceChildren(h('p',{class:'error',role:'alert'},e.message))}
})();
