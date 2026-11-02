"use strict";
const $=id=>document.getElementById(id);
const state={mobile:"",challenge:null,account:null,requests:[],current:null,cursor:0,socket:null,retry:null,stopped:false,selectionVersion:0,supportTickets:[],supportOnly:false};
const sep="\x1e";
// UI-only preview: never enables API access or impersonates a real account.
const uiPreview=true;
const previewConversationId="preview-client-conversation";
async function api(path,{method="GET",body}={}){throw new Error("نسخه نمایشی بدون سرور است");
 const r=await fetch(path,{method,credentials:"same-origin",headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 if(!r.ok)throw new Error(r.status===429?"برای دریافت دوباره کد، یک دقیقه صبر کنید.":r.status===503&&path==="/auth/mobile/request"?"سرویس ارسال پیامک موقتاً در دسترس نیست. لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید.":r.status===401?"احراز هویت لازم است.":"خطای "+r.status);
 return r.status===204?null:r.json();
}
function normalizeMobile(s){const v=s.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/[^\d+]/g,"");return /^09\d{9}$/.test(v)?"+98"+v.slice(1):/^\+989\d{9}$/.test(v)?v:null}
function setMsg(s){$("auth-status").textContent=s}
function authView(ok){$("guest-landing").hidden=ok;$("auth").hidden=true;$("workspace").hidden=!ok;$("top-state").textContent=ok?"حساب کاربری":"ورود با موبایل"}
function routeRole(role){if(role==="lawyer"){location.replace("/lawyer.html");return true}if(role==="admin"){location.replace("/admin.html");return true}return false}
async function start(){if(uiPreview){startClientPreview();return}try{const r=await api("/auth/me");if(routeRole(r.role))return;state.account=r.accountId;authView(true);document.dispatchEvent(new Event('vv:auth-ready'));await refresh();await refreshSupport()}catch{authView(false)}}
$("phone-form").addEventListener("submit",async e=>{e.preventDefault();const m=normalizeMobile($("phone").value);if(!m){setMsg("شماره معتبر وارد کنید.");return}const b=e.currentTarget.querySelector("button");b.disabled=true;setMsg("در حال ارسال...");try{const r=await api("/auth/mobile/request",{method:"POST",body:{mobile:m}});state.mobile=m;state.challenge=r.challengeId;$("phone-form").hidden=true;$("otp-form").hidden=false;setMsg(r.developmentCode?"کد آزمایشی: "+r.developmentCode:"کد پیامک شد.")}catch(err){setMsg(err.message)}finally{b.disabled=false}});
$("back-phone").onclick=()=>{$("otp-form").hidden=true;$("phone-form").hidden=false;setMsg("")};
$("otp-form").addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button");b.disabled=true;try{const r=await api("/auth/mobile/verify",{method:"POST",body:{mobile:state.mobile,challengeId:state.challenge,code:$("otp").value.trim()}});const me=await api("/auth/me");if(routeRole(me.role))return;state.account=r.accountId;authView(true);document.dispatchEvent(new Event("vv:auth-ready"));await refresh();await refreshSupport();if(resumeWizard){resumeWizard=false;wizardStep=2;renderWizard();$("request-dialog").showModal()}}catch(err){setMsg(err.message)}finally{b.disabled=false}});
function el(tag,cls,txt){const e=document.createElement(tag);e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
async function refresh(){if(uiPreview){drawInbox();return}try{state.requests=await api("/clients/me/requests");drawInbox();const r=state.requests.find(x=>x.requestId===state.current?.requestId)||state.requests[0];if(r){if(!state.current||(!state.current.ticketId&&(r.requestId!==state.current.requestId||r.status!==state.current.status)))await selectRequest(r)}else{showClientList();$("messages").replaceChildren(el("div","empty","هنوز گفتگویی ندارید."));$("message-form").hidden=true;$("pending-notice").hidden=true}}catch{$("top-state").textContent="خطا در بازیابی"}}
function drawInbox(){const box=$("inbox");box.replaceChildren();$("support-new").hidden=!state.supportOnly;for(const t of state.supportTickets){const b=el("button","thread support-thread"+(state.current?.ticketId===t.ticketId?" selected":""));b.type="button";b.append(el("strong","",t.subject),el("span","", (t.status==="closed"?"پایان‌یافته":"پشتیبانی فعال")+" · "+(t.lastMessage||"درخواست پشتیبانی")));b.onclick=()=>uiPreview?previewSupportSelect(t):selectSupport(t);box.append(b)}for(const r of (state.supportOnly?[]:state.requests)){const b=el("button","thread"+(state.current?.requestId===r.requestId?" selected":""));b.type="button";b.append(el("strong","",r.category||"مشاوره حقوقی"),el("span","",(r.status==="waiting"?"در انتظار وکیل":r.status==="pending_payment"?"در انتظار پرداخت":r.status==="completed"?"پایان‌یافته":"گفتگوی مشاوره")+" · کد: "+r.requestId.slice(0,8)));b.onclick=()=>selectRequest(r);box.append(b)}}
async function selectRequest(r){if(uiPreview){previewSelect(r);return}state.supportOnly=false;$("support-close").hidden=true;showClientChat();const version=++state.selectionVersion;state.current=r;state.cursor=0;state.stopped=true;stopSocket();$("messages").replaceChildren();$("chat-title").textContent="مشاوره حقوقی";$("chat-subtitle").textContent=r.status==="waiting"?"در انتظار پذیرش وکیل":r.status==="pending_payment"?"در انتظار تکمیل پرداخت":"گفتگوی فعال";$("pending-notice").hidden=r.status!=="waiting"&&r.status!=="pending_payment";$("pending-notice").textContent=r.status==="pending_payment"?"درخواست ثبت شد. امکان پرداخت آنلاین پس از اتصال درگاه فعال می‌شود.":"درخواست شما در انتظار پذیرش وکیل است.";$("message-form").hidden=r.status!=="assigned"&&r.status!=="in_progress";$("complete-consultation").hidden=!(r.status==="assigned"||r.status==="in_progress");$("review-consultation").hidden=r.status!=="completed";drawInbox();await syncMessages();if(version!==state.selectionVersion||state.current?.conversationId!==r.conversationId)return;if(r.status==="assigned"||r.status==="in_progress"){state.stopped=false;connectSocket()}}
async function syncMessages(){if(state.current?.ticketId)return syncSupportMessages();if(!state.current)return;const chat=state.current.conversationId,cursor=state.cursor;try{const msgs=await api("/conversations/"+chat+"/messages?after="+cursor);if(state.current?.conversationId!==chat)return;for(const m of msgs)addMessage(m);if(!state.cursor&&!$("messages").children.length)$("messages").replaceChildren(el("div","empty","هنوز پیامی ارسال نشده است."))}catch{if(state.current?.conversationId===chat)$("live-state").textContent="خطای بازیابی"}}
function addMessage(m){if(!state.current||m.conversationId&&m.conversationId!==state.current.conversationId||m.id<=state.cursor)return;state.cursor=m.id;const box=$("messages");box.querySelector(".empty")?.remove();box.append(el("div","bubble"+(m.senderId===state.account?" mine":""),m.body));box.scrollTop=box.scrollHeight}
function stopSocket(){clearTimeout(state.retry);state.retry=null;if(state.socket){state.socket.onclose=null;state.socket.close();state.socket=null}}
function connectSocket(){if(!state.current||state.stopped)return;const chat=state.current.conversationId,s=new WebSocket((location.protocol==="https:"?"wss:":"ws:")+"//"+location.host+"/realtime/chat");state.socket=s;let buffer="";s.onopen=()=>s.send(JSON.stringify({protocol:"json",version:1})+sep);s.onmessage=async ev=>{buffer+=ev.data;const parts=buffer.split(sep);buffer=parts.pop();for(const part of parts){if(state.socket!==s||state.current?.conversationId!==chat||state.stopped)return;if(!part)continue;let m;try{m=JSON.parse(part)}catch{continue}if(m.error){$("live-state").textContent="اتصال ناموفق";continue}if(!m.type){s.send(JSON.stringify({type:1,invocationId:"sub",target:"Subscribe",arguments:[chat]})+sep);$("live-state").textContent="متصل";await syncMessages();continue}if(m.target==="MessageCreated"&&m.arguments?.[0]?.conversationId===chat)addMessage(m.arguments[0]);}};s.onclose=()=>{if(state.socket!==s||state.stopped)return;$("live-state").textContent="اتصال مجدد";state.retry=setTimeout(connectSocket,2500)};s.onerror=()=>{$("live-state").textContent="ارتباط ناپایدار"}}
$("message-form").addEventListener("submit",async e=>{e.preventDefault();const body=$("message").value.trim();if(!body||!state.current)return;if(uiPreview){if(state.current?.ticketId){const t=state.supportTickets.find(x=>x.ticketId===state.current.ticketId);if(t){t.previewMessages.push({body,mine:true});t.lastMessage=body;} }previewMessage(body);return}if(state.current.ticketId){const id=state.current.ticketId;try{await api("/support/tickets/"+id+"/messages",{method:"POST",body:{body}});$("message").value="";await syncSupportMessages();await refreshSupport()}catch(err){alert(err.message)}return}const id=state.current.conversationId;$("message").value="";try{await api("/conversations/"+id+"/messages",{method:"POST",body:{key:crypto.randomUUID(),body}});await syncMessages()}catch(err){if(state.current?.conversationId===id){$("message").value=body;$("live-state").textContent=err.message}}});
function openDialog(){wizardStep=0;document.querySelectorAll('input[name="wizard-service"],input[name="wizard-category"]').forEach(x=>x.checked=false);$("description").value="";renderWizard();$("request-dialog").showModal()}$("guest-start").onclick=openDialog;$("new-request").onclick=openDialog;$("nav-create").onclick=openDialog;$("close-dialog").onclick=()=>{$("request-dialog").close();pendingRequestKey=null};

let wizardStep=0;
const wizardLabels=["انتخاب خدمت","موضوع حقوقی","مرور انتخاب‌ها"];let resumeWizard=false;
function selectedWizard(name){return document.querySelector('input[name="'+name+'"]:checked')}
function renderWizard(){
 document.querySelectorAll(".wizard-step").forEach((x,i)=>x.hidden=i!==wizardStep);
 document.querySelectorAll(".wizard-progress span").forEach((x,i)=>{x.hidden=i>=3;x.classList.toggle("done",i===wizardStep)});
 $("wizard-title").textContent=wizardLabels[wizardStep];$("wizard-count").textContent=(wizardStep+1)+" از ۳";
 $("wizard-back").hidden=wizardStep===0;$("wizard-next").hidden=wizardStep===2;$("wizard-submit").hidden=wizardStep!==2;
 $("wizard-next").disabled=wizardStep===0?!selectedWizard("wizard-service"):!selectedWizard("wizard-category");
 $("wizard-error").textContent="";
 if(wizardStep===2){
  const service=selectedWizard("wizard-service").value,category=selectedWizard("wizard-category").value;
  $("service").value=service;$("category").value=category;
  $("summary-service").textContent=service==="free"?"پرسش رایگان":"گفتگوی متنی";
  $("summary-category").textContent=category;
  $("summary-price").textContent=service==="free"?"رایگان":"پس از اتصال درگاه";
  $("wizard-payment-note").hidden=service==="free";
 }
}
document.querySelectorAll('input[name="wizard-service"],input[name="wizard-category"]').forEach(x=>x.addEventListener("change",renderWizard));
$("wizard-next").onclick=()=>{if(wizardStep<2){wizardStep++;renderWizard()}};
$("wizard-back").onclick=()=>{if(wizardStep>0){wizardStep--;renderWizard()}};
document.querySelectorAll("[data-goto]").forEach(x=>x.onclick=()=>{wizardStep=Number(x.dataset.goto);renderWizard()});

let pendingRequestKey=null;
$("request-form").addEventListener("submit",async e=>{e.preventDefault();const b=$("wizard-submit");if(!$("description").value.trim()){ $("wizard-error").textContent="لطفاً شرح مسئله حقوقی را وارد کنید.";return }if(uiPreview){previewRequest();return}if(!state.account){resumeWizard=true;$("request-dialog").close();$("guest-landing").hidden=true;$("auth").hidden=false;setMsg("برای ثبت درخواست شماره موبایل را تأیید کنید. انتخاب‌ها محفوظ است.");return;}b.disabled=true;pendingRequestKey??=crypto.randomUUID();try{const endpoint=$("service").value==="paid"?"/paid-requests":"/requests";const r=await api(endpoint,{method:"POST",body:{category:$("category").value,description:$("description").value.trim(),requestKey:pendingRequestKey}});pendingRequestKey=null;$("request-dialog").close();$("description").value="";resumeWizard=false;await refresh();const found=state.requests.find(x=>x.requestId===r.requestId);if(found)await selectRequest(found)}catch(err){alert(err.message)}finally{b.disabled=false}});
function openSupportChat(){state.supportOnly=true;showClientList();drawInbox();if(!uiPreview)refreshSupport()}
function showClientList(){ $("support-new").hidden=!state.supportOnly; $("workspace").classList.remove("chat-open");$("nav-home").classList.remove("selected");$("nav-chats").classList.add("selected");$("nav-home").removeAttribute("aria-current");$("nav-chats").setAttribute("aria-current","page"); }
function showClientChat(){ $("workspace").classList.add("chat-open");$("nav-chats").classList.remove("selected");$("nav-chats").removeAttribute("aria-current"); }
$("chat-back").onclick=()=>{showClientList();drawInbox()};$("nav-support").onclick=openSupportChat;
$("refresh").onclick=async()=>{await refresh();await refreshSupport()};$("nav-chats").onclick=()=>{state.supportOnly=false;showClientList();drawInbox();refresh()};$("nav-home").onclick=()=>{state.supportOnly=false;showClientList();drawInbox();refresh();$("nav-chats").classList.remove("selected");$("nav-home").classList.add("selected");$("nav-home").setAttribute("aria-current","page");$("nav-chats").removeAttribute("aria-current")};
$("logout").onclick=async()=>{if(uiPreview){location.href=location.pathname;return}state.stopped=true;stopSocket();try{await api("/auth/logout",{method:"POST"})}finally{state.account=null;state.requests=[];state.supportTickets=[];state.current=null;state.selectionVersion++;authView(false);document.dispatchEvent(new Event("vv:auth-logout"))}};
setInterval(async()=>{if(document.hidden||!state.account||uiPreview)return;if(state.current?.ticketId){await syncSupportMessages();await refreshSupport();return;}if(state.current?.status==="waiting"||state.current?.status==="pending_payment")await refresh();else if(!state.socket||state.socket.readyState!==WebSocket.OPEN)await syncMessages()},30000);
start();

$("complete-consultation").onclick=async()=>{if(uiPreview){previewComplete();return}if(!state.current||!confirm("مشاوره پایان یابد؟"))return;try{await api("/requests/"+state.current.requestId+"/complete",{method:"POST",body:{reason:"تکمیل مشاوره توسط کاربر"}});state.stopped=true;stopSocket();$("complete-consultation").hidden=true;state.current=null;await refresh()}catch(err){alert(err.message)}};

document.addEventListener('vv:workspace-changed',()=>{if(state.account)refresh()});

$("review-consultation").onclick=async()=>{
 if(!state.current||state.current.status!=="completed")return;
 let current;try{current=await api("/requests/"+state.current.requestId+"/feedback")}catch{}
 if(current){alert("نظر این مشاوره قبلاً ثبت شده است.");return}
 const raw=prompt("امتیاز شما از ۱ تا ۵:", "5");
 if(raw===null)return;
 const rating=Number(raw);
 if(!Number.isInteger(rating)||rating<1||rating>5){alert("امتیاز باید بین ۱ تا ۵ باشد.");return}
 const comment=prompt("توضیح کوتاه (اختیاری):","");if(comment===null)return;
 try{await api("/requests/"+state.current.requestId+"/feedback",{method:"POST",body:{rating,comment:comment.slice(0,1000)}});$("review-consultation").hidden=true;alert("نظر شما ثبت شد.")}catch(e){alert(e.message)}
};

// Isolated client-messenger preview, without SMS, sessions, payments or database writes.
function startClientPreview(){
 state.account="preview-client";authView(true);
 $("top-state").textContent="پیش‌نمایش آزمایشی · بدون ورود";
 $("live-state").textContent="داده نمایشی";
 state.supportTickets=[{ticketId:"preview-ticket-001",subject:"راهنمایی درباره پرداخت",status:"open",lastMessage:"سلام، وضعیت پرداخت را چگونه بررسی کنم؟",previewMessages:[{body:"سلام، وضعیت پرداخت را چگونه بررسی کنم؟",mine:true},{body:"سلام. درخواست شما بررسی می‌شود.",mine:false}]}];
 state.requests=[{requestId:"preview-001",conversationId:previewConversationId,status:"in_progress",category:"ملکی و ثبتی",description:"بررسی وضعیت سند ملک"}];
 previewSelect(state.requests[0]);
 showClientList();
}
function previewSelect(r){
 showClientChat();
 state.current=r;state.cursor=0;state.selectionVersion++;
 $("chat-title").textContent=r.category||"مشاوره حقوقی";
 $("chat-subtitle").textContent=r.status==="completed"?"پایان‌یافته":r.status==="waiting"?"در انتظار پذیرش وکیل":"گفتگو با مشاور";
 $("pending-notice").hidden=r.status!=="waiting";
 $("message-form").hidden=!(r.status==="assigned"||r.status==="in_progress");
 $("complete-consultation").hidden=r.isSupport||$("message-form").hidden;
 $("review-consultation").hidden=true;
 $("live-state").textContent="پیش‌نمایش · بدون اتصال";
 $("messages").replaceChildren();
 drawInbox();
 if(r.status!=="waiting"){
  previewBubble(r.isSupport?"سلام، به بخش پشتیبانی ویزیت وکیل خوش آمدید. این گفتگو فعلاً نمایشی است.":"سلام. به ویزیت وکیل خوش آمدید. لطفاً موضوع حقوقی خود را مطرح کنید.",false);
  previewBubble(r.description||"برای بررسی سند ملک راهنمایی می‌خواهم.",true);
 }
}
function previewBubble(body,mine){
 const node=el("div","bubble"+(mine?" mine":""),body);
 $("messages").append(node);$("messages").scrollTop=$("messages").scrollHeight;
}
function previewMessage(body){
 $("message").value="";previewBubble(body,true);
}
function previewRequest(){
 const service=$("service").value;
 const r={requestId:"preview-"+Date.now(),conversationId:"preview-"+Date.now(),status:"waiting",category:$("category").value,description:$("description").value.trim(),mode:service};
 state.requests.unshift(r);$("request-dialog").close();pendingRequestKey=null;previewSelect(r);
}
function previewComplete(){
 if(!state.current||!confirm("پیش‌نمایش مشاوره پایان یابد؟"))return;
 state.current.status="completed";previewSelect(state.current);
}

// Independent persisted support tickets. A ticket is a single conversation, never a shared room.
function previewSupportSelect(t){if(!t)return;state.current={...t,isSupport:true};showClientChat();$("chat-title").textContent=t.subject;$("chat-subtitle").textContent=t.status==="closed"?"تیکت پایان‌یافته":"پشتیبانی ویزیت وکیل";$("live-state").textContent="پیش‌نمایش";$("message-form").hidden=t.status==="closed";$("support-close").hidden=t.status==="closed";$("complete-consultation").hidden=true;$("review-consultation").hidden=true;$("pending-notice").hidden=true;$("messages").replaceChildren();for(const m of t.previewMessages||[])previewBubble(m.body,m.mine);drawInbox()}
async function refreshSupport(){if(uiPreview)return;try{state.supportTickets=await api("/support/tickets");drawInbox()}catch(e){console.warn("Support unavailable:",e.message)}}
async function selectSupport(t){
 state.current={...t,ticketId:t.ticketId};state.cursor=0;state.selectionVersion++;state.stopped=true;stopSocket();
 showClientChat();$("chat-title").textContent=t.subject;$("chat-subtitle").textContent=t.status==="closed"?"تیکت پایان‌یافته":"پشتیبانی ویزیت وکیل";
 $("live-state").textContent=t.status==="closed"?"بسته‌شده":"پشتیبانی";$("message-form").hidden=t.status==="closed";
 $("support-close").hidden=t.status==="closed";$("complete-consultation").hidden=true;$("review-consultation").hidden=true;$("pending-notice").hidden=true;
 $("messages").replaceChildren();drawInbox();await syncSupportMessages();
}
async function syncSupportMessages(){
 const t=state.current;if(!t?.ticketId)return;const cursor=state.cursor;
 try{const messages=await api("/support/tickets/"+t.ticketId+"/messages?after="+cursor);if(state.current?.ticketId!==t.ticketId)return;
 for(const m of messages){if(m.id<=state.cursor)continue;state.cursor=m.id;$("messages").querySelector(".empty")?.remove();$("messages").append(el("div","bubble"+(m.senderId===state.account?" mine":""),m.body))}
 if(!state.cursor)$("messages").replaceChildren(el("div","empty","هنوز پیامی ثبت نشده است."));
 $("messages").scrollTop=$("messages").scrollHeight;
 }catch(e){$("live-state").textContent=e.message}
}
$("support-new").onclick=()=>{$("support-dialog").showModal()};
$("support-cancel").onclick=()=>{$("support-dialog").close()};
$("support-form").onsubmit=async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;
 try{if(uiPreview){const subject=$("support-subject").value.trim(),body=$("support-body").value.trim();const t={ticketId:"preview-ticket-"+Date.now(),subject,status:"open",lastMessage:body,previewMessages:[{body,mine:true}]};state.supportTickets.unshift(t);$("support-dialog").close();e.currentTarget.reset();previewSupportSelect(t);return}
 const result=await api("/support/tickets",{method:"POST",body:{subject:$("support-subject").value.trim(),body:$("support-body").value.trim()}});
 $("support-dialog").close();e.currentTarget.reset();await refreshSupport();const t=state.supportTickets.find(x=>x.ticketId===result.ticketId);if(t)await selectSupport(t);
 }catch(err){alert(err.message)}finally{btn.disabled=false}
};
$("support-close").onclick=async()=>{const t=state.current;if(!t?.ticketId||!confirm("این تیکت پایان یابد؟"))return;
 try{if(uiPreview){const item=state.supportTickets.find(x=>x.ticketId===t.ticketId);if(item)item.status="closed";previewSupportSelect(item);return}await api("/support/tickets/"+t.ticketId+"/close",{method:"POST"});await refreshSupport();const updated=state.supportTickets.find(x=>x.ticketId===t.ticketId);if(updated)await selectSupport(updated)}catch(err){alert(err.message)}
};
