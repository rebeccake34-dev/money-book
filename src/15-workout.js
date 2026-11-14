(function(){
const PLAN = {
  1:{name:"上肢·拉",type:"train",ex:[["离心引体 / 弹力带辅助引体","4×5–8"],["哑铃单臂划船","3×8–10/侧"],["高位下拉","3×10–12"],["面拉","3×12–15"],["悬挂：双手→单手辅助","3×最大时长"],["哑铃弯举","2×12"]],
     cardio:"力量练完后：坡度走 30 分钟（坡度 8–12%，4.5–5.5 km/h）。"},
  2:{name:"下肢 A · 深蹲",type:"train",ex:[["杠铃深蹲 / 高脚杯深蹲","4×6–10"],["罗马尼亚硬拉","3×8–10"],["保加利亚分腿蹲","3×10/侧"],["腿弯举","3×12"],["平板支撑","3×45秒"]],
     cardio:"今天不加额外有氧，保证步数即可。"},
  3:{name:"主动恢复",type:"rest",ex:[["散步 / 拉伸 / 泡沫轴","15–20 分钟"]],
     cardio:"坡度走 30–40 分钟，心率保持最大心率的 60–70%。"},
  4:{name:"上肢·推",type:"train",ex:[["俯卧撑（可上斜）","4×力竭前1–2个"],["哑铃卧推","3×8–10"],["坐姿哑铃推举","3×8–10"],["侧平举","3×12–15"],["反向划船","3×10"],["绳索下压","2×12"]],
     cardio:"今天不加额外有氧，保证步数即可。"},
  5:{name:"下肢 B · 臀",type:"train",ex:[["杠铃臀推","4×8–10"],["腿举","3×10–12"],["行走弓步","3×12/侧"],["器械髋外展","3×15"],["悬垂举腿","3×10"]],
     cardio:"今天不加额外有氧，保证步数即可。"},
  6:{name:"有氧日",type:"rest",ex:[],
     cardio:"坡度走 30–40 分钟；状态好可改做 HIIT：单车 30 秒冲刺 + 90 秒慢速 × 6–8 轮。"},
  0:{name:"完全休息",type:"rest",ex:[],
     cardio:"只保留日常步数，好好休息。"}
};
const PLAN_ORIG=PLAN;
/* exercise library: [name, muscle, default sets, who: f=women favour, m=men favour, a=everyone] */
const MUSCLES={chest:"胸",back:"背",shoulder:"肩",arm:"手臂",leg:"腿",glute:"臀",core:"核心",cond:"有氧 / 恢复"};
const DB=[
 ["杠铃卧推","chest","4×6–8","m"],["哑铃卧推","chest","3×8–10","a"],["上斜哑铃卧推","chest","3×8–10","a"],["俯卧撑（可上斜）","chest","4×力竭前1–2个","a"],["跪姿俯卧撑","chest","3×8–12","f"],["双杠臂屈伸","chest","3×6–10","m"],["器械推胸","chest","3×10–12","a"],["绳索夹胸","chest","3×12–15","a"],["哑铃飞鸟","chest","3×12","a"],
 ["引体向上","back","4×5–8","m"],["离心引体 / 弹力带辅助引体","back","4×5–8","f"],["悬挂：双手→单手辅助","back","3×最大时长","a"],["高位下拉","back","3×10–12","a"],["杠铃划船","back","4×6–8","m"],["哑铃单臂划船","back","3×8–10/侧","a"],["坐姿绳索划船","back","3×10–12","a"],["面拉","back","3×12–15","a"],["直臂下压","back","3×12–15","a"],["传统硬拉","back","3×3–5","m"],["反向划船","back","3×10","a"],
 ["站姿杠铃推举","shoulder","4×5–8","m"],["坐姿哑铃推举","shoulder","3×8–10","a"],["阿诺德推举","shoulder","3×10","a"],["侧平举","shoulder","3×12–15","a"],["绳索侧平举","shoulder","3×12–15","a"],["俯身飞鸟","shoulder","3×12–15","a"],
 ["杠铃弯举","arm","3×8–10","m"],["哑铃弯举","arm","2×12","a"],["锤式弯举","arm","3×10–12","a"],["绳索下压","arm","2×12","a"],["窄距卧推","arm","3×6–8","m"],["过头臂屈伸","arm","3×10–12","a"],
 ["杠铃深蹲 / 高脚杯深蹲","leg","4×6–10","a"],["杠铃深蹲","leg","4×5–8","m"],["高脚杯深蹲","leg","3×10–12","f"],["前蹲","leg","3×5–8","m"],["腿举","leg","3×10–12","a"],["保加利亚分腿蹲","leg","3×10/侧","a"],["行走弓步","leg","3×12/侧","a"],["罗马尼亚硬拉","leg","3×8–10","a"],["腿弯举","leg","3×12","a"],["腿屈伸","leg","3×12–15","a"],["提踵","leg","3×15","a"],
 ["杠铃臀推","glute","4×8–10","f"],["单腿臀桥","glute","3×12/侧","f"],["臀桥","glute","3×15","f"],["器械髋外展","glute","3×15","f"],["绳索后踢腿","glute","3×12–15/侧","f"],["相扑深蹲","glute","3×10–12","f"],["弹力带蚌式开合","glute","3×15/侧","f"],["箱式登阶","glute","3×10/侧","f"],["45° 背伸（臀部发力）","glute","3×12–15","f"],
 ["平板支撑","core","3×45秒","a"],["侧平板","core","3×30秒/侧","a"],["悬垂举腿","core","3×10","a"],["死虫","core","3×10/侧","a"],["绳索卷腹","core","3×12–15","a"],["健腹轮","core","3×8–12","m"],["农夫行走","core","3×30米","m"],
 ["散步 / 拉伸 / 泡沫轴","cond","15–20 分钟","a"],["壶铃摇摆","cond","3×15","a"],["波比跳","cond","3×10","a"],["坡度走","cond","30–40 分钟","a"],["单车 HIIT","cond","6–8 轮","a"]
];
const dbSets=n=>{const e=DB.find(x=>x[0]===n);return e?e[2]:"3×10"};
const TR=(name,list,cardio)=>({name,type:"train",ex:list.map(n=>[n,dbSets(n)]),cardio:cardio||"今天不加额外有氧，保证步数即可。"});
const REC={name:"主动恢复",type:"rest",ex:[["散步 / 拉伸 / 泡沫轴","15–20 分钟"]],cardio:"坡度走 30–40 分钟，心率保持最大心率的 60–70%。"};
const CAR={name:"有氧日",type:"rest",ex:[],cardio:"坡度走 30–40 分钟；状态好可改做 HIIT：单车 30 秒冲刺 + 90 秒慢速 × 6–8 轮。"};
const OFF={name:"完全休息",type:"rest",ex:[],cardio:"只保留日常步数，好好休息。"};
const TEMPLATES=[
 {id:"orig",name:"原有搭配：上下肢 + 臀腿",who:"通用 · 每周 4 练",desc:"拉 / 深蹲 / 推 / 臀，中间穿插恢复和有氧。你之前一直在用的这套。",days:PLAN_ORIG},
 {id:"fglute",name:"女生 · 臀腿塑形",who:"女生 · 每周 4 练",desc:"两天臀腿 + 两天上肢，臀部训练量最高，适合想练翘臀、改善体态。",days:{
   1:TR("臀腿 A · 臀推",["杠铃臀推","罗马尼亚硬拉","保加利亚分腿蹲","器械髋外展","平板支撑"]),
   2:TR("上肢 · 背肩",["高位下拉","哑铃单臂划船","坐姿哑铃推举","侧平举","面拉"]),
   3:REC,
   4:TR("臀腿 B · 深蹲",["高脚杯深蹲","单腿臀桥","绳索后踢腿","腿弯举","箱式登阶"]),
   5:TR("上肢 + 核心",["离心引体 / 弹力带辅助引体","上斜哑铃卧推","俯身飞鸟","绳索下压","死虫"]),
   6:CAR,0:OFF}},
 {id:"ffull",name:"女生 · 全身 + 臀（新手友好）",who:"女生 · 每周 3 练",desc:"每次都练全身，额外加一个臀部动作。时间少、刚开始练的首选。",days:{
   1:TR("全身 A",["高脚杯深蹲","哑铃卧推","高位下拉","臀桥","平板支撑"]),
   2:CAR,
   3:TR("全身 B",["罗马尼亚硬拉","坐姿哑铃推举","坐姿绳索划船","弹力带蚌式开合","死虫"]),
   4:REC,
   5:TR("全身 C",["腿举","跪姿俯卧撑","哑铃单臂划船","杠铃臀推","侧平板"]),
   6:CAR,0:OFF}},
 {id:"mppl",name:"男生 · 推拉腿（PPL）",who:"男生 · 每周 6 练",desc:"推、拉、腿各练两次，训练量大，适合有一定基础、以增肌为主。",days:{
   1:TR("推 A · 胸",["杠铃卧推","站姿杠铃推举","上斜哑铃卧推","侧平举","绳索下压"]),
   2:TR("拉 A · 背",["引体向上","杠铃划船","坐姿绳索划船","面拉","杠铃弯举"]),
   3:TR("腿 A · 深蹲",["杠铃深蹲","罗马尼亚硬拉","腿举","腿弯举","提踵"]),
   4:TR("推 B · 肩",["哑铃卧推","坐姿哑铃推举","双杠臂屈伸","绳索侧平举","过头臂屈伸"]),
   5:TR("拉 B · 背宽",["高位下拉","哑铃单臂划船","直臂下压","俯身飞鸟","锤式弯举"]),
   6:TR("腿 B · 前蹲",["前蹲","保加利亚分腿蹲","腿屈伸","腿弯举","悬垂举腿"]),
   0:OFF}},
 {id:"mul",name:"男生 · 上下肢四分化",who:"男生 · 每周 4 练",desc:"两天偏力量（重量大、次数少），两天偏肌肥大（次数多），兼顾力量和围度。",days:{
   1:TR("上肢 · 力量",["杠铃卧推","杠铃划船","站姿杠铃推举","引体向上","窄距卧推"]),
   2:TR("下肢 · 力量",["杠铃深蹲","传统硬拉","腿举","提踵","健腹轮"]),
   3:REC,
   4:TR("上肢 · 肌肥大",["上斜哑铃卧推","坐姿绳索划船","侧平举","绳索夹胸","杠铃弯举","绳索下压"]),
   5:TR("下肢 · 肌肥大",["保加利亚分腿蹲","罗马尼亚硬拉","腿屈伸","腿弯举","悬垂举腿"]),
   6:CAR,0:OFF}},
 {id:"full3",name:"新手全身（男女通用）",who:"通用 · 每周 3 练",desc:"一、三、五练全身，只用最基础的动作，先把动作学标准。",days:{
   1:TR("全身 A",["杠铃深蹲 / 高脚杯深蹲","哑铃卧推","高位下拉","平板支撑"]),
   2:OFF,
   3:TR("全身 B",["罗马尼亚硬拉","坐姿哑铃推举","坐姿绳索划船","死虫"]),
   4:REC,
   5:TR("全身 C",["腿举","俯卧撑（可上斜）","哑铃单臂划船","侧平举"]),
   6:CAR,0:OFF}}
];
const FOODS=[
 // [名称, 份量, kcal, 蛋白质 g, 分类, 别名]
 ["米饭","1 碗 150g",195,4,"主食","白饭"],["糙米饭","1 碗 150g",170,4,"主食",""],["面条","1 碗 熟200g",220,7,"主食","挂面 汤面"],["意面","1 盘 熟200g",310,11,"主食","意大利面 pasta"],
 ["米粉 / 河粉","1 碗 熟200g",220,4,"主食","粉"],["白粥","1 碗 250g",115,2,"主食","稀饭 粥"],["馒头","1 个 100g",220,7,"主食",""],["肉包子","1 个",230,8,"主食","包子"],
 ["饺子","6 个",270,11,"主食","水饺"],["全麦面包","1 片",85,4,"主食","吐司"],["白吐司","1 片",80,3,"主食","面包"],["燕麦","干 40g",150,5,"主食","麦片 oats"],
 ["红薯","1 个 200g",170,3,"主食","地瓜 番薯"],["土豆","1 个 150g",115,3,"主食","马铃薯"],["玉米","1 根",130,5,"主食",""],["紫薯","1 个 150g",125,2,"主食",""],
 ["鸡胸肉","熟 100g",165,31,"肉蛋","鸡肉"],["鸡腿肉","去皮 熟100g",190,25,"肉蛋","鸡肉"],["鸡蛋","1 个",70,6,"肉蛋","水煮蛋 煎蛋"],["蛋白","1 个",17,4,"肉蛋","蛋清"],
 ["瘦牛肉","熟 100g",200,27,"肉蛋","牛肉"],["牛排","150g",330,39,"肉蛋","steak"],["猪里脊","熟 100g",160,26,"肉蛋","瘦猪肉"],["五花肉","熟 100g",480,10,"肉蛋","猪肉"],
 ["羊肉","熟 100g",250,25,"肉蛋",""],["培根","2 片",90,6,"肉蛋","bacon"],["火腿片","2 片",45,7,"肉蛋","ham"],["鸡翅","2 个",200,17,"肉蛋",""],
 ["虾","去壳 熟100g",100,24,"海鲜","虾仁 大虾 prawn"],["三文鱼","熟 100g",205,22,"海鲜","salmon"],["三文鱼刺身","5 片",155,15,"海鲜","生鱼片"],["金枪鱼罐头","水浸 1 罐 95g",100,22,"海鲜","吞拿鱼 tuna"],
 ["白身鱼","熟 100g",105,23,"海鲜","鳕鱼 巴沙鱼 鱼"],["鱿鱼","100g",90,16,"海鲜",""],["扇贝 / 贝类","熟 100g",110,20,"海鲜","蛤蜊"],["蟹棒","3 根",50,4,"海鲜",""],
 ["豆奶 / 豆浆（无糖）","250ml",90,8,"豆奶","soy milk"],["豆奶 / 豆浆（含糖）","250ml",140,8,"豆奶","soy milk"],["全脂牛奶","250ml",160,8,"豆奶","milk"],["脱脂牛奶","250ml",90,9,"豆奶","milk"],
 ["燕麦奶","250ml",120,2,"豆奶","oat milk"],["杏仁奶（无糖）","250ml",40,1,"豆奶","almond milk"],["希腊酸奶（无糖）","170g",100,17,"豆奶","yogurt"],["普通酸奶","1 杯 150g",135,6,"豆奶","yogurt"],
 ["嫩豆腐","150g",85,8,"豆奶","豆腐"],["老豆腐","150g",180,19,"豆奶","豆腐 北豆腐"],["毛豆仁","100g",120,11,"豆奶","毛豆"],["奶酪","1 片 20g",65,4,"豆奶","芝士 cheese"],
 ["蛋白粉","1 勺",120,24,"豆奶","protein"],
 ["西兰花","100g",35,3,"蔬菜","花椰菜"],["炒青菜","1 份",80,3,"蔬菜","绿叶菜 菠菜 生菜"],["沙拉菜（不含酱）","1 碗",20,1,"蔬菜","salad"],["番茄","1 个",25,1,"蔬菜","西红柿"],
 ["黄瓜","1 根",20,1,"蔬菜",""],["胡萝卜","1 根",30,1,"蔬菜",""],["蘑菇","100g",25,3,"蔬菜","菌菇"],["牛油果","半个",120,2,"蔬菜","avocado"],
 ["蓝莓","1 盒 125g",70,1,"水果","blueberry"],["草莓","10 颗",50,1,"水果",""],["香蕉","1 根",105,1,"水果",""],["苹果","1 个",95,0,"水果",""],
 ["橙子","1 个",65,1,"水果","橘子"],["葡萄","100g",70,1,"水果",""],["西瓜","1 块 200g",60,1,"水果",""],["猕猴桃","1 个",45,1,"水果","奇异果"],
 ["芒果","1 个",120,2,"水果",""],["梨","1 个",100,1,"水果",""],
 ["黑咖啡 / 美式","1 杯",5,0,"饮品","coffee"],["拿铁（全脂）","1 杯",150,8,"饮品","咖啡 latte"],["奶茶（正常糖）","1 杯",350,3,"饮品","珍珠奶茶"],["可乐","1 罐",140,0,"饮品","汽水"],
 ["橙汁","250ml",110,2,"饮品","果汁"],["啤酒","1 罐 375ml",140,1,"饮品","酒"],["红酒","1 杯 150ml",125,0,"饮品","酒"],
 ["坚果","1 小把 30g",180,6,"零食外食","杏仁 腰果 核桃"],["花生酱","1 勺 15g",95,4,"零食外食",""],["黑巧克力","20g",110,2,"零食外食",""],["薯片","1 小包 45g",240,3,"零食外食",""],
 ["饼干","2 块",100,1,"零食外食",""],["冰淇淋","1 球",140,2,"零食外食",""],["蛋白棒","1 根",200,20,"零食外食",""],["食用油","1 汤匙",120,0,"零食外食","橄榄油"],
 ["寿司卷","1 条",180,6,"零食外食","sushi"],["汉堡","1 个",500,25,"零食外食",""],["薯条","中份",340,4,"零食外食",""],["披萨","1 片",270,11,"零食外食","pizza"],
 ["炸鸡","2 块",450,30,"零食外食",""],["拉面","1 碗",600,25,"零食外食",""],["越南粉","1 碗",450,30,"零食外食","pho"],["鸡肉沙拉碗","1 份",450,35,"零食外食","salad bowl"]
];
const FCATS=["全部","主食","肉蛋","海鲜","豆奶","蔬菜","水果","饮品","零食外食"];
let flCat="全部",flMul=1;
const PRESETS=[["燕麦酸奶早餐",410,24],["米饭鸡胸午餐",440,37],["香蕉+牛奶",190,8],["三文鱼红薯晚餐",440,27],["蛋白粉 1 勺",120,24]];
const WD=["周日","周一","周二","周三","周四","周五","周六"];
const FLOOR=1400;

const pad=n=>String(n).padStart(2,"0");
const keyOf=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const dayAgo=i=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);return d};
const now=new Date(), todayKey=keyOf(now);
const blank=()=>({ex:{},lifts:{},water:[],food:[],steps:null,cardio:false,weight:null,waist:null,hip:null,thigh:null,arm:null,planDay:null});

