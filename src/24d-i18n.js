/* 中英文切换。页面本身按中文写；切到 English 时，把屏幕上的中文片段按 24c-i18n-dict.js 的表换成英文。
   一段文字里只要有一处查不到，就整段保留中文（避免把你自己写的内容翻得乱七八糟）。选择存在这台设备上。 */
(function(){
  var KEY="app-lang",D=window.__I18N_EN||{};
  var lang="zh";try{lang=localStorage.getItem(KEY)==="en"?"en":"zh"}catch(e){}
  var RUN=/[　-〿一-鿿＀-￯·“”‘’—…、]+/g,HAN=/[一-鿿]/;
  var EDGE=/^[，。、：；！？ ·（）「」]+|[，。、：；！？ ·（）「」]+$/g;
  var PUN={"，":", ","。":". ","、":", ","：":": ","；":"; ","！":"! ","？":"? ","（":" (","）":") ","「":"“","」":"”","·":" · ","…":"…","—":"—","＋":"+","％":"%","／":"/","＞":">","＜":"<","～":"~","　":" "};
  var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var cache=new Map(),MAXK=0;for(var k in D)if(k.length>MAXK)MAXK=k.length;MAXK=Math.min(MAXK,60);
  function pun(s){return s.replace(/[，。、：；！？（）「」·…—＋％／＞＜～　]/g,function(c){return PUN[c]||c})}
  function seg(core){ // greedy longest match over the dictionary
    if(core in D)return D[core];
    var out=[],i=0,n=core.length;
    while(i<n){var c=core[i];
      if(!HAN.test(c)){out.push(pun(c));i++;continue}
      var hit=null,j=Math.min(n,i+MAXK);
      for(;j>i;j--){var s=core.slice(i,j);if(s in D){hit=D[s];break}}
      if(hit==null)return null;
      if(hit)out.push(hit);i=j}
    return out.join(" ");}
  function dates(s){
    return s.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g,function(m,y,mo,d){return MON[mo-1]+" "+(+d)+", "+y})
      .replace(/(\d{4})年(\d{1,2})月/g,function(m,y,mo){return MON[mo-1]+" "+y})
      .replace(/(\d{1,2})月(\d{1,2})日/g,function(m,mo,d){return MON[mo-1]?MON[mo-1]+" "+(+d):m})
      .replace(/(\d{1,2})月(?=\s|$|[^一-鿿])/g,function(m,mo){return MON[mo-1]||m})
      .replace(/(\d{1,2})月/g,function(m,mo){return MON[mo-1]?MON[mo-1]+" ":m})
      .replace(/(\d{4})年/g,"$1").replace(/(\d{1,2})日/g,"$1");}
  function tr(src){
    if(!src||!HAN.test(src))return src;
    if(cache.has(src))return cache.get(src);
    var s=dates(src),fail=false,res="",last=0;
    s.replace(RUN,function(run,off){
      if(fail)return run;
      var pre=s.slice(last,off);last=off+run.length;
      var core=run.replace(EDGE,""),a=run.match(/^[，。、：；！？ ·（）「」]+/),b=run.match(/[，。、：；！？ ·（）「」]+$/);
      var t;
      if(!core)t=pun(run);
      else if(!HAN.test(core))t=pun(run);
      else{var x=seg(core);if(x==null){fail=true;return run}t=(a?pun(a[0]):"")+x+(core===run?"":(b&&core.length<run.length?pun(b[0]):""))}
      // spaces where an English word meets a number or another word
      if(res&&/[A-Za-z0-9$%)\]]$/.test(res+pre)&&/^[A-Za-z0-9(]/.test(t))t=" "+t;
      res+=pre+t;return run});
    if(fail){cache.set(src,src);return src}
    var tail=s.slice(last);if(/[A-Za-z)]$/.test(res)&&/^[A-Za-z0-9$]/.test(tail))tail=" "+tail;res+=tail;
    res=res.replace(/ {2,}/g," ").replace(/ ([,.;:!?)])/g,"$1").replace(/\( /g,"(").replace(/:\s*$/,":");
    if(!/\s$/.test(src))res=res.replace(/\s+$/,"");if(!/^\s/.test(src))res=res.replace(/^\s+/,"");
    cache.set(src,res);return res;}
  window.__tr=function(s){return lang==="en"?tr(s):s};

  var TXT=new WeakMap(),ATT=new WeakMap(),touched=new Set(),ATTRS=["placeholder","aria-label","title"];
  var SKIP=/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/;
  function skipEl(el){for(var e=el;e&&e!==document.body;e=e.parentElement){if(SKIP.test(e.tagName)||e.isContentEditable||e.hasAttribute&&e.hasAttribute("data-noi18n")||e.classList&&e.classList.contains("note-text"))return true}return false}
  function doText(n){var st=TXT.get(n);if(st&&n.data===st.out)return;
    var src=n.data;if(!HAN.test(src)){if(st)TXT.delete(n);return}
    if(skipEl(n.parentElement))return;
    var out=tr(src);
    if(out!==src&&!n.previousSibling&&/^\s*[\u4e00-\u9fff]/.test(src))out=out.replace(/^(\s*)([a-z])/,function(m,w,c){return w+c.toUpperCase()});
    TXT.set(n,{src:src,out:out});touched.add(n);if(out!==src)n.data=out;}
  function doAttrs(el){if(el.nodeType!==1||skipEl(el))return;var m=ATT.get(el);
    ATTRS.forEach(function(a){var v=el.getAttribute(a);if(v==null||!HAN.test(v)){return}
      if(m&&m[a]&&m[a].out===v)return;var out=tr(v);if(!m){m={};ATT.set(el,m)}m[a]={src:v,out:out};touched.add(el);if(out!==v)el.setAttribute(a,out);});}
  function walk(root){
    if(root.nodeType===3){doText(root);return}
    if(root.nodeType!==1||SKIP.test(root.tagName))return;
    doAttrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null),n;
    while((n=w.nextNode())){if(n.nodeType===3)doText(n);else if(!SKIP.test(n.tagName))doAttrs(n)}}
  var titleSrc=null;
  function doTitle(){var t=document.title;if(t&&HAN.test(t)){titleSrc=t;var o=tr(t);if(o!==t)document.title=o}}
  var mo=null,q=new Set(),sched=false;
  function flush(){sched=false;var list=Array.from(q);q.clear();list.forEach(function(n){if(n.isConnected)walk(n)});doTitle()}
  function start(){
    document.documentElement.lang="en";walk(document.body);doTitle();
    mo=new MutationObserver(function(ms){ms.forEach(function(m){
      if(m.type==="characterData")q.add(m.target);
      else if(m.type==="attributes")q.add(m.target);
      else m.addedNodes.forEach(function(n){q.add(n)});});
      if(!sched){sched=true;queueMicrotask(flush)}});
    mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});}
  function stop(){if(mo)mo.disconnect();mo=null;document.documentElement.lang="zh-CN";
    touched.forEach(function(n){if(!n.isConnected)return;
      if(n.nodeType===3){var st=TXT.get(n);if(st&&n.data===st.out)n.data=st.src;TXT.delete(n)}
      else{var m=ATT.get(n);if(m)for(var a in m){if(n.getAttribute(a)===m[a].out)n.setAttribute(a,m[a].src)}ATT.delete(n)}});
    touched.clear();if(titleSrc&&document.title===tr(titleSrc))document.title=titleSrc;}

  // switch button in the header
  var btn=document.createElement("button");btn.type="button";btn.id="langBtn";btn.className="lang-btn";btn.setAttribute("data-noi18n","");
  function label(){btn.textContent=lang==="en"?"中文":"EN";btn.setAttribute("aria-label",lang==="en"?"切换到中文":"Switch to English");btn.title=btn.getAttribute("aria-label")}
  btn.onclick=function(){lang=lang==="en"?"zh":"en";try{localStorage.setItem(KEY,lang)}catch(e){}label();if(lang==="en")start();else stop();
    try{window.dispatchEvent(new Event("resize"))}catch(e){}};
  var hd=document.querySelector("header");if(hd)hd.appendChild(btn);label();
  if(lang==="en")start();
})();
