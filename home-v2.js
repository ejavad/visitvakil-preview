"use strict";
const $=id=>document.getElementById(id);
const state={step:0,service:"text",topic:"",description:""};
const names={text:"مشاوره آنلاین",phone:"مشاوره تلفنی"};
const topics=["ملکی و ثبتی","خانواده","کیفری","چک و مطالبات","قراردادها","شرکت و کسب‌وکار"];
function node(tag,className,value){const n=document.createElement(tag);if(className)n.className=className;n.textContent=value;return n}
function setService(value){if(!names[value])return;state.service=value;for(const b of document.querySelectorAll("[data-service]")){b.classList.toggle("selected",b.dataset.service===value);b.setAttribute("aria-pressed",String(b.dataset.service===value))}}

function openWizard(topic){if(topic&&topics.includes(topic))state.topic=topic;state.step=topic?1:0;draw();$("wizard").showModal()}
function closeWizard(){$("wizard").close()}
$("start-wizard").onclick=()=>openWizard();
// Preview deep link: show the latest consultation design immediately.
if(new URLSearchParams(location.search).get("show")==="consultation"){openWizard();}




$("close-wizard").onclick=closeWizard;
$("wizard").addEventListener("click",e=>{if(e.target===$("wizard"))closeWizard()});
$("wizard-back").onclick=()=>{state.step=Math.max(0,state.step-1);draw()};
function choice(value,label,subtitle,selected,click){const b=node("button","wizard-choice"+(selected?" chosen":""),"");b.type="button";b.append(node("strong","",label));if(subtitle)b.append(node("small","",subtitle));b.setAttribute("aria-pressed",String(selected));b.onclick=click;return b}
function draw(){
 const body=$("wizard-body");body.replaceChildren();$("wizard-error").textContent="";
 const heading=["مشاوره را چطور می‌خواهید بگیرید؟","موضوع مشاوره شما چیست؟","شرح درخواست شما"];
 const lead=["روش ارتباط با وکیل را انتخاب کنید.","موضوع نزدیک‌تر به مسئله خود را انتخاب کنید.","مسئله خود را کوتاه و روشن توضیح دهید."];
 $("wizard-title").textContent=heading[state.step];$("wizard-lead").textContent=lead[state.step];
 $("wizard").dataset.step=String(state.step);
 $("wizard-lead").hidden=state.step===0;
 $("wizard-step-label").textContent=["نوع مشاوره","موضوع حقوقی","شرح درخواست"][state.step];
 document.querySelectorAll(".wizard-progress span").forEach((x,i)=>x.classList.toggle("on",i<=state.step));
 $("wizard-back").disabled=state.step===0;
 $("wizard-next").lastChild.textContent=state.step===2?"مشاهده پیش‌نمایش":"←";
 if(state.step===0){
  const cards=[
   {id:"phone",name:"مشاوره تلفنی",desc:"گفتگوی مستقیم و خصوصی با وکیل",kind:"تماس تلفنی",symbol:'<path d="M9.1 5.8c-.7-.9-2.1-1.1-3-.3L4.3 7.1c-.8.7-1.1 1.8-.7 2.8 3.2 8.1 9.8 14.6 17.9 17.4 1 .3 2.1 0 2.7-.8l1.6-1.9c.8-.9.6-2.3-.3-3l-3.5-2.6c-.9-.7-2.1-.6-2.9.2l-1.8 1.8a20 20 0 0 1-7.2-7.2l1.8-1.8c.8-.8.9-2 .2-2.9L9.1 5.8Z" transform="translate(0 1) scale(.91)"/><path d="M19 5.4a7.6 7.6 0 0 1 7.6 7.6M19 9.3a3.7 3.7 0 0 1 3.7 3.7"/>'},
   {id:"text",name:"مشاوره آنلاین",desc:"گفتگوی متنی با وکیل در مسنجر",kind:"گفتگوی اینترنتی",symbol:'<rect x="3.5" y="5" width="25" height="19" rx="4"/><path d="M10 11h12M10 16h8M10 24l-5 5v-5"/>'}
  ];
  for(const item of cards){
    const selected=state.service===item.id;
    const button=node("button","vv-consult-card"+(item.id==="phone"?" recommended":"")+(selected?" selected":""),"");
    button.type="button";button.dataset.service=item.id;button.setAttribute("aria-pressed",String(selected));
    const icon=document.createElement("span");icon.className="vv-consult-illustration";icon.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+item.symbol+'</svg>';
    const copy=node("span","vv-consult-copy","");
    copy.append(node("strong","",item.name),node("small","",item.desc),node("em","",item.kind));
    const check=node("span","vv-consult-check",selected?"✓":"");check.setAttribute("aria-hidden","true");
    if(item.id==="phone"){const badge=node("span","vv-recommend-badge","پیشنهاد ویزیت وکیل");button.append(badge);}
    button.append(icon,copy,check);
    button.onclick=()=>{state.service=item.id;draw()};
    body.append(button);
  }
}
 if(state.step===1){for(const topic of topics)body.append(choice(topic,topic,"",state.topic===topic,()=>{state.topic=topic;draw()}))}
 if(state.step===2){
  const div=node("div","review","");
  for(const [label,value] of [["نوع مشاوره",names[state.service]],["موضوع حقوقی",state.topic]]){const row=document.createElement("div");row.append(node("span","",label),node("b","",value));div.append(row)}
  body.append(div);const label=node("label","wizard-field","شرح مسئله حقوقی");const textarea=document.createElement("textarea");textarea.id="wizard-description";textarea.maxLength=10000;textarea.placeholder="مثلاً درباره سند ملک، قرارداد، خانواده یا موضوع دیگری توضیح دهید...";textarea.value=state.description;textarea.addEventListener("input",()=>state.description=textarea.value);label.append(textarea);body.append(label);
  body.append(node("div","preview-notice","این نسخه فقط پیش‌نمایش طراحی است؛ هنوز شماره موبایل، پرداخت یا درخواست واقعی ثبت نمی‌شود."));
 }
}
$("wizard-next").onclick=()=>{
 if(state.step===0){state.step=1;draw();return}
 if(state.step===1){if(!state.topic){$("wizard-error").textContent="موضوع حقوقی را انتخاب کنید.";return}state.step=2;draw();return}
 const v=$("wizard-description")?.value.trim()||"";if(v.length<10){$("wizard-error").textContent="برای بررسی فرم، شرحی با حداقل ۱۰ نویسه وارد کنید.";return}
 state.description=v;
 const body=$("wizard-body");body.replaceChildren();$("wizard-title").textContent="پیش‌نمایش تکمیل شد";$("wizard-lead").textContent="در نسخه نهایی این مرحله به ورود امن و ثبت درخواست متصل می‌شود.";
 const review=node("div","review","");
 for(const [label,val] of [["خدمت",names[state.service]],["موضوع",state.topic],["شرح",state.description]]){const row=document.createElement("div");row.append(node("span","",label),node("b","",val));review.append(row)}body.append(review);
 body.append(node("div","preview-notice","این درخواست ثبت نشده و پیام یا پرداختی ارسال نشده است. برای دیدن محیط گفتگو، می‌توانید پیش‌نمایش مسنجر کاربر را باز کنید."));
 const link=node("a","cta","مشاهده مسنجر کاربر ←");link.href="./index.html";body.append(link);
 $("wizard-next").hidden=true;$("wizard-back").hidden=true;
};
$("wizard").addEventListener("close",()=>{$("wizard-next").hidden=false;$("wizard-back").hidden=false;state.step=0});

