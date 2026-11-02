const q=id=>document.getElementById(id);
const lawyerPreview=true;
let active=null, cursor=0, account=null, refreshing=false, syncing=false, refreshQueued=false, selectionVersion=0, lawyerTab="activity", lawyerChatFilter="all", lawyerDeskView="overview";
async function api(p,m="GET",v){throw Error("نسخه نمایشی بدون سرور است");const r=await fetch(p,{method:m,credentials:"same-origin",headers:{"Content-Type":"application/json"},body:v?JSON.stringify(v):undefined});if(!r.ok)throw Error(r.status===401?"برای ادامه، وارد حساب وکیل شوید.":r.status===409?"این درخواست قبلاً توسط وکیل دیگری پذیرفته شده است.":r.status===429?"تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.":r.status===503?"سرویس موقتاً در دسترس نیست.":"خطای ارتباط با سرور ("+r.status+")");return r.status===204?null:r.json()}
function entry(parent,label,fn){let b=document.createElement("button");b.className="thread";b.textContent=label;b.onclick=()=>fn(b);parent.append(b)}
async function refresh(){if(refreshing){refreshQueued=true;return}refreshing=true;try{account=(await api("/auth/me")).accountId;const offers=await api("/lawyers/me/offers"),cases=await api("/lawyers/me/consultations");const availability=await api("/lawyers/me/ready");q("ready").checked=availability.ready;for(const id of ["offer-count","nav-offer-count"]){q(id).textContent=offers.length>99?"99+":String(offers.length);q(id).hidden=!offers.length;}q("note").hidden=true;q("offers").replaceChildren();q("cases").replaceChildren();for(const o of offers)entry(q("offers"),o.category+" — پذیرش",async(button)=>{try{if(button)button.disabled=true;await api("/requests/"+o.id+"/accept","POST");queueMicrotask(refresh)}catch(err){alert("این درخواست ممکن است توسط وکیل دیگری پذیرفته شده باشد. "+err.message);queueMicrotask(refresh)}finally{if(button)button.disabled=false}});for(const c of cases.filter(lawyerMatchesChatFilter))renderLawyerConsultationRow(q("cases"),c,()=>openCase(c));if(active){const latest=cases.find(c=>c.requestId===active.requestId);if(!latest){active=null;selectionVersion++;cursor=0;q("messages").replaceChildren();q("send").hidden=true;q("complete-consultation").hidden=true;q("header").textContent="گفتگویی انتخاب نشده است."}else{active={...active,...latest};const writable=latest.status==="assigned"||latest.status==="in_progress";q("send").hidden=!writable;q("complete-consultation").hidden=!writable}}}catch(e){q("note").hidden=false;q("note").textContent="با حساب وکیل وارد شوید: "+e.message}finally{refreshing=false;if(refreshQueued){refreshQueued=false;queueMicrotask(refresh)}}}
async function sync(){if(!active||syncing)return;syncing=true;const conversationId=active.conversationId,version=selectionVersion,after=cursor;try{for(const m of await api("/conversations/"+conversationId+"/messages?after="+after)){if(version!==selectionVersion||active?.conversationId!==conversationId)break;if(m.id<=cursor)continue;cursor=m.id;const d=document.createElement("div");d.className="bubble"+((lawyerPreview?m.mine:m.senderId===account)?" mine":"");d.textContent=m.body;q("messages").append(d)}q("messages").scrollTop=q("messages").scrollHeight}catch(e){if(version===selectionVersion)q("header").textContent=e.message}finally{syncing=false;if(active&&active.conversationId!==conversationId)queueMicrotask(sync)}}
async function openCase(c){if(active?.conversationId===c.conversationId&&q("workspace").classList.contains("chat-open"))return;active=c;selectionVersion++;cursor=0;q("messages").replaceChildren();q("send").hidden=!(c.status==="assigned"||c.status==="in_progress");q("complete-consultation").hidden=q("send").hidden;q("header").textContent=c.category;lawyerTab="chats";renderLawyerTab(true);await sync()}
q("refresh").onclick=()=>lawyerTab==="support"?loadLawyerSupport():lawyerPreview?renderLawyerPreview():refresh();
q("ready").onchange=async e=>{if(lawyerPreview){renderLawyerPreview();return;}const toggle=e.target;const desired=toggle.checked;toggle.disabled=true;try{await api("/lawyers/me/ready","PUT",{ready:desired});await refresh()}catch(err){toggle.checked=!desired;alert(err.message)}finally{toggle.disabled=false}};
q("send").onsubmit=async e=>{e.preventDefault();if(lawyerTab==="support"&&supportTicket){const body=q("body").value.trim();if(!body)return;try{if(lawyerPreview){supportTicket.lastMessage=body;supportTicket.previewMessages??=[];supportTicket.previewMessages.push({body,mine:true});savePreviewSupport();const d=document.createElement("div");d.className="bubble mine";d.textContent=body;q("messages").append(d)}else{await api("/support/tickets/"+supportTicket.ticketId+"/messages","POST",{body});await syncLawyerSupport()}q("body").value="";if(lawyerPreview)savePreviewSupport();await loadLawyerSupport()}catch(err){alert(err.message)}return;}if(lawyerPreview){
 const value=q("body").value.trim();
 if(lawyerTab==="chats"&&active&&active.status!=="completed"&&value){
  active.previewMessages??=[];
  active.previewMessages.push({body:value,mine:true});
  active.lastMessage=value;
  const index=previewLawyerCases.indexOf(active);
  if(index>0){previewLawyerCases.splice(index,1);previewLawyerCases.unshift(active)}
  savePreviewLawyerState();
  q("body").value="";
  drawLawyerPreviewMessages();
  renderPreviewCaseList();
 }
 return;
}const body=q("body").value.trim();if(!body||!active||q("send").hidden)return;const button=q("send").querySelector('button[type="submit"]')||q("send").querySelector("button");if(button?.disabled)return;if(button)button.disabled=true;const target=active.conversationId;try{await api("/conversations/"+target+"/messages","POST",{key:crypto.randomUUID(),body});if(active?.conversationId===target){if(q("body").value.trim()===body)q("body").value="";await sync()}}catch(err){alert(err.message)}finally{if(button)button.disabled=false}};
setInterval(()=>{if(document.hidden||lawyerPreview)return;refresh();if(active)sync()},30000);if(!lawyerPreview)refresh();
q("complete-consultation").onclick=async()=>{if(lawyerTab==="support"&&supportTicket){if(!confirm("درخواست پشتیبانی بسته شود؟"))return;try{if(!lawyerPreview)await api("/support/tickets/"+supportTicket.ticketId+"/close","POST");supportTicket.status="closed";if(lawyerPreview)savePreviewSupport();q("send").hidden=true;q("complete-consultation").hidden=true;await loadLawyerSupport()}catch(e){alert(e.message)}return;}if(lawyerPreview){
 if(lawyerTab==="chats"&&active&&active.status!=="completed"&&confirm("این مشاوره پایان یابد؟")){
  active.status="completed";
  savePreviewLawyerState();
  q("send").hidden=true;
  q("complete-consultation").hidden=true;
  renderPreviewCaseList();
 }
 return;
}if(!active||!confirm("این مشاوره پایان یابد؟"))return;try{await api("/requests/"+active.requestId+"/complete","POST",{reason:"تکمیل مشاوره توسط وکیل"});active=null;selectionVersion++;q("send").hidden=true;q("complete-consultation").hidden=true;q("messages").replaceChildren();await refresh()}catch(e){alert(e.message)}};

