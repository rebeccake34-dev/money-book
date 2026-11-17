/* 今天心情：五个笑脸点一下记录，可选原因和一句话；近 7 天一排；记满 5 天后对比运动日/不运动日、上班日/休息日的心情。
   数据：localStorage mood-v1，账号里 data/users/<id>/mood = {days:{"YYYY-MM-DD":{v:1-5,tags:[],note,t}}}。 */
(function(){
  var $=function(id){return document.getElementById(id)};
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function btn(c,x,f,id){var b=el("button",c,x);b.type="button";if(id)b.id=id;b.onclick=f;return b}
  function pad(n){return String(n).padStart(2,"0")}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function parse(k){var p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2],12)}
  function addD(k,n){var d=parse(k);d.setDate(d.getDate()+n);return ymd(d)}
  function tkey(){return ymd(new Date())}
  var FACES=[["😣","很差"],["😟","不太好"],["😐","一般"],["🙂","不错"],["😄","很好"]];
  var TAGS=["睡眠","运动","工作","学习","身体","家人朋友","钱","天气","吃得好","放松"];
  var WD=["日","一","二","三","四","五","六"];
  var KEY="mood-v1",S={days:{}};
  try{var c=JSON.parse(localStorage.getItem(KEY)||"null");if(c&&c.days)S=c}catch(e){}
  var ref=null,tm=null,noteOpen=false;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    if(!ref)return;clearTimeout(tm);tm=setTimeout(function(){ref.set(JSON.parse(JSON.stringify(S))).catch(function(){try{window.__toastAny("心情没保存上，稍后再试")}catch(e){}})},400)}
  function changed(){save();render();try{window.__gameRender&&window.__gameRender()}catch(e){}}
  function setV(v){var k=tkey(),d=S.days[k];if(d&&d.v===v){delete S.days[k];noteOpen=false}else{S.days[k]=Object.assign({tags:[],note:""},d||{},{v:v,t:Date.now()});noteOpen=true}changed()}
  function avg(a){return a.length?a.reduce(function(s,x){return s+x},0)/a.length:null}
  // 记满 5 天后：运动日 vs 不运动日、上班日 vs 休息日（差 0.5 以上才说）
  function insights(){var out=[],t=tkey(),C=window.__cut,fit=[],nofit=[],wk=[],off=[];
    for(var i=0;i<30;i++){var k=addD(t,-i),d=S.days[k];if(!d)continue;
      var r=null;try{r=C&&C.record(k)}catch(e){}var tr=!!(r&&((r.exTotal&&r.exDone>=r.exTotal)||r.cardio));(tr?fit:nofit).push(d.v);
      var P=window.__planXp?window.__planXp(k):null;if(P)(P.work?wk:off).push(d.v)}
    if(fit.length+nofit.length<5)return out;
    function f(n){return n.toFixed(1)}
    if(fit.length>=2&&nofit.length>=2){var a=avg(fit),b=avg(nofit);if(Math.abs(a-b)>=0.5)out.push((a>b?"运动的日子心情更好":"运动的日子心情反而低一些")+"：平均 "+f(a)+" 对 "+f(b))}
    if(wk.length>=2&&off.length>=2){var x=avg(wk),y=avg(off);if(Math.abs(x-y)>=0.5)out.push((x<y?"上班日心情低一些":"上班日心情更好")+"：平均 "+f(x)+" 对 "+f(y))}
    var tc={};Object.keys(S.days).forEach(function(k){if(k<addD(t,-29))return;var d=S.days[k];(d.tags||[]).forEach(function(g){var o=tc[g]||(tc[g]={n:0,s:0});o.n++;o.s+=d.v})});
    var low=Object.keys(tc).filter(function(g){return tc[g].n>=3&&tc[g].s/tc[g].n<=2.5}).sort(function(a,b){return tc[a].s/tc[a].n-tc[b].s/tc[b].n})[0];
    if(low)out.push("「"+low+"」常跟低落的日子一起出现（"+tc[low].n+" 次）");
    return out}

  var card=el("section","td-card");card.id="td-mood";
  function place(){var root=$("todayView");if(!root)return false;if(card.parentNode!==root){var h=$("td-hab");root.insertBefore(card,h||null)}return true}
  function render(){var root=$("todayView");if(!root||root.hidden||!place())return;
    var a=document.activeElement;if(a&&card.contains(a)&&a.tagName==="INPUT")return;
    var k=tkey(),d=S.days[k];card.textContent="";
    var h=el("div","td-h");h.appendChild(el("b",null,"今天心情"));h.appendChild(el("span","td-sub",d?FACES[d.v-1][1]+(d.tags&&d.tags.length?" · "+d.tags.join("、"):""):"点一个笑脸，再点一次取消"));
    if(d)h.appendChild(btn("td-more",noteOpen?"收起":"原因 ›",function(){noteOpen=!noteOpen;render()},"mdMore"));card.appendChild(h);
    var row=el("div","md-faces");row.setAttribute("role","group");row.setAttribute("aria-label","今天心情");
    FACES.forEach(function(f,i){var b=btn("md-face td-keep"+(d&&d.v===i+1?" on":""),null,function(){setV(i+1)},"mdF"+(i+1));
      b.setAttribute("aria-pressed",String(!!(d&&d.v===i+1)));b.setAttribute("aria-label",f[1]);b.appendChild(el("span","md-e",f[0]));b.appendChild(el("small",null,f[1]));row.appendChild(b)});
    card.appendChild(row);
    if(d&&noteOpen){var tg=el("div","md-tags");TAGS.forEach(function(g,i){var on=(d.tags||[]).indexOf(g)>=0,b=btn("md-tag td-keep"+(on?" on":""),g,function(){var l=(d.tags||[]).slice(),j=l.indexOf(g);if(j>=0)l.splice(j,1);else l.push(g);d.tags=l;changed()},"mdT"+i);
        b.setAttribute("aria-pressed",String(on));tg.appendChild(b)});card.appendChild(tg);
      var n=el("input","md-note");n.type="text";n.id="mdNote";n.maxLength=80;n.placeholder="一句话记下为什么（可不填）";n.value=d.note||"";n.setAttribute("aria-label","心情备注");
      n.onchange=function(){d.note=n.value.trim();save()};n.onkeydown=function(e){if(e.key==="Enter"){n.blur()}};card.appendChild(n)}
    // 近 7 天
    var wk=el("div","md-week");for(var i=6;i>=0;i--){var kk=addD(k,-i),dd=S.days[kk],c=el("div","md-day"+(i===0?" today":""));
      c.appendChild(el("span","md-de",dd?FACES[dd.v-1][0]:"·"));c.appendChild(el("small",null,i===0?"今天":"周"+WD[parse(kk).getDay()]));
      c.title=kk+(dd?" "+FACES[dd.v-1][1]+(dd.note?"："+dd.note:""):" 没记");wk.appendChild(c)}
    card.appendChild(wk);
    var ins=insights();if(ins.length){var u=el("ul","td-list");ins.forEach(function(t){u.appendChild(el("li",null,t))});card.appendChild(u)}
  }
  // 每周回顾里一行
  function renderWeek(){var box=$("moodWeek"),L=window.__ledger;if(!box)return;box.textContent="";
    var ws=L&&L.weekStart?L.weekStart():null;if(!ws)return;var cur=[],prev=[];
    for(var i=0;i<7;i++){var a=S.days[addD(ws,i)],b=S.days[addD(ws,i-7)];if(a)cur.push(a.v);if(b)prev.push(b.v)}
    if(!cur.length&&!prev.length)return;box.appendChild(el("h3",null,"心情"));
    var best=null;for(var j=0;j<7;j++){var x=S.days[addD(ws,j)];if(x&&(!best||x.v>best.v))best={v:x.v,k:addD(ws,j)}}
    var u=el("ul","td-list");
    u.appendChild(el("li",null,"本周记了 "+cur.length+" 天"+(cur.length?"，平均 "+avg(cur).toFixed(1)+" "+FACES[Math.round(avg(cur))-1][0]:"")+(prev.length?"（上周 "+avg(prev).toFixed(1)+"）":"")));
    if(best)u.appendChild(el("li","good","最开心的一天：周"+WD[parse(best.k).getDay()]+" "+FACES[best.v-1][0]+(S.days[best.k].note?"「"+S.days[best.k].note+"」":"")));
    box.appendChild(u)}
  var timer=null;function all(){clearTimeout(timer);timer=setTimeout(function(){try{render()}catch(e){try{window.__debugPush&&window.__debugPush("mood",e)}catch(x){}}try{renderWeek()}catch(e){}},70)}
  window.__mood={get:function(k){var d=S.days[k||tkey()];return d?JSON.parse(JSON.stringify(d)):null}};
  ["__todayRender","__todayShown","__overview"].forEach(function(n){var f=window[n];window[n]=function(){var r;try{r=f&&f.apply(this,arguments)}finally{all()}return r}});
  window.__bk=window.__bk||{};
  window.__bk.mood={dump:function(){return JSON.parse(JSON.stringify(S))},
    merge:function(d){if(!d||!d.days)return 0;var n=0;Object.keys(d.days).forEach(function(k){if(!/^\d{4}-\d\d-\d\d$/.test(k))return;var a=S.days[k],b=d.days[k];if(!b||!b.v)return;if(!a||(b.t||0)>(a.t||0)){S.days[k]=b;n++}});if(n)save();all();return n}};
  all();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){var db=r[0],user=r[1];if(!db||!user)return;
    return user.id().then(function(id){if(!id)return;ref=db.doc("data/users/"+id+"/mood");var first=true;
      ref.onSnapshot(function(s){if(s.metadata.hasPendingWrites)return;
        if(!s.exists){if(first&&!s.metadata.fromCache){first=false;if(Object.keys(S.days).length)save()}return}
        first=false;var b=JSON.parse(JSON.stringify(s.data()));S={days:b.days||{}};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}all()},function(){ref=null});
    });
  }).catch(function(){});
})();
