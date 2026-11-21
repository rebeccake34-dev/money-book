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
    const light=`--accent:${c(h,sa,la)};--accent-soft:${c(h,Math.min(sa,70),92)};--bg:${c(h,Math.min(s,30),94)};--paper:${c(h,35,99)};--ink:${c(h,35,13)};--muted:${c(h,12,40)};--line:${c(h,22,86)};--accent-deep:${c(h,Math.max(sa,45),Math.max(la-15,16))};--sh:hsl(${h} 45% 22% / .14);--hi:rgba(255,255,255,.9);--trough:${c(h,Math.min(s,28),91.5)};--th:${h};--gold:hsl(36 62% 35%);--gold-soft:hsl(38 58% 91%);--bad:hsl(6 48% 46%);--bad-soft:hsl(8 58% 93.5%);--calm:${c(h+38,34,42)};--calm-soft:${c(h+38,42,93)};--cy-p:hsl(346 46% 50%);--cy-ps:hsl(346 55% 94%);--cy-f:${c(h+32,36,50)};--cy-fs:${c(h+32,42,92)};--cy-o:${c(h+58,36,46)};--cy-g:${c(h-36,34,40)};--cy-gs:${c(h-36,36,91)};--cy-l:hsl(36 52% 40%);--cy-ls:hsl(38 55% 90%);--bgbase:${c(h,Math.min(s,40),94)};--glass:hsl(${h} 45% 99% / .56);--glass-strong:hsl(${h} 45% 99% / .8);--glass-2:hsl(${h} 50% 100% / .55);--glass-in:hsl(${h} 50% 100% / .62);--glass-bar:hsl(${h} 40% 96% / .62);--glass-bd:rgba(255,255,255,.72);--glass-edge:hsl(${h} 35% 40% / .12);--glass-hi:rgba(255,255,255,.95);--glass-sheen:rgba(255,255,255,.55);--orb1:hsl(${h} 85% 68% / .5);--orb2:hsl(${h+45} 80% 72% / .42);--orb3:hsl(${h-55} 75% 74% / .36);`;
    const dark=`--accent:${c(h,Math.min(sa,75),66)};--accent-soft:${c(h,35,18)};--bg:${c(h,22,7.5)};--paper:${c(h,18,12.5)};--ink:${c(h,20,92)};--muted:${c(h,10,66)};--line:${c(h,15,21)};--accent-deep:${c(h,Math.min(sa,55),17)};--sh:rgba(0,0,0,.55);--hi:hsl(${h} 40% 90% / .06);--trough:${c(h,22,5.5)};--th:${h};--gold:hsl(38 62% 64%);--gold-soft:hsl(38 40% 16%);--bad:hsl(8 68% 70%);--bad-soft:hsl(8 34% 17%);--calm:${c(h+38,50,76)};--calm-soft:${c(h+38,28,19)};--cy-p:hsl(346 62% 72%);--cy-ps:hsl(346 32% 19%);--cy-f:${c(h+32,50,76)};--cy-fs:${c(h+32,28,20)};--cy-o:${c(h+58,50,74)};--cy-g:${c(h-36,42,66)};--cy-gs:${c(h-36,26,17)};--cy-l:hsl(38 58% 64%);--cy-ls:hsl(38 38% 16%);--bgbase:${c(h,24,7)};--glass:hsl(${h} 22% 16% / .52);--glass-strong:hsl(${h} 22% 13% / .82);--glass-2:hsl(${h} 25% 26% / .38);--glass-in:hsl(${h} 25% 8% / .45);--glass-bar:hsl(${h} 22% 9% / .6);--glass-bd:rgba(255,255,255,.12);--glass-edge:rgba(0,0,0,.35);--glass-hi:rgba(255,255,255,.16);--glass-sheen:rgba(255,255,255,.07);--orb1:hsl(${h} 70% 42% / .45);--orb2:hsl(${h+45} 60% 38% / .36);--orb3:hsl(${h-55} 55% 36% / .3);`;
    let st=document.getElementById("themeStyle");
    if(!st){st=document.createElement("style");st.id="themeStyle";document.body.appendChild(st)}
    // 新拟物 · 诧寂：米灰平面 + 一亮一暗两道柔和阴影；字是深灰和墨蓝（墨蓝跟主题色走，饱和度压低）
    const nu=`--bg:hsl(36 22% 89%);--paper:hsl(36 22% 89%);--bgbase:hsl(36 22% 89%);--ink:hsl(215 14% 30%);--muted:hsl(30 8% 50%);--line:hsl(32 16% 80%);--accent:${c(h,30,36)};--accent-soft:hsl(36 22% 86%);--accent-deep:${c(h,28,28)};--trough:hsl(36 18% 85%);--sh:hsl(30 20% 60% / .35);--hi:hsl(40 40% 98%);--gold:hsl(36 38% 40%);--gold-soft:hsl(38 32% 86%);--bad:hsl(14 38% 46%);--bad-soft:hsl(14 32% 87%);--calm:hsl(95 16% 38%);--calm-soft:hsl(95 16% 85%);--cy-p:hsl(350 28% 52%);--cy-ps:hsl(350 26% 87%);--cy-f:hsl(160 16% 40%);--cy-fs:hsl(160 14% 85%);--cy-o:hsl(40 30% 42%);--cy-g:hsl(200 18% 42%);--cy-gs:hsl(200 16% 86%);--cy-l:hsl(30 28% 44%);--cy-ls:hsl(30 26% 86%);--nu-d:hsl(32 18% 70% / .75);--nu-l:hsl(40 45% 98% / .95);--glass:var(--bg);--glass-strong:var(--bg);--glass-2:var(--bg);--glass-in:var(--bg);--glass-bar:var(--bg);--glass-bd:transparent;--glass-edge:transparent;--glass-hi:transparent;--glass-sheen:transparent;`;
    st.textContent=`:root{${light}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}:root[data-theme="dark"]{${dark}}:root[data-look="neu"]{${light}${nu}}`;
    const m=document.getElementById("metaTheme");if(m)m.content=document.documentElement.dataset.look==="neu"?"hsl(36 22% 89%)":c(h,Math.min(s,45),95);
    document.querySelectorAll(".sw").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.c.toLowerCase()===hex.toLowerCase())));
    const ci=document.getElementById("customColor");if(ci)ci.value=hex;
  }
  function choose(hex){put(hex);apply(hex)}
  const box=document.getElementById("swatches");
  if(box)PRESETS.forEach(([name,hex])=>{const b=document.createElement("button");b.type="button";b.className="sw";b.dataset.c=hex;b.style.background=hex;b.title=name;b.setAttribute("aria-label",name);b.onclick=()=>choose(hex);box.appendChild(b)});
  const ci=document.getElementById("customColor");
  if(ci)ci.addEventListener("input",e=>choose(e.target.value));
  // 界面风格：液态玻璃（原来的）/ 新拟物，存在这台设备上（以前选过的「毛玻璃」自动换成新拟物）
  const LK="ui-look";
  function look(){try{const v=localStorage.getItem(LK);if(v==="frost"){localStorage.setItem(LK,"neu");return "neu"}return v==="neu"?"neu":"liquid"}catch(e){return "liquid"}}
  function setLook(v){const r=document.documentElement;
    if(v==="neu"){r.dataset.look="neu";r.dataset.theme="light"}else{delete r.dataset.look;r.removeAttribute("data-theme")}
    document.querySelectorAll("#lookRow button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.look===v)));apply(get())}
  document.querySelectorAll("#lookRow button").forEach(b=>b.onclick=()=>{try{localStorage.setItem(LK,b.dataset.look)}catch(e){}setLook(b.dataset.look)});
  window.__look={get:look,set:v=>{try{localStorage.setItem(LK,v)}catch(e){}setLook(v)}};
  setLook(look());
})();