let day=blank(), allDays={}, settings={offset:0,applied:null,proT:110,height:null,goal:"cut",tdee:1900,sex:"",age:null,act:1.375,tdeeManual:false,presets:null,cups:[250,500],offLog:[],restAuto:true,syncPlan:true};
let calOff=0,calSel=null;
let chartDays=28,bTab="w",presetEditing=false,restEnd=0,restTimer=null;
let col=null, saveTimer=null, setTimer=null;

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function lsGet(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

const planIdx=d=>(d&&d.planDay!=null?d.planDay:null);
const plans=()=>settings.plans||PLAN_ORIG;
const planOf=(rec,date)=>{
  const k=planIdx(rec)??date.getDay();
  if(keyOf(date)>=todayKey)return plans()[k]||OFF;
  if(rec&&rec.snap)return rec.snap;          // what was planned that day
  return PLAN_ORIG[k];                        // records made before plans were editable
};
const curPlan=()=>planOf(day,now);
const isTrain=()=>curPlan().type==="train";
const GOALCFG={
  cut:{name:"减脂",tr:-0.15,rs:-0.22,floor:1400,fat:0.8},
  gain:{name:"增肌",tr:0.12,rs:0.05,floor:1600,fat:0.9},
  keep:{name:"维持",tr:0.03,rs:-0.03,floor:1500,fat:0.85}};
const goal=()=>GOALCFG[settings.goal]?settings.goal:"cut";
const cfg=()=>GOALCFG[goal()];
/* weight used for calorie maths: 7-day average, else most recent weigh-in */
function calcWeight(){
  const w=[];for(let i=0;i<=6;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.weight)w.push(+r.weight)}
  if(w.length)return avg(w);
  for(let i=7;i<=42;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.weight)return +r.weight}
  return null;
}
/* Mifflin-St Jeor basal metabolic rate */
function bmr(){
  const w=calcWeight(),h=+settings.height,a=+settings.age,sx=settings.sex;
  if(!(w>0)||!(h>=100)||!(a>=14)||!sx)return null;
  return 10*w+6.25*h-5*a+(sx==="m"?5:-161);
}
const autoTdee=()=>{const b=bmr();return b?Math.round(b*(+settings.act||1.375)/10)*10:null};
const isAuto=()=>!settings.tdeeManual&&autoTdee()!=null;
const manualTdee=()=>(+settings.tdee>=1200&&+settings.tdee<=4000)?+settings.tdee:1900;
const tdee=()=>isAuto()?autoTdee():manualTdee();
const r10=v=>Math.round(v/10)*10;
const floorK=()=>{const b=bmr();return goal()==="cut"?Math.max(1200,b?r10(b):cfg().floor):(b?r10(b):cfg().floor)};
const baseK=train=>r10(tdee()*(1+(train?cfg().tr:cfg().rs)));
const kOf=train=>Math.max(floorK(),baseK(train)+(settings.offset||0));
const fatG=()=>{const w=calcWeight();return w?Math.round(w*cfg().fat):({cut:45,gain:55,keep:50})[goal()]};
const kcalT=()=>kOf(isTrain());
const waterT=()=>isTrain()?2500:2000;
const proT=()=>settings.proT||110;

function snap(){try{const p=curPlan();day.snap={name:p.name,type:p.type,ex:p.ex.map(e=>[e[0],e[1]]),cardio:p.cardio}}catch(e){}}
function save(){
  snap();day.at=Date.now();allDays[todayKey]=day; render();
  try{window.__cutHook&&window.__cutHook(totals(day).pro,proT())}catch(e){}
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    lsSet("cut-day-"+todayKey,day);
    if(col){try{await col.doc(todayKey).set(day);$("sync").textContent="已同步到你的账户"}catch(e){if(e&&e.code==="invalid_argument"){col=null;lsSet("cut-local-only",1);$("sync").textContent="你的账号不能存到云端，记录保存在这个浏览器里"}else $("sync").textContent="同步失败，已暂存在本浏览器"}}
  },500);
}
function saveSettings(){
  render();
  clearTimeout(setTimer);
  setTimer=setTimeout(async()=>{
    lsSet("cut-settings",settings);
    if(col){try{await col.doc("settings").set(settings)}catch(e){}}
  },300);
}

function totals(d){
  const kcal=(d.food||[]).reduce((a,f)=>a+(+f.kcal||0),0);
  const pro=(d.food||[]).reduce((a,f)=>a+(+f.pro||0),0);
  const water=(d.water||[]).reduce((a,w)=>a+w.ml,0);
  return {kcal,pro,water};
}
function setBar(el,val,target,overBad){
  el.querySelector("i").style.width=Math.min(100,target?val/target*100:0)+"%";
  el.classList.toggle("over",!!overBad&&val>target);
}
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
function windowWeights(from,to){ // days ago, inclusive
  const out=[];for(let i=from;i<=to;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.weight)out.push(+r.weight)}return out;
}
function windowSteps(from,to){
  const out=[];for(let i=from;i<=to;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.steps!=null)out.push(+r.steps)}return out;
}
function waistSeries(){
  const out=[];for(let i=35;i>=0;i--){const r=allDays[keyOf(dayAgo(i))];if(r&&r.waist)out.push({i,v:+r.waist})}return out;
}
function parseTarget(s){const m=String(s).match(/(\d+)×(\d+)(?:–(\d+))?/);return m?{sets:+m[1],top:+(m[3]||m[2])}:null}
function lastLift(exName){
  for(let i=1;i<=42;i++){
    const d=dayAgo(i), r=allDays[keyOf(d)]; if(!r||!r.lifts)continue;
    const p=planOf(r,d); const j=p.ex.findIndex(e=>e[0]===exName);
    if(j>=0&&r.lifts[j]&&(r.lifts[j].w||r.lifts[j].r))return {...r.lifts[j],date:d};
  }
  return null;
}
const repsArr=s=>String(s||"").split(/[,，\s/]+/).map(Number).filter(n=>n>0);

/* ---------- advice ---------- */
function advice(){
  if(goal()==="gain")return adviceGain();
  if(goal()==="keep")return adviceKeep();
  const w0=windowWeights(0,6), w1=windowWeights(7,13), w2=windowWeights(14,20);
  const a0=avg(w0),a1=avg(w1),a2=avg(w2);
  const actions=[];
  if(w0.length<3||w1.length<3){
    return {cls:"plain",text:`数据还不够：需要连续两周、每周至少 3 次称重才能判断。本周已称 ${w0.length} 次，上周 ${w1.length} 次。`,actions};
  }
  const loss=a1-a0;
  const lossPrev=(w2.length>=3)?a2-a1:null;
  const ws=waistSeries(); let waistDown=false;
  if(ws.length>=2){const recent=ws[ws.length-1], older=ws.find(x=>x.i>=recent.i+7); if(older&&recent.v<older.v)waistDown=true}
  if(loss>0.7){
    actions.push(["每天 +150 kcal",150]);
    return {cls:"warn",text:`本周平均下降 ${loss.toFixed(2)} kg，超过每周 0.7 kg，掉得太快容易掉肌肉。建议每天加 100–150 kcal。`,actions};
  }
  if(loss>=0.2){
    return {cls:"ok",text:`本周平均下降 ${loss.toFixed(2)} kg，在 0.2–0.7 kg 的目标范围内。保持现在的计划，不用调整。`,actions};
  }
  if(waistDown){
    return {cls:"ok",text:`体重变化 ${(-loss).toFixed(2)} kg，但腰围在减少，说明在减脂增肌。不调整。`,actions};
  }
  if(lossPrev===null||lossPrev>=0.2){
    return {cls:"plain",text:`本周平均只下降 ${Math.max(0,loss).toFixed(2)} kg。先观察一周：可能是水分或生理期波动。规则是连续 2 周不到 0.2 kg 才调整。`,actions};
  }
  const st=avg(windowSteps(0,6));
  if(st===null||st<10000){
    return {cls:"warn",text:`已连续 2 周每周下降不到 0.2 kg。第一步：每天多走 2,000 步（近 7 天平均 ${st?Math.round(st):"未记录"} 步）。`,actions};
  }
  if(baseK(false)+(settings.offset||0)-150<floorK()){
    return {cls:"bad",text:`连续 2 周不动，但热量已经接近 ${floorK()} kcal 下限（不低于基础代谢）。不再减热量：建议吃 1–2 周维持热量（约 ${tdee()} kcal）做饮食休息。`,actions};
  }
  actions.push(["每天 −150 kcal（从碳水减）",-150]);
  return {cls:"warn",text:`连续 2 周下降不到 0.2 kg，且步数已够。第二步：每天减 100–150 kcal，从碳水里减。`,actions};
}

