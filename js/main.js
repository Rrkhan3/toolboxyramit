(()=>{const R=document.body.dataset.root||'',T=window.TOOLS,C=window.CATEGORIES;
const icon=n=>(C.find(c=>c.name===n)||{}).icon||'🧰';
const card=t=>h('article',{class:'card'},h('div',{class:'card-icon','aria-hidden':'true'},icon(t.category)),h('h3',{},t.name),h('p',{},t.description),h('p',{class:'meta'},t.category),h('a',{class:'btn secondary',href:`/tools/${t.slug}`,'aria-label':`Use ${t.name}`},'Use Tool'));
const mb=$('#menu-btn'),nav=$('#site-nav');
if(mb)mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',String(o))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav&&nav.classList.contains('open')){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.focus()}});
$$('[data-tools]').forEach(el=>{let l=T.filter(t=>(!el.dataset.popular||t.popular)&&(!el.dataset.skipPopular||!t.popular));if(el.dataset.limit)l=l.slice(0,+el.dataset.limit);l.forEach(t=>el.append(card(t)))});
$$('[data-categories]').forEach(el=>C.forEach(c=>el.append(h('article',{class:'card'},h('div',{class:'card-icon','aria-hidden':'true'},c.icon),h('h3',{},c.name),h('p',{},c.description),h('p',{class:'meta'},`${T.filter(t=>t.category===c.name).length} tools`),h('a',{class:'btn secondary',href:`/tools?category=${encodeURIComponent(c.name)}`,'aria-label':`View ${c.name}`},'View Tools')))));
$$('[data-count]').forEach(el=>el.textContent=T.filter(t=>t.category===el.dataset.count).length);
$$('[data-total]').forEach(el=>el.textContent=T.length);
const app=$('#tools-app');
if(app){const q=$('#tq'),cat=$('#tcat'),pop=$('#tpop'),so=$('#tsort'),out=$('#tresults');
C.forEach(c=>cat.append(h('option',{value:c.name},c.name)));
const p=new URLSearchParams(location.search);if(p.get('category'))cat.value=p.get('category');if(p.get('popular')==='1')pop.checked=true;if(p.has('focus'))q.focus();
const run=()=>{let l=searchTools(q.value.trim());if(cat.value)l=l.filter(t=>t.category===cat.value);if(pop.checked)l=l.filter(t=>t.popular);
l.sort((a,b)=>so.value==='za'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));out.replaceChildren();
if(!l.length){out.append(h('p',{class:'muted'},'No tools match your search. Try a different word or clear the filters.'));return}
C.forEach(c=>{const g=l.filter(t=>t.category===c.name);if(!g.length)return;out.append(h('h2',{},c.name),h('div',{class:'grid'},g.map(card)))})};
[q,cat,pop,so].forEach(e=>e.addEventListener('input',run));run()}
const f=$('#contact-form');
if(f){const st=$('#contact-status'),btn=$('#cf-submit'),nt=$('#contact-notice'),ep=(f.dataset.endpoint||'').trim(),mail=(f.dataset.email||'').trim();
const set=(t,c)=>{st.textContent=t;st.className='cf-status '+(c||'')};
const fe=(id,msg)=>{const e=$('#'+id+'-e'),i=$('#'+({cn:'cn',ce:'ce',cm:'cm'}[id]));e.hidden=!msg;e.textContent=msg||'';i.setAttribute('aria-invalid',msg?'true':'false');if(msg)i.setAttribute('aria-describedby',id+'-e');return!msg};
if(!ep&&!mail){$$('input,textarea,button',f).forEach(x=>x.disabled=true);nt.hidden=false;nt.className='cf-notice';nt.textContent='Contact form is currently unavailable. Please check back later.'}
f.addEventListener('submit',async e=>{e.preventDefault();if(f.querySelector('[name=_gotcha]').value)return;set('');
const n=$('#cn').value.trim(),m=$('#ce').value.trim(),g=$('#cm').value.trim();
const v=[fe('cn',n.length<2?'Please enter your name.':''),fe('ce',!m?'Please enter your email.':!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)?'Please enter a valid email address.':''),fe('cm',g.length<10?'Please enter a message (at least 10 characters).':'')];
if(v.includes(false)){set('Please fix the highlighted fields.','err');return}
if(!ep){location.href='mailto:'+mail+'?subject='+encodeURIComponent('ToolBoxy contact from '+n)+'&body='+encodeURIComponent(g+'\n\n'+n+' <'+m+'>');set('Your email app should open. If it does not, please email us directly.','ok');return}
btn.disabled=true;btn.textContent='Sending…';set('Sending your message…');
try{const r=await fetch(ep,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});if(r.ok){set('Thank you! Your message was sent.','ok');f.reset()}else set('Sorry, your message could not be sent. Please try again later.','err')}catch{set('Network error. Please check your connection and try again.','err')}
btn.disabled=false;btn.textContent='Send message'})}
})();
