"use strict";
const $=id=>document.getElementById(id);
const state={step:0,service:"text",topic:"",description:""};
const names={text:"مشاوره متنی",phone:"مشاوره تلفنی",free:"پرسش رایگان"};
const topics=["ملکی و ثبتی","خانواده","کیفری","چک و مطالبات","قراردادها","شرکت و کسب‌وکار"];
function node(tag,className,value){const n=document.createElement(tag);if(className)n.className=className;n.textContent=value;return n}
function setService(value){if(!names[value])return;state.service=value;for(const b of document.querySelectorAll("[data-service]")){b.classList.toggle("selected",b.dataset.service===value);b.setAttribute("aria-pressed",String(b.dataset.service===value))}}

function openWizard(topic){if(topic&&topics.includes(topic))state.topic=topic;state.step=topic?1:0;draw();$("wizard").showModal()}
function closeWizard(){$("wizard").close()}
$("start-wizard").onclick=()=>openWizard();



$("close-wizard").onclick=closeWizard;
$("wizard").addEventListener("click",e=>{if(e.target===$("wizard"))closeWizard()});
$("wizard-back").onclick=()=>{state.step=Math.max(0,state.step-1);draw()};
function choice(value,label,subtitle,selected,click){const b=node("button","wizard-choice"+(selected?" chosen":""),"");b.type="button";b.append(node("strong","",label));if(subtitle)b.append(node("small","",subtitle));b.setAttribute("aria-pressed",String(selected));b.onclick=click;return b}
function draw(){
 const body=$("wizard-body");body.replaceChildren();$("wizard-error").textContent="";
 const heading=["انتخاب نوع مشاوره","انتخاب موضوع حقوقی","شرح و مرور درخواست"];
 const lead=["نوع خدمتی را که می‌خواهید انتخاب کنید.","کدام موضوع به مسئله شما نزدیک‌تر است؟","جزئیات مسئله را بنویسید و پیش‌نمایش مسیر را ببینید."];
 $("wizard-title").textContent=heading[state.step];$("wizard-lead").textContent=lead[state.step];
 $("wizard-step-label").textContent="مرحله "+String(state.step+1)+" از ۳";
 document.querySelectorAll(".wizard-progress span").forEach((x,i)=>x.classList.toggle("on",i<=state.step));
 $("wizard-back").disabled=state.step===0;
 $("wizard-next").lastChild.textContent=state.step===2?"مشاهده پیش‌نمایش":"←";
 if(state.step===0){for(const [id,label,sub] of [["text","مشاوره متنی","گفتگوی آنلاین با وکیل"],["phone","مشاوره تلفنی","مشاوره با تماس تلفنی"],["free","پرسش رایگان","ثبت سؤال حقوقی"]])body.append(choice(id,label,sub,state.service===id,()=>{state.service=id;setService(id);draw()}))}
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