function weeklyRates(){
  const w0=windowWeights(0,6), w1=windowWeights(7,13), w2=windowWeights(14,20);
  const a0=avg(w0),a1=avg(w1),a2=avg(w2);
  return {ok:w0.length>=3&&w1.length>=3,n0:w0.length,n1:w1.length,a0,a1,
    rate:(a0&&a1)?(a0-a1)/a1*100:null, prev:(w2.length>=3&&a1)?(a1-a2)/a2*100:null};
}
function seriesChange(field,days){ // latest value vs value ~4 weeks earlier
  const pts=[];for(let i=days+14;i>=0;i--){const r=allDays[keyOf(dayAgo(i))];if(r&&r[field])pts.push({i,v:+r[field]})}
  if(pts.length<2)return null;
  const last=pts[pts.length-1], first=pts.find(p=>p.i>=last.i+days-7);
  return first?{d:last.v-first.v,from:first.v,to:last.v,days:first.i-last.i}:null;
}
/* strength: estimated 1RM per exercise */
function liftStats(from,to){
  const best={}; let vol=0;
  for(let i=from;i<=to;i++){
    const d=dayAgo(i), r=allDays[keyOf(d)]; if(!r||!r.lifts)continue;
    const p=planOf(r,d);
    Object.keys(r.lifts).forEach(j=>{
      const e=p.ex[j], lf=r.lifts[j]; if(!e||!lf)return;
      const w=parseFloat(lf.w), reps=repsArr(lf.r); if(!(w>0)||!reps.length)return;
      reps.forEach(n=>{vol+=w*n; const e1=w*(1+Math.min(n,15)/30); if(!best[e[0]]||e1>best[e[0]])best[e[0]]=e1});
    });
  }
  return {best,vol};
}
function strength(){
  const now2=liftStats(0,13), before=liftStats(14,41);
  const rows=Object.keys(now2.best).map(k=>({k,n:now2.best[k],b:before.best[k]||null}));
  let up=0,flat=0,down=0;
  rows.forEach(r=>{if(r.b==null)return;const c=(r.n-r.b)/r.b*100;r.c=c;if(c>=1)up++;else if(c<=-3)down++;else flat++});
  return {rows,up,flat,down,compared:up+flat+down};
}
function strengthText(st){
  if(!st.compared)return "力量：记录满 3 周以上重量和次数后才能比较。";
  return `力量：${st.compared} 个动作里 ${st.up} 个进步、${st.flat} 个持平、${st.down} 个下降。`;
}
function adviceGain(){
  const R=weeklyRates(), actions=[];
  if(!R.ok)return {cls:"plain",text:`数据还不够：需要连续两周、每周至少 3 次称重才能判断。本周已称 ${R.n0} 次，上周 ${R.n1} 次。`,actions};
  const kg=r=>(R.a1*r/100).toFixed(2), wc=seriesChange("waist",28), st=strength(), stT=strengthText(st);
  if(R.rate>0.5){actions.push(["每天 −150 kcal",-150]);
    return {cls:"warn",text:`本周体重涨了 ${R.rate.toFixed(2)}%（${(R.a0-R.a1).toFixed(2)} kg），超过每周 0.5%（${kg(0.5)} kg）。涨太快多出来的大多是脂肪，建议每天少吃 150 kcal。${stT}`,actions}}
  if(wc&&wc.d>1&&R.rate>0){actions.push(["每天 −100 kcal",-100]);
    return {cls:"warn",text:`体重在涨，但 4 周内腰围也涨了 ${wc.d.toFixed(1)} cm（超过 1 cm），脂肪长得偏多。建议每天少吃 100 kcal，并确认每次训练都在加重或加次数。${stT}`,actions}}
  if(R.rate>=0.25){
    const weak=st.compared&&st.up===0;
    return {cls:weak?"warn":"ok",text:`本周体重涨了 ${R.rate.toFixed(2)}%（${(R.a0-R.a1).toFixed(2)} kg），在 0.25–0.5%（${kg(0.25)}–${kg(0.5)} kg）的目标范围内。${stT}${weak?"力量没有进步，长的可能不是肌肉：先检查训练是否做到接近力竭、有没有逐渐加重，热量不用加。":"保持现在的计划。"}`,actions}}
  if(R.prev===null||R.prev>=0.25)
    return {cls:"plain",text:`本周体重只涨了 ${R.rate.toFixed(2)}%，低于 0.25%（${kg(0.25)} kg）。先观察一周，规则是连续 2 周不够才加热量。${stT}`,actions};
  actions.push(["每天 +150 kcal（主要加碳水）",150]);
  return {cls:"warn",text:`已连续 2 周增重低于每周 0.25%（${kg(0.25)} kg），吃得不够长肌肉。建议每天加 150 kcal，主要加在训练前后的碳水。${stT}`,actions};
}
function adviceKeep(){
  const R=weeklyRates(), actions=[];
  if(!R.ok)return {cls:"plain",text:`数据还不够：需要连续两周、每周至少 3 次称重才能判断。本周已称 ${R.n0} 次，上周 ${R.n1} 次。`,actions};
  if(R.rate>0.3&&(R.prev===null||R.prev>0.3)){actions.push(["每天 −100 kcal",-100]);
    return {cls:"warn",text:`体重持续上升（本周 +${R.rate.toFixed(2)}%），超出维持范围。建议每天少吃 100 kcal。`,actions}}
  if(R.rate<-0.3&&(R.prev===null||R.prev<-0.3)){actions.push(["每天 +100 kcal",100]);
    return {cls:"warn",text:`体重持续下降（本周 ${R.rate.toFixed(2)}%），超出维持范围。建议每天多吃 100 kcal。`,actions}}
  return {cls:"ok",text:`本周体重变化 ${R.rate>0?"+":""}${R.rate.toFixed(2)}%，在 ±0.3% 的维持范围内（偶尔一周超出属于正常波动）。不用调整。`,actions};
}
function renderGoal(){
  document.querySelectorAll("#goalSeg [data-goal]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.goal===goal())));
  if(document.activeElement!==$("tdee"))$("tdee").value=manualTdee();
  if(document.activeElement!==$("bSex"))$("bSex").value=settings.sex||"";
  if(document.activeElement!==$("bAge"))$("bAge").value=settings.age??"";
  if(document.activeElement!==$("bH"))$("bH").value=settings.height??"";
  $("bAct").value=String(settings.act||1.375);
  $("tdeeManual").checked=!!settings.tdeeManual;$("tdeeRow").hidden=!settings.tdeeManual;
  const cw=calcWeight(), b=bmr();
  $("bW").textContent=cw?cw.toFixed(1):"–";$("bBmr").textContent=b?Math.round(b):"–";$("bTdee").textContent=tdee();
  $("bMode").textContent=isAuto()?"自动":"手动";
  const g=goal(), T=kOf(true), Rs=kOf(false);
  const pctTxt={cut:"比维持少 15–22%",gain:"比维持多 5–12%，慢速增肌",keep:"维持 ±3%"}[g];
  $("goalNote").textContent={
    cut:`减脂：训练日 ${T} kcal、休息日 ${Rs} kcal（${pctTxt}，不低于基础代谢）。目标每周体重下降 0.2–0.7 kg，力量尽量保持。`,
    gain:`增肌：训练日 ${T} kcal、休息日 ${Rs} kcal（${pctTxt}）。目标每周体重上涨 0.25–0.5%，力量持续进步，腰围基本不变。`,
    keep:`维持：训练日 ${T} kcal、休息日 ${Rs} kcal（${pctTxt}）。目标体重每周变化不超过 ±0.3%。`}[g]+(isAuto()?` 维持热量 = 基础代谢 × 活动量系数，体重用近 7 天平均，每次称重后自动更新。`:settings.tdeeManual?" 现在用的是你手动填的维持热量，不会随体重变化。":" 填好性别、年龄、身高并记录体重后，会改为按你的体重自动计算。现在先用 "+manualTdee()+" kcal。");
}
function renderMuscle(){
  const R=weeklyRates(), st=strength(), wc=seriesChange("waist",28), lsN=liftStats(0,6), lsP=liftStats(7,13);
  $("mRate").textContent=R.rate==null?"–":(R.rate>0?"+":"")+R.rate.toFixed(2)+"%";
  $("mStr").textContent=st.compared?`${st.up}/${st.compared}`:"–";
  $("mVol").textContent=lsN.vol?Math.round(lsN.vol).toLocaleString():"–";
  $("mWaist").textContent=wc?(wc.d>0?"+":"")+wc.d.toFixed(1):"–";
  // verdict
  let cls="plain",t;
  if(R.rate==null||!st.compared)t="继续记录体重（每周 3 次以上）、腰围，以及每个动作的重量和次数。满 3–4 周后，这里会判断你是在长肌肉还是在长脂肪。";
  else{
    const wUp=R.rate>=0.1, sUp=st.up>=Math.max(1,st.down+1), waistOk=!wc||wc.d<=1;
    if(wUp&&sUp&&waistOk){cls="ok";t="在长肌肉：体重上升、力量进步、腰围稳定。"}
    else if(wUp&&!waistOk){cls="warn";t="体重和腰围一起涨，长了偏多脂肪。增肌期可以少吃一点，训练保持加重。"}
    else if(wUp&&!sUp){cls="warn";t="体重在涨，但力量没进步，多出来的可能是脂肪或水分。重点检查训练强度和渐进加重。"}
    else if(!wUp&&sUp){cls=goal()==="gain"?"plain":"ok";t=goal()==="gain"?"力量在进步，但体重没涨，肌肉增长会比较慢。想更快增肌就加一点热量。":"力量在进步、体重没涨：很可能是在减脂的同时保住甚至增加了肌肉。"}
    else{t="体重和力量都没明显变化。增肌需要：热量略有盈余、蛋白质吃够、每次训练尽量加重或加次数。"}
  }
  if(R.rate!=null&&lsP.vol)t+=`本周训练量比上周${lsN.vol>=lsP.vol?"多":"少"} ${Math.abs(Math.round((lsN.vol-lsP.vol)/lsP.vol*100))}%。`;
  $("mVerdict").className="banner "+cls;$("mVerdict").textContent=t;
  // girth
  ["hip","thigh","arm"].forEach(f=>{if(document.activeElement!==$(f))$(f).value=day[f]??""});
  const names={hip:"臀围",thigh:"大腿围",arm:"上臂围"};
  const g=["hip","thigh","arm"].map(f=>{const c=seriesChange(f,28);return c?`${names[f]} ${c.d>0?"+":""}${c.d.toFixed(1)} cm`:null}).filter(Boolean);
  $("mGirth").textContent=g.length?"近 4 周变化："+g.join(" · ")+"。臀围、大腿围、上臂围变大而腰围不变，是长肌肉的好信号。":"";
  // lifts table
  $("mLifts").innerHTML=st.rows.length?st.rows.sort((a,b)=>(b.c??-999)-(a.c??-999)).map(r=>`<tr><td>${esc(r.k)}</td><td class="n">${r.n.toFixed(1)} kg</td><td class="n">${r.b?r.b.toFixed(1)+" kg":"–"}</td><td class="n">${r.c==null?"–":`<span class="tag" style="${r.c<=-3?"background:var(--bad-soft);color:var(--bad)":r.c<1?"background:var(--bg);color:var(--muted)":""}">${r.c>0?"+":""}${r.c.toFixed(1)}%</span>`}</td></tr>`).join("")
    :`<tr><td colspan="4" class="note">在「今日训练」里填重量和每组次数后，这里会显示每个动作的力量变化。</td></tr>`;
}

/* ---------- chart ---------- */
function renderChart(){
  let N=chartDays;if(!N){const ks=Object.keys(allDays).filter(k=>allDays[k]&&allDays[k].weight).sort();N=ks.length?Math.max(28,Math.round((now-new Date(+ks[0].slice(0,4),+ks[0].slice(5,7)-1,+ks[0].slice(8,10)))/864e5)+1):28}const D=N-1;
  const pts=[];for(let i=D;i>=0;i--){const r=allDays[keyOf(dayAgo(i))];if(r&&r.weight)pts.push({i,v:+r.weight})}
  if(pts.length<2){$("wchart").innerHTML=`<p class="note">记录 2 天以上体重后，这里会显示体重曲线和 7 天平均线。</p>`;return}
  const W=640,H=160,L=36,R=10,T=12,B=22;
  const vals=pts.map(p=>p.v); let lo=Math.min(...vals), hi=Math.max(...vals);
  lo=Math.floor((lo-0.3)*2)/2; hi=Math.ceil((hi+0.3)*2)/2; if(hi-lo<1)hi=lo+1;
  const x=i=>L+(D-i)/D*(W-L-R), y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  let grid="";const step=(hi-lo)>3?1:0.5;
  for(let v=lo;v<=hi+1e-9;v+=step){grid+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v.toFixed(1)}</text>`}
  const dots=pts.map(p=>`<circle cx="${x(p.i)}" cy="${y(p.v)}" r="3" fill="var(--muted)" opacity=".55"/>`).join("");
  const ma=[];for(let i=D;i>=0;i--){const w=[];for(let k=i;k<=i+6;k++){const r=allDays[keyOf(dayAgo(k))];if(r&&r.weight)w.push(+r.weight)}if(w.length>=2)ma.push([x(i),y(avg(w))])}
  const line=ma.length>1?`<polyline points="${ma.map(p=>p.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`:"";
  const end=ma.length?`<circle cx="${ma[ma.length-1][0]}" cy="${ma[ma.length-1][1]}" r="4.5" fill="var(--accent)"/>`:"";
  const lbl=[D,Math.round(D/2),0].map(i=>{const d=dayAgo(i);return `<text x="${x(i)}" y="${H-6}" text-anchor="${i===D?"start":i===0?"end":"middle"}">${d.getMonth()+1}/${d.getDate()}</text>`}).join("");
  $("wchart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:420px" role="img" aria-label="近 4 周体重，点为每日体重，线为 7 天平均">${grid}${dots}${line}${end}${lbl}</svg><p class="note">灰点：每日体重 · 彩色线：7 天平均。看线的方向，不看单天。</p>`;
}

/* ---------- render ---------- */
function render(){
  const plan=curPlan(), t=totals(day), KT=kcalT(), WT=waterT();
  $("dayType").textContent=(isTrain()?"训练日 · ":"休息日 · ")+KT+" kcal";
  $("dayType").classList.toggle("rest",!isTrain());
  $("sKcalT").textContent=KT;$("sWaterT").textContent=WT;
  $("sKcal").textContent=t.kcal;$("sPro").textContent=t.pro;$("sProT").textContent=proT();$("sWater").textContent=t.water;
  const done=plan.ex.filter((_,i)=>day.ex[i]).length;
  $("sTrain").textContent=plan.ex.length?done+"/"+plan.ex.length:"休息";

  // advice
  const a=advice();
  $("advice").className="banner "+a.cls;$("advice").textContent=a.text;
  $("adviceActions").innerHTML=a.actions.map(([l,v])=>`<button type="button" class="primary" data-off="${v}">应用：${l}</button>`).join("")+
    (settings.offset?`<button type="button" id="resetOff">恢复原始目标</button>`:"");
  $("offsetNote").textContent=settings.offset?`当前目标已调整 ${settings.offset>0?"+":""}${settings.offset} kcal/天（训练日 ${kOf(true)}，休息日 ${kOf(false)}）${settings.applied?"，调整于 "+settings.applied:""}。调整后至少观察 2 周再改。`:`${cfg().name}热量目标：训练日 ${kOf(true)} kcal，休息日 ${kOf(false)} kcal。`;
  renderGoal();renderMuscle();

  // body
  if(document.activeElement!==$("weight"))$("weight").value=day.weight??"";
  if(document.activeElement!==$("waist"))$("waist").value=day.waist??"";
  const a0=avg(windowWeights(0,6)),a1=avg(windowWeights(7,13));
  $("avgNow").textContent=a0?a0.toFixed(1):"–";
  $("avgPrev").textContent=a1?a1.toFixed(1):"–";
  $("avgDiff").textContent=(a0&&a1)?((a0-a1>0?"+":"")+(a0-a1).toFixed(2)):"–";
  const ws=waistSeries();$("waistNow").textContent=ws.length?ws[ws.length-1].v:"–";
  renderChart();

  // plan select
  const sel=$("planSel");
  const sig=[1,2,3,4,5,6,0].map(k=>plans()[k].name).join("|");
  if(sel.dataset.sig!==sig){sel.dataset.sig=sig;sel.innerHTML="";[1,2,3,4,5,6,0].forEach(k=>{const o=document.createElement("option");o.value=k;o.textContent=WD[k]+"："+plans()[k].name+(k===now.getDay()?"（今天原计划）":"");sel.appendChild(o)})}
  sel.value=String(planIdx(day)??now.getDay());
  {const t=TEMPLATES.find(x=>x.id===(settings.plans?settings.tpl:"orig"));$("planName").textContent=t?"当前搭配："+t.name:"当前搭配：自定义";}

  // exercises
  $("exList").innerHTML=plan.ex.length?plan.ex.map((e,i)=>{
    const lf=day.lifts[i]||{}, last=lastLift(e[0]), tg=parseTarget(e[1]);
    let hint="";const pr=isPR(e[0],lf);
    if(last){
      const lr=repsArr(last.r);
      hint=`上次 ${last.date.getMonth()+1}/${last.date.getDate()}：${last.w?esc(last.w)+" kg × ":""}${esc(last.r||"")}`;
      if(tg&&lr.length>=tg.sets&&lr.slice(0,tg.sets).every(n=>n>=tg.top))hint+=` <span class="tag">全部做满，今天加 1–2.5 kg</span>`;
    }
    return `<li class="${day.ex[i]?"done":""}"><input type="checkbox" id="ex${i}" data-i="${i}" ${day.ex[i]?"checked":""}><label class="name" for="ex${i}">${esc(e[0])}</label><span class="sets">${esc(e[1])}</span>
      <div class="lift"><input type="number" step="0.5" min="0" inputmode="decimal" placeholder="重量 kg" id="lw${i}" data-lw="${i}" value="${esc(lf.w??"")}" aria-label="${esc(e[0])} 重量">
      <input type="text" class="reps" placeholder="每组次数 8,8,7" id="lr${i}" data-lr="${i}" value="${esc(lf.r??"")}" aria-label="${esc(e[0])} 每组次数">
      ${last&&!lf.w&&!lf.r?`<button type="button" class="same" data-same="${i}">照上次</button>`:""}${pr?`<span class="tag pr">新纪录 ${pr} kg</span>`:""}
      ${hint?`<span>${hint}</span>`:""}</div></li>`}).join("")
    :`<li><span></span><span class="name">今天没有力量训练</span><span></span></li>`;
  $("trainNote").textContent=isTrain()?"每组做到还剩 1–3 个；每组次数用逗号分开。所有组都做到次数上限，下次会提示加重。练前热身 5–10 分钟。":(goal()==="gain"?"休息日蛋白质照样吃够，碳水比训练日少一点就行，肌肉是在休息时长的。":"休息日碳水少一点：去掉训练前的香蕉，午餐米饭减到 100 g。");
  $("cardioText").textContent=plan.cardio+(goal()==="gain"?" 增肌期有氧不用多：每周 2–3 次、每次 20–30 分钟就够，步数保持 7,000–9,000。":"");

  // work-day hint + rest timer
  {let w=[];try{w=(window.__workOn&&window.__workOn(todayKey))||[]}catch(e){}
   const hb=$("workHint");if(w.length&&isTrain()){const s=w[0];hb.hidden=false;hb.textContent=`今天 ${s.start}${s.end?"–"+s.end:""} 要上班。训练放在下班后，或在上面「今天练」换成恢复日也可以。站了一天，腿部训练的重量可以先降一点。`}else hb.hidden=true}
  $("restAuto").checked=settings.restAuto!==false;if(!restEnd)tickRest();
  // steps
  if(document.activeElement!==$("steps"))$("steps").value=day.steps??"";
  if(document.activeElement!==$("cardioType"))$("cardioType").value=day.cardioType||"";
  if(document.activeElement!==$("cardioMin"))$("cardioMin").value=day.cardioMin??"";
  {let m=0,n=0;for(let i=0;i<7;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.cardio){n++;m+=+r.cardioMin||0}}$("cardioWeek").textContent=`近 7 天有氧 ${n} 次`+(m?` · 共 ${m} 分钟`:"")}
  $("cardioDone").checked=!!day.cardio;
  setBar($("stepBar"),+day.steps||0,9000);

  // water
  $("cupBtns").innerHTML=(settings.cups||[250,500]).map(ml=>`<button class="waterbtn" data-ml="${ml}" type="button">+${ml} ml</button>`).join("");
  $("waterFill").style.width=Math.min(100,t.water/WT*100)+"%";
  const last=day.water.length?new Date(day.water[day.water.length-1].t):null;
  const h=new Date().getHours(); let msg,late=false;
  if(t.water>=WT)msg="今天喝水已达标 ✓";
  else if(h<8)msg="08:00 开始第一杯水。";
  else if(h>=21)msg=`今天还差 ${WT-t.water} ml，睡前少量补一点，别一次喝太多。`;
  else if(!last){msg="今天还没喝水，先来一杯 250 ml。";late=true}
  else{const mins=Math.round((Date.now()-last)/60000), next=new Date(last.getTime()+90*60000);
    if(mins>=90){msg=`距离上一杯已经 ${mins} 分钟，该喝水了。`;late=true}
    else msg=`上一杯 ${pad(last.getHours())}:${pad(last.getMinutes())}，下一杯 ${pad(next.getHours())}:${pad(next.getMinutes())}。还差 ${WT-t.water} ml。`}
  $("waterBanner").textContent=msg;$("waterBanner").classList.toggle("late",late);

  // food
  const left=KT-t.kcal;
  $("kcalLeft").textContent=left>=0?`还可以吃 ${left} kcal · 蛋白质还差 ${Math.max(0,proT()-t.pro)} g`:`已超出 ${-left} kcal`;
  setBar($("kcalBar"),t.kcal,KT,true);
  {const pl=presetList();$("presets").innerHTML=pl.map((p,i)=>{const n=day.food.filter(f=>f.name===p.name).length;
     return `<button type="button" data-preset="${i}" data-name="${esc(p.name)}" class="${presetEditing?"rm":""}${n&&!presetEditing?" on":""}" aria-label="${esc(p.name)} ${p.kcal} kcal${n?"，今天已记 "+n+" 次":""}">${presetEditing?"✕ ":""}${esc(p.name)} <span class="note">${p.kcal}</span>${n&&!presetEditing?`<span class="cnt">×${n}</span>`:""}</button>`}).join("")||`<span class="note">还没有常吃的。在下面的记录里点 ☆ 就能存进来。</span>`;
   $("presetEdit").textContent=presetEditing?"完成":"管理"}
  renderFoodLib();
  {const MEALS=["早餐","午餐","加餐","晚餐"],groups={};day.food.forEach((f,i)=>{const m=f.meal||autoMeal(f.t);(groups[m]=groups[m]||[]).push([f,i])});
   const names=presetList().map(p=>p.name);
   $("foodBody").innerHTML=day.food.length?MEALS.filter(m=>groups[m]).map(m=>{const g=groups[m],kc=g.reduce((a,x)=>a+(+x[0].kcal||0),0),pr=g.reduce((a,x)=>a+(+x[0].pro||0),0);
     return `<tr class="meal"><td colspan="2">${m}</td><td class="n">${kc}</td><td class="n">${pr} g</td><td></td></tr>`+g.map(([f,i])=>{const d=new Date(f.t);
       return `<tr><td>${pad(d.getHours())}:${pad(d.getMinutes())}</td><td>${esc(f.name)}${f.cost?` <span class="note">$${(+f.cost).toFixed(2)}</span>`:""}</td><td class="n">${f.kcal}</td><td class="n">${f.pro||0} g</td><td class="x">${names.includes(f.name)?"":`<button type="button" data-fav="${i}" aria-label="存为常吃" title="存为常吃">☆</button>`}<button type="button" data-del="${i}" aria-label="删除">×</button></td></tr>`}).join("")}).join("")
    :`<tr><td colspan="5" class="note">还没有记录。点上面的常吃快速添加，或手动输入，也可以复制昨天。</td></tr>`}

  // macro targets
  const fatT=fatG(), carbT=Math.round((KT-proT()*4-fatT*9)/4);
  {const cf=day.food.filter(f=>f.c!=null||f.f!=null),cE=cf.reduce((a,f)=>a+(+f.c||0),0),fE=cf.reduce((a,f)=>a+(+f.f||0),0),restK=Math.max(0,KT-t.kcal-Math.max(0,proT()-t.pro)*4);
   $("macroTarget").textContent=`今天的目标：蛋白质 ${proT()} g · 脂肪 ${fatT} g · 碳水约 ${carbT} g。`+(t.kcal?` 扣掉还差的蛋白质，碳水和脂肪大约还能吃 ${restK} kcal。`:"")+(cf.length?` 已记录克数的食物：碳水 ${cE} g（还差 ${Math.max(0,carbT-cE)}）· 脂肪 ${fE} g（还差 ${Math.max(0,fatT-fE)}）。`:"")}

  renderWeek();renderRange();renderAdviceExtra();renderGoalSum();
  try{fillCalc();window.__cutRendered&&window.__cutRendered()}catch(e){}
}

function dayScore(k,d){const rec=allDays[k];if(!rec)return null;const p=planOf(rec,d),tt=totals(rec);
  const trained=p.ex.length?p.ex.every((_,j)=>rec.ex&&rec.ex[j]):p.type!=="train",wOk=tt.water>=(p.type==="train"?2500:2000),pOk=tt.pro>=proT();
  const any=tt.kcal||tt.water||rec.cardio||Object.keys(rec.ex||{}).length||rec.weight;if(!any)return null;
  return {n:[trained,!!rec.cardio,wOk,pOk].filter(Boolean).length,trained,cardio:!!rec.cardio,wOk,pOk,kcal:tt.kcal,weight:rec.weight}}
function recOf(k){return k===todayKey?day:allDays[k]}
function dateOf(k){return new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12)}
function saveRec(k,rec){
  if(k===todayKey){day=rec;save();return}
  allDays[k]=rec;lsSet("cut-day-"+k,rec);if(col){col.doc(k).set(rec).catch(()=>{})}render();
}
const CARDIO_RE=/有氧|跑|单车|游泳|快走|坡度走|散步|椭圆|跳绳|HIIT/i;
function recCardio(rec){return !!(rec&&(rec.cardio||(rec.extra||[]).some(x=>x.done&&CARDIO_RE.test(x.name))))}
function dayScore(k,d){const rec=allDays[k];if(!rec)return null;const p=planOf(rec,d),tt=totals(rec);
  const trained=p.ex.length?p.ex.every((_,j)=>rec.ex&&rec.ex[j]):p.type!=="train",cd=recCardio(rec),wOk=tt.water>=(p.type==="train"?2500:2000),pOk=tt.pro>=proT();
  const any=tt.kcal||tt.water||cd||Object.keys(rec.ex||{}).length||rec.weight||(rec.extra||[]).some(x=>x.done);if(!any)return null;
  return {n:[trained,cd,wOk,pOk].filter(Boolean).length,trained,cardio:cd,wOk,pOk,kcal:tt.kcal,weight:rec.weight}}
function shortPlan(p){if(!p)return "";if(p.type!=="train")return /有氧/.test(p.name)?"有氧":/恢复/.test(p.name)?"恢复":"休";return p.name.replace(/\s/g,"").slice(0,4)}
function renderWeek(){
  const end=new Date(now);end.setHours(12,0,0,0);
  const st=new Date(end);st.setDate(end.getDate()-((end.getDay()+6)%7)-21+calOff*7);
  const last=new Date(st);last.setDate(st.getDate()+34);
  $("calRange").textContent=`${st.getMonth()+1}/${st.getDate()} – ${last.getMonth()+1}/${last.getDate()}`;
  if(!calSel)calSel=todayKey;
  let html=["一","二","三","四","五","六","日"].map(x=>`<span class="cal-h">${x}</span>`).join("");
  for(let i=0;i<35;i++){const d=new Date(st);d.setDate(st.getDate()+i);const k=keyOf(d),fut=k>todayKey,rec=allDays[k]||(k===todayKey?day:null);
    const sc=fut?null:dayScore(k,d),lv=sc?sc.n:0,p=planOf(rec,d),ex=(rec&&rec.extra)||[];
    const chg=planIdx(rec)!=null,showP=fut||k===todayKey||(rec&&(Object.keys(rec.ex||{}).length||chg));
    let sub=showP?shortPlan(p)+(ex.length?" +"+ex.length:""):"";const sub2=!fut&&sc&&sc.weight?sc.weight:"";
    const cm=window.__cycleMark?window.__cycleMark(k,"cut"):null;
    const tip=`${d.getMonth()+1}/${d.getDate()} ${p.name}`+(ex.length?" + "+ex.map(x=>x.name).join("、"):"")+(cm?" · "+cm.text:"");
    html+=`<button type="button" class="cal-d lv${lv}${cm?" cy-"+cm.kind+(cm.pred?" cy-pred":""):""}${k===todayKey?" today":""}${fut?" fut":""}${k===calSel?" sel":""}${fut&&p.type!=="train"&&!ex.length?" rest":""}" data-k="${k}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${k===calSel}"><b>${d.getDate()}${chg?'<i class="cal-chg" title="改过计划"></i>':""}</b>${sub?`<span>${esc(String(sub))}</span>`:""}${sub2?`<span class="cal-w">${esc(String(sub2))}</span>`:""}</button>`}
  $("week").innerHTML=html;
  $("calSync").checked=settings.syncPlan!==false;
  renderCalDay();
}
const QUICK=[["有氧 · 坡度走",30],["有氧 · 单车",30],["跑步",30],["拉伸",15],["瑜伽",45],["游泳",30],["散步",40]];
function renderCalDay(){
  const k=calSel||todayKey,d=dateOf(k),rec=recOf(k),p=planOf(rec,d),past=k<todayKey,ex=(rec&&rec.extra)||[];
  const box=$("calDay");if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT"&&document.activeElement.type!=="checkbox")return;
  const wkName=WD[d.getDay()],idx=planIdx(rec);
  let h=`<div class="cd-head"><b>${d.getMonth()+1}月${d.getDate()}日 ${wkName}</b><span class="note">${k===todayKey?"今天":past?"已过去":"还没到"}</span></div>`;
  {const cl=window.__cycleLine?window.__cycleLine(k,"cut"):null;if(cl)h+=`<p class="cd-cyc">${esc(cl)}</p>`;}
  if(past){const sc=dayScore(k,d),tt=rec?totals(rec):null;
    h+=`<p class="cd-line">训练：${esc(p.name)}${p.ex.length?`（完成 ${p.ex.filter((_,j)=>rec&&rec.ex&&rec.ex[j]).length}/${p.ex.length}）`:""}</p>`;
    if(tt)h+=`<p class="cd-line note">有氧 ${recCardio(rec)?"✓":"–"} · 喝水 ${tt.water} ml · 蛋白质 ${tt.pro} g${rec.weight?" · 体重 "+rec.weight+" kg":""}</p>`;
    if(!sc&&!ex.length)h+=`<p class="note">这天没有记录。</p>`;
  }else{
    h+=`<div class="cd-row"><label for="cdPlan">训练</label><select id="cdPlan">`+[1,2,3,4,5,6,0].map(w=>`<option value="${w}" ${(idx??d.getDay())===w?"selected":""}>${esc(plans()[w].name)}${w===d.getDay()?"（${wkName}默认）":""}</option>`).join("")+`</select>
      <input type="time" id="cdTime" value="${esc((rec&&rec.trainAt)||"")}" aria-label="训练时间"><span class="note">时间可不填</span></div>`;
    if(idx!=null&&idx!==d.getDay())h+=`<p class="cd-chg">${k===todayKey?"今天":"这天"}改成了「${esc(p.name)}」，原计划是「${esc((plans()[d.getDay()]||{}).name||"")}」</p>`;
    if(p.ex.length)h+=`<p class="note cd-exs">${p.ex.map((x,j)=>(k===todayKey&&rec&&rec.ex&&rec.ex[j]?"✓ ":"")+esc(x[0])).join(" · ")}</p>`;
  }
  h+=`<div class="cd-list">`+(ex.length?ex.map(x=>`<div class="cd-it${x.done?" done":""}">${past||k===todayKey?`<input type="checkbox" data-xdone="${x.id}" ${x.done?"checked":""} aria-label="完成 ${esc(x.name)}">`:"<span></span>"}<span>${x.time?`<b>${esc(x.time)}</b> `:""}${esc(x.name)}${x.min?` · ${x.min} 分钟`:""}</span><button type="button" data-xdel="${x.id}" aria-label="删除 ${esc(x.name)}">✕</button></div>`).join(""):`<p class="note">${past?"":"还没有加其他健身项目。"}</p>`)+`</div>`;
  h+=`<div class="cd-quick">`+QUICK.map(([n,m],i)=>`<button type="button" data-q="${i}">＋ ${n}</button>`).join("")+`</div>
    <form class="cd-form" id="cdForm"><input type="text" id="cdName" placeholder="自己写：比如 普拉提" maxlength="30"><input type="number" id="cdMin" placeholder="分钟" min="0" max="600" inputmode="numeric"><input type="time" id="cdAt" aria-label="时间"><button type="submit" class="primary">添加</button></form>`;
  if(k!==todayKey)h+=`<div class="row"><button type="button" id="cdGoToday" class="ghost">回到今天</button></div>`;
  box.innerHTML=h;
}
function ensureRec(k){const r=recOf(k);if(r)return JSON.parse(JSON.stringify(r));return blank()}
function syncPlanFor(k){if(settings.syncPlan===false||k<todayKey||!window.__planFit)return;const rec=recOf(k),d=dateOf(k),p=planOf(rec,d);
  try{if(p.type==="train"){const st=(rec&&rec.trainAt)||"";let en="";if(st){const m=+st.slice(0,2)*60+ +st.slice(3)+90;en=pad(Math.floor(m/60)%24)+":"+pad(m%60)}
      window.__planFit.upsert(k,"plan",{sub:p.name,start:st,end:en,note:"来自运动打卡"})}else window.__planFit.remove(k,"plan");
    const ex=(rec&&rec.extra)||[];window.__planFit.prune(k,ex.map(x=>"x-"+x.id));
    ex.forEach(x=>window.__planFit.upsert(k,"x-"+x.id,{sub:x.name+(x.min?" "+x.min+" 分钟":""),start:x.time||"",end:"",note:"来自运动打卡",done:!!x.done}))}catch(e){}}
window.__cutWeek=()=>{try{renderWeek()}catch(e){}};
window.__cutToday=()=>{const p=planOf(day,dateOf(todayKey));return {name:p.name,train:p.type==="train"}};
window.__cutLight=keys=>{const P=plans(),ord=[3,6,0,1,2,4,5];let w=ord.find(i=>P[i]&&P[i].type!=="train"&&P[i].ex.length);if(w==null)w=ord.find(i=>P[i]&&P[i].type!=="train");if(w==null)return null;
  let n=0;keys.forEach(k=>{if(k<todayKey)return;const d=dateOf(k),p=planOf(recOf(k),d);if(p.type!=="train")return;
    if(k===todayKey){const cur=planIdx(day)??now.getDay(),by=Object.assign({},day.exBy||{});by[cur]={ex:day.ex||{},lifts:day.lifts||{}};const keep=by[w];delete by[w];
      day.exBy=by;day.planDay=(w===now.getDay())?null:w;day.ex=keep?keep.ex:{};day.lifts=keep?keep.lifts:{};save()}
    else{const r=ensureRec(k);r.planDay=(w===d.getDay())?null:w;saveRec(k,r)}
    syncPlanFor(k);n++});
  if(n)try{render()}catch(e){}
  return {n,name:P[w].name,sync:settings.syncPlan!==false&&!!window.__planFit}};
function addExtra(k,name,min,time){const r=ensureRec(k);r.extra=[...(r.extra||[]),{id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,min:min||null,time:time||"",done:false}];saveRec(k,r);syncPlanFor(k);
  try{window.__toastAny&&window.__toastAny(`已加到 ${k.slice(5).replace("-","/")}：${name}`+(settings.syncPlan!==false&&k>=todayKey?"，日常计划已同步":""))}catch(e){}}
$("week").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;calSel=b.dataset.k;renderWeek()});
$("calPrev").addEventListener("click",()=>{calOff-=2;renderWeek()});
$("calNext").addEventListener("click",()=>{calOff+=2;renderWeek()});
$("calToday").addEventListener("click",()=>{calOff=0;calSel=todayKey;renderWeek()});
$("calSync").addEventListener("change",e=>{settings.syncPlan=e.target.checked;saveSettings();
  if(e.target.checked){Object.keys(allDays).concat([todayKey]).filter(k=>k>=todayKey).forEach(syncPlanFor);try{window.__toastAny&&window.__toastAny("已打开同步，今天起的健身安排已同步到日常计划")}catch(err){}}
  else try{window.__toastAny&&window.__toastAny("已关闭同步，日常计划里已有的项目会保留")}catch(err){}});
$("calDay").addEventListener("change",e=>{const k=calSel||todayKey,t=e.target;
  if(t.id==="cdPlan"){const v=+t.value,d=dateOf(k);if(k===todayKey){switchToday(v);return}
    else{const r=ensureRec(k);r.planDay=(v===d.getDay())?null:v;saveRec(k,r)}syncPlanFor(k);return}
  if(t.id==="cdTime"){const r=ensureRec(k);r.trainAt=t.value||null;saveRec(k,r);syncPlanFor(k);return}
  if(t.dataset.xdone){const r=ensureRec(k);const x=(r.extra||[]).find(y=>y.id===t.dataset.xdone);if(!x)return;x.done=t.checked;
    if(k===todayKey&&t.checked&&CARDIO_RE.test(x.name)){r.cardio=true;if(x.min)r.cardioMin=(+r.cardioMin||0)+x.min}saveRec(k,r);syncPlanFor(k)}});
$("calDay").addEventListener("click",e=>{const k=calSel||todayKey,b=e.target.closest("button");if(!b)return;
  if(b.dataset.q!=null){const q=QUICK[+b.dataset.q];addExtra(k,q[0],q[1],"");return}
  if(b.dataset.xdel){const r=ensureRec(k);r.extra=(r.extra||[]).filter(y=>y.id!==b.dataset.xdel);saveRec(k,r);if(window.__planFit&&settings.syncPlan!==false&&k>=todayKey)try{window.__planFit.remove(k,"x-"+b.dataset.xdel)}catch(err){}return}
  if(b.id==="cdGoToday"){calSel=todayKey;calOff=0;renderWeek()}});
$("calDay").addEventListener("submit",e=>{if(e.target.id!=="cdForm")return;e.preventDefault();const n=$("cdName").value.trim();if(!n){$("cdName").focus();return}
  const m=Math.round(+$("cdMin").value)||null,t=$("cdAt").value;$("cdName").value="";addExtra(calSel||todayKey,n,m,t)});
function renderAdviceExtra(){
  const ws=new Date(now);ws.setDate(now.getDate()-((now.getDay()+6)%7));let cnt=0;for(let i=0;i<=((now.getDay()+6)%7);i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const r=allDays[keyOf(d)];if(r&&r.weight)cnt++}
  const need=Math.max(0,3-cnt),wb=$("weighCount");
  wb.className="banner "+(need?"warn":"ok");wb.textContent=need?`本周已称 ${cnt} 次，还差 ${need} 次（早上空腹称）。凑够 3 次，下周才能给调整建议。${day.weight?"":"今天还没称。"}`:`本周已称 ${cnt} 次，够了 ✓`;
  const log=(settings.offLog||[]).slice().reverse();
  $("offList").innerHTML=log.length?log.map(x=>`<li>${x.d.slice(5).replace("-","/")}：${x.reset?"恢复原始目标":(x.v>0?"每天 +":"每天 ")+x.v+" kcal"}${x.w?` · 当时 7 天均重 ${(+x.w).toFixed(1)} kg`:""}</li>`).join(""):`<li class="note">还没有调整过。</li>`;
}
function renderGoalSum(){$("goalSum").textContent=`${cfg().name} · 训练日 ${kOf(true)} kcal / 休息日 ${kOf(false)} · 蛋白质 ${proT()} g`}
function isPR(name,lf){const w=parseFloat(lf&&lf.w),reps=repsArr(lf&&lf.r);if(!(w>0)||!reps.length)return null;
  const today=Math.max(...reps.map(n=>w*(1+Math.min(n,15)/30)));let best=0;
  Object.keys(allDays).forEach(k=>{if(k===todayKey)return;const r=allDays[k];if(!r||!r.lifts)return;const p=planOf(r,new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12));
    Object.keys(r.lifts).forEach(j=>{const e=p.ex[j],x=r.lifts[j];if(!e||e[0]!==name||!x)return;const ww=parseFloat(x.w),rr=repsArr(x.r);if(ww>0&&rr.length)best=Math.max(best,...rr.map(n=>ww*(1+Math.min(n,15)/30)))})});
  return best>0&&today>best+0.01?w:null}

/* ---------- protein calculator ---------- */
const GOALS={cut:[1.6,2.2],gain:[1.6,2.2],keep:[1.2,1.6]};
function latestWeight(){for(let i=0;i<=42;i++){const r=allDays[keyOf(dayAgo(i))];if(r&&r.weight)return +r.weight}return null}
function pcalc(){
  const h=parseFloat($("pH").value), w=parseFloat($("pW").value), g=$("pGoal").value;
  $("pNow").textContent=`当前每日目标：${proT()} g`;
  if(!(h>=100&&h<=230)||!(w>=25&&w<=250)){["pBmi","pRef","pRange","pRec"].forEach(id=>$(id).textContent="–");$("pText").textContent="填好身高和体重就会显示结果。";$("pText").className="banner plain";$("pSet").disabled=true;return null}
  const m=h/100, bmi=w/(m*m), ref=bmi>25?25*m*m:w, [lo,hi]=GOALS[g];
  const a=Math.round(ref*lo), b=Math.round(ref*hi), rec=Math.round(ref*(g==="keep"?1.4:2.0)/5)*5;
  $("pBmi").textContent=bmi.toFixed(1);$("pRef").textContent=ref.toFixed(1);$("pRange").textContent=a+"–"+b;$("pRec").textContent=rec;
  $("pText").className="banner ok";
  $("pText").textContent=`每天 ${a}–${b} g，建议 ${rec} g。分 4 餐吃，每餐约 ${Math.round(rec/4)} g；分 3 餐，每餐约 ${Math.round(rec/3)} g。${bmi>25?"（BMI 超过 25，已按 "+ref.toFixed(1)+" kg 计算）":""}`;
  $("pSet").disabled=false;return rec;
}
["pH","pW","pGoal"].forEach(id=>$(id).addEventListener("input",()=>{pcalc();if(id==="pH"){const v=parseFloat($("pH").value);if(v>=100&&v<=230){settings.height=v;clearTimeout(setTimer);setTimer=setTimeout(async()=>{lsSet("cut-settings",settings);if(col){try{await col.doc("settings").set(settings)}catch(e){}}},800)}}}));
$("pSet").addEventListener("click",()=>{const rec=pcalc();if(!rec)return;settings.proT=rec;saveSettings();pcalc();try{window.__cutHook&&window.__cutHook(totals(day).pro,proT())}catch(e){}});
function fillCalc(){if(!fillCalc.g){fillCalc.g=1;$("pGoal").value=goal()}if(settings.height&&document.activeElement!==$("pH")&&!$("pH").value)$("pH").value=settings.height;const lw=latestWeight();if(lw&&document.activeElement!==$("pW")&&!$("pW").value)$("pW").value=lw;pcalc()}
window.__cutProtein=()=>({pro:totals(day).pro,target:proT()});
window.__cutSetTime=function(k,ref,start){try{const r=ensureRec(k);
  if(ref==="plan")r.trainAt=start||null;else{const x=(r.extra||[]).find(y=>"x-"+y.id===ref);if(!x)return;x.time=start||""}
  saveRec(k,r);syncPlanFor(k)}catch(e){}};
window.__bk=window.__bk||{};
window.__bk.cut={
  dump:()=>{allDays[todayKey]=day;return JSON.parse(JSON.stringify({days:allDays,settings}))},
  merge:d=>{if(!d)return 0;let n=0;const rich=r=>r?((r.food||[]).length+(r.water||[]).length+Object.values(r.ex||{}).filter(Boolean).length+(r.weight?1:0)+(r.steps?1:0)+(r.cardio?1:0)+(r.waist?1:0)):0;
    const had=Object.keys(allDays).some(k=>rich(k===todayKey?day:allDays[k])>0);
    Object.keys(d.days||{}).forEach(k=>{if(!/^\d{4}-\d\d-\d\d$/.test(k))return;const b=d.days[k],a=k===todayKey?day:allDays[k];if(!b||!rich(b))return;
      const take=!a||!rich(a)?true:(a.at&&b.at?b.at>a.at:rich(b)>rich(a));
      if(!take)return;n++;
      if(k===todayKey){day=Object.assign(blank(),b);allDays[k]=day}else allDays[k]=b;
      lsSet("cut-day-"+k,allDays[k]);if(col)col.doc(k).set(allDays[k]).catch(()=>{})});
    if(!had&&d.settings){settings=Object.assign(settings,d.settings);lsSet("cut-settings",settings);if(col)col.doc("settings").set(settings).catch(()=>{});n++}
    render();return n}
};
window.__cut={
  rerender:()=>render(),
  cups:()=>(settings.cups||[250,500]).slice(),
  quickFoods:n=>quickFoods(n||6),
  quickAdd:name=>{const x=quickFoods(12).find(f=>f.name===name);if(!x)return false;addFood({name:x.name,kcal:x.kcal,pro:x.pro});return true},
  undoFood:name=>{for(let i=day.food.length-1;i>=0;i--)if(day.food[i].name===name){const f=day.food[i];if(f.exp&&window.__expenses)try{window.__expenses.remove(f.exp)}catch(e){}day.food.splice(i,1);save();return true}return false},
  foodSearch:q=>{q=String(q||"").trim().toLowerCase();if(!q)return [];return FOODS.map((e,i)=>({i,name:e[0],unit:e[1],kcal:e[2],pro:e[3],s:(e[0]+" "+e[5]).toLowerCase()})).filter(x=>x.s.includes(q)).slice(0,6)},
  addLib:i=>{flMul=1;addLibFood(i)},
  undoWater:()=>{if(day.water.length){day.water.pop();save();return true}return false},
  waterCount:()=>day.water.length,
  planFor:d=>{const p=plans()[d.getDay()]||OFF;return {name:p.name,type:p.type}},
  targets:d=>{const p=keyOf(d)===todayKey?curPlan():(plans()[d.getDay()]||OFF),tr=p.type==="train";return {plan:p.name,type:p.type,kcal:kOf(tr),pro:proT(),water:tr?2500:2000}},
  today:()=>{const p=curPlan(),t=totals(day);return {plan:p.name,type:p.type,exDone:p.ex.filter((_,i)=>day.ex[i]).length,exTotal:p.ex.length,cardio:!!day.cardio,water:t.water,waterT:waterT(),pro:t.pro,proT:proT(),kcal:t.kcal,kcalT:kcalT()}},
  checkAllEx:()=>{const idx=[];curPlan().ex.forEach((_,i)=>{if(!day.ex[i]){day.ex[i]=true;idx.push(i)}});if(idx.length)save();return idx},
  uncheckEx:idx=>{(idx||[]).forEach(i=>{day.ex[i]=false});save()},
  record:k=>{const r=k===todayKey?day:allDays[k];if(!r)return null;const t=totals(r),d=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12),p=planOf(r,d);
    return {plan:p.name,type:p.type,exDone:p.ex.filter((_,i)=>r.ex&&r.ex[i]).length,exTotal:p.ex.length,cardio:!!r.cardio,water:t.water,kcal:t.kcal,pro:t.pro,food:(r.food||[]).map(f=>f.name),weight:r.weight||null}},
  cardio:()=>!!day.cardio,
  setCardio:v=>{day.cardio=!!v;save()},
  addWater:ml=>{const t=Date.now();day.water.push({ml,t});save();return t},
  removeWater:t=>{day.water=day.water.filter(w=>w.t!==t);save()},
  addFood:(name,kcal,pro)=>{const t=Date.now();day.food.push({name,kcal,pro,t});save();return t},
  removeFood:t=>{day.food=day.food.filter(f=>f.t!==t);save()}
};

/* ---------- calculator ---------- */
function calc(){
  const p=+$("cP").value||0,c=+$("cC").value||0,f=+$("cF").value||0;
  $("cPk").textContent=Math.round(p*4)+" kcal";$("cCk").textContent=Math.round(c*4)+" kcal";$("cFk").textContent=Math.round(f*9)+" kcal";
  $("cTotal").textContent=Math.round(p*4+c*4+f*9);
  const k=+$("rK").value||0;$("rG").textContent=(k/+$("rM").value).toFixed(1).replace(/\.0$/,"");
}
["cP","cC","cF","rK","rM"].forEach(id=>$(id).addEventListener("input",calc));
$("cAdd").addEventListener("click",()=>{
  const p=+$("cP").value||0,c=+$("cC").value||0,f=+$("cF").value||0,k=Math.round(p*4+c*4+f*9);
  if(!k)return;
  addFood({name:$("cName").value.trim()||`P${p}/C${c}/F${f}`,kcal:k,pro:p,c,f});
  ["cP","cC","cF","cName"].forEach(id=>$(id).value="");calc();
});

/* ---------- events ---------- */
$("date").textContent=`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${WD[now.getDay()]}`;

function switchToday(v){const cur=planIdx(day)??now.getDay();if(v===cur)return;const by=Object.assign({},day.exBy||{});by[cur]={ex:day.ex||{},lifts:day.lifts||{}};const keep=by[v];delete by[v];
  day.exBy=by;day.planDay=(v===now.getDay())?null:v;day.ex=keep?keep.ex:{};day.lifts=keep?keep.lifts:{};save();syncPlanFor(todayKey);
  try{window.__toastAny&&window.__toastAny("今天改成「"+plans()[v].name+"」，健身日历已更新"+(keep?"，之前的记录还在":""))}catch(e){}}
$("planSel").addEventListener("change",e=>switchToday(+e.target.value));
$("exList").addEventListener("change",e=>{const i=e.target.dataset.i;if(i!=null){day.ex[i]=e.target.checked;save()}});
$("exList").addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset.lw!=null){(day.lifts[t.dataset.lw]=day.lifts[t.dataset.lw]||{}).w=t.value;allDays[todayKey]=day;queueSave()}
  if(t.dataset.lr!=null){const L=(day.lifts[t.dataset.lr]=day.lifts[t.dataset.lr]||{}),before=repsArr(L.r).length;L.r=t.value;allDays[todayKey]=day;queueSave();
    if(settings.restAuto!==false&&/[,，\s]$/.test(t.value)&&repsArr(t.value).length>before){const tg=parseTarget(curPlan().ex[+t.dataset.lr][1]);if(!tg||repsArr(t.value).length<tg.sets)startRest(90)}}
});
$("exList").addEventListener("focusout",e=>{if(e.target.dataset.lw!=null||e.target.dataset.lr!=null)save()});
function queueSave(){snap();clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{lsSet("cut-day-"+todayKey,day);if(col){try{await col.doc(todayKey).set(day)}catch(e){}}},800)}
$("weight").addEventListener("change",e=>{const v=parseFloat(e.target.value);day.weight=(v>20&&v<300)?Math.round(v*10)/10:null;save()});
$("waist").addEventListener("change",e=>{const v=parseFloat(e.target.value);day.waist=(v>30&&v<200)?v:null;save()});
["hip","thigh","arm"].forEach(f=>$(f).addEventListener("change",e=>{const v=parseFloat(e.target.value);day[f]=(v>10&&v<200)?v:null;save()}));
$("goalSeg").addEventListener("click",e=>{const b=e.target.closest("[data-goal]");if(!b||b.dataset.goal===goal())return;settings.goal=b.dataset.goal;settings.offset=0;settings.applied=null;$("pGoal").value=goal();saveSettings();pcalc()});
$("tdee").addEventListener("change",e=>{const v=+e.target.value;if(v>=1200&&v<=4000){settings.tdee=Math.round(v);saveSettings()}else e.target.value=manualTdee()});
$("bSex").addEventListener("change",e=>{settings.sex=e.target.value;saveSettings()});
$("bAge").addEventListener("change",e=>{const v=+e.target.value;settings.age=(v>=14&&v<=90)?Math.round(v):null;saveSettings()});
$("bH").addEventListener("change",e=>{const v=parseFloat(e.target.value);settings.height=(v>=100&&v<=230)?v:null;if(settings.height)$("pH").value=settings.height;saveSettings()});
$("bAct").addEventListener("change",e=>{settings.act=+e.target.value;saveSettings()});
$("tdeeManual").addEventListener("change",e=>{settings.tdeeManual=e.target.checked;saveSettings()});
$("steps").addEventListener("change",e=>{day.steps=e.target.value===""?null:Math.max(0,+e.target.value);save()});
$("cardioDone").addEventListener("change",e=>{day.cardio=e.target.checked;save()});
$("cardioType").addEventListener("change",e=>{day.cardioType=e.target.value||null;if(e.target.value&&!day.cardio)day.cardio=true;save()});
$("cardioMin").addEventListener("change",e=>{const v=Math.round(+e.target.value);day.cardioMin=v>0?Math.min(600,v):null;if(v>0&&!day.cardio)day.cardio=true;save()});
$("cupBtns").addEventListener("click",e=>{const b=e.target.closest("[data-ml]");if(!b)return;
  if(b.dataset.rmcup!=null){settings.cups=(settings.cups||[]).filter(x=>x!==+b.dataset.ml);saveSettings();return}
  day.water.push({ml:+b.dataset.ml,t:Date.now()});save()});
$("cupAdd").addEventListener("click",()=>{const v=Math.round(+$("cupNew").value);if(!(v>=50&&v<=2000)){$("cupNew").focus();return}
  const c=settings.cups||[250,500];if(!c.includes(v))settings.cups=[...c,v].sort((a,b)=>a-b);$("cupNew").value="";saveSettings()});
$("waterUndo").addEventListener("click",()=>{if(day.water.length){day.water.pop();save()}});
$("presets").addEventListener("click",e=>{const b=e.target.closest("[data-preset]");if(!b)return;const list=presetList(),p=list.find(x=>x.name===b.dataset.name);if(!p)return;
  if(presetEditing){settings.presets=list.filter(x=>x!==p).map(x=>({name:x.name,kcal:x.kcal,pro:x.pro,c:x.c,f:x.f}));saveSettings();return}
  addFood({name:p.name,kcal:p.kcal,pro:p.pro,c:p.c,f:p.f});
  const n=day.food.filter(f=>f.name===p.name).length,t=totals(day),left=kcalT()-t.kcal;
  try{window.__toastAny&&window.__toastAny(`已记录：${p.name} ${p.kcal} kcal`+(n>1?`（今天第 ${n} 次）`:"")+` · ${left>=0?"还可以吃 "+left:"已超出 "+(-left)} kcal · 蛋白质 ${t.pro}/${proT()} g`)}catch(err){}
  const nb=document.querySelector(`#presets [data-name="${CSS.escape(p.name)}"]`);if(nb){nb.classList.remove("hit");void nb.offsetWidth;nb.classList.add("hit")}});
$("presetEdit").addEventListener("click",()=>{presetEditing=!presetEditing;render()});
$("copyYday").addEventListener("click",()=>{const y=allDays[keyOf(dayAgo(1))];const f=(y&&y.food)||[];if(!f.length){$("copyNote").textContent="昨天没有饮食记录。";return}
  const base=Date.now();f.forEach((x,i)=>{const c={...x,t:base+i,meal:x.meal||autoMeal(x.t)};delete c.cost;delete c.exp;day.food.push(c)});save();$("copyNote").textContent="已复制昨天的 "+f.length+" 项，吃得不一样的可以删掉。"});
function autoMeal(t){const d=new Date(t),m=d.getHours()*60+d.getMinutes();return m<630?"早餐":m<900?"午餐":m<1020?"加餐":"晚餐"}
function addFood(o,meal,cost){const t=Date.now(),f={name:o.name,kcal:Math.max(0,Math.round(+o.kcal||0)),pro:Math.max(0,Math.round(+o.pro||0)),t,meal:meal||autoMeal(t)};
  if(o.c!=null)f.c=Math.round(+o.c);if(o.f!=null)f.f=Math.round(+o.f);
  if(cost>0&&window.__expenses){try{f.exp=window.__expenses.add(cost,"餐饮",o.name,todayKey,"cut");f.cost=cost}catch(e){}}
  day.food.push(f);save()}
function flName(e,m){return e[0]+" "+e[1]+(m!==1?" ×"+m:"")}
function renderFoodLib(){const box=$("flList");if(!box)return;const q=($("flQ").value||"").trim().toLowerCase();
  const cnt={};day.food.forEach(f=>{const b=f.name.replace(/ ×[\d.]+$/,"");cnt[b]=(cnt[b]||0)+1});
  const list=FOODS.map((e,i)=>[e,i]).filter(([e])=>(q||flCat==="全部"||e[4]===flCat)&&(!q||(e[0]+" "+e[5]).toLowerCase().includes(q)));
  $("flCats").innerHTML=FCATS.map(c=>`<button type="button" class="chip" data-fc="${c}" aria-pressed="${c===flCat}">${c}</button>`).join("");
  $("flMul").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.mul===flMul)));
  box.innerHTML=list.length?list.map(([e,i])=>{const n=cnt[e[0]+" "+e[1]]||0;return `<div class="lib-item"><div><div>${esc(e[0])}${n?` <span class="note">今天 ×${n}</span>`:""}</div><div class="meta">${esc(e[1])} · ${Math.round(e[2]*flMul)} kcal · 蛋白质 ${Math.round(e[3]*flMul)} g${flMul!==1?" · "+flMul+" 份":""}</div></div><span></span><button type="button" data-food="${i}" aria-label="记录 ${esc(e[0])}">＋</button></div>`}).join(""):`<p class="note" style="padding:10px 0">没找到，可以在下面自己填。</p>`}