document.addEventListener('vv:workspace-changed',()=>refresh());document.dispatchEvent(new Event('vv:auth-ready'));

function renderLawyerTab(chatOpen=false){
 const root=document.querySelector("#workspace");
 root.dataset.lawyerTab=lawyerTab;
 const home=lawyerTab==="home";
 const profileView=lawyerTab==="account";
 q("lawyer-dashboard").hidden=!home;
 q("lawyer-profile").hidden=!profileView;
 root.querySelector(".layout").hidden=home||profileView;
 q("chat-filter-bar").hidden=lawyerTab!=="chats";
 for(const button of document.querySelectorAll("[data-chat-filter]")){
  const selected=button.dataset.chatFilter===lawyerChatFilter;
  button.classList.toggle("selected",selected);
  button.setAttribute("aria-pressed",String(selected));
 }
 if(home)renderLawyerDesk();
 root.classList.toggle("chat-open",!!chatOpen);root.classList.toggle("lawyer-chat-open",!!chatOpen);
 for(const b of document.querySelectorAll("[data-lawyer-tab]")){b.classList.toggle("selected",b.dataset.lawyerTab===lawyerTab);b.setAttribute("aria-current",b.dataset.lawyerTab===lawyerTab?"page":"false")}
 q("offers").hidden=lawyerTab==="chats"||lawyerTab==="support"||lawyerTab==="account";
 q("cases").hidden=lawyerTab==="activity"||lawyerTab==="support"||lawyerTab==="account";
 q("cases-heading").hidden=q("cases").hidden;
 q("ready-control").hidden=lawyerTab==="chats"||lawyerTab==="support"||lawyerTab==="account";
 const heading=q("lawyer-list-title");
 const headingText=lawyerTab==="chats"?"گفتگوهای من":lawyerTab==="support"?"پشتیبانی":lawyerTab==="account"?"حساب وکیل":"درخواست‌های جدید";
 // Preserve the nested #offer-count element: replacing heading.textContent destroys it
 // and throws during preview initialization, preventing all footer handlers from working.
 if(heading.firstChild?.nodeType===3)heading.firstChild.nodeValue=headingText+" ";
 else heading.prepend(document.createTextNode(headingText+" "));
 const offerBadge=q("offer-count");
 if(offerBadge)offerBadge.hidden=!(lawyerTab==="activity"||lawyerTab==="home")||offerBadge.textContent==="0";
 q("refresh").hidden=lawyerTab==="account";
 q("support-list").hidden=lawyerTab!=="support";q("support-panel").hidden=lawyerTab!=="support";
 q("lawyer-back").hidden=!chatOpen;
 if(lawyerTab==="support")q("note").hidden=true;
 else if(lawyerTab==="account")q("note").textContent="اطلاعات حساب وکیل در مرحله بعد تکمیل می‌شود.";
 else if(account)q("note").hidden=true;
 if(lawyerTab==="account")q("note").hidden=false;
}
function navigateLawyerTab(tab,chatFilter="all"){
 lawyerTab=tab;supportTicket=null;
 if(tab==="chats")lawyerChatFilter=chatFilter;
 if(tab==="home")lawyerDeskView="overview";
 if(lawyerPreview&&tab==="chats")renderPreviewCaseList();
 if(tab==="account")populateLawyerProfileForm();
 renderLawyerTab(false);
 if(tab==="support")loadLawyerSupport().catch(e=>{q("note").hidden=false;q("note").textContent=e.message});
}
for(const button of document.querySelectorAll("[data-lawyer-tab]")){
 button.onclick=()=>navigateLawyerTab(button.dataset.lawyerTab);
}
for(const button of document.querySelectorAll("[data-chat-filter]")){
 button.onclick=()=>{
  lawyerChatFilter=button.dataset.chatFilter;
  if(lawyerPreview)renderPreviewCaseList();
  else refresh();
  renderLawyerTab(false);
 };
}
for(const button of document.querySelectorAll("[data-desk-action]")){
 button.onclick=()=>{
  const action=button.dataset.deskAction;
  if(action==="requests")navigateLawyerTab("activity");
  else if(action==="active")navigateLawyerTab("chats","active");
  else if(action==="completed")navigateLawyerTab("chats","completed");
  else if(action==="support")navigateLawyerTab("support");
  else if(action==="finance"||action==="reports")showLawyerDeskPanel(action);
 };
}
for(const button of document.querySelectorAll("[data-desk-back]")){
 button.onclick=()=>showLawyerDeskPanel("overview");
}
q("desk-availability").onclick=()=>{
 const input=q("ready");
 if(input.disabled)return;
 input.checked=!input.checked;
 input.dispatchEvent(new Event("change",{bubbles:true}));
};
q("lawyer-back").onclick=()=>{supportTicket=null;document.querySelector("#workspace").classList.remove("lawyer-chat-open");renderLawyerTab(false);if(lawyerTab==="support")loadLawyerSupport()};
renderLawyerTab(false);

