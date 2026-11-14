/* 生理期：记录、预测、建议，并给运动打卡 / 日常计划 / 今天概览提供标记 */
(function(){
  var $=function(id){return document.getElementById(id)};
  var root=$("cycle");if(!root)return;
  var KEY="cycle-v1";
  var DEFS={cyc:28,len:5,lut:14,showCut:true,showPlan:true,showOv:true};
  function norm(c){c=JSON.parse(JSON.stringify(c||{}));var re=/^\d{4}-\d\d-\d\d$/;
    return {periods:Array.isArray(c.periods)?c.periods.filter(function(p){return p&&re.test(p.s)&&(!p.e||re.test(p.e));}):[],
      logs:c.logs&&typeof c.logs==="object"?c.logs:{},set:Object.assign({},DEFS,c.set||{}),at:+c.at||0};}
  var S=norm(null);
  try{var c0=JSON.parse(localStorage.getItem(KEY)||"null");if(c0)S=norm(c0);}catch(e){}
  var ref=null,tm=null;
  function lsPut(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
  function save(){S.at=Date.now();lsPut();
    if(ref){clearTimeout(tm);tm=setTimeout(function(){ref.set(JSON.parse(JSON.stringify(S))).catch(function(){toast("生理期记录没保存上，稍后再试");});},400);}}
  function toast(m){try{window.__toastAny&&window.__toastAny(m);}catch(e){}}

  var pad=function(n){return String(n).padStart(2,"0")};
  var ymd=function(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
  var parse=function(k){return new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12)};
  var add=function(k,n){var d=parse(k);d.setDate(d.getDate()+n);return ymd(d)};
  var diff=function(a,b){return Math.round((parse(a)-parse(b))/864e5)};
  var md=function(k){return (+k.slice(5,7))+"/"+(+k.slice(8,10))};
  var mdc=function(k){return (+k.slice(5,7))+"月"+(+k.slice(8,10))+"日"};
  var WD=["周日","周一","周二","周三","周四","周五","周六"];
  var wd=function(k){return WD[parse(k).getDay()]};
  var today=function(){return ymd(new Date())};
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
  function btn(c,x,fn){var b=el("button",c,x);b.type="button";if(fn)b.onclick=fn;return b;}
  var NAME={period:"经期",follicular:"卵泡期",fertile:"易孕期",ovulation:"排卵日",luteal:"黄体期",late:"推迟"};
  var FLOW=["无","点滴","少","中","多"],PAIN=["不痛","轻微","明显","很痛"];
  var SYM=["痛经","腰酸","头痛","胸胀","腹胀","长痘","疲劳","失眠","嘴馋","情绪低落","烦躁","便秘","腹泻"];

  /* ---------- 模型 ---------- */
  var MD=null;
  function sortedP(){return S.periods.slice().sort(function(a,b){return a.s<b.s?-1:1;});}
  function stats(ps){var cyc=[],lens=[];
    for(var i=1;i<ps.length;i++){var L=diff(ps[i].s,ps[i-1].s);if(L>=15&&L<=60)cyc.push(L);}
    ps.forEach(function(p){if(p.e){var L=diff(p.e,p.s)+1;if(L>=1&&L<=12)lens.push(L);}});
    var c6=cyc.slice(-6),l6=lens.slice(-6),mean=function(a){return a.reduce(function(x,y){return x+y},0)/a.length};
    var dc=Math.min(45,Math.max(20,+S.set.cyc||28)),dl=Math.min(10,Math.max(2,+S.set.len||5));
    return {cyc:cyc,lens:lens,avgC:c6.length?Math.round(mean(c6)):dc,avgL:l6.length?Math.round(mean(l6)):dl,
      nC:c6.length,nL:l6.length,range:c6.length>=3?Math.max.apply(null,c6)-Math.min.apply(null,c6):null};}
  function lut(){return Math.min(16,Math.max(10,+S.set.lut||14));}
  function endOf(p,t){if(p.e)return p.e;if(t<p.s)return p.s;return diff(t,p.s)>=9?add(p.s,9):t;}
  function rebuild(){
    var t=today(),ps=sortedP(),st=stats(ps),last=ps[ps.length-1]||null;
    // 超过 10 天还没点「结束」：按平均经期自动结束
    var ch=false;ps.forEach(function(p){if(!p.e&&diff(t,p.s)>=10){p.e=add(p.s,st.avgL-1);ch=true;}});
    if(ch){S.periods=ps.map(function(p){return {s:p.s,e:p.e};});save();}
    var pdays={},ppdays={};
    ps.forEach(function(p){var e=endOf(p,t);for(var k=p.s;k<=e;k=add(k,1))pdays[k]=1;});
    var ongoing=last&&!last.e&&last.s<=t?last:null;
    var next=null,late=0,preds=[];
    if(last){next=add(last.s,st.avgC);
      if(next<t)late=diff(t,next);
      else{for(var i=0;i<14;i++){var s=add(next,i*st.avgC);if(diff(s,t)>430)break;preds.push(s);
        for(var j=0;j<st.avgL;j++)ppdays[add(s,j)]=1;}}
      if(ongoing)for(var k2=add(t,1);k2<=add(ongoing.s,st.avgL-1);k2=add(k2,1))ppdays[k2]=1;}
    MD={t:t,ps:ps,st:st,last:last,ongoing:ongoing,next:next,late:late,preds:preds,pdays:pdays,ppdays:ppdays};
  }
  function info(k){
    if(!MD||!MD.ps.length)return null;if(k<MD.ps[0].s)return null;
    var a=null,pred=false,i;
    for(i=0;i<MD.ps.length;i++){if(MD.ps[i].s<=k)a=MD.ps[i].s;else break;}
    for(i=0;i<MD.preds.length;i++){if(MD.preds[i]<=k&&MD.preds[i]>a){a=MD.preds[i];pred=true;}}
    var nx=null;
    for(i=0;i<MD.ps.length;i++)if(MD.ps[i].s>a){nx=MD.ps[i].s;break;}
    if(!nx)for(i=0;i<MD.preds.length;i++)if(MD.preds[i]>a){nx=MD.preds[i];break;}
    var n=diff(k,a)+1,fut=k>MD.t,ph,est=nx||add(a,MD.st.avgC);
    if(MD.pdays[k])ph="period";
    else if(MD.ppdays[k]){ph="period";pred=true;}
    else if(k>est){if(fut)return null;ph="late";}
    else{var ov=add(est,-lut());
      ph=k===ov?"ovulation":(k>=add(ov,-5)&&k<=add(ov,1))?"fertile":k<ov?"follicular":"luteal";}
    var toNext=nx?diff(nx,k):null;
    return {k:k,ph:ph,n:n,a:a,nx:nx,est:est,len:diff(est,a),toNext:toNext,pred:pred||fut,
      pre:ph==="luteal"&&toNext!=null&&toNext<=7,ov:add(est,-lut()),late:ph==="late"?diff(k,est):0};
  }
  function label(I){if(!I)return "";
    if(I.ph==="period")return (I.pred?"预计经期":"经期")+"第 "+I.n+" 天";
    if(I.ph==="late")return "比预计晚了 "+I.late+" 天";
    return (I.pre?"经前期":NAME[I.ph])+(I.pred?"（预计）":"");}

  /* ---------- 建议 ---------- */
  function advKey(I){if(!I)return null;if(I.ph==="period")return I.n<=2?"p1":"p";if(I.ph==="luteal")return I.pre?"pre":"lut";if(I.ph==="ovulation")return "fertile";return I.ph;}
  var ADV={
    p1:{t:"经期前两天：以散步、拉伸、瑜伽这类轻松活动为主，不舒服就完全休息。状态还行也可以练，但用平时 60–70% 的重量，避开大重量深蹲、硬拉和强烈挤压腹部的动作。",
      d:"多吃含铁的食物（红肉、鸡蛋、菠菜、豆类），配上维生素 C（橙子、猕猴桃）帮助吸收；少喝冰的和含咖啡因的饮料，多喝温水。",
      l:"痛经可以热敷小腹，早点睡；这两天的安排排轻一点。"},
    p:{t:"经期第 3 天起：按身体感觉慢慢恢复训练，从中等重量开始；有氧选快走、单车这类低冲击的。",
      d:"继续吃够含铁食物和蛋白质，多喝水。",
      l:"留意流量变化。经期超过 7 天或者出血特别多，要去看医生。"},
    follicular:{t:"卵泡期：雌激素上升，力量、耐力和恢复都在变好，最适合安排大重量、冲个人纪录（PR）和 HIIT。",
      d:"按平常的减脂计划吃，蛋白质吃够；这段时间食欲一般比较好控制。",
      l:"精力好、心情稳，适合安排需要专注的学习和重要的事。"},
    fertile:{t:"排卵前后：力量还在高点，可以继续高强度；但这几天韧带相对松，深蹲、跳跃、变向时注意动作控制，热身做足。",
      d:"正常吃，多喝水。",
      l:"这几天是最容易怀孕的时间。"},
    lut:{t:"黄体期：体温和心率偏高，同样的重量会觉得更累。照常训练，但不追求新纪录；有氧以中低强度为主。",
      d:"饿得快是正常的：多吃高蛋白、高纤维的食物增加饱腹感；想吃甜的就选水果或一小块黑巧克力。",
      l:"作息规律，保证睡眠。"},
    pre:{t:"经前一周：疲劳、浮肿比较常见。可以少做一两组或减一点重量，多做拉伸和低强度有氧，别勉强。",
      d:"少吃太咸的减轻水肿；这几天体重涨 1–2 kg 多半是水分，不用慌，也不用因此少吃。",
      l:"情绪容易起伏，日程排松一点；提前备好卫生用品。"},
    late:{t:"经期推迟时照常训练，注意休息。",
      d:"正常吃，别因为推迟就节食。",
      l:"压力、作息变化、减脂期热量偏低，都可能让周期推迟几天。推迟超过一周，或者连续几次明显不规律，建议去看医生；如果有可能怀孕，可以先验孕。"}
  };
  var SHORT={
    p1:{cut:"建议轻松活动或休息",plan:"安排轻一点，备好热水袋"},
    p:{cut:"按感觉练，中等重量",plan:"注意休息"},
    follicular:{cut:"体能上升，适合冲重量",plan:"精力好，适合做重要的事"},
    fertile:{cut:"力量好，注意膝盖和动作控制",plan:"精力不错"},
    lut:{cut:"会比平时累，照常练、不冲纪录",plan:"作息规律、保证睡眠"},
    pre:{cut:"可少做一两组，多拉伸",plan:"情绪易波动，日程排松一点"},
    late:{cut:"照常练、注意休息",plan:"注意休息"}
  };
  var TIPS={痛经:"痛经：热敷小腹，做婴儿式、猫牛式这类轻柔拉伸；需要的话按说明吃止痛药，痛到影响生活要看医生。",
    腰酸:"腰酸：热敷腰部，别久坐，做点轻柔的髋部拉伸。",头痛:"头痛：多喝水、少看屏幕，按时吃饭别饿太久。",
    胸胀:"胸胀：穿舒适的运动内衣，少盐、少咖啡因。",腹胀:"腹胀：少盐、少碳酸饮料，饭后散散步。",
    长痘:"长痘：做好清洁，少吃高糖油炸，别用手挤。",疲劳:"疲劳：今天降低训练强度，早点睡。",
    失眠:"失眠：睡前少看手机，下午以后少喝咖啡和茶。",嘴馋:"嘴馋：很正常，选酸奶、鸡蛋这类高蛋白零食或水果，三餐别饿太久。",
    情绪低落:"情绪低落：出门走走、晒晒太阳，和朋友聊聊。",烦躁:"烦躁：给自己留点空，散步或拉伸能帮忙放松。",
    便秘:"便秘：多喝水，多吃蔬菜水果和全谷物。",腹泻:"腹泻：吃清淡些，注意补水。"};

  /* ---------- 改数据 ---------- */
  function daySet(){var s={},t=today();S.periods.forEach(function(p){var e=endOf(p,t);for(var k=p.s;k<=e;k=add(k,1))s[k]=1;});return s;}
  function fromSet(s,keepOpen){var ks=Object.keys(s).sort(),out=[];
    ks.forEach(function(k){var l=out[out.length-1];if(l&&diff(k,l.e)<=2)l.e=k;else out.push({s:k,e:k});});
    if(keepOpen&&out.length){var l=out[out.length-1];if(l.e===today())l.e=null;}
    S.periods=out;}
  function hadOpen(){return S.periods.some(function(p){return !p.e;});}
  function setPeriod(k,on){var t=today();if(on&&k>t)return false;var s=daySet(),open=hadOpen();
    if(on)s[k]=1;else delete s[k];fromSet(s,open||(on&&k===t));return true;}
  function changed(){save();rebuild();renderAll();notify();}
  function startToday(){var t=today();if(MD.pdays[t]){toast("今天已经记成经期了");return;}
    setPeriod(t,true);changed();toast("已记录：经期今天开始");}
  function endToday(){var o=S.periods.filter(function(p){return !p.e;})[0];if(!o)return;o.e=today();changed();toast("已记录：经期今天结束");}
  function setLog(k,patch){var L=Object.assign({},S.logs[k]||{},patch);
    if(!L.f)delete L.f;if(!L.p)delete L.p;if(!L.sy||!L.sy.length)delete L.sy;if(!L.n)delete L.n;
    if(Object.keys(L).length)S.logs[k]=L;else delete S.logs[k];
    if(patch.f>=2&&!MD.pdays[k])setPeriod(k,true);}

  /* ---------- 渲染 ---------- */
  var selK=null,calY=null,calM=null,armed=null;
  function cycleBar(I){var L=Math.max(I.len,1),pl=I.ph==="period"?Math.max(MD.st.avgL,I.n):MD.st.avgL,ovn=diff(I.ov,I.a)+1;
    var segs=[["b-p",pl],["b-g",Math.max(0,ovn-6-pl)],["b-f",5],["b-o",1],["b-f",1],["b-l",Math.max(0,L-ovn-1)]];
    var tot=segs.reduce(function(a,s){return a+s[1]},0)||1;
    var w=el("div","cy-barw"),b=el("div","cy-bar");
    segs.forEach(function(s){if(s[1]<=0)return;var i=el("i",s[0]);i.style.width=(s[1]/tot*100)+"%";b.appendChild(i);});
    w.appendChild(b);var m=el("span","cy-mark");m.style.left=Math.min(100,(Math.min(I.n,tot)-.5)/tot*100)+"%";m.title="今天";w.appendChild(m);
    var l=el("div","cy-barl");l.appendChild(el("span",null,"第 1 天"));l.appendChild(el("span",null,"排卵约第 "+ovn+" 天"));l.appendChild(el("span",null,"第 "+L+" 天"));w.appendChild(l);
    return w;}
  function warnings(){var st=MD.st,w=[];
    if(st.nC>=2&&(st.avgC<21||st.avgC>35))w.push("最近的平均周期是 "+st.avgC+" 天，超出一般 21–35 天的范围，建议找医生（GP）聊一下。");
    if(st.range!=null&&st.range>8)w.push("最近几次周期长短相差 "+st.range+" 天，算不太规律，预测会不准；一直这样可以问问医生。");
    if(st.nL>=2&&st.avgL>7)w.push("最近的经期平均有 "+st.avgL+" 天，超过 7 天，建议去看医生。");
    var hurt=MD.ps.slice(-3).filter(function(p){var e=endOf(p,MD.t);for(var k=p.s;k<=e;k=add(k,1))if((S.logs[k]||{}).p===3)return true;return false;}).length;
    if(hurt>=2)w.push("最近几次经期都记了「很痛」。痛到影响上班、上课或训练，值得去看医生。");
    return w;}
  function renderToday(){var box=$("cyToday");box.textContent="";var t=MD.t,I=info(t);
    if(!MD.ps.length){box.appendChild(el("h2",null,"今天"));
      box.appendChild(el("p",null,"还没有记录。经期来的那天点下面的按钮就行；以前的经期可以在「历史统计」里补记，补 2–3 次后预测会准很多。"));
      var r0=el("div","cy-row");r0.appendChild(btn("cy-btn","经期今天来了",startToday));
      r0.appendChild(btn("cy-link","补记以前的经期",function(){go("cyHist");}));box.appendChild(r0);return;}
    var hero=el("div","cy-hero"),left=el("div");
    var big=el("div","cy-big",I&&I.ph!=="late"?"周期第 "+I.n+" 天":"周期第 "+(diff(t,MD.last.s)+1)+" 天");
    left.appendChild(big);var pill=el("span","cy-pill "+(I?I.ph:""),I?label(I):"");left.appendChild(pill);hero.appendChild(left);
    var acts=el("div","cy-row");
    if(MD.ongoing){acts.appendChild(btn("cy-btn","经期结束了（今天）",endToday));}
    else acts.appendChild(btn("cy-btn","经期今天来了",startToday));
    hero.appendChild(acts);box.appendChild(hero);
    var nx=el("p","cy-next");nx.style.margin="0";
    if(MD.ongoing){var ee=add(MD.ongoing.s,Math.max(MD.st.avgL,diff(t,MD.ongoing.s)+1)-1);
      nx.innerHTML="";nx.appendChild(document.createTextNode("经期第 "+(diff(t,MD.ongoing.s)+1)+" 天，按平均 "+MD.st.avgL+" 天算，大约 "));
      var b1=el("b",null,mdc(ee)+"（"+wd(ee)+"）");nx.appendChild(b1);nx.appendChild(document.createTextNode(" 结束。"));}
    else if(MD.late){nx.appendChild(document.createTextNode("原本预计 "+mdc(MD.next)+" 来，现在晚了 "));nx.appendChild(el("b",null,MD.late+" 天"));nx.appendChild(document.createTextNode("。来了就点上面的按钮。"));}
    else{var dd=diff(MD.next,t);nx.appendChild(document.createTextNode("下次经期大约 "));nx.appendChild(el("b",null,mdc(MD.next)+"（"+wd(MD.next)+"）"));
      nx.appendChild(document.createTextNode(dd===0?"，就是今天左右":"，还有 "+dd+" 天"));
      if(I&&I.ov>t)nx.appendChild(document.createTextNode("；排卵日约 "+mdc(I.ov)));nx.appendChild(document.createTextNode("。"));}
    box.appendChild(nx);
    if(I&&I.ph!=="late")box.appendChild(cycleBar(I));
    var st=MD.st;box.appendChild(el("p","cy-note",(st.nC?"按最近 "+st.nC+" 次周期平均 "+st.avgC+" 天预测":"记录还不到 2 次，先按 "+st.avgC+" 天一个周期估算（可在设置里改）")+"；预测只供参考，不能用来避孕。"));
    warnings().forEach(function(w){box.appendChild(el("div","cy-warn",w));});
  }
  function segRow(lab,opts,val,fn){var w=el("div");w.appendChild(el("span","cy-lab",lab));var s=el("div","cy-seg");s.setAttribute("role","group");s.setAttribute("aria-label",lab);
    opts.forEach(function(o,i){var b=btn(null,o,function(){fn(i===val?0:i);});b.setAttribute("aria-pressed",String(i===val));s.appendChild(b);});w.appendChild(s);return w;}
  function renderLog(){var box=$("cyLogBody");
    if(box.contains(document.activeElement)&&document.activeElement.id==="cyNote")return;
    box.textContent="";var t=MD.t,k=selK&&selK<=t?selK:t;var L=S.logs[k]||{},I=info(k);
    var hd=el("div","cy-lhead");var pv=btn("cy-nb","‹",function(){selK=add(k,-1);renderLog();renderCal();});pv.setAttribute("aria-label","前一天");
    var nv=btn("cy-nb","›",function(){selK=add(k,1);renderLog();renderCal();});nv.setAttribute("aria-label","后一天");nv.disabled=k>=t;
    var mid=el("div");mid.style.textAlign="center";mid.appendChild(el("b",null,mdc(k)+" "+wd(k)+(k===t?" · 今天":"")));
    if(I){mid.appendChild(el("br"));mid.appendChild(el("span","cy-note",label(I)+(I.ph!=="late"?" · 周期第 "+I.n+" 天":"")));}
    hd.appendChild(pv);hd.appendChild(mid);hd.appendChild(nv);box.appendChild(hd);
    $("cyLogSum").textContent=(k===t?"今天":md(k))+(L.f||L.sy||L.p?" · 已记录":"");
    var on=!!MD.pdays[k],tg=el("div","cy-toggle"+(on?" on":""));
    tg.appendChild(el("span",null,on?"这天是经期":"这天不是经期"));
    tg.appendChild(btn("cy-btn"+(on?" ghost":""),on?"取消经期":"标为经期",function(){setPeriod(k,!on);changed();}));box.appendChild(tg);
    box.appendChild(segRow("流量",FLOW,L.f||0,function(v){setLog(k,{f:v});changed();}));
    box.appendChild(segRow("疼痛",PAIN,L.p||0,function(v){setLog(k,{p:v});changed();}));
    var sw=el("div");sw.appendChild(el("span","cy-lab","症状和感受（可多选）"));var ch=el("div","cy-chips"),sy=L.sy||[];
    SYM.forEach(function(s){var b=btn("cy-chip",s,function(){var a=sy.indexOf(s)>=0?sy.filter(function(x){return x!==s}):sy.concat([s]);setLog(k,{sy:a});changed();});
      b.setAttribute("aria-pressed",String(sy.indexOf(s)>=0));ch.appendChild(b);});sw.appendChild(ch);box.appendChild(sw);
    var nw=el("label");nw.appendChild(el("span","cy-lab","备注"));var ni=el("input");ni.id="cyNote";ni.type="text";ni.maxLength=120;ni.placeholder="比如：吃了止痛药、睡得不好";ni.value=L.n||"";
    ni.addEventListener("change",function(){setLog(k,{n:ni.value.trim()});save();rebuild();ni.blur();renderAll();});nw.appendChild(ni);box.appendChild(nw);
    box.appendChild(el("p","cy-note","流量选「少」以上会自动把这天标为经期。"));
  }
  function lightKeys(){var t=MD.t;
    if(MD.ongoing){var ks=[];for(var k=t;k<=add(MD.ongoing.s,1);k=add(k,1))ks.push(k);return ks.length?{keys:ks,txt:"今天"+(ks.length>1?"和明天":"")}:null;}
    if(!MD.late&&MD.next&&diff(MD.next,t)<=10&&diff(MD.next,t)>=0)return {keys:[MD.next,add(MD.next,1)],txt:md(MD.next)+"、"+md(add(MD.next,1))+"（预计经期前两天）"};
    return null;}
  function renderAdvice(){var box=$("cyAdvBody");box.textContent="";var t=MD.t,I=info(t),key=advKey(I);
    if(!I){box.appendChild(el("p","cy-note","记录一次经期后，这里会按你所在的阶段给训练、饮食和生活上的建议。"));$("cyAdvSum").textContent="";return;}
    $("cyAdvSum").textContent=label(I);
    var A=ADV[key],g=el("div","cy-adv");
    [["训练",A.t],["饮食",A.d],["生活",A.l]].forEach(function(x){var d=el("div");d.appendChild(el("b",null,x[0]));d.appendChild(document.createTextNode(x[1]));g.appendChild(d);});
    box.appendChild(g);
    var sy={};[t,add(t,-1)].forEach(function(k){((S.logs[k]||{}).sy||[]).forEach(function(s){sy[s]=1;});});
    var ts=Object.keys(sy).filter(function(s){return TIPS[s];});
    if(ts.length){var w=el("div");w.appendChild(el("span","cy-lab","针对你这两天记的症状"));var ul=el("ul","cy-tips");ts.forEach(function(s){ul.appendChild(el("li",null,TIPS[s]));});w.appendChild(ul);box.appendChild(w);}
    var sc=el("div","cy-sync");sc.appendChild(el("b",null,"同步"));
    sc.appendChild(el("span",null,"运动打卡："+(S.set.showCut?"今日训练上方会显示经期提示，健身日历标出经期（实线是已记录，虚线是预计）。":"已关闭提示（在下方设置里打开）。")));
    var lk=lightKeys();
    if(lk&&window.__cutLight){var r=el("div","cy-row");r.appendChild(btn("cy-btn ghost","把"+lk.txt+"的力量训练换成轻松训练",function(){
      var res=window.__cutLight(lk.keys);if(!res)toast("没找到轻松训练的计划");else if(!res.n)toast("那几天本来就没有力量训练");
      else toast("已把 "+res.n+" 天的训练换成「"+res.name+"」"+(res.sync?"，日常计划也已同步":""));}));sc.appendChild(r);}
    sc.appendChild(el("span",null,"日常计划："+(S.set.showPlan?"月历和年历上会标出经期和排卵日，点某天能看到当天建议。":"已关闭标记（在下方设置里打开）。")));
    if(window.__planSelect&&MD.next&&!MD.late){var r2=el("div","cy-row");r2.appendChild(btn("cy-link","在日常计划里看下次经期那天",function(){window.__planSelect(MD.next);}));sc.appendChild(r2);}
    box.appendChild(sc);
    box.appendChild(el("p","cy-note","这些是一般性的建议，不是医疗意见；身体不舒服以自己的感觉为准。"));
  }
  function renderCal(){var box=$("cyCalBody");box.textContent="";var t=MD.t;
    if(calY==null){var d0=parse(t);calY=d0.getFullYear();calM=d0.getMonth();}
    var nav=el("div","cy-mnav");var pv=btn("cy-nb","‹",function(){calM--;if(calM<0){calM=11;calY--;}renderCal();});pv.setAttribute("aria-label","上个月");
    var nv=btn("cy-nb","›",function(){calM++;if(calM>11){calM=0;calY++;}renderCal();});nv.setAttribute("aria-label","下个月");
    var tt=el("b",null,calY+"年"+(calM+1)+"月");var tb=btn("cy-link","回到本月",function(){var d=parse(t);calY=d.getFullYear();calM=d.getMonth();selK=t;renderCal();renderLog();});
    var mid=el("div");mid.style.display="flex";mid.style.gap="10px";mid.style.alignItems="baseline";mid.appendChild(tt);mid.appendChild(tb);
    nav.appendChild(pv);nav.appendChild(mid);nav.appendChild(nv);box.appendChild(nav);
    var g=el("div","cy-grid");["一","二","三","四","五","六","日"].forEach(function(w){g.appendChild(el("span","cy-wh",w));});
    var f=new Date(calY,calM,1,12),off=(f.getDay()+6)%7,dim=new Date(calY,calM+1,0).getDate();
    for(var i=0;i<off;i++){var x=el("span","cy-d out");x.setAttribute("aria-hidden","true");g.appendChild(x);}
    for(var dd=1;dd<=dim;dd++){var k=calY+"-"+pad(calM+1)+"-"+pad(dd),I=info(k),cls="cy-d";
      if(MD.pdays[k])cls+=" p";else if(MD.ppdays[k])cls+=" pp";else if(I&&I.ph==="ovulation")cls+=" o";else if(I&&I.ph==="fertile")cls+=" f";
      if(k===t)cls+=" today";if(k===selK)cls+=" sel";
      var b=btn(cls,String(dd));b.dataset.k=k;var L=S.logs[k];if(L&&(L.sy||L.p||L.n||(L.f&&!MD.pdays[k])))b.appendChild(el("i","dt"));
      b.setAttribute("aria-label",mdc(k)+(I?" "+label(I):"")+(L?"，有记录":""));b.setAttribute("aria-pressed",String(k===selK));
      b.onclick=(function(k){return function(){selK=k;renderCal();if(k<=t)renderLog();};})(k);
      g.appendChild(b);}
    box.appendChild(g);
    var lg=el("div","cy-leg");[["var(--cy-p)","经期"],["var(--cy-ps)","预计经期",1],["var(--cy-fs)","易孕期"],["var(--cy-o)","排卵日"]].forEach(function(x){var s=el("span");var i=el("i");i.style.background=x[0];if(x[2])i.style.border="1.5px dashed var(--cy-p)";s.appendChild(i);s.appendChild(document.createTextNode(x[1]));lg.appendChild(s);});
    var s2=el("span");var i2=el("i");i2.style.cssText="width:6px;height:6px;border-radius:50%;background:var(--muted)";s2.appendChild(i2);s2.appendChild(document.createTextNode("有症状记录"));lg.appendChild(s2);
    box.appendChild(lg);
    if(selK){var k2=selK,I2=info(k2),L2=S.logs[k2]||{},det=el("div","cy-det");
      det.appendChild(el("b",null,mdc(k2)+" "+wd(k2)+(I2?" · "+label(I2)+(I2.ph!=="late"?" · 周期第 "+I2.n+" 天":""):"")));
      var bits=[];if(L2.f)bits.push("流量 "+FLOW[L2.f]);if(L2.p)bits.push("疼痛 "+PAIN[L2.p]);if(L2.sy)bits.push(L2.sy.join("、"));if(L2.n)bits.push(L2.n);
      if(bits.length)det.appendChild(el("span",null,"记录："+bits.join(" · ")));
      var ak=advKey(I2);if(ak&&SHORT[ak])det.appendChild(el("span","cy-note","训练："+SHORT[ak].cut+"；生活："+SHORT[ak].plan));
      if(k2<=t){var r=el("div","cy-row");var on=!!MD.pdays[k2];
        r.appendChild(btn("cy-btn"+(on?" ghost":""),on?"取消这天的经期":"把这天标为经期",function(){setPeriod(k2,!on);changed();}));
        r.appendChild(btn("cy-link","记录这天的症状",function(){selK=k2;renderLog();go("cyLog");}));det.appendChild(r);}
      else det.appendChild(el("span","cy-note","还没到这天，只能看预测。"));
      box.appendChild(det);}
  }
  function fmtD(k){return k.slice(0,4)+"/"+(+k.slice(5,7))+"/"+(+k.slice(8,10));}
  function renderHist(){var box=$("cyHistBody");box.textContent="";var st=MD.st,ps=MD.ps;
    $("cyHistSum").textContent=ps.length?"已记录 "+ps.length+" 次":"";
    var g=el("div","cy-stats");
    [["平均周期",st.avgC+" 天",st.nC?"最近 "+st.nC+" 次":"默认值"],["平均经期",st.avgL+" 天",st.nL?"最近 "+st.nL+" 次":"默认值"],
     ["规律程度",st.range==null?"–":st.range<=8?"规律":"不太规律",st.range==null?"记满 4 次后判断":"最长最短差 "+st.range+" 天"],["已记录",ps.length+" 次",ps.length?"从 "+fmtD(ps[0].s):"还没有"]]
     .forEach(function(x){var d=el("div","cy-stat");d.appendChild(el("small",null,x[0]));d.appendChild(el("b",null,x[1]));d.appendChild(el("span",null,x[2]));g.appendChild(d);});
    box.appendChild(g);
    if(ps.length){var h=el("div","cy-hist");var hh=el("div","cy-hr");["开始","经期","周期长度",""].forEach(function(x){hh.appendChild(el("span","cy-note",x));});h.appendChild(hh);
      for(var i=ps.length-1;i>=0;i--){(function(p,nx){var r=el("div","cy-hr"),e=endOf(p,MD.t),pl=diff(e,p.s)+1,cl=nx?diff(nx.s,p.s):null;
        r.appendChild(el("span",null,fmtD(p.s)));r.appendChild(el("span",null,p.e?pl+" 天":"进行中"));
        var bw=el("div");bw.style.display="flex";bw.style.alignItems="center";bw.style.gap="6px";var bar=el("div","bar");bar.style.flex="1";
        var tot=cl||Math.max(st.avgC,diff(MD.t,p.s)+1),ii=el("i");ii.style.width=Math.min(100,pl/45*100)+"%";bar.appendChild(ii);
        var em=el("em");em.style.width=Math.max(0,Math.min(100,(tot-pl)/45*100))+"%";bar.appendChild(em);bw.appendChild(bar);
        bw.appendChild(el("span","cy-note",cl?cl+" 天":"本次"));r.appendChild(bw);
        var del=btn("del"+(armed===p.s?" armed":""),armed===p.s?"确认删除":"删除",function(){
          if(armed!==p.s){armed=p.s;renderHist();setTimeout(function(){if(armed===p.s){armed=null;renderHist();}},4000);return;}
          armed=null;S.periods=S.periods.filter(function(q){return q.s!==p.s;});changed();toast("已删除 "+fmtD(p.s)+" 这次经期");});
        r.appendChild(del);h.appendChild(r);})(ps[i],ps[i+1]);}
      box.appendChild(h);}
    var fw=el("div");fw.appendChild(el("span","cy-lab","补记一次以前的经期"));
    var f=el("form","cy-form");f.noValidate=true;
    var l1=el("label",null,"开始");var i1=el("input");i1.type="date";i1.max=MD.t;l1.appendChild(i1);
    var l2=el("label",null,"结束");var i2=el("input");i2.type="date";i2.max=MD.t;l2.appendChild(i2);
    var sb=el("button","cy-btn","补记");sb.type="submit";f.appendChild(l1);f.appendChild(l2);f.appendChild(sb);
    f.onsubmit=function(ev){ev.preventDefault();var s=i1.value,e=i2.value||i1.value;
      if(!s){toast("先选开始日期");return;}if(e<s){toast("结束日期不能早于开始");return;}if(e>MD.t){toast("不能记以后的日子");return;}if(diff(e,s)>11){toast("经期最多记 12 天");return;}
      var set=daySet(),open=hadOpen();for(var k=s;k<=e;k=add(k,1))set[k]=1;fromSet(set,open);changed();toast("已补记 "+fmtD(s)+" 开始的经期");};
    fw.appendChild(f);box.appendChild(fw);
  }
  function renderSet(){var box=$("cySetBody");if(box.contains(document.activeElement))return;box.textContent="";
    box.appendChild(el("p","cy-note","记录少于 2 次时用下面的默认值预测；记多了会自动改用你自己的平均值。"));
    var g=el("div","cy-set");
    [["cyc","默认周期（天）",20,45],["len","默认经期（天）",2,10],["lut","排卵日在下次经期前几天",10,16]].forEach(function(x){
      var l=el("label",null,x[1]);var i=el("input");i.type="number";i.min=x[2];i.max=x[3];i.inputMode="numeric";i.value=S.set[x[0]];
      i.addEventListener("change",function(){var v=Math.round(+i.value);if(!(v>=x[2]&&v<=x[3])){toast(x[1]+"要在 "+x[2]+"–"+x[3]+" 之间");i.value=S.set[x[0]];return;}
        S.set[x[0]]=v;i.blur();changed();});l.appendChild(i);g.appendChild(l);});
    box.appendChild(g);
    [["showCut","在「运动打卡」显示经期提示和日历标记"],["showPlan","在「日常计划」月历、年历上标出经期和排卵日"],["showOv","在「今天概览」显示生理期卡片"]].forEach(function(x){
      var l=el("label","cy-ck");var c=el("input");c.type="checkbox";c.checked=S.set[x[0]]!==false;
      c.onchange=function(){S.set[x[0]]=c.checked;changed();};l.appendChild(c);l.appendChild(el("span",null,x[1]));box.appendChild(l);});
  }
  function renderOv(){var card=$("ovCyc");if(!card)return;var on=S.set.showOv!==false;card.hidden=!on;if(!on)return;
    var v=$("ovCycV"),s=$("ovCycS"),t=MD.t,I=info(t);
    if(!MD.ps.length){v.textContent="还没记录";s.textContent="点这里开始记录";return;}
    if(MD.ongoing){v.textContent="经期第 "+(diff(t,MD.ongoing.s)+1)+" 天";s.textContent="结束了记得点一下";return;}
    if(MD.late){v.textContent="推迟 "+MD.late+" 天";s.textContent="原预计 "+md(MD.next);return;}
    v.textContent=I?"第"+I.n+"天·"+(I.pre?"经前期":NAME[I.ph]):"–";
    var dd=diff(MD.next,t);s.textContent="下次约 "+md(MD.next)+(dd?" · 还有 "+dd+" 天":" · 今天左右");}
  function cutHint(){var h=$("cycHint");if(!h)return;var t=MD.t,I=info(t);
    if(S.set.showCut===false||!I){h.hidden=true;return;}
    var key=advKey(I);h.hidden=false;h.textContent="";h.className="banner plain"+(I.ph==="period"?"":I.ph==="luteal"||I.ph==="late"?" lut":" calm");
    h.appendChild(el("span",null,label(I)+" · "+SHORT[key].cut));
    var cur=window.__cutToday&&window.__cutToday();
    if(key==="p1"&&cur&&cur.train&&window.__cutLight)h.appendChild(btn(null,"今天换成轻松训练",function(){var r=window.__cutLight([t]);if(r&&r.n)toast("今天改成「"+r.name+"」");}));
    h.appendChild(btn(null,"看建议",function(){if(typeof showTab==="function")showTab("cycle");setTimeout(function(){go("cyAdvice");},60);}));}
  function renderAll(){renderToday();renderLog();renderAdvice();renderCal();renderHist();renderSet();renderOv();cutHint();try{window.__todayRender&&window.__todayRender();}catch(e){}}
  function notify(){try{window.__cutWeek&&window.__cutWeek();}catch(e){}try{window.__planRefresh&&window.__planRefresh();}catch(e){}}
  function go(id){var e=$(id);if(!e)return;if(e.classList.contains("folded")){var h=e.firstElementChild;if(h)h.click();}
    var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;e.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"});}

  /* ---------- 给其他板块用 ---------- */
  window.__cycleMark=function(k,where){if(!MD)return null;if(where==="cut"&&S.set.showCut===false)return null;if(where==="plan"&&S.set.showPlan===false)return null;
    var I=info(k);if(!I)return null;
    if(I.ph==="period")return {kind:"p",pred:I.pred,text:I.pred?"预计经期":"经期第 "+I.n+" 天"};
    if(I.ph==="ovulation")return {kind:"ov",pred:true,text:"排卵日（预计）"};
    return null;};
  window.__cycleLine=function(k,where){if(!MD)return null;if(where==="cut"&&S.set.showCut===false)return null;if(where==="plan"&&S.set.showPlan===false)return null;
    var I=info(k),key=advKey(I);if(!I||!SHORT[key])return null;return label(I)+" · "+SHORT[key][where==="cut"?"cut":"plan"];};
  window.__cycleOpen=function(k){if(typeof showTab==="function")showTab("cycle");if(k&&MD&&k<=MD.t){selK=k;var d=parse(k);calY=d.getFullYear();calM=d.getMonth();renderLog();renderCal();}
    setTimeout(function(){go("cyLog");},60);};
  window.__cycleToday=function(){if(!MD||S.set.showOv===false)return null;var t=MD.t,I=info(t),o={v:"还没记录",s:"来了就点一下，之后会自动预测",ongoing:!!MD.ongoing,none:!MD.ps.length};
    if(!MD.ps.length)return o;
    if(MD.ongoing){o.v="经期第 "+(diff(t,MD.ongoing.s)+1)+" 天";o.s="结束了记得点一下";return o;}
    if(MD.late){o.v="推迟 "+MD.late+" 天";o.s="原预计 "+md(MD.next);return o;}
    o.v=I?"第 "+I.n+" 天 · "+(I.pre?"经前期":NAME[I.ph]):"–";var dd=diff(MD.next,t);o.s="下次约 "+md(MD.next)+(dd?" · 还有 "+dd+" 天":" · 今天左右");
    var ln=window.__cycleLine&&window.__cycleLine(t,"cut");if(ln)o.tip=ln;return o;};
  window.__cycleStart=function(){startToday();};
  window.__cycleEnd=function(){endToday();};
  window.__bk=window.__bk||{};
  window.__bk.cycle={dump:function(){return JSON.parse(JSON.stringify(S));},
    merge:function(d){if(!d)return 0;var R=norm(d),n=0,t=today(),mine=daySet(),open=hadOpen(),fresh=!Object.keys(mine).length&&!Object.keys(S.logs).length;
      R.periods.forEach(function(p){var e=endOf(p,t);for(var k=p.s;k<=e;k=add(k,1))if(!mine[k]){mine[k]=1;n++;}if(!p.e&&diff(t,p.s)<10)open=true;});
      Object.keys(R.logs).forEach(function(k){if(!S.logs[k]){S.logs[k]=R.logs[k];n++;}});
      if(fresh)S.set=Object.assign({},S.set,R.set);
      if(n){fromSet(mine,open);changed();}return n;}};
  window.__cycleShown=function(){if(MD&&MD.t!==today()){rebuild();renderAll();notify();}};
  {var prev=window.__cutRendered;window.__cutRendered=function(){try{cutHint();}catch(e){}if(prev)return prev.apply(this,arguments);};}
  {var ov=$("ovCyc");if(ov)ov.onclick=function(){if(typeof showTab==="function")showTab("cycle");var tb=document.querySelector(".tabs");if(tb)tb.scrollIntoView({behavior:"smooth",block:"start"});};}

  rebuild();renderAll();notify();

  /* ---------- 云端同步（Claude 里打开时） ---------- */
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){var db=r[0],user=r[1];
    if(!db||!user)return;
    return user.id().then(function(id){if(!id)return;ref=db.doc("data/users/"+id+"/cycle");var first=true;
      ref.onSnapshot(function(s){if(s.metadata.hasPendingWrites)return;
        if(!s.exists){if(first&&!s.metadata.fromCache){first=false;if(S.periods.length||Object.keys(S.logs).length)save();}return;}
        var R=norm(s.data());
        if(first){first=false;if(S.at>R.at){save();return;}}
        S=R;lsPut();rebuild();renderAll();notify();},function(){ref=null;});
    });
  }).catch(function(){});
})();