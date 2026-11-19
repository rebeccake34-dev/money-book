/* 今天心情：五个笑脸点一下记录，可选原因和一句话；近 7 天一排；记满 5 天后对比运动日/不运动日、上班日/休息日的心情。
   数据：localStorage mood-v1，账号里 data/users/<id>/mood = {days:{"YYYY-MM-DD":{v:1-5,tags:[],note,t,log:[{v,t}]}},tags:[自定义原因]}。
   点「历史」看按月的心情日历；点近 7 天或日历里的某天可以补记；同一天换心情会保留之前的记录。 */
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
  var ref=null,tm=null,noteOpen=false,sel=null,histOpen=false,histM=null,clearArm=false,addingTag=false;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    if(!ref)return;clearTimeout(tm);tm=setTimeout(function(){ref.set(JSON.parse(JSON.stringify(S))).catch(function(){try{window.__toastAny("心情没保存上，稍后再试")}catch(e){}})},400)}
  function changed(){save();render();try{window.__gameRender&&window.__gameRender()}catch(e){}}
  function cur(){var t=tkey();if(!sel||sel>t)sel=t;return sel}
  function clone(o){return JSON.parse(JSON.stringify(o))}
  // 点笑脸：同一天里换心情会留下之前的记录（log），再点同一个笑脸只开关「原因」，不会误删
  function setV(v){var k=cur(),d=S.days[k];
    if(d&&d.v===v){noteOpen=!noteOpen;render();return}
    var nd=Object.assign({tags:[],note:""},d?clone(d):{});
    var log=(nd.log||[]).slice();if(!log.length&&d)log.push({v:d.v,t:d.t||Date.now()});log.push({v:v,t:Date.now()});
    nd.v=v;nd.t=Date.now();nd.log=log.slice(-12);S.days[k]=nd;noteOpen=true;clearArm=false;changed()}
  function sameAsYesterday(){var k=cur(),y=S.days[addD(k,-1)];if(!y)return;S.days[k]={v:y.v,tags:(y.tags||[]).slice(),note:"",t:Date.now(),log:[{v:y.v,t:Date.now()}]};noteOpen=true;changed();try{window.__toastAny("已照昨天记下："+FACES[y.v-1][1])}catch(e){}}
  function clearDay(){if(!clearArm){clearArm=true;render();setTimeout(function(){if(clearArm){clearArm=false;render()}},3500);return}
    delete S.days[cur()];clearArm=false;noteOpen=false;changed()}
  function allTags(){return TAGS.concat(S.tags||[])}
  // 常用的原因排前面（近 60 天出现次数）
  function tagOrder(){var t=tkey(),cnt={};Object.keys(S.days).forEach(function(k){if(k<addD(t,-59))return;(S.days[k].tags||[]).forEach(function(g){cnt[g]=(cnt[g]||0)+1})});
    return allTags().map(function(g,i){return {g:g,i:i,n:cnt[g]||0}}).sort(function(a,b){return b.n-a.n||a.i-b.i})}
  function fmtDay(k){var d=parse(k);return (d.getMonth()+1)+"月"+d.getDate()+"日 周"+WD[d.getDay()]}
  function hm(t){var d=new Date(t);return pad(d.getHours())+":"+pad(d.getMinutes())}
  function pick(k){sel=k;noteOpen=!!S.days[k];clearArm=false;render();var c=$("td-mood");if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest",behavior:"smooth"})}
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
    var t=tkey(),k=cur(),d=S.days[k],isT=k===t;card.textContent="";
    var h=el("div","td-h");h.appendChild(el("b",null,isT?"今天心情":fmtDay(k)+"的心情"));
    h.appendChild(el("span","td-sub",d?FACES[d.v-1][1]+(d.tags&&d.tags.length?" · "+d.tags.join("、"):""):(isT?"点一个笑脸记下来":"这天还没记，点一个笑脸补记")));
    var hb=btn("td-more",histOpen?"收起历史":"历史 ›",function(){histOpen=!histOpen;if(histOpen&&!histM)histM=k.slice(0,7);render()},"mdHist");hb.setAttribute("aria-expanded",String(histOpen));h.appendChild(hb);
    card.appendChild(h);
    if(!isT){var bk=el("div","md-back");bk.appendChild(el("span",null,"正在看 "+fmtDay(k)));bk.appendChild(btn("td-more","回到今天",function(){pick(t)},"mdToday"));card.appendChild(bk)}
    var row=el("div","md-faces");row.setAttribute("role","group");row.setAttribute("aria-label",isT?"今天心情":"这天心情");
    FACES.forEach(function(f,i){var on=!!(d&&d.v===i+1),b=btn("md-face td-keep"+(on?" on":""),null,function(){setV(i+1)},"mdF"+(i+1));
      b.setAttribute("aria-pressed",String(on));b.setAttribute("aria-label",f[1]);b.appendChild(el("span","md-e",f[0]));b.appendChild(el("small",null,f[1]));row.appendChild(b)});
    card.appendChild(row);
    var y=S.days[addD(k,-1)];
    if(!d&&y){var q=btn("md-same td-keep","和前一天一样 "+FACES[y.v-1][0]+((y.tags||[]).length?" · "+y.tags.join("、"):""),sameAsYesterday,"mdSame");card.appendChild(q)}
    if(d){
      if((d.log||[]).length>1){var lg=el("div","md-log");lg.appendChild(el("span","md-logk",isT?"今天的变化":"这天的变化"));
        d.log.forEach(function(x,j){if(j)lg.appendChild(el("span","md-arr","→"));var it=el("span","md-li");it.appendChild(el("span",null,FACES[x.v-1][0]));it.appendChild(el("small",null,hm(x.t)));lg.appendChild(it)});card.appendChild(lg)}
      var mt=btn("md-toggle",noteOpen?"收起原因":"原因和备注 ›"+((d.tags||[]).length||d.note?" · 已填":""),function(){noteOpen=!noteOpen;render()},"mdMore");mt.setAttribute("aria-expanded",String(noteOpen));card.appendChild(mt);
      if(noteOpen){var tg=el("div","md-tags");
        tagOrder().forEach(function(o){var g=o.g,on=(d.tags||[]).indexOf(g)>=0,b=btn("md-tag td-keep"+(on?" on":""),g,function(){var l=(d.tags||[]).slice(),j=l.indexOf(g);if(j>=0)l.splice(j,1);else l.push(g);d.tags=l;changed()},"mdT"+o.i);
          b.setAttribute("aria-pressed",String(on));tg.appendChild(b)});
        if(addingTag){var ti=el("input","md-tagin");ti.type="text";ti.id="mdTagIn";ti.maxLength=8;ti.placeholder="新原因";ti.setAttribute("aria-label","新原因");
          var addT=function(){var v=ti.value.trim();addingTag=false;if(v&&allTags().indexOf(v)<0){S.tags=(S.tags||[]).concat([v]);var l=(d.tags||[]).slice();l.push(v);d.tags=l}changed()};
          ti.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();addT()}else if(e.key==="Escape"){addingTag=false;render()}};ti.onblur=addT;tg.appendChild(ti);setTimeout(function(){ti.focus()},30)}
        else tg.appendChild(btn("md-tag md-add","＋ 自定义",function(){addingTag=true;render()},"mdTagAdd"));
        card.appendChild(tg);
        var n=el("input","md-note");n.type="text";n.id="mdNote";n.maxLength=80;n.placeholder="一句话记下为什么（可不填）";n.value=d.note||"";n.setAttribute("aria-label","心情备注");
        n.onchange=function(){d.note=n.value.trim();save()};n.onkeydown=function(e){if(e.key==="Enter"){n.blur()}};card.appendChild(n);
        var cl=btn("md-clear",clearArm?"再点一次清除这天的心情":"清除这天",clearDay,"mdClear");card.appendChild(cl)}
    }
    // 近 7 天：点一天就能查看或补记
    var wk=el("div","md-week");for(var i=6;i>=0;i--){(function(kk,i){var dd=S.days[kk],c=btn("md-day td-keep"+(kk===t?" today":"")+(kk===k?" sel":""),null,function(){pick(kk)});
      c.appendChild(el("span","md-de",dd?FACES[dd.v-1][0]:"·"));c.appendChild(el("small",null,kk===t?"今天":"周"+WD[parse(kk).getDay()]));
      c.setAttribute("aria-label",fmtDay(kk)+(dd?" "+FACES[dd.v-1][1]:" 没记"));c.title=fmtDay(kk)+(dd?" "+FACES[dd.v-1][1]+(dd.note?"："+dd.note:""):" 没记");wk.appendChild(c)})(addD(t,-i),i)}
    card.appendChild(wk);
    if(histOpen)card.appendChild(history());
    var ins=insights();if(ins.length){var u=el("ul","td-list");ins.forEach(function(x){u.appendChild(el("li",null,x))});card.appendChild(u)}
  }
  // 历史：按月的心情日历 + 这个月的统计 + 最近写过的备注
  function history(){var t=tkey(),box=el("div","md-hist"),ym=histM||t.slice(0,7),Y=+ym.slice(0,4),M=+ym.slice(5,7);
    var nav=el("div","md-hnav");nav.appendChild(btn("td-more","‹",function(){var d=new Date(Y,M-2,1);histM=d.getFullYear()+"-"+pad(d.getMonth()+1);render()},"mdPrevM"));
    nav.appendChild(el("b",null,Y+"年"+M+"月"));
    var nx=btn("td-more","›",function(){var d=new Date(Y,M,1);histM=d.getFullYear()+"-"+pad(d.getMonth()+1);render()},"mdNextM");if(ym>=t.slice(0,7))nx.disabled=true;nav.appendChild(nx);box.appendChild(nav);
    var g=el("div","md-cal");["一","二","三","四","五","六","日"].forEach(function(w){g.appendChild(el("span","md-ch",w))});
    var first=new Date(Y,M-1,1),lead=(first.getDay()+6)%7,days=new Date(Y,M,0).getDate();
    for(var i=0;i<lead;i++)g.appendChild(el("span"));
    var vals=[],cnt=[0,0,0,0,0],tc={};
    for(var dn=1;dn<=days;dn++){(function(dn){var k=ym+"-"+pad(dn),d=S.days[k],fut=k>t;
      var c=btn("md-cd"+(d?" v"+d.v:"")+(k===t?" today":"")+(k===cur()?" sel":""),null,fut?null:function(){pick(k)});if(fut)c.disabled=true;
      c.appendChild(el("small",null,String(dn)));c.appendChild(el("span",null,d?FACES[d.v-1][0]:""));
      c.setAttribute("aria-label",fmtDay(k)+(d?" "+FACES[d.v-1][1]:fut?"":" 没记"));if(d&&d.note)c.title=d.note;g.appendChild(c);
      if(d){vals.push(d.v);cnt[d.v-1]++;(d.tags||[]).forEach(function(x){tc[x]=(tc[x]||0)+1})}})(dn)}
    box.appendChild(g);
    var st=el("div","md-mstat");
    if(vals.length){var av=avg(vals);st.appendChild(el("p",null,"这个月记了 "+vals.length+" 天，平均 "+av.toFixed(1)+" "+FACES[Math.round(av)-1][0]));
      var bar=el("div","md-dist");cnt.forEach(function(n,i){if(!n)return;var s=el("span","md-db v"+(i+1));s.style.flexGrow=n;s.title=FACES[i][1]+" "+n+" 天";s.appendChild(el("i",null,FACES[i][0]+" "+n));bar.appendChild(s)});st.appendChild(bar);
      var top=Object.keys(tc).sort(function(a,b){return tc[b]-tc[a]}).slice(0,3);if(top.length)st.appendChild(el("p","md-top","常见原因："+top.map(function(x){return x+" "+tc[x]+" 次"}).join(" · ")))}
    else st.appendChild(el("p","note","这个月还没有心情记录。点日历里的日子可以补记。"));
    box.appendChild(st);
    var notes=Object.keys(S.days).filter(function(k){return S.days[k].note}).sort().reverse().slice(0,6);
    if(notes.length){box.appendChild(el("h4",null,"最近写下的话"));var ul=el("div","md-notes");notes.forEach(function(k){var d=S.days[k],r=btn("md-nr td-keep",null,function(){histM=k.slice(0,7);pick(k)});
      r.appendChild(el("span","md-ne",FACES[d.v-1][0]));var tx=el("span","md-nt");tx.appendChild(el("small",null,fmtDay(k)+((d.tags||[]).length?" · "+d.tags.join("、"):"")));tx.appendChild(el("span","note-text",d.note));r.appendChild(tx);ul.appendChild(r)});box.appendChild(ul)}
    return box}
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
    merge:function(d){if(!d||!d.days)return 0;var n=0;(d.tags||[]).forEach(function(g){S.tags=S.tags||[];if(S.tags.indexOf(g)<0&&TAGS.indexOf(g)<0){S.tags.push(g);n++}});Object.keys(d.days).forEach(function(k){if(!/^\d{4}-\d\d-\d\d$/.test(k))return;var a=S.days[k],b=d.days[k];if(!b||!b.v)return;if(!a||(b.t||0)>(a.t||0)){S.days[k]=b;n++}});if(n)save();all();return n}};
  all();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){var db=r[0],user=r[1];if(!db||!user)return;
    return user.id().then(function(id){if(!id)return;ref=db.doc("data/users/"+id+"/mood");var first=true;
      ref.onSnapshot(function(s){if(s.metadata.hasPendingWrites)return;
        if(!s.exists){if(first&&!s.metadata.fromCache){first=false;if(Object.keys(S.days).length)save()}return}
        first=false;var b=JSON.parse(JSON.stringify(s.data()));S={days:b.days||{},tags:b.tags||[]};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}all()},function(){ref=null});
    });
  }).catch(function(){});
})();
