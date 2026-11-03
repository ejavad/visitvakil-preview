"use strict";
const $=id=>document.getElementById(id);
const state={step:0,service:"text",duration:null,topic:"",description:"",demoSignedIn:false,mobile:"",otp:"",paymentDone:false};
const phoneDurations=[20,30,45];
const names={text:"مشاوره آنلاین",phone:"مشاوره تلفنی"};
const legalTopics=[
 {id:"family",name:"خانواده",desc:"طلاق، مهریه، نفقه و حضانت",icon:'<circle cx="11" cy="10" r="4"/><circle cx="25" cy="10" r="4"/><path d="M3 29v-4c0-5 3-8 8-8s8 3 8 8v4M20 17c5 0 9 3 9 8v4"/>'},
 {id:"property",name:"ملکی و املاک",desc:"خرید و فروش، سند، اجاره و تخلیه",icon:'<path d="m4 16 12-10 12 10v13H4V16Z"/><path d="M12 29V19h8v10M2 17l14-12 14 12"/>'},
 {id:"crime",name:"کیفری و جرایم",desc:"کلاهبرداری، تهدید و شکایت",icon:'<path d="M16 5v25M8 9h16M8 9l-5 9h10L8 9ZM24 9l-5 9h10l-5-9ZM11 30h10"/>'},
 {id:"contracts",name:"قراردادها و تعهدات",desc:"قرارداد، چک و ضمانت",icon:'<path d="M7 3h13l7 7v19H7zM20 3v8h7M12 17h10M12 22h10M12 27h7"/>'},
 {id:"business",name:"شرکت و کسب‌وکار",desc:"شرکت و امور کسب‌وکار",icon:'<path d="M4 29V10h13v19M17 15h11v14M8 15h4M8 20h4M8 25h4M21 20h3M21 25h3M2 29h28"/>'},
 {id:"other",name:"حقوقی و سایر",desc:"موضوعات دیگر",icon:'<rect x="4" y="4" width="8" height="8" rx="1"/><rect x="20" y="4" width="8" height="8" rx="1"/><rect x="4" y="20" width="8" height="8" rx="1"/><path d="M24 19v10M19 24h10"/>'}
];
const topics=legalTopics.map(item=>item.name);
function node(tag,className,value){const n=document.createElement(tag);if(className)n.className=className;n.textContent=value;return n}
function setService(value){if(!names[value])return;state.service=value;for(const b of document.querySelectorAll("[data-service]")){b.classList.toggle("selected",b.dataset.service===value);b.setAttribute("aria-pressed",String(b.dataset.service===value))}}

function openWizard(topic){if(topic&&topics.includes(topic))state.topic=topic;state.step=topic?2:0;draw();$("wizard").showModal()}
function closeWizard(){$("wizard").close()}
$("start-wizard").onclick=()=>openWizard();
// Preview deep link supported for design testing only.
const previewStep=new URLSearchParams(location.search).get("show");
if(previewStep==="consultation"){openWizard();}
if(previewStep==="topics"){state.service="phone";state.duration=30;state.step=2;draw();$("wizard").showModal();}
if(previewStep==="review"||previewStep==="login"||previewStep==="payment"){
 state.service="phone";state.duration=30;state.topic="قراردادها و تعهدات";
 state.demoSignedIn=previewStep==="payment";
 state.step=previewStep==="login"?4:previewStep==="payment"?6:3;
 draw();$("wizard").showModal();
}
if(previewStep==="review"){state.service="phone";state.duration=30;state.topic="قراردادها و تعهدات";state.step=3;draw();$("wizard").showModal();}




