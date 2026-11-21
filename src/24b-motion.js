/* 动效：标签栏滑动胶囊、切换页面、展开区域、新加的行、勾选弹一下、数字跳动。样式在 10-style9b.css */
(function(){
  var $=function(id){return document.getElementById(id)};
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
  function calm(){return reduce&&reduce.matches}
  function replay(el,cls,ms){if(!el||calm())return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
    clearTimeout(el["_mo_"+cls]);el["_mo_"+cls]=setTimeout(function(){el.classList.remove(cls)},ms||700);}

  // ---- 标签栏胶囊 ----
  var tabs=document.querySelector(".tabs");
  if(tabs){
    var ind=document.createElement("span");ind.className="tab-ind";ind.setAttribute("aria-hidden","true");tabs.insertBefore(ind,tabs.firstChild);
    var first=true,lastX=null;
    var place=function(){var b=tabs.querySelector('button[aria-selected="true"]');if(!b){ind.style.opacity="0";return}
      ind.style.opacity="";var x=b.offsetLeft,w=b.offsetWidth;
      if(first){ind.style.transition="none";}
      ind.style.width=w+"px";ind.style.transform="translateX("+x+"px)";
      if(first){void ind.offsetWidth;ind.style.transition="";first=false;}
      if(lastX!=null&&lastX!==x)tabs.classList.add("has-ind");lastX=x;
      tabs.classList.add("has-ind");
      // keep the chosen tab visible when the bar scrolls sideways
      if(tabs.scrollWidth>tabs.clientWidth){var l=tabs.scrollLeft;if(x<l||x+w>l+tabs.clientWidth)tabs.scrollTo({left:x-(tabs.clientWidth-w)/2,behavior:calm()?"auto":"smooth"});}
    };
    new MutationObserver(place).observe(tabs,{subtree:true,attributes:true,attributeFilter:["aria-selected"]});
    window.addEventListener("resize",place);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
    place();setTimeout(place,400);
  }

  // ---- 切换页面 ----
  var VIEWS=["todayView","ledgerView","cut","plan","cycle","setView"];
  var vis=function(){for(var i=0;i<VIEWS.length;i++){var e=$(VIEWS[i]);if(e&&!e.hidden)return e}return null};
  var curV=vis();
  VIEWS.forEach(function(id){var e=$(id);if(!e)return;new MutationObserver(function(){var v=vis();if(v&&v!==curV){curV=v;replay(v,"mo-view",900);}}).observe(e,{attributes:true,attributeFilter:["hidden"]});});

  // ---- 展开 / 收起区域 ----
  var opening=new WeakSet();
  document.addEventListener("click",function(ev){
    var t=ev.target;if(!t.closest||calm())return;
    if(t.closest("input,select,textarea,label,a,button"))return;
    var sec=t.closest(".fold");if(!sec)return;var h=sec.firstElementChild;if(!h||!h.contains(t))return;
    if(sec.classList.contains("folded"))opening.add(sec);
  },true);
  new MutationObserver(function(list){list.forEach(function(m){var e=m.target;if(!e.classList||!e.classList.contains("fold"))return;
    var was=(m.oldValue||"").split(/\s+/).indexOf("folded")>=0,now=e.classList.contains("folded");
    if(was&&!now)replay(e,"mo-open",800);});}).observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],attributeOldValue:true});

  // ---- 新加的一行（日常计划清单、备忘、便签、饮食、健身日历） ----
  var ROWS=".pl-item,.pl-mi,.note-item,#foodBody tr,.cd-it,.exp-it,.sav-row";
  var seen=new Set(),ready=false;
  function keyOf(r){var c=r.querySelector("input[id],[data-id],[data-xdone],[data-del]");
    if(c)return r.className.split(" ")[0]+":"+(c.id||c.dataset.id||c.dataset.xdone||c.dataset.del);
    var tx=(r.textContent||"").replace(/\s+/g," ").trim().slice(0,60);return tx?r.className.split(" ")[0]+"~"+tx:null;}
  function scan(root,anim){(root.matches&&root.matches(ROWS)?[root]:[]).concat([].slice.call(root.querySelectorAll?root.querySelectorAll(ROWS):[])).forEach(function(r){
      var k=keyOf(r);if(!k)return;if(!seen.has(k)){seen.add(k);if(anim&&ready)replay(r,"mo-row",700);}});}
  scan(document.body,false);setTimeout(function(){scan(document.body,false);ready=true;},2500);
  new MutationObserver(function(list){list.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n,true);});});}).observe(document.body,{childList:true,subtree:true});

  // ---- 勾选弹一下（列表重画后找回同一个框） ----
  document.addEventListener("change",function(ev){var t=ev.target;if(!t||t.type!=="checkbox"||!t.checked||calm())return;
    var id=t.id;var pop=function(){var e=id?document.getElementById(id):t;if(e)replay(e,"mo-tick",500);};pop();setTimeout(pop,30);},true);

  // ---- 金额 / 数字变化时跳一下 ----
  var NUMS=["wNet","dNet","wCash","wFut","sKcal","sPro","sWater","sTrain","ovPlanV","ovCutV","ovLedV","ovSavV"];
  NUMS.forEach(function(id){var e=$(id);if(!e)return;var last=e.textContent;
    new MutationObserver(function(){var v=e.textContent;if(v!==last&&last!=="–"&&last!==""){replay(e,"mo-num",600);}last=v;}).observe(e,{childList:true,characterData:true,subtree:true});});

  // ---- 进度条：宽度直接变到新值，再用 transform 从旧长度弹到新长度（不给 width 做动画，手机上更顺） ----
  var BAR=".bar i,.bar span,#waterFill,.sav-bar i,.aes-bar i,.pe-bar i",barW=new WeakMap();
  function barGrow(el){if(!el.matches||!el.matches(BAR))return;var w=el.offsetWidth,old=barW.get(el);barW.set(el,w);
    if(old==null||old===w||!w||calm()||!el.animate||!el.offsetParent)return;
    el.animate([{transform:"scaleX("+Math.max(old/w,.001)+")"},{transform:"scaleX(1)"}],{duration:520,easing:"cubic-bezier(.32,.72,0,1)"});}
  new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes")barGrow(m.target);
    else m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;barGrow(n);if(n.querySelectorAll)n.querySelectorAll(BAR).forEach(barGrow)})})})
    .observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style"]});
})();
