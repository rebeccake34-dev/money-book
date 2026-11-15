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
    const light=`--accent:${c(h,sa,la)};--accent-soft:${c(h,Math.min(sa,70),92)};--bg:${c(h,Math.min(s,30),94)};--paper:${c(h,35,99)};--ink:${c(h,35,13)};--muted:${c(h,12,40)};--line:${c(h,22,86)};--accent-deep:${c(h,Math.max(sa,45),Math.max(la-15,16))};--sh:hsl(${h} 45% 22% / .14);--hi:rgba(255,255,255,.9);--trough:${c(h,Math.min(s,28),91.5)};--th:${h};--gold:hsl(36 62% 35%);--gold-soft:hsl(38 58% 91%);--bad:hsl(6 48% 46%);--bad-soft:hsl(8 58% 93.5%);--calm:${c(h+38,34,42)};--calm-soft:${c(h+38,42,93)};--cy-p:hsl(346 46% 50%);--cy-ps:hsl(346 55% 94%);--cy-f:${c(h+32,36,50)};--cy-fs:${c(h+32,42,92)};--cy-o:${c(h+58,36,46)};--cy-g:${c(h-36,34,40)};--cy-gs:${c(h-36,36,91)};--cy-l:hsl(36 52% 40%);--cy-ls:hsl(38 55% 90%);`;
    const dark=`--accent:${c(h,Math.min(sa,75),66)};--accent-soft:${c(h,35,18)};--bg:${c(h,22,7.5)};--paper:${c(h,18,12.5)};--ink:${c(h,20,92)};--muted:${c(h,10,66)};--line:${c(h,15,21)};--accent-deep:${c(h,Math.min(sa,55),17)};--sh:rgba(0,0,0,.55);--hi:hsl(${h} 40% 90% / .06);--trough:${c(h,22,5.5)};--th:${h};--gold:hsl(38 62% 64%);--gold-soft:hsl(38 40% 16%);--bad:hsl(8 68% 70%);--bad-soft:hsl(8 34% 17%);--calm:${c(h+38,50,76)};--calm-soft:${c(h+38,28,19)};--cy-p:hsl(346 62% 72%);--cy-ps:hsl(346 32% 19%);--cy-f:${c(h+32,50,76)};--cy-fs:${c(h+32,28,20)};--cy-o:${c(h+58,50,74)};--cy-g:${c(h-36,42,66)};--cy-gs:${c(h-36,26,17)};--cy-l:hsl(38 58% 64%);--cy-ls:hsl(38 38% 16%);`;
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