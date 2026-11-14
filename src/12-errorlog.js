(function(){
  var VER="11/14-1500",log=[],busy=false;
  function push(kind,msg,stack){
    var e={kind:kind,msg:String(msg||"").slice(0,400),stack:String(stack||"").slice(0,1500),ua:navigator.userAgent.slice(0,200),ver:VER,t:new Date().toISOString(),tab:(function(){try{return localStorage.getItem("ledger-tab")}catch(x){return ""}})()};
    log.push(e);if(log.length>20)log.shift();
    try{var old=JSON.parse(localStorage.getItem("debug-log")||"[]");old.push(e);localStorage.setItem("debug-log",JSON.stringify(old.slice(-20)))}catch(x){}
    var b=document.getElementById("errBar");if(b){b.hidden=false;b.textContent="页面出错了，已经自动记录，告诉 Claude「出错了」就行。错误："+e.msg.slice(0,120);clearTimeout(push.t);push.t=setTimeout(function(){b.hidden=true},9000)}
    send();
  }
  function send(){if(busy||!(window.claude&&window.claude.use))return;busy=true;
    Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){var db=r[0],u=r[1];if(!db||!u){busy=false;return}
      return u.id().then(function(id){if(!id){busy=false;return}var ref=db.doc("data/users/"+id+"/debuglog");
        return ref.get().then(function(s){var old=(s.exists&&s.data().list)||[];return ref.set({list:old.concat(log).slice(-30)})}).then(function(){log=[];busy=false})})}).catch(function(){busy=false})}
  window.addEventListener("error",function(ev){push("error",ev.message,(ev.error&&ev.error.stack)||(ev.filename+":"+ev.lineno+":"+ev.colno))});
  window.addEventListener("unhandledrejection",function(ev){var r=ev.reason;push("promise",r&&r.message||r,r&&r.stack)});
  window.__debugPush=push;
})();