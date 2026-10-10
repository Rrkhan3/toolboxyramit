(()=>{const K='toolboxy-theme',r=document.documentElement,b=document.getElementById('theme-btn');
const get=()=>{try{return localStorage.getItem(K)}catch{return null}};
const sys=()=>matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
const apply=t=>{r.dataset.theme=t;if(b)b.setAttribute('aria-pressed',String(t==='dark'))};
apply(get()||sys());
if(b)b.addEventListener('click',()=>{const t=r.dataset.theme==='dark'?'light':'dark';apply(t);try{localStorage.setItem(K,t)}catch{}});})();
