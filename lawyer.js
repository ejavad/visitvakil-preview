const q=id=>document.getElementById(id);
const lawyerPreview=true;
let active=null, cursor=0, account=null, refreshing=false, syncing=false, refreshQueued=false, selectionVersion=0, lawyerTab="activity";
async function api(p,m="GET",v){throw Error("نسخه نمایشی بدون سرور است");const r=await fetch(p,{method:m,credentials:"same-origin",headers:{"Content-Type":"application/json"},body:v?JSON.stringify(v):undefined});if(!r.ok)throw Error(r.status===401?"برای ادامه، وارد حساب وکیل شوید.":r.status===409?"این درخواست قبلاً توسط وکیل دیگری پذیرفته شده است.":r.status===429?"تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.":r.status===503?"سرویس موقتاً در دسترس نیست.":"خطای ارتباط با سرور ("+r.status+")");return r.status===204?null:r.json()}
function entry(parent,label,fn){let b=document.createElement("button");b.className="thread";b.textContent=label;b.onclick=()=>fn(b);parent.append(b)}
async function refresh(){if(refreshing){refreshQueued=true;return}refreshing=true;try{account=(await api("/auth/me")).accountId;const offers=await api("/lawyers/me/offers"),cases=await api("/lawyers/me/consultations");const availability=await api("/lawyers/me/ready");q("ready").checked=availability.ready;for(const id of ["offer-count","nav-offer-count"]){q(id).textContent=offers.length>99?"99+":String(offers.length);q(id).hidden=!offers.length;}q("note").hidden=true;q("offers").replaceChildren();q("cases").replaceChildren();for(const o of offers)entry(q("offers"),o.category+" — پذیرش",async(button)=>{try{if(button)button.disabled=true;await api("/requests/"+o.id+"/accept","POST");queueMicrotask(refresh)}catch(err){alert("این درخواست ممکن است توسط وکیل دیگری پذیرفته شده باشد. "+err.message);queueMicrotask(refresh)}finally{if(button)button.disabled=false}});for(const c of cases)entry(q("cases"),c.category+" — "+c.status,()=>openCase(c));if(active){const latest=cases.find(c=>c.requestId===active.requestId);if(!latest){active=null;selectionVersion++;cursor=0;q("messages").replaceChildren();q("send").hidden=true;q("complete-consultation").hidden=true;q("header").textContent="گفتگویی انتخاب نشده است."}else{active={...active,...latest};const writable=latest.status==="assigned"||latest.status==="in_progress";q("send").hidden=!writable;q("complete-consultation").hidden=!writable}}}catch(e){q("note").hidden=false;q("note").textContent="با حساب وکیل وارد شوید: "+e.message}finally{refreshing=false;if(refreshQueued){refreshQueued=false;queueMicrotask(refresh)}}}
async function sync(){if(!active||syncing)return;syncing=true;const conversationId=active.conversationId,version=selectionVersion,after=cursor;try{for(const m of await api("/conversations/"+conversationId+"/messages?after="+after)){if(version!==selectionVersion||active?.conversationId!==conversationId)break;if(m.id<=cursor)continue;cursor=m.id;const d=document.createElement("div");d.className="bubble"+((lawyerPreview?m.mine:m.senderId===account)?" mine":"");d.textContent=m.body;q("messages").append(d)}q("messages").scrollTop=q("messages").scrollHeight}catch(e){if(version===selectionVersion)q("header").textContent=e.message}finally{syncing=false;if(active&&active.conversationId!==conversationId)queueMicrotask(sync)}}
async function openCase(c){if(active?.conversationId===c.conversationId)return;active=c;selectionVersion++;cursor=0;q("messages").replaceChildren();q("send").hidden=!(c.status==="assigned"||c.status==="in_progress");q("complete-consultation").hidden=q("send").hidden;q("header").textContent=c.category;lawyerTab="chats";renderLawyerTab(true);await sync()}
q("refresh").onclick=()=>lawyerTab==="support"?loadLawyerSupport():refresh();
q("ready").onchange=async e=>{if(lawyerPreview){renderLawyerPreview();return;}const toggle=e.target;const desired=toggle.checked;toggle.disabled=true;try{await api("/lawyers/me/ready","PUT",{ready:desired});await refresh()}catch(err){toggle.checked=!desired;alert(err.message)}finally{toggle.disabled=false}};
q("send").onsubmit=async e=>{e.preventDefault();if(lawyerTab==="support"&&supportTicket){const body=q("body").value.trim();if(!body)return;try{if(lawyerPreview){supportTicket.lastMessage=body;supportTicket.previewMessages??=[];supportTicket.previewMessages.push({body,mine:true});savePreviewSupport();const d=document.createElement("div");d.className="bubble mine";d.textContent=body;q("messages").append(d)}else{await api("/support/tickets/"+supportTicket.ticketId+"/messages","POST",{body});await syncLawyerSupport()}q("body").value="";if(lawyerPreview)savePreviewSupport();await loadLawyerSupport()}catch(err){alert(err.message)}return;}if(lawyerPreview){const value=q("body").value.trim();if(value&&active){previewLawyerMessages.push({body:value,mine:true});q("body").value="";drawLawyerPreviewMessages()}return;}const body=q("body").value.trim();if(!body||!active||q("send").hidden)return;const button=q("send").querySelector('button[type="submit"]')||q("send").querySelector("button");if(button?.disabled)return;if(button)button.disabled=true;const target=active.conversationId;try{await api("/conversations/"+target+"/messages","POST",{key:crypto.randomUUID(),body});if(active?.conversationId===target){if(q("body").value.trim()===body)q("body").value="";await sync()}}catch(err){alert(err.message)}finally{if(button)button.disabled=false}};
setInterval(()=>{if(document.hidden||lawyerPreview)return;refresh();if(active)sync()},30000);if(!lawyerPreview)refresh();
q("complete-consultation").onclick=async()=>{if(lawyerTab==="support"&&supportTicket){if(!confirm("درخواست پشتیبانی بسته شود؟"))return;try{if(!lawyerPreview)await api("/support/tickets/"+supportTicket.ticketId+"/close","POST");supportTicket.status="closed";if(lawyerPreview)savePreviewSupport();q("send").hidden=true;q("complete-consultation").hidden=true;await loadLawyerSupport()}catch(e){alert(e.message)}return;}if(lawyerPreview){if(active&&confirm("این مشاوره پایان یابد؟")){active.status="completed";renderLawyerPreview();}return;}if(!active||!confirm("این مشاوره پایان یابد؟"))return;try{await api("/requests/"+active.requestId+"/complete","POST",{reason:"تکمیل مشاوره توسط وکیل"});active=null;selectionVersion++;q("send").hidden=true;q("complete-consultation").hidden=true;q("messages").replaceChildren();await refresh()}catch(e){alert(e.message)}};

document.addEventListener('vv:workspace-changed',()=>refresh());document.dispatchEvent(new Event('vv:auth-ready'));

function renderLawyerTab(chatOpen=false){
 const root=document.querySelector("#workspace");
 root.dataset.lawyerTab=lawyerTab;
 root.classList.toggle("chat-open",!!chatOpen);root.classList.toggle("lawyer-chat-open",!!chatOpen);
 for(const b of document.querySelectorAll("[data-lawyer-tab]")){b.classList.toggle("selected",b.dataset.lawyerTab===lawyerTab);b.setAttribute("aria-current",b.dataset.lawyerTab===lawyerTab?"page":"false")}
 q("offers").hidden=lawyerTab==="chats"||lawyerTab==="support"||lawyerTab==="account";
 q("cases").hidden=lawyerTab==="activity"||lawyerTab==="support"||lawyerTab==="account";
 q("cases-heading").hidden=q("cases").hidden;
 q("ready-control").hidden=lawyerTab==="chats"||lawyerTab==="support"||lawyerTab==="account";
 q("lawyer-list-title").textContent=lawyerTab==="chats"?"گفتگوهای من":lawyerTab==="support"?"پشتیبانی":lawyerTab==="account"?"حساب وکیل":"درخواست‌های جدید";
 if(lawyerTab==="activity"||lawyerTab==="home")q("lawyer-list-title").append(q("offer-count"));
 q("refresh").hidden=lawyerTab==="account";
 q("support-list").hidden=lawyerTab!=="support";q("support-panel").hidden=lawyerTab!=="support";
 q("lawyer-back").hidden=!chatOpen;
 if(lawyerTab==="support")q("note").hidden=true;
 else if(lawyerTab==="account")q("note").textContent="اطلاعات حساب وکیل در مرحله بعد تکمیل می‌شود.";
 else if(account)q("note").hidden=true;
 if(lawyerTab==="account")q("note").hidden=false;
}
for(const b of document.querySelectorAll("[data-lawyer-tab]"))b.onclick=()=>{lawyerTab=b.dataset.lawyerTab;supportTicket=null;if(lawyerPreview)renderLawyerPreview();renderLawyerTab(false);if(lawyerTab==="support")loadLawyerSupport().catch(e=>{q("note").hidden=false;q("note").textContent=e.message})};
q("lawyer-back").onclick=()=>{supportTicket=null;document.querySelector("#workspace").classList.remove("lawyer-chat-open");renderLawyerTab(false);if(lawyerTab==="support")loadLawyerSupport()};
renderLawyerTab(false);

// Isolated UI preview: local sample data only, never authenticates or changes server records.
const previewLawyerOffers=[{id:"demo-1",category:"ملکی و ثبتی"},{id:"demo-2",category:"خانواده"},{id:"demo-3",category:"چک و مطالبات"}];
const previewLawyerCases=[{requestId:"demo-existing",conversationId:"demo-chat",category:"قراردادها",status:"in_progress"}];
let previewLawyerMessages=[];
function drawLawyerPreviewMessages(){q("messages").replaceChildren();for(const m of previewLawyerMessages){const d=document.createElement("div");d.className="bubble"+(m.mine?" mine":"");d.textContent=m.body;q("messages").append(d)}q("messages").scrollTop=q("messages").scrollHeight}
function openLawyerPreviewCase(c){active=c;lawyerTab="chats";previewLawyerMessages=[{body:"سلام، برای بررسی موضوع حقوقی در خدمت شما هستم.",mine:true}];q("header").textContent=c.category;q("send").hidden=c.status==="completed";q("complete-consultation").hidden=c.status==="completed";q("note").hidden=true;renderLawyerTab(true);drawLawyerPreviewMessages()}
function renderLawyerPreview(){const ready=q("ready").checked;const offers=ready?previewLawyerOffers:[];q("offers").replaceChildren();q("cases").replaceChildren();for(const o of offers)entry(q("offers"),o.category+" — پذیرش",()=>{previewLawyerOffers.splice(previewLawyerOffers.indexOf(o),1);const c={requestId:o.id,conversationId:"preview-"+o.id,category:o.category,status:"in_progress"};previewLawyerCases.unshift(c);renderLawyerPreview();openLawyerPreviewCase(c)});for(const c of previewLawyerCases)entry(q("cases"),c.category+" — "+(c.status==="completed"?"پایان‌یافته":"در حال مشاوره"),()=>openLawyerPreviewCase(c));for(const id of ["offer-count","nav-offer-count"]){q(id).textContent=String(offers.length);q(id).hidden=!offers.length}q("note").hidden=!(lawyerTab==="support"||lawyerTab==="account");renderLawyerTab(false)}
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