// UI preview: accepted consultations are local to this browser, not the real server.
const previewLawyerStateKey="visitvakil-preview-lawyer-consultations-v1";
function readPreviewLawyerState(){
 const defaultState={
  offers:[
   {id:"demo-1",category:"حقوقی · ملکی و ثبتی",subject:"اختلاف در تنظیم سند ملک"},
   {id:"demo-2",category:"کیفری · سرقت",subject:"مشاوره درباره شکایت سرقت"},
   {id:"demo-3",category:"خانواده · مهریه",subject:"بررسی مطالبه مهریه"}
  ],
  cases:[{
   requestId:"demo-existing",conversationId:"demo-chat",category:"حقوقی · قراردادها",
   status:"in_progress",lastMessage:"سلام، درباره قرارداد راهنمایی می‌خواهم.",
   previewMessages:[{body:"سلام، درباره قرارداد راهنمایی می‌خواهم.",mine:false}]
  }]
 };
 try{
  const saved=JSON.parse(localStorage.getItem(previewLawyerStateKey));
  if(saved&&Array.isArray(saved.offers)&&Array.isArray(saved.cases))return saved;
 }catch(err){console.warn("Preview consultation storage unavailable",err)}
 return defaultState;
}
const previewLawyerState=readPreviewLawyerState();
const previewLawyerOffers=previewLawyerState.offers;
const previewLawyerCases=previewLawyerState.cases;
function savePreviewLawyerState(){
 try{localStorage.setItem(previewLawyerStateKey,JSON.stringify(previewLawyerState))}
 catch(err){console.warn("Could not save preview consultations",err)}
}
function appendPreviewEmpty(parent,message){
 const div=document.createElement("div");div.className="empty";div.textContent=message;parent.append(div);
}
function lawyerMatchesChatFilter(c){
 if(lawyerChatFilter==="active")return c.status==="assigned"||c.status==="in_progress";
 if(lawyerChatFilter==="completed")return c.status==="completed";
 return true;
}
function faDeskCount(n){return typeof n==="number"?new Intl.NumberFormat("fa-IR").format(n):"—"}
function showLawyerDeskPanel(panel){
 lawyerDeskView=panel;
 for(const name of ["overview","finance","reports"]){
  q("desk-"+name).hidden=name!==panel;
 }
}
function renderLawyerDesk(){
 const offers=lawyerPreview?previewLawyerOffers:null;
 const cases=lawyerPreview?previewLawyerCases:null;
 const tickets=lawyerPreview?previewSupport:null;
 const awaiting=offers?.length??null;
 const activeCount=cases?cases.filter(c=>c.status==="in_progress"||c.status==="assigned").length:null;
 const completedCount=cases?cases.filter(c=>c.status==="completed").length:null;
 const openTickets=tickets?tickets.filter(t=>t.status!=="closed").length:null;
 const values={
  "desk-requests":awaiting,"desk-active":activeCount,
  "desk-completed":completedCount,"desk-support":openTickets,
  "desk-report-requests":awaiting,"desk-report-active":activeCount,
  "desk-report-completed":completedCount,"desk-report-total":cases?.length??null
 };
 for(const [id,value] of Object.entries(values))q(id).textContent=faDeskCount(value);
 const ready=q("ready").checked;
 q("desk-availability").classList.toggle("offline",!ready);
 q("desk-availability-label").textContent=ready?"آماده پذیرش درخواست":"فعلاً غیرفعال";
 const latest=cases?.[0]||null;
 const button=q("desk-latest");
 button.disabled=!latest;
 q("desk-latest-title").textContent=latest?.category||"گفتگویی ثبت نشده است";
 q("desk-latest-subtitle").textContent=latest?(
  (latest.status==="completed"?"پایان‌یافته":"فعال")+" · "+(latest.lastMessage||"گفتگوی مشاوره")
 ):"پس از پذیرش درخواست، اینجا نمایش داده می‌شود.";
 button.onclick=()=>{if(!latest)return;if(lawyerPreview)openLawyerPreviewCase(latest);else openCase(latest)};
 showLawyerDeskPanel(lawyerDeskView);
}
function renderLawyerConsultationRow(parent,c,onOpen){
 const button=document.createElement("button");
 button.type="button";button.className="thread consultation-thread";
 const title=document.createElement("strong");title.textContent=c.category||"مشاوره حقوقی";
 const desc=document.createElement("span");
 const label=c.status==="completed"?"پایان‌یافته":"در حال مشاوره";
 desc.textContent=label+" · "+(c.lastMessage||"گفتگوی مشاوره");
 button.append(title,desc);button.addEventListener("click",onOpen);parent.append(button);
}
function renderPreviewCaseList(){
 const list=q("cases");list.replaceChildren();
 const visible=previewLawyerCases.filter(lawyerMatchesChatFilter);
 if(!visible.length)appendPreviewEmpty(list,previewLawyerCases.length?"در این بخش گفتگویی وجود ندارد.":"هنوز درخواستی را نپذیرفته‌اید.");
 for(const c of visible)renderLawyerConsultationRow(list,c,()=>openLawyerPreviewCase(c));
}
function drawLawyerPreviewMessages(){
 const list=q("messages");list.replaceChildren();
 const messages=active?.previewMessages||[];
 if(!messages.length)appendPreviewEmpty(list,"گفتگو آغاز شده است. پیام خود را بنویسید.");
 for(const message of messages){
  const bubble=document.createElement("div");
  bubble.className="bubble"+(message.mine?" mine":"");
  bubble.textContent=message.body;
  list.append(bubble);
 }
 list.scrollTop=list.scrollHeight;
}
function openLawyerPreviewCase(c){
 active=c;supportTicket=null;lawyerTab="chats";
 q("header").textContent=c.category||"مشاوره حقوقی";
 const writable=c.status!=="completed";
 q("send").hidden=!writable;
 q("complete-consultation").hidden=!writable;
 q("complete-consultation").textContent="پایان مشاوره";
 q("note").hidden=true;
 renderLawyerTab(true);
 drawLawyerPreviewMessages();
}
function acceptPreviewLawyerOffer(o){
 const i=previewLawyerOffers.findIndex(x=>x.id===o.id);
 if(i<0)return;
 previewLawyerOffers.splice(i,1);
 const c={
  requestId:o.id,conversationId:"preview-"+o.id,category:o.category,
  status:"in_progress",lastMessage:o.subject||"درخواست پذیرفته شد",
  previewMessages:[
   {body:o.subject||"درخواست مشاوره حقوقی",mine:false}
  ]
 };
 previewLawyerCases.unshift(c);
 savePreviewLawyerState();
 renderLawyerPreview();
 openLawyerPreviewCase(c);
}
function renderLawyerPreview(){
 const ready=q("ready").checked;
 const offers=ready?previewLawyerOffers:[];
 const requests=q("offers");requests.replaceChildren();
 if(!ready)appendPreviewEmpty(requests,"برای دریافت درخواست، وضعیت آماده پذیرش را فعال کنید.");
 else if(!offers.length)appendPreviewEmpty(requests,"درخواست جدیدی برای پذیرش وجود ندارد.");
 for(const o of offers){
  const button=document.createElement("button");
  button.type="button";button.className="thread lawyer-offer-thread";
  const title=document.createElement("strong");title.textContent=o.category;
  const subtitle=document.createElement("span");subtitle.textContent=(o.subject||"درخواست مشاوره")+" · پذیرش درخواست";
  button.append(title,subtitle);
  button.addEventListener("click",()=>acceptPreviewLawyerOffer(o));
  requests.append(button);
 }
 renderPreviewCaseList();
 for(const id of ["offer-count","nav-offer-count"]){
  const badge=q(id);
  if(badge){badge.textContent=String(offers.length);badge.hidden=!offers.length}
 }
 q("note").hidden=!(lawyerTab==="support"||lawyerTab==="account");
 renderLawyerTab(false);
}
if(lawyerPreview){q("ready").checked=true;renderLawyerPreview()}