function addLibFood(i){const e=FOODS[i];if(!e)return;const m=flMul,name=flName(e,m);addFood({name,kcal:e[2]*m,pro:e[3]*m});flMul=1;renderFoodLib();
  const t=totals(day),left=kcalT()-t.kcal;try{window.__toastAny&&window.__toastAny(`已记录：${name} ${Math.round(e[2]*m)} kcal · ${left>=0?"还可以吃 "+left:"已超出 "+(-left)} kcal · 蛋白质 ${t.pro}/${proT()} g`)}catch(err){}}
$("flQ").addEventListener("input",renderFoodLib);
$("flCats").addEventListener("click",e=>{const b=e.target.closest("[data-fc]");if(!b)return;flCat=b.dataset.fc;$("flQ").value="";renderFoodLib()});
$("flMul").addEventListener("click",e=>{const b=e.target.closest("[data-mul]");if(!b)return;flMul=+b.dataset.mul;renderFoodLib()});
$("flList").addEventListener("click",e=>{const b=e.target.closest("[data-food]");if(b)addLibFood(+b.dataset.food)});
try{if(localStorage.getItem("food-lib-open")==="0")$("foodLib").open=false}catch(e){}
$("foodLib").addEventListener("toggle",()=>{try{localStorage.setItem("food-lib-open",$("foodLib").open?"1":"0")}catch(e){}});
function quickFoods(n){const stat={};Object.keys(allDays).sort().forEach(k=>{if(k===todayKey)return;((allDays[k]&&allDays[k].food)||[]).forEach(f=>{if(!f||!f.name)return;const s=stat[f.name]||(stat[f.name]={name:f.name,kcal:f.kcal,pro:f.pro||0,c:0});s.c++;s.kcal=f.kcal;s.pro=f.pro||0})});
  const out=Object.values(stat).filter(x=>x.c>=2).sort((a,b)=>b.c-a.c).slice(0,n),have=new Set(out.map(x=>x.name));
  presetList().forEach(p=>{if(out.length<n&&!have.has(p.name)){out.push({name:p.name,kcal:p.kcal,pro:p.pro||0});have.add(p.name)}});
  return out.map(x=>({name:x.name,kcal:x.kcal,pro:x.pro,n:day.food.filter(f=>f.name===x.name).length}))}
