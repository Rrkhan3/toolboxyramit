window.$=(s,r=document)=>r.querySelector(s);
window.$$=(s,r=document)=>[...r.querySelectorAll(s)];
window.h=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k==='class')e.className=v;else if(v!==false&&v!=null)e.setAttribute(k,v)}kids.flat().forEach(c=>c!=null&&e.append(c.nodeType?c:document.createTextNode(String(c))));return e};
window.fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d});
window.copyText=async t=>{try{await navigator.clipboard.writeText(t);return true}catch{const a=h('textarea',{style:'position:fixed;opacity:0'});a.value=t;document.body.append(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch{}a.remove();return ok}};
