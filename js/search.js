window.searchTools=(q,list=window.TOOLS)=>{const w=q.toLowerCase().split(/\s+/).filter(Boolean);if(!w.length)return list.slice();
return list.map(t=>{const hay=[t.name,t.category,t.description,...t.keywords].join(' ').toLowerCase();if(!w.every(x=>hay.includes(x)))return null;
return{t,s:w.some(x=>t.name.toLowerCase().includes(x))?3:w.some(x=>t.keywords.join(' ').includes(x))?2:1}}).filter(Boolean).sort((a,b)=>b.s-a.s||a.t.name.localeCompare(b.t.name)).map(x=>x.t)};
(()=>{const inp=$('#hero-search'),ul=$('#hero-results'),st=$('#hero-status');if(!inp)return;const R=document.body.dataset.root||'';
const go=()=>{const q=inp.value.trim();ul.replaceChildren();if(!q){ul.hidden=true;st.textContent='';return}
const r=searchTools(q).slice(0,8);ul.hidden=false;st.textContent=`${r.length} tool${r.length===1?'':'s'} found`;
if(!r.length){ul.append(h('li',{},h('span',{class:'muted',style:'padding:.7rem 1rem;display:block'},'No tools found. Try another word.')));return}
r.forEach(t=>ul.append(h('li',{},h('a',{href:`/tools/${t.slug}`},t.name,h('small',{},`${t.category} · ${t.description}`)))))};
inp.addEventListener('input',go);
inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){const a=$('a',ul);if(a){e.preventDefault();a.focus()}}else if(e.key==='Enter'){const a=$('a',ul);if(a)location.href=a.href}else if(e.key==='Escape'){inp.value='';go()}});
ul.addEventListener('keydown',e=>{const a=$$('a',ul),i=a.indexOf(document.activeElement);if(e.key==='ArrowDown'&&a[i+1]){e.preventDefault();a[i+1].focus()}if(e.key==='ArrowUp'){e.preventDefault();(a[i-1]||inp).focus()}if(e.key==='Escape')inp.focus()});
$$('.chip').forEach(c=>c.addEventListener('click',()=>{inp.value=c.dataset.q;go();inp.focus()}));})();