function presetList(){
  const base=(settings.presets||PRESETS.map(p=>({name:p[0],kcal:p[1],pro:p[2]})));
  const cnt={};Object.keys(allDays).forEach(k=>{if(k>=todayKey)return;((allDays[k]&&allDays[k].food)||[]).forEach(f=>{cnt[f.name]=(cnt[f.name]||0)+1})});
  return base.map((p,i)=>({...p,_n:cnt[p.name]||0,_i:i})).sort((a,b)=>b._n-a._n||a._i-b._i);
}
$("foodForm").addEventListener("submit",e=>{e.preventDefault();const name=$("fName").value.trim();if(!name)return;
  addFood({name,kcal:$("fKcal").value,pro:$("fPro").value},$("fMeal").value,+$("fCost").value||0);e.target.reset();$("fName").focus()});
$("foodBody").addEventListener("click",e=>{
  const fv=e.target.closest("[data-fav]");if(fv){const f=day.food[+fv.dataset.fav];if(!f)return;const list=presetList().map(x=>({name:x.name,kcal:x.kcal,pro:x.pro,c:x.c,f:x.f}));
    if(!list.some(x=>x.name===f.name)){list.push({name:f.name,kcal:f.kcal,pro:f.pro,c:f.c,f:f.f});settings.presets=list;saveSettings()}return}
  const b=e.target.closest("[data-del]");if(!b)return;const f=day.food[+b.dataset.del];
  if(f&&f.exp&&window.__expenses)try{window.__expenses.remove(f.exp)}catch(err){}
  day.food.splice(+b.dataset.del,1);save()});
$("adviceActions").addEventListener("click",e=>{
  const b=e.target.closest("[data-off]");
  if(b){settings.offset=(settings.offset||0)+(+b.dataset.off);settings.applied=todayKey;settings.offLog=[...(settings.offLog||[]),{d:todayKey,v:+b.dataset.off,w:avg(windowWeights(0,6))}];saveSettings();return}
  if(e.target.id==="resetOff"){settings.offLog=[...(settings.offLog||[]),{d:todayKey,v:-(settings.offset||0),reset:true,w:avg(windowWeights(0,6))}];settings.offset=0;settings.applied=null;saveSettings()}
});
setInterval(()=>{if(!document.activeElement||!document.activeElement.closest("#exList,.calc,#foodForm"))render()},60000);
document.querySelectorAll("[data-btab]").forEach(b=>b.addEventListener("click",()=>{bTab=b.dataset.btab;
  document.querySelectorAll("[data-btab]").forEach(x=>x.setAttribute("aria-selected",String(x===b)));
  document.querySelectorAll("[data-bpane]").forEach(p=>p.hidden=p.dataset.bpane!==bTab)}));
$("wRange").addEventListener("click",e=>{const b=e.target.closest("[data-range]");if(!b)return;chartDays=+b.dataset.range;renderChart();renderRange()});
function renderRange(){document.querySelectorAll("#wRange [data-range]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.range===chartDays)))}
/* rest timer */
let audioCtx=null;
function beep(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(t=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=880;o.connect(g);g.connect(audioCtx.destination);g.gain.setValueAtTime(.25,audioCtx.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+t+.25);o.start(audioCtx.currentTime+t);o.stop(audioCtx.currentTime+t+.3)})}catch(e){}
  try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}