$("close-wizard").onclick=closeWizard;
$("wizard").addEventListener("click",e=>{if(e.target===$("wizard"))closeWizard()});
$("wizard-back").onclick=()=>{
 if(state.step===4||state.step===6&&state.demoSignedIn)state.step=3;
 else if(state.step===6)state.step=5;
 else if(state.step===5)state.step=4;
 else if(state.step===7)state.step=6;
 else if(state.step===2&&state.service==="text")state.step=0;
 else state.step=Math.max(0,state.step-1);
 draw();
};
function choice(value,label,subtitle,selected,click){const b=node("button","wizard-choice"+(selected?" chosen":""),"");b.type="button";b.append(node("strong","",label));if(subtitle)b.append(node("small","",subtitle));b.setAttribute("aria-pressed",String(selected));b.onclick=click;return b}
function draw(){
 const body=$("wizard-body");body.replaceChildren();$("wizard-error").textContent="";
 const heading=["مشاوره را چطور می‌خواهید بگیرید؟","مشاوره تلفنی چند دقیقه باشد؟","موضوع مشاوره را انتخاب کنید","خلاصه درخواست"];
 const lead=["روش ارتباط با وکیل را انتخاب کنید.","مدت زمان موردنظر خود را انتخاب کنید.","موضوع نزدیک‌تر به مسئله خود را انتخاب کنید.","خلاصه انتخاب‌ها را بررسی کنید."];
 const postTitles={4:"شماره موبایل خود را وارد کنید",5:"کد تأیید را وارد کنید",6:"بررسی و پرداخت",7:"مسنجر گفتگوها"};
 const postLabels={4:"ورود با موبایل",5:"تأیید شماره موبایل",6:"پرداخت",7:"گفتگوهای من"};
 $("wizard-title").textContent=heading[state.step]||postTitles[state.step];
 $("wizard-lead").textContent=lead[state.step]||"";
 $("wizard").dataset.step=String(state.step);
 $("wizard-lead").hidden=state.step!==1;
 $("wizard-step-label").textContent=["نوع مشاوره","مدت مشاوره","موضوع حقوقی","شرح درخواست"][state.step]||postLabels[state.step];
 document.querySelectorAll(".wizard-progress span").forEach((x,i)=>{
 const sequence=state.service==="phone"?state.step:state.step===0?0:state.step-1;
 x.hidden=i>=(state.service==="phone"?4:3);
 x.classList.toggle("on",i<=sequence);
});
 $("wizard-back").disabled=state.step===0;
 const nextText={2:"تأیید و ادامه",3:"تأیید و ادامه",4:"دریافت کد تأیید",5:"تأیید و ادامه",6:"پرداخت آزمایشی",7:"پایان نمایش"};
 $("wizard-next").firstChild.textContent=nextText[state.step]||"ادامه ";
 $("wizard-next").lastChild.textContent=state.step>=2?"":"←";
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
 if(state.step===1){
  for(const minutes of phoneDurations){
    const selected=state.duration===minutes;
    const button=node("button","vv-duration-card"+(selected?" selected":"")+(minutes===30?" recommended":""),"");
    button.type="button";button.dataset.duration=String(minutes);button.setAttribute("aria-pressed",String(selected));
    if(minutes===30)button.append(node("span","vv-duration-badge","پیشنهاد ویزیت وکیل"));
    const prices={20:349000,30:449000,45:599000};
    const info=node("span","vv-duration-info","");
    info.append(node("small","vv-duration-price-label","قیمت پیشنهادی"));
    info.append(node("strong","vv-duration-price",prices[minutes].toLocaleString("fa-IR")+" تومان"));
    button.append(node("strong","vv-duration-name",new Intl.NumberFormat("fa-IR").format(minutes)+" دقیقه"),info);
    button.append(node("span","vv-duration-radio",selected?"✓":""));
    button.onclick=()=>{state.duration=minutes;draw()};body.append(button);
  }
  body.append(node("p","vv-duration-note","مبالغ نمونه و برای تصمیم‌گیری هستند؛ تعرفه نهایی هنوز تأیید نشده است."));
 }
 if(state.step===2){
  const summary=node("div","vv-topic-summary","");
  summary.append(node("span","vv-topic-pill",names[state.service]));
  if(state.service==="phone"&&phoneDurations.includes(state.duration))
    summary.append(node("span","vv-topic-pill",new Intl.NumberFormat("fa-IR").format(state.duration)+" دقیقه"));
  body.append(summary);
  const grid=node("div","vv-topic-grid","");
  for(const topic of legalTopics){
    const selected=state.topic===topic.name;
    const button=node("button","vv-topic-card"+(selected?" selected":""),"");
    button.type="button";button.setAttribute("aria-pressed",String(selected));button.dataset.topic=topic.id;
    const glyph=node("span","vv-topic-icon","");
    glyph.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+topic.icon+'</svg>';
    button.append(glyph,node("strong","vv-topic-title",topic.name),node("small","vv-topic-desc",topic.desc));
    button.onclick=()=>{state.topic=topic.name;draw()};
    grid.append(button);
  }
  body.append(grid);
}
 if(state.step===3){
  // Compact, readable summary; no duplicated selection controls on the final step.
  const summary=node("section","vv-request-summary","");
  summary.setAttribute("aria-label","خلاصه انتخاب‌های شما");
  const row=(label,value,important=false)=>{
    const line=node("div","vv-summary-line"+(important?" important":""),"");
    line.append(node("span","vv-summary-label",label),node("strong","vv-summary-value",value));return line;
  };
  summary.append(row("نوع مشاوره",names[state.service]));
  if(state.service==="phone"){
    const chosen=state.duration&&phoneDurations.includes(state.duration)?state.duration:30;
    summary.append(row("مدت مشاوره",new Intl.NumberFormat("fa-IR").format(chosen)+" دقیقه"));
  }
  summary.append(row("موضوع",state.topic||"انتخاب نشده"));
  if(state.service==="phone"){
    const previewPrices={20:349000,30:449000,45:599000};
    const price=previewPrices[state.duration];
    summary.append(row("مبلغ نمونه",price?new Intl.NumberFormat("fa-IR").format(price)+" تومان":"هنوز تعیین نشده",true));
  }else{
    summary.append(row("هزینه","در مرحله قیمت‌گذاری تعیین می‌شود",true));
  }
  body.append(summary);
  const field=node("label","vv-short-description","");
  field.append(node("span","vv-short-description-label","توضیح کوتاه مسئله"),node("small","","اختیاری"));
  const textarea=document.createElement("textarea");
  textarea.id="wizard-description";textarea.rows=2;textarea.maxLength=10000;
  textarea.placeholder="در صورت نیاز، مسئله‌تان را در چند کلمه توضیح دهید...";
  textarea.value=state.description;
  textarea.addEventListener("input",()=>state.description=textarea.value);
  field.append(textarea);body.append(field);
  body.append(node("p","vv-preview-disclaimer","پیش‌نمایش طراحی است؛ درخواست یا پرداختی ثبت نمی‌شود."));
 }
 if(state.step===4){
   const authBox=node("div","vv-auth-demo","");
   authBox.append(node("small","vv-demo-caption","وضعیت ورود برای آزمایش طراحی"));
   const toggle=node("div","vv-auth-toggle","");
   for(const [mode,label] of [[false,"کاربر جدید"],[true,"قبلاً وارد شده"]]){
     const button=node("button","vv-auth-option"+(state.demoSignedIn===mode?" selected":""),label);
     button.type="button";button.setAttribute("aria-pressed",String(state.demoSignedIn===mode));
     button.onclick=()=>{state.demoSignedIn=mode;if(mode){state.step=6;}draw();};
     toggle.append(button);
   }
   authBox.append(toggle);
   body.append(authBox);
   const label=node("label","vv-auth-field","");
   label.append(node("span","","شماره موبایل"));
   const input=document.createElement("input");input.id="vv-mobile";input.type="tel";input.inputMode="numeric";
   input.autocomplete="tel";input.dir="ltr";input.maxLength=11;input.placeholder="۰۹۱۲۳۴۵۶۷۸۹";
   input.value=state.mobile;input.addEventListener("input",()=>state.mobile=input.value);
   label.append(input);body.append(label);
   body.append(node("p","vv-auth-hint","کد تأیید به همین شماره پیامک می‌شود. (در این پیش‌نمایش هیچ پیامکی ارسال نمی‌شود.)"));
 }
 if(state.step===5){
   body.append(node("p","vv-auth-hint","کد شش‌رقمی ارسال‌شده به "+state.mobile+" را وارد کنید."));
   const label=node("label","vv-auth-field","");
   const input=document.createElement("input");input.id="vv-otp";input.type="text";input.inputMode="numeric";
   input.dir="ltr";input.maxLength=6;input.autocomplete="one-time-code";input.placeholder="••••••";
   input.value=state.otp;input.addEventListener("input",()=>state.otp=input.value);
   label.append(input);body.append(label);
   body.append(node("div","vv-demo-otp","کد نمایشی برای تست: ۱۲۳۴۵۶"));
 }
 if(state.step===6){
   const summary=node("section","vv-payment-summary","");
   summary.append(node("strong","","خلاصه مشاوره"));
   summary.append(node("p","",names[state.service]+" · "+state.topic+(state.service==="phone"?" · "+new Intl.NumberFormat("fa-IR").format(state.duration)+" دقیقه":"")));
   const previewPrices={20:349000,30:449000,45:599000};
   const price=state.service==="phone"?new Intl.NumberFormat("fa-IR").format(previewPrices[state.duration]||0)+" تومان":"تعرفه در دست بررسی";
   summary.append(node("div","vv-payment-price",price));
   body.append(summary);
   body.append(node("p","vv-auth-hint",state.demoSignedIn?"کاربر وارد شده است و مستقیم به این مرحله رسیده.":"شماره موبایل تأیید شد و اکنون مرحله پرداخت نمایش داده می‌شود."));
   body.append(node("p","vv-demo-warning","پرداخت کاملاً نمایشی است؛ هیچ تراکنشی انجام نخواهد شد."));
 }
 if(state.step===7){
   const messages=node("section","vv-messenger-mock","");
   messages.append(node("div","vv-messenger-icon","✓"),node("strong","","پرداخت نمایشی موفق بود"),node("p","","گفتگوهای مشاوره در این بخش نمایش داده می‌شوند."));
   messages.append(node("div","vv-messenger-row","مشاوره "+state.topic+" — در انتظار پذیرش وکیل"));
   body.append(messages);
   body.append(node("p","vv-auth-hint","این صفحه فقط نمایش روند است؛ درخواست یا گفتگوی واقعی ایجاد نشده است."));
 }
}
$("wizard-next").onclick=()=>{
 if(state.step===0){state.step=state.service==="phone"?1:2;draw();return}
 if(state.step===1){if(!phoneDurations.includes(state.duration)){$("wizard-error").textContent="مدت تماس را انتخاب کنید.";return}state.step=2;draw();return}
 if(state.step===2){if(!state.topic){$("wizard-error").textContent="موضوع حقوقی را انتخاب کنید.";return}state.step=3;draw();return}
 if(state.step===3){
   state.description=$("wizard-description")?.value.trim()||"";
   state.step=state.demoSignedIn?6:4;draw();return;
 }
 if(state.step===4){
   const clean=state.mobile.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
   if(!/^09\d{9}$/.test(clean)){$("wizard-error").textContent="شماره موبایل ۱۱ رقمی معتبر وارد کنید.";return;}
   state.mobile=clean;state.step=5;draw();return;
 }
 if(state.step===5){
   const clean=state.otp.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
   if(clean!=="123456"){$("wizard-error").textContent="برای تست، کد نمایشی ۱۲۳۴۵۶ را وارد کنید.";return;}
   state.demoSignedIn=true;state.step=6;draw();return;
 }
 if(state.step===6){state.paymentDone=true;state.step=7;draw();return;}
 if(state.step===7){closeWizard();return;}
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
  if(span.dataset.cmsManaged === 'true')return;
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
