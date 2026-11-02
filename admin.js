"use strict";
const $=id=>document.getElementById(id);
const key="visitvakil-admin-preview-v1";
const demo={
 requests:[
  {id:"R-101",topic:"حقوقی · ملکی و ثبتی",client:"کاربر نمونه ۱",status:"waiting",summary:"اختلاف درباره انتقال سند رسمی",created:"۱۴:۳۰"},
  {id:"R-102",topic:"کیفری · شکایت",client:"کاربر نمونه ۲",status:"waiting",summary:"درخواست راهنمایی برای شکایت کیفری",created:"۱۳:۴۵"},
  {id:"R-103",topic:"خانواده · مهریه",client:"کاربر نمونه ۳",status:"assigned",lawyer:"وکیل نمونه ۱",summary:"مشاوره درباره مهریه",created:"۱۲:۱۰"}
 ],
 conversations:[
  {id:"C-201",topic:"حقوقی · قراردادها",client:"کاربر نمونه ۴",lawyer:"وکیل نمونه ۱",status:"active",messages:[{text:"سلام، برای موضوع قرارداد مشاوره می‌خواهم.",from:"client",at:"۱۲:۰۰"},{text:"سلام، مدارک قرارداد را بررسی می‌کنیم.",from:"lawyer",at:"۱۲:۰۳"}]},
  {id:"C-202",topic:"خانواده · مهریه",client:"کاربر نمونه ۳",lawyer:"وکیل نمونه ۲",status:"active",messages:[{text:"درخواست مشاوره دارم.",from:"client",at:"۱۱:۱۵"}]},
  {id:"C-203",topic:"کیفری · سرقت",client:"کاربر نمونه ۵",lawyer:"وکیل نمونه ۳",status:"completed",messages:[{text:"مشاوره پایان یافت.",from:"lawyer",at:"دیروز"}]}
 ],
 support:[
  {id:"S-301",subject:"مشکل در نمایش درخواست‌ها",owner:"وکیل نمونه ۱",role:"وکیل",status:"open",messages:[{text:"درخواست‌های جدید را نمی‌بینم.",from:"owner",at:"۱۴:۱۰"}]},
  {id:"S-302",subject:"پیگیری پرداخت",owner:"کاربر نمونه ۶",role:"کاربر",status:"open",messages:[{text:"پرداخت انجام شده ولی وضعیت به‌روز نشده است.",from:"owner",at:"۱۳:۰۵"}]},
  {id:"S-303",subject:"راهنمایی حساب",owner:"وکیل نمونه ۲",role:"وکیل",status:"closed",messages:[{text:"مشکل رفع شد.",from:"admin",at:"دیروز"}]}
 ],
 accounts:[
  {id:"A-401",name:"وکیل نمونه ۱",type:"lawyer",license:"نمونه ۱۰۰۱",city:"کیش",status:"review"},
  {id:"A-402",name:"وکیل نمونه ۲",type:"lawyer",license:"نمونه ۱۰۰۲",city:"گراش",status:"verified"},
  {id:"A-403",name:"کاربر نمونه ۳",type:"client",city:"تهران",status:"active"},
  {id:"A-404",name:"وکیل نمونه ۳",type:"lawyer",license:"نمونه ۱۰۰۳",city:"بندرعباس",status:"review"}
 ]
};
function load(){try{let x=JSON.parse(localStorage.getItem(key));if(x&&["requests","conversations","support","accounts"].every(k=>Array.isArray(x[k])))return x}catch(e){console.warn(e)}return structuredClone(demo)}
let data=load(),tab="home",filter="all",search="",selected=null;
function save(){try{localStorage.setItem(key,JSON.stringify(data))}catch(e){alert("ذخیره‌سازی مرورگر ممکن نیست: "+e.message)}}
const fa=n=>new Intl.NumberFormat("fa-IR").format(n);
const words={home:"خانه",requests:"درخواست‌ها",conversations:"گفتگوها",support:"پشتیبانی",accounts:"حساب‌ها"};
function status(v){return ({waiting:"در انتظار وکیل",assigned:"پذیرفته‌شده",active:"فعال",completed:"پایان‌یافته",open:"باز",closed:"بسته",review:"نیازمند بررسی",verified:"تأیید‌شده"})[v]||v}
function options(){return tab==="requests"?[["all","همه"],["waiting","در انتظار"],["assigned","پذیرفته‌شده"]]:tab==="conversations"?[["all","همه"],["active","فعال"],["completed","پایان‌یافته"]]:tab==="support"?[["all","همه"],["open","باز"],["closed","بسته"]]:tab==="accounts"?[["all","همه"],["lawyer","وکلا"],["client","کاربران"],["review","نیازمند بررسی"]]:[]}
function items(){const arr=data[tab]||[];return arr.filter(x=>(filter==="all"||(filter==="review"?x.status==="review":tab==="accounts"?x.type===filter:x.status===filter))&&[x.topic,x.subject,x.name,x.client,x.lawyer,x.owner,x.summary,x.id].filter(Boolean).join(" ").includes(search))}
function textNode(tag,cls,value){const x=document.createElement(tag);if(cls)x.className=cls;x.textContent=value;return x}
function countStats(){ $("stat-requests").textContent=fa(data.requests.filter(x=>x.status==="waiting").length);$("stat-chats").textContent=fa(data.conversations.filter(x=>x.status==="active").length);$("stat-support").textContent=fa(data.support.filter(x=>x.status==="open").length);$("stat-lawyers").textContent=fa(data.accounts.filter(x=>x.type==="lawyer").length);
const a=$("admin-activity");a.replaceChildren();for(const x of [data.requests[0],data.support[0],data.conversations[0]])if(x)a.append(textNode("p","",x.topic||x.subject||"گفتگو"))}
function drawList(){
 const list=$("admin-list");list.replaceChildren();
 const found=items();if(!found.length)list.append(textNode("div","admin-empty","موردی یافت نشد."));
 for(const x of found){const b=textNode("button","admin-item"+(selected===x.id?" selected":""),"");b.type="button";
 b.append(textNode("strong","",x.topic||x.subject||x.name||x.id),textNode("span","",[(x.owner||x.client||x.city||x.lawyer||""),status(x.status)].filter(Boolean).join(" · ")));
 b.onclick=()=>select(x.id);list.append(b)}
}
function row(label,value){const d=textNode("div","admin-field","");d.append(textNode("b","",label),textNode("span","",value||"—"));return d}
function actionButton(label,fn){const b=textNode("button","admin-primary",label);b.type="button";b.onclick=fn;return b}
function conversationMessages(x,canReply){
 const box=$("admin-detail-body");for(const m of x.messages||[]){const d=textNode("div","admin-message"+(m.from==="admin"?" mine":""),m.text);d.append(textNode("small","",m.at||""));box.append(d)}
 const form=$("admin-compose");form.hidden=!canReply;
 if(canReply){form.dataset.id=x.id;box.scrollTop=box.scrollHeight}else delete form.dataset.id;
}
function renderDetail(){
 const x=(data[tab]||[]).find(z=>z.id===selected);
 const body=$("admin-detail-body");body.replaceChildren();$("admin-compose").hidden=true;
 $("admin-detail-title").textContent=x?(x.topic||x.subject||x.name):"یک مورد را انتخاب کنید";
 $("admin-detail-subtitle").textContent=x?.id||"";
 $("admin-detail-badge").textContent=x?status(x.status):"";
 if(!x){body.append(textNode("p","admin-empty","یک مورد را از فهرست انتخاب کنید."));return}
 if(tab==="requests"){
  body.append(row("درخواست‌دهنده",x.client),row("موضوع",x.topic),row("شرح درخواست",x.summary),row("زمان ثبت",x.created),row("وضعیت",status(x.status)),row("وکیل پذیرنده",x.lawyer||"هنوز تعیین نشده"));
 }else if(tab==="conversations"){
  body.append(row("موکل",x.client),row("وکیل پذیرنده",x.lawyer),row("وضعیت",status(x.status)),textNode("p","admin-muted","نظارت مدیر: گفتگوی مشاوره فقط قابل مشاهده است؛ مدیر در مکالمه خصوصی موکل و وکیل پیام نمی‌فرستد."));
  conversationMessages(x,false);
 }else if(tab==="support"){
  body.append(row("درخواست‌دهنده",x.owner+" · "+x.role),row("موضوع",x.subject));
  if(x.status==="open")body.append(actionButton("بستن تیکت",()=>{x.status="closed";save();render();select(x.id)}));
  else body.append(actionButton("بازگشایی تیکت",()=>{x.status="open";save();render();select(x.id)}));
  conversationMessages(x,x.status==="open");
 }else if(tab==="accounts"){
  body.append(row("نام",x.name),row("نوع حساب",x.type==="lawyer"?"وکیل":"کاربر"),row("شهر",x.city),row("شماره پروانه",x.license||"—"),row("وضعیت",status(x.status)),textNode("p","admin-muted","تأیید پروانه در این نسخه نمایشی واقعی نیست و مستلزم کنترل مدارک و استعلام معتبر است."));
 }
}
function select(id){selected=id; $("admin-work").classList.add("detail-open");drawList();renderDetail()}
function render(){
 const home=tab==="home";$("admin-home").hidden=!home;$("admin-work").hidden=home;
 for(const b of document.querySelectorAll("[data-tab]")){b.classList.toggle("selected",b.dataset.tab===tab);b.setAttribute("aria-current",b.dataset.tab===tab?"page":"false")}
 countStats();if(home)return;
 $("admin-section-title").textContent=words[tab];
 $("admin-section-subtitle").textContent=tab==="conversations"?"نظارت بر مشاوره‌های پذیرفته‌شده":tab==="requests"?"پیگیری درخواست‌های جدید":tab==="support"?"پاسخ‌گویی به تیکت‌های کاربر و وکیل":"فهرست حساب‌های کاربران و وکلا";
 const filters=$("admin-filters");filters.replaceChildren();
 for(const [id,label] of options()){const b=textNode("button",filter===id?"selected":"",label);b.type="button";b.setAttribute("aria-pressed",String(filter===id));b.onclick=()=>{filter=id;selected=null;$("admin-work").classList.remove("detail-open");render()};filters.append(b)}
 drawList();renderDetail();
}
function navigate(next){tab=next;filter="all";search="";selected=null;$("admin-search").value="";$("admin-work").classList.remove("detail-open");render()}
for(const b of document.querySelectorAll("[data-tab],[data-nav]"))b.onclick=()=>navigate(b.dataset.tab||b.dataset.nav);
$("admin-back").onclick=()=>{$("admin-work").classList.remove("detail-open");selected=null;drawList()};
$("admin-refresh").onclick=()=>render();
$("admin-search").oninput=e=>{search=e.target.value.trim();selected=null;drawList();renderDetail()};
$("admin-compose").onsubmit=e=>{e.preventDefault();const id=$("admin-compose").dataset.id;const x=data.support.find(v=>v.id===id);const input=$("admin-message");const message=input.value.trim();if(!x||x.status!=="open"||!message)return;x.messages.push({text:message,from:"admin",at:new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit"}).format(new Date())});input.value="";save();renderDetail();drawList()};
render();