function tickRest(){const left=Math.max(0,Math.round((restEnd-Date.now())/1000));
  $("restTime").textContent=restEnd?pad(Math.floor(left/60))+":"+pad(left%60):"--:--";$("restBox").classList.toggle("on",!!restEnd&&left>0);
  if(restEnd&&left<=0){restEnd=0;clearInterval(restTimer);restTimer=null;$("restTime").textContent="开始下一组";$("restBox").classList.add("done");beep();
    try{window.__toastAny&&window.__toastAny("休息结束，开始下一组")}catch(e){}}}
function startRest(sec){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
  restEnd=Date.now()+sec*1000;$("restBox").classList.remove("done");clearInterval(restTimer);restTimer=setInterval(tickRest,250);tickRest()}
$("restBox").addEventListener("click",e=>{const b=e.target.closest("[data-rest]");if(b){startRest(+b.dataset.rest);return}
  if(e.target.id==="restStop"){restEnd=0;clearInterval(restTimer);restTimer=null;$("restBox").classList.remove("done","on");tickRest()}});
$("restAuto").addEventListener("change",e=>{settings.restAuto=e.target.checked;saveSettings()});
$("exList").addEventListener("click",e=>{const b=e.target.closest("[data-same]");if(!b)return;const i=+b.dataset.same,ex=curPlan().ex[i];if(!ex)return;
  const last=lastLift(ex[0]);if(!last)return;day.lifts[i]={w:last.w||"",r:last.r||""};save()});

