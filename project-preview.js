"use strict";
/* VisitVakil project preview — no calls to production APIs, no real user data.
   Each browser holds its own fictional state. This is NOT a live multi-user test. */
(()=>{
 const role=document.body.dataset.previewRole;
 const $=id=>document.getElementById(id);
 const fa=n=>new Intl.NumberFormat("fa-IR").format(n);
 const status=s=>({waiting:"در انتظار وکیل",assigned:"پذیرفته‌شده",in_progress:"در حال مشاوره",completed:"پایان‌یافته",open:"باز",closed:"بسته"})[s]||s;
 const sample=[
  {id:"DEMO-1",category:"ملکی و ثبتی",description:"نمونه آزمایشی اختلاف در قرارداد ملکی",status:"waiting",lawyerName:null},
  {id:"DEMO-2",category:"خانواده",description:"نمونه آزمایشی درخواست مشاوره خانواده",status:"in_progress",lawyerName:"وکیل آزمایشی"}
 ];
 const requests=sample.map(x=>({...x}));
 const support=[{id:"SUPPORT-1",subject:"راهنمایی در استفاده از سامانه",status:"open",messages:[{mine:false,body:"سلام، این پیام صرفاً نمونه نمایشی است."}]}];
 const messages={"DEMO-2":[{mine:false,body:"سلام، درخواست شما در حال بررسی است."},{mine:true,body:"متشکرم. مدارکم را آماده می‌کنم."}]};
 let selected=null,tab="home",ready=true;
 function el(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value||"";return n}
 function listRow(parent,title,subtitle,fn){
  const b=el("button",role==="admin"?"row":"item");
  b.type="button";b.append(el("strong","",title),el("small","",subtitle));b.onclick=fn;parent.append(b);
 }
 const views=role==="client"?["home","create-view","list-view","detail-view","account-view"]:role==="lawyer"?["home","list-view","detail-view","account-view"]:["home","list-view","detail-view"];
 function show(id){views.forEach(v=>{if($(v))$(v).hidden=v!==id})}
 function mark(t){tab=t;document.querySelectorAll("[data-tab]").forEach(b=>{b.classList.toggle("selected",b.dataset.tab===t);b.setAttribute("aria-current",b.dataset.tab===t?"page":"false")})}
 function renderMessages(target,key){
  const area=$(target);if(!area)return;area.replaceChildren();
  for(const m of messages[key]||[]){const b=el("div","bubble"+(m.mine?" mine":""),m.body);area.append(b)}
 }
 function createDemoRequest(category,description){
  const id="DEMO-"+Date.now();
  requests.unshift({id,category,description,status:"waiting",lawyerName:null});
  return id;
 }
 function openDetail(item,isSupport=false){
  selected={item,isSupport};
  show("detail-view");
  if($("detail-title"))$("detail-title").textContent=isSupport?item.subject:item.category;
  if($("detail-status"))$("detail-status").textContent=status(item.status);
  if(role==="admin"){
   $("detail-body").replaceChildren();
   for(const [k,v] of Object.entries(isSupport?{عنوان:item.subject,وضعیت:status(item.status)}:{شناسه:item.id||item.accountId||"آزمایشی",موضوع:item.category||item.displayName||"حساب آزمایشی",وضعیت:status(item.status||"open"),وکیل:item.lawyerName||"انتخاب نشده"})){
    const field=el("div","field");field.append(el("span","",k),el("strong","",v));$("detail-body").append(field)
   }
   $("reply").hidden=!isSupport;return;
  }
  const key=isSupport?item.id:item.id;
  if(isSupport)messages[key]=item.messages;
  renderMessages("messages",key);
  if($("waiting"))$("waiting").hidden=isSupport||item.status!=="waiting";
  if($("send"))$("send").hidden=!isSupport&&item.status==="waiting"||(!isSupport&&item.status==="completed");
  if($("finish"))$("finish").hidden=isSupport||item.status==="waiting"||item.status==="completed";
  if($("close-ticket"))$("close-ticket").hidden=!isSupport||item.status!=="open";
 }
 function navigate(t){
  mark(t);selected=null;
  if(t==="home"){
   show("home");
   if(role==="client"){$("count-chats").textContent=fa(requests.length);$("count-support").textContent=fa(support.length)}
   if(role==="lawyer"){$("count-offers").textContent=fa(requests.filter(x=>x.status==="waiting").length);$("count-chats").textContent=fa(requests.filter(x=>x.status!=="waiting").length);$("count-support").textContent=fa(support.length)}
   if(role==="admin"){
    for(const [id,val] of Object.entries({"metric-waiting":requests.filter(x=>x.status==="waiting").length,"metric-active":requests.filter(x=>x.status==="in_progress").length,"metric-support":support.length,"metric-lawyers":1,"metric-completed":requests.filter(x=>x.status==="completed").length,"metric-ready":ready?1:0}))$(id).textContent=fa(val)
   }
   return;
  }
  if(t==="create"&&role==="client"){show("create-view");return}
  if(t==="account"){
   show("account-view");$("account-details").replaceChildren(el("p","notice","حساب آزمایشی پروژه؛ احراز هویت واقعی در پیش‌نمایش غیرفعال است."));return
  }
  show("list-view");
  const area=$(role==="admin"?"rows":"list");area.replaceChildren();
  let rows=[];
  if(t==="support")rows=support.map(x=>({item:x,subtitle:status(x.status),title:x.subject,isSupport:true}));
  else if(t==="accounts")rows=[{item:{accountId:"DEMO-LAWYER",displayName:"وکیل آزمایشی",status:"open"},title:"وکیل آزمایشی",subtitle:"آماده پذیرش"}];
  else if(t==="offers")rows=requests.filter(x=>x.status==="waiting").map(x=>({item:x,title:x.category,subtitle:status(x.status)}));
  else if(t==="chats")rows=requests.filter(x=>role!=="lawyer"||x.status!=="waiting").map(x=>({item:x,title:x.category,subtitle:status(x.status)}));
  else rows=requests.map(x=>({item:x,title:x.category,subtitle:status(x.status)}));
  if($("list-title"))$("list-title").textContent=({support:"پشتیبانی آزمایشی",offers:"درخواست‌های آزمایشی",chats:"گفتگوهای آزمایشی"})[t]||"درخواست‌ها";
  if($("section-title"))$("section-title").textContent=({requests:"درخواست‌های آزمایشی",chats:"مشاوره‌های آزمایشی",support:"پشتیبانی آزمایشی",accounts:"حساب‌های آزمایشی"})[t]||"فهرست";
  if($("support-new"))$("support-new").hidden=t!=="support";
  if($("support-create"))$("support-create").hidden=true;
  for(const row of rows)listRow(area,row.title,row.subtitle,()=>openDetail(row.item,!!row.isSupport));
  if(!rows.length)area.append(el("p","empty","مورد آزمایشی موجود نیست."));
 }
 const indicator=$("connection");
 if(indicator){indicator.textContent="پیش‌نمایش پروژه — بدون ورود";indicator.classList.remove("error")}
 const banner=el("div","notice","حالت نمایشی مدیریت پروژه | داده‌ها ساختگی‌اند و هیچ اطلاعاتی به سرور واقعی ارسال نمی‌شود.");
 banner.setAttribute("role","status");
 banner.style.cssText="padding:10px 14px;margin:8px 12px;border:1px solid #ecdba4;border-radius:10px;background:#fff8df;color:#393026;font-size:12px;line-height:1.8";
 const main=document.querySelector("main")||$("main");if(main)main.parentNode.insertBefore(banner,main);
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>navigate(b.dataset.tab));
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>navigate(b.dataset.open));
 if($("refresh"))$("refresh").onclick=()=>navigate(tab);
 if($("back"))$("back").onclick=()=>navigate(tab);
 if($("ready")){$("ready").checked=ready;$("ready").onchange=e=>{ready=e.target.checked;navigate("home")}}
 if($("request-form"))$("request-form").onsubmit=e=>{e.preventDefault();createDemoRequest($("category").value,$("description").value.trim()||"درخواست نمونه");e.target.reset();navigate("chats")};
 if($("support-new"))$("support-new").onclick=()=>{$("support-create").hidden=false};
 if($("support-cancel"))$("support-cancel").onclick=()=>{$("support-create").hidden=true};
 if($("support-create"))$("support-create").onsubmit=e=>{e.preventDefault();const id="SUPPORT-"+Date.now();support.unshift({id,subject:$("support-subject").value,status:"open",messages:[{mine:true,body:$("support-body").value}]});e.target.reset();navigate("support")};
 if($("send"))$("send").onsubmit=e=>{
  e.preventDefault();if(!selected)return;const val=$("message").value.trim();if(!val)return;
  const key=selected.item.id;messages[key]??=[];messages[key].push({mine:true,body:val});$("message").value="";renderMessages("messages",key)
 };
 if($("finish"))$("finish").onclick=()=>{if(!selected)return;selected.item.status="completed";navigate("chats")};
 if($("close-ticket"))$("close-ticket").onclick=()=>{if(!selected)return;selected.item.status="closed";navigate("support")};
 if($("reply"))$("reply").onsubmit=e=>{e.preventDefault();if(!selected)return;selected.item.messages.push({mine:true,body:$("reply-text").value});$("reply-text").value="";openDetail(selected.item,true)};
 navigate("home");
})();
