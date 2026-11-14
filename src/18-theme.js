(function(){
  const KEY="theme-color", DEF="#1f84cc";
  const PRESETS=[["天蓝","#1f84cc"],["湖水青","#128a8a"],["森林绿","#1f7a52"],["薰衣草","#6b5bc4"],["樱花粉","#c4487a"],["暖橙","#c2651a"]];
  function get(){try{return localStorage.getItem(KEY)||DEF}catch(e){return DEF}}
  function put(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function hsl(hex){
    const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
    if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
      h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
    return [Math.round(h),Math.round(s*100),Math.round(l*100)];
  }
  const c=(h,s,l)=>`hsl(${h} ${s}% ${l}%)`;
  function apply(hex){
    let [h,s,l]=hsl(hex);
    const la=Math.min(Math.max(l,26),44), sa=Math.max(s,30);
    const light=`--accent:${c(h,sa,la)};--accent-soft:${c(h,Math.min(sa,70),92)};--bg:${c(h,Math.min(s,45),95)};--paper:#ffffff;--ink:${c(h,30,12)};--muted:${c(h,12,40)};--line:${c(h,25,85)};`;
    const dark=`--accent:${c(h,Math.min(sa,75),66)};--accent-soft:${c(h,35,18)};--bg:${c(h,22,8)};--paper:${c(h,18,12)};--ink:${c(h,20,92)};--muted:${c(h,10,66)};--line:${c(h,15,22)};`;
    let st=document.getElementById("themeStyle");
    if(!st){st=document.createElement("style");st.id="themeStyle";document.body.appendChild(st)}
    st.textContent=`:root{${light}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}:root[data-theme="dark"]{${dark}}`;
    const m=document.getElementById("metaTheme");if(m)m.content=c(h,Math.min(s,45),95);
    document.querySelectorAll(".sw").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.c.toLowerCase()===hex.toLowerCase())));
    const ci=document.getElementById("customColor");if(ci)ci.value=hex;
  }
  function choose(hex){put(hex);apply(hex)}
  const box=document.getElementById("swatches");
  if(box)PRESETS.forEach(([name,hex])=>{const b=document.createElement("button");b.type="button";b.className="sw";b.dataset.c=hex;b.style.background=hex;b.title=name;b.setAttribute("aria-label",name);b.onclick=()=>choose(hex);box.appendChild(b)});
  const ci=document.getElementById("customColor");
  if(ci)ci.addEventListener("input",e=>choose(e.target.value));
  apply(get());
})();