let supportTicket=null,supportCursor=0;
const supportStorageKey="visitvakil-preview-lawyer-support-v1";
function getSupportTickets(){try{const v=JSON.parse(localStorage.getItem(supportStorageKey));return Array.isArray(v)?v:[]}catch{return []}}
const previewSupport=getSupportTickets();
function savePreviewSupport(){localStorage.setItem(supportStorageKey,JSON.stringify(previewSupport))}
async function loadLawyerSupport(){
 const list=q("support-list");list.replaceChildren();
 const rows=lawyerPreview?previewSupport:await api("/support/tickets");
 if(!rows.length){const d=document.createElement("div");d.className="empty";d.textContent="هنوز تیکتی ثبت نشده است.";list.append(d)}
 for(const t of rows){
  const b=document.createElement("button");b.type="button";b.className="thread support-thread";
  const title=document.createElement("strong");title.textContent=t.subject;
  const desc=document.createElement("span");desc.textContent=(t.status==="closed"?"پایان‌یافته":"پشتیبانی فعال")+" · "+(t.lastMessage||"");
  b.append(title,desc);b.addEventListener("click",()=>openLawyerSupport(t));list.append(b);
 }
}
q("support-cancel").onclick=()=>{q("support-panel").open=false};
q("support-form").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.currentTarget,subject=q("support-subject").value.trim(),body=q("support-body").value.trim();
 if(!subject||!body)return;
 const button=form.querySelector('[type="submit"]');button.disabled=true;
 try{
  const t=lawyerPreview?{ticketId:"ticket-"+Date.now(),subject,status:"open",lastMessage:body,previewMessages:[{body,mine:true}]}:await api("/support/tickets","POST",{subject,body});
  if(lawyerPreview){previewSupport.unshift(t);savePreviewSupport()}
  form.reset();q("support-panel").open=false;
  await loadLawyerSupport();
  await openLawyerSupport(t);
 }catch(err){alert("ثبت تیکت ناموفق بود: "+err.message)}
 finally{button.disabled=false}
});
async function openLawyerSupport(t){
 const current=lawyerPreview?previewSupport.find(x=>x.ticketId===t.ticketId):null;
 if(lawyerPreview&&current)t=current;
 supportTicket=t;supportCursor=0;active=null;selectionVersion++;
 lawyerTab="support";renderLawyerTab(true);document.querySelector("#workspace").classList.add("lawyer-chat-open");
 q("header").textContent=t.subject;q("messages").replaceChildren();q("support-panel").open=false;
 q("send").hidden=t.status==="closed";q("complete-consultation").hidden=t.status==="closed";q("complete-consultation").textContent="بستن درخواست";
 await syncLawyerSupport();
}
async function syncLawyerSupport(){
 if(!supportTicket)return;
 const rows=lawyerPreview?(supportTicket.previewMessages||[]).map((m,i)=>({id:i+1,body:m.body,mine:m.mine})):await api("/support/tickets/"+supportTicket.ticketId+"/messages?after="+supportCursor);
 for(const m of rows){if(m.id<=supportCursor)continue;supportCursor=m.id;const d=document.createElement("div");d.className="bubble"+((lawyerPreview?m.mine:m.senderId===account)?" mine":"");d.textContent=m.body;q("messages").append(d)}
 q("messages").scrollTop=q("messages").scrollHeight;
}