/* ---------- plan editor ---------- */
let edDay=now.getDay(), libM="all", libG=null;
const ORDER=[1,2,3,4,5,6,0];
const myPlans=()=>{if(!settings.plans)settings.plans=JSON.parse(JSON.stringify(PLAN_ORIG));return settings.plans};
function mutate(k,fn){
  const P=myPlans(), todayK=planIdx(day)??now.getDay();
  const before=k===todayK?P[k].ex.map(e=>e[0]):null;
  fn(P[k]); settings.tpl=null;
  if(before){ // keep today's ticks and weights attached to the same exercises
    const ex={},lifts={};
    P[k].ex.forEach((e,i)=>{const j=before.indexOf(e[0]);if(j>=0){if(day.ex[j])ex[i]=day.ex[j];if(day.lifts[j])lifts[i]=day.lifts[j]}});
    day.ex=ex;day.lifts=lifts;save();
  }
  saveSettings();renderEditor();
}
function renderEditor(){
  if($("planEditor").hidden)return;
  const P=plans();
  $("tplList").innerHTML=TEMPLATES.map(t=>`<div class="tpl ${settings.tpl===t.id||(!settings.plans&&t.id==="orig")?"on":""}"><div class="tpl-top"><b>${esc(t.name)}</b><button type="button" data-tpl="${t.id}">${settings.tpl===t.id||(!settings.plans&&t.id==="orig")?"正在使用":"使用这套"}</button></div><small>${esc(t.who)}</small><span class="note">${esc(t.desc)}</span><span class="note">${ORDER.map(k=>WD[k].slice(1)+" "+t.days[k].name).join(" · ")}</span></div>`).join("");
  $("wdSeg").innerHTML=ORDER.map(k=>`<button type="button" data-wd="${k}" aria-pressed="${k===edDay}">${WD[k].slice(1)}</button>`).join("");
  const d=P[edDay];
  $("dayEdit").innerHTML=`<div class="pcalc" style="grid-template-columns:2fr 1fr">
      <div class="field"><label for="edName">${WD[edDay]}叫什么</label><input type="text" id="edName" maxlength="20" value="${esc(d.name)}"></div>
      <div class="field"><label for="edType">类型</label><select id="edType"><option value="train"${d.type==="train"?" selected":""}>训练日</option><option value="rest"${d.type==="rest"?" selected":""}>休息日</option></select></div></div>
    <div>${d.ex.length?d.ex.map((e,i)=>`<div class="ed-row"><span class="nm">${esc(e[0])}</span><input type="text" data-sets="${i}" value="${esc(e[1])}" aria-label="${esc(e[0])} 组数"><span class="ed-btns"><button type="button" data-up="${i}" aria-label="上移"${i===0?" disabled":""}>↑</button><button type="button" data-down="${i}" aria-label="下移"${i===d.ex.length-1?" disabled":""}>↓</button><button type="button" data-rm="${i}" aria-label="删除">×</button></span></div>`).join(""):`<p class="note">这天还没有动作。从下面的动作库添加，或者保持为休息日。</p>`}</div>
    <div class="field"><label for="edCardio">有氧 / 备注</label><textarea id="edCardio" rows="2" maxlength="200">${esc(d.cardio||"")}</textarea></div>
    <p class="note">训练日和休息日的热量目标不一样。改了「类型」，这天的热量目标也会跟着变。</p>`;
  if(libG===null)libG=settings.sex||"all";
  $("libG").value=libG;
  $("libM").innerHTML=[["all","全部"],...Object.entries(MUSCLES)].map(([k,v])=>`<button type="button" class="chip" data-m="${k}" aria-pressed="${k===libM}">${v}</button>`).join("");
  renderLib();
}
function renderLib(){
  const q=$("libQ").value.trim(), have=new Set(plans()[edDay].ex.map(e=>e[0]));
  const list=DB.filter(e=>(libM==="all"||e[1]===libM)&&(libG==="all"||e[3]===libG||e[3]==="a")&&(!q||e[0].includes(q)));
  const tag={f:"女生常用",m:"男生常用",a:"通用"};
  $("libList").innerHTML=list.length?list.map(e=>`<div class="lib-item"><div><div>${esc(e[0])}</div><div class="meta">${MUSCLES[e[1]]} · ${tag[e[3]]} · ${esc(e[2])}</div></div><span></span><button type="button" data-add="${esc(e[0])}"${have.has(e[0])?" disabled":""} aria-label="添加 ${esc(e[0])}">${have.has(e[0])?"已加":"＋"}</button></div>`).join(""):`<p class="note" style="padding:10px 0">没找到，可以在下面自己添加。</p>`;
}
$("editPlanBtn").addEventListener("click",()=>{const ed=$("planEditor");ed.hidden=!ed.hidden;$("editPlanBtn").textContent=ed.hidden?"调整计划 / 换一套搭配":"收起训练计划设置";if(!ed.hidden){edDay=planIdx(day)??now.getDay();renderEditor();ed.scrollIntoView({behavior:"smooth",block:"start"})}});
$("planEditor").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.tpl){const t=TEMPLATES.find(x=>x.id===b.dataset.tpl);if(!t||settings.tpl===t.id)return;
    if(!b.dataset.armed){b.dataset.armed="1";const o=b.textContent;b.textContent="再点一次确认替换整周安排";setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent=o}},4000);return}
    const todayK=planIdx(day)??now.getDay(), before=plans()[todayK].ex.map(x=>x[0]);
    settings.plans=JSON.parse(JSON.stringify(t.days));settings.tpl=t.id;
    const ex={},lifts={};settings.plans[todayK].ex.forEach((x,i)=>{const j=before.indexOf(x[0]);if(j>=0){if(day.ex[j])ex[i]=day.ex[j];if(day.lifts[j])lifts[i]=day.lifts[j]}});day.ex=ex;day.lifts=lifts;
    save();saveSettings();renderEditor();return}
  if(b.dataset.wd!=null){edDay=+b.dataset.wd;renderEditor();return}
  if(b.dataset.m){libM=b.dataset.m;renderEditor();return}
  if(b.dataset.add){const n=b.dataset.add;const m=(DB.find(x=>x[0]===n)||[])[1];mutate(edDay,d=>{d.ex.push([n,dbSets(n)]);if(m!=="cond")d.type="train"});return}
  if(b.dataset.rm!=null){const i=+b.dataset.rm;mutate(edDay,d=>d.ex.splice(i,1));return}
  if(b.dataset.up!=null){const i=+b.dataset.up;if(i>0)mutate(edDay,d=>{[d.ex[i-1],d.ex[i]]=[d.ex[i],d.ex[i-1]]});return}
  if(b.dataset.down!=null){const i=+b.dataset.down;mutate(edDay,d=>{if(i<d.ex.length-1)[d.ex[i+1],d.ex[i]]=[d.ex[i],d.ex[i+1]]});return}
});
$("planEditor").addEventListener("change",e=>{
  const t=e.target;
  if(t.id==="edName"){const v=t.value.trim();if(v)mutate(edDay,d=>d.name=v);else t.value=plans()[edDay].name;return}
  if(t.id==="edType"){mutate(edDay,d=>d.type=t.value);return}
  if(t.id==="edCardio"){mutate(edDay,d=>d.cardio=t.value.trim());return}
  if(t.dataset.sets!=null){const i=+t.dataset.sets,v=t.value.trim();if(v)mutate(edDay,d=>d.ex[i][1]=v);return}
  if(t.id==="libG"){libG=t.value;renderLib();return}
});
$("libQ").addEventListener("input",renderLib);
$("customEx").addEventListener("submit",e=>{e.preventDefault();const n=$("cxName").value.trim();if(!n)return;const st=$("cxSets").value.trim()||"3×10";
  if(plans()[edDay].ex.some(x=>x[0]===n)){$("cxName").select();return}
  mutate(edDay,d=>{d.ex.push([n,st]);if(d.type!=="train")d.type="train"});$("cxName").value="";$("cxSets").value=""});

/* ---------- load ---------- */
const local=lsGet("cut-day-"+todayKey); if(local)day=Object.assign(blank(),local);
try{for(let i=0;i<localStorage.length;i++){const lk=localStorage.key(i);if(lk&&lk.indexOf("cut-day-")===0){const k=lk.slice(8);if(k!==todayKey){const v=lsGet(lk);if(v)allDays[k]=v}}}}catch(e){}
const ls=lsGet("cut-settings");if(ls)settings=Object.assign(settings,ls);
allDays[todayKey]=day;
render();calc();

(async()=>{
  const timer=setTimeout(()=>{if(!col)$("sync").textContent="未连接账户，数据暂存在本浏览器"},10000);
  try{
    if(lsGet("cut-local-only")){clearTimeout(timer);$("sync").textContent="记录保存在这个浏览器里";return}
    if(!window.claude||!claude.use){clearTimeout(timer);$("sync").textContent="未连接账户，数据暂存在本浏览器";return}
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
    const uid=user&&await user.id();
    if(!db||!uid){clearTimeout(timer);$("sync").textContent="未登录，数据暂存在本浏览器";return}
    const c=db.collection("data/users/"+uid).doc("cut").collection("days");
    const snap=await c.get();
    let remoteToday=null;
    snap.docs.forEach(s=>{if(!s.exists)return;const v=JSON.parse(JSON.stringify(s.data()));if(s.id==="settings")settings=Object.assign({offset:0,applied:null,proT:110,goal:"cut",tdee:1900,sex:"",age:null,act:1.375,tdeeManual:false,presets:null,cups:[250,500],offLog:[],restAuto:true,syncPlan:true},v);else{allDays[s.id]=v;if(s.id===todayKey)remoteToday=JSON.parse(JSON.stringify(v))}});
    if(remoteToday){
      const rc=(remoteToday.food||[]).length+(remoteToday.water||[]).length, lc=day.food.length+day.water.length;
      const newer=(remoteToday.at&&local&&local.at)?remoteToday.at>=local.at:rc>=lc;
      if(!local||newer)day=Object.assign(blank(),remoteToday);
    }
    allDays[todayKey]=day;
    col=c; clearTimeout(timer);
    $("sync").textContent="已连接，记录会同步到你的账户";
    render();
    if(local&&!remoteToday)save();
  }catch(e){clearTimeout(timer);$("sync").textContent="同步不可用，数据暂存在本浏览器"}
})();

})();