/* Sliding homepage services drawer; consultation wizard behavior remains unchanged. */
const menuButton=document.getElementById("site-menu");
const menuLinks=document.getElementById("site-links");
const menuScrim=document.getElementById("menu-scrim");
const menuClose=document.getElementById("menu-close");
const menuConsult=document.getElementById("menu-consult");
let menuReturnFocus=null;
function setMenuOpen(open){
 if(!menuButton||!menuLinks||!menuScrim)return;
 if(open)menuReturnFocus=document.activeElement;
 menuLinks.hidden=!open;
 menuScrim.hidden=!open;
 document.body.classList.toggle("vv-menu-open",open);
 menuButton.setAttribute("aria-expanded",String(open));
 if(open){menuClose.focus();}else if(menuReturnFocus&&typeof menuReturnFocus.focus==="function"){menuReturnFocus.focus();menuReturnFocus=null;}
}
if(menuButton&&menuLinks&&menuScrim){
 menuButton.addEventListener("click",()=>setMenuOpen(menuLinks.hidden));
 menuClose.addEventListener("click",()=>setMenuOpen(false));
 menuScrim.addEventListener("click",()=>setMenuOpen(false));
 document.addEventListener("keydown",event=>{
  if(menuLinks.hidden)return;
  if(event.key==="Escape"){setMenuOpen(false);return;}
  if(event.key==="Tab"){
    const focusable=[...menuLinks.querySelectorAll('button:not([disabled]),a[href],summary')].filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 menuLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenuOpen(false)));
 if(menuConsult)menuConsult.addEventListener("click",()=>{setMenuOpen(false);document.getElementById("start-wizard")?.click();});
}

/* Rotating phrase is decorative only: content is already present without JS. */
(function startHomepageTyping(){
 const span=document.getElementById("rotating-phrase");
 if(!span || window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const phrases=["آغاز یک تصمیم درست","آغاز یک انتخاب درست","آغاز یک مسیر درست"];
 let phrase=0,index=phrases[0].length,removing=true;
 function tick(){
  const current=phrases[phrase];
  if(removing){
   index=Math.max(0,index-1);span.textContent=current.slice(0,index);
   if(index===0){phrase=(phrase+1)%phrases.length;removing=false;setTimeout(tick,380);return}
   setTimeout(tick,45);return;
  }
  const next=phrases[phrase];index=Math.min(next.length,index+1);span.textContent=next.slice(0,index);
  if(index===next.length){removing=true;setTimeout(tick,2300);return}
  setTimeout(tick,95);
 }
 setTimeout(tick,2500);
})();