// Lawyer profile preview. No server upload or lawyer identity verification happens here.
const lawyerProfileStorageKey="visitvakil-preview-lawyer-profile-v1";
const lawyerProfileFields=["firstName","lastName","professionalTitle","licenseNumber","licenseIssuer","province","city","bio"];
function readLawyerProfile(){
 try{
  const saved=JSON.parse(localStorage.getItem(lawyerProfileStorageKey));
  if(saved&&typeof saved==="object"&&!Array.isArray(saved)){
   const clean={};
   for(const name of lawyerProfileFields)clean[name]=typeof saved[name]==="string"?saved[name]:"";
   clean.specialties=Array.isArray(saved.specialties)?saved.specialties.filter(x=>typeof x==="string"):[];
   clean.avatar=typeof saved.avatar==="string"&&saved.avatar.startsWith("data:image/jpeg;base64,")?saved.avatar:"";
   return clean;
  }
 }catch(err){console.warn("Could not read lawyer profile",err)}
 return Object.fromEntries([...lawyerProfileFields.map(name=>[name,""]),["specialties",[]],["avatar",""]]);
}
let lawyerProfileState=readLawyerProfile();
let lawyerProfileAvatarDraft=lawyerProfileState.avatar;
function getLawyerProfileDraft(){
 const form=q("lawyer-profile-form");
 const data=new FormData(form);
 const draft={};
 for(const name of lawyerProfileFields)draft[name]=String(data.get(name)||"").trim();
 draft.specialties=data.getAll("specialty").map(String);
 draft.avatar=lawyerProfileAvatarDraft;
 return draft;
}
function profileFaNumber(n){return new Intl.NumberFormat("fa-IR").format(n)}
function updateLawyerProfilePreview(){
 const form=q("lawyer-profile-form");
 if(!form)return;
 const draft=getLawyerProfileDraft();
 const name=[draft.firstName,draft.lastName].filter(Boolean).join(" ")||"پروفایل شما";
 q("profile-display-name").textContent=name;
 q("profile-display-subtitle").textContent=[draft.professionalTitle,draft.city||draft.province].filter(Boolean).join(" · ")||"اطلاعات حرفه‌ای خود را تکمیل کنید";
 const img=q("profile-avatar-image");
 const fallback=q("profile-avatar-initial");
 if(draft.avatar){
  if(img.getAttribute("src")!==draft.avatar)img.setAttribute("src",draft.avatar);
  img.hidden=false;fallback.hidden=true;
 }else{
  img.hidden=true;img.removeAttribute("src");fallback.hidden=false;
  fallback.textContent=[draft.firstName.charAt(0),draft.lastName.charAt(0)].filter(Boolean).join("")||"و";
 }
 q("profile-avatar-remove").hidden=!draft.avatar;
 const parts=[
  !!draft.firstName,!!draft.lastName,!!draft.professionalTitle,
  !!draft.licenseNumber,!!draft.licenseIssuer,
  !!draft.province,!!draft.city,!!draft.specialties.length,
  !!draft.bio,!!draft.avatar
 ];
 const percent=Math.round(parts.filter(Boolean).length/parts.length*100);
 q("profile-progress-label").textContent=profileFaNumber(percent)+"٪";
 q("profile-progress-bar").style.width=percent+"%";
 q("profile-bio-count").textContent=profileFaNumber(draft.bio.length);
}
function populateLawyerProfileForm(){
 const form=q("lawyer-profile-form");
 for(const name of lawyerProfileFields){
  const control=form.elements.namedItem(name);
  if(control)control.value=lawyerProfileState[name]||"";
 }
 for(const checkbox of form.querySelectorAll('input[name="specialty"]')){
  checkbox.checked=lawyerProfileState.specialties.includes(checkbox.value);
 }
 lawyerProfileAvatarDraft=lawyerProfileState.avatar;
 q("profile-avatar-file").value="";
 q("profile-mobile").value="";
 q("profile-save-status").textContent="تغییرات فقط در همین مرورگر ذخیره می‌شوند.";
 q("profile-save-status").dataset.result="";
 updateLawyerProfilePreview();
}
function setLawyerProfileDirty(){
 q("profile-save-status").textContent="تغییرات ذخیره نشده‌اند.";
 q("profile-save-status").dataset.result="pending";
 updateLawyerProfilePreview();
}
function resizeLawyerAvatar(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file);
  const image=new Image();
  image.onload=()=>{
   try{
    const size=288;
    const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext("2d");
    if(!ctx)throw new Error("امکان پردازش تصویر وجود ندارد.");
    const edge=Math.min(image.naturalWidth,image.naturalHeight);
    if(!edge)throw new Error("ابعاد تصویر معتبر نیست.");
    const sx=(image.naturalWidth-edge)/2,sy=(image.naturalHeight-edge)/2;
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,size,size);
    ctx.drawImage(image,sx,sy,edge,edge,0,0,size,size);
    resolve(canvas.toDataURL("image/jpeg",0.82));
   }catch(err){reject(err)}
   finally{URL.revokeObjectURL(url)}
  };
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("خواندن تصویر ممکن نیست."))};
  image.src=url;
 });
}
q("profile-avatar-file").addEventListener("change",async e=>{
 const file=e.target.files?.[0];
 if(!file)return;
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>4*1024*1024){
  q("profile-save-status").textContent="فقط تصویر JPG، PNG یا WebP تا حجم ۴ مگابایت مجاز است.";
  q("profile-save-status").dataset.result="error";
  e.target.value="";return;
 }
 const save=q("profile-save-button");save.disabled=true;
 q("profile-save-status").textContent="در حال آماده‌سازی عکس...";
 try{
  const avatar=await resizeLawyerAvatar(file);
  if(avatar.length>450000)throw new Error("اندازه تصویر پردازش‌شده بیش از حد مجاز است.");
  lawyerProfileAvatarDraft=avatar;
  setLawyerProfileDirty();
 }catch(err){
  q("profile-save-status").textContent=err.message||"خواندن عکس ناموفق بود.";
  q("profile-save-status").dataset.result="error";
 }finally{save.disabled=false;e.target.value=""}
});
q("profile-avatar-remove").onclick=()=>{
 lawyerProfileAvatarDraft="";
 setLawyerProfileDirty();
};
q("lawyer-profile-form").addEventListener("input",setLawyerProfileDirty);
q("lawyer-profile-form").addEventListener("change",setLawyerProfileDirty);
q("lawyer-profile-form").addEventListener("submit",e=>{
 e.preventDefault();
 const draft=getLawyerProfileDraft();
 try{
  localStorage.setItem(lawyerProfileStorageKey,JSON.stringify(draft));
  lawyerProfileState=draft;
  q("profile-save-status").textContent="پروفایل با موفقیت در همین مرورگر ذخیره شد.";
  q("profile-save-status").dataset.result="success";
  updateLawyerProfilePreview();
 }catch(err){
  q("profile-save-status").textContent="ذخیره انجام نشد؛ فضای مرورگر را بررسی کنید.";
  q("profile-save-status").dataset.result="error";
 }
});
