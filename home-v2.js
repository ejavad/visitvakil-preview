"use strict";
const $=id=>document.getElementById(id);
// Consultation preview UI uses English consistently; core service IDs are unchanged.
const state={step:0,service:"text",duration:null,topic:"",description:"",demoSignedIn:false,mobile:"",otp:"",paymentDone:false};
const phoneDurations=[20,30,45];
const names={text:"Online Consultation",phone:"Phone Consultation"};
const legalTopics=[
 {id:"family",name:"Family",desc:"Divorce, support & custody",icon:'<circle cx="11" cy="10" r="4"/><circle cx="25" cy="10" r="4"/><path d="M3 29v-4c0-5 3-8 8-8s8 3 8 8v4M20 17c5 0 9 3 9 8v4"/>'},
 {id:"property",name:"Property & Real Estate",desc:"Sales, deeds, rentals & eviction",icon:'<path d="m4 16 12-10 12 10v13H4V16Z"/><path d="M12 29V19h8v10M2 17l14-12 14 12"/>'},
 {id:"crime",name:"Criminal Law",desc:"Fraud, threats & complaints",icon:'<path d="M16 5v25M8 9h16M8 9l-5 9h10L8 9ZM24 9l-5 9h10l-5-9ZM11 30h10"/>'},
 {id:"contracts",name:"Contracts & Obligations",desc:"Agreements, checks & guarantees",icon:'<path d="M7 3h13l7 7v19H7zM20 3v8h7M12 17h10M12 22h10M12 27h7"/>'},
 {id:"business",name:"Business & Companies",desc:"Company and business affairs",icon:'<path d="M4 29V10h13v19M17 15h11v14M8 15h4M8 20h4M8 25h4M21 20h3M21 25h3M2 29h28"/>'},
 {id:"other",name:"Other Legal Matters",desc:"Other legal issues",icon:'<rect x="4" y="4" width="8" height="8" rx="1"/><rect x="20" y="4" width="8" height="8" rx="1"/><rect x="4" y="20" width="8" height="8" rx="1"/><path d="M24 19v10M19 24h10"/>'}
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
 state.service="phone";state.duration=30;state.topic="Contracts & Obligations";
 state.demoSignedIn=previewStep==="payment";
 state.step=previewStep==="login"?4:previewStep==="payment"?6:3;
 draw();$("wizard").showModal();
}
if(previewStep==="review"){state.service="phone";state.duration=30;state.topic="Contracts & Obligations";state.step=3;draw();$("wizard").showModal();}




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
 const heading=["How would you like to consult?","How many minutes do you need?","Choose your legal topic","Request Summary"];
 const lead=["Choose how to connect with a lawyer.","Choose your preferred call duration.","Choose the topic closest to your case.","Review your choices."];
 const postTitles={4:"Enter your mobile number",5:"Enter your verification code",6:"Review & Payment",7:"Your Conversations"};
 const postLabels={4:"Mobile Sign-in",5:"Verify Mobile",6:"Payment",7:"My Conversations"};
 $("wizard-title").textContent=heading[state.step]||postTitles[state.step];
 $("wizard").dir="ltr";
 $("wizard").lang="en";
 $("wizard-back").textContent="Back";
 $("close-wizard").setAttribute("aria-label","Close");
 $("wizard-lead").textContent=lead[state.step]||"";
 $("wizard").dataset.step=String(state.step);
 $("wizard-lead").hidden=state.step!==1;
 $("wizard-step-label").textContent=["Consultation Type","Call Duration","Legal Topic","Request Details"][state.step]||postLabels[state.step];
 document.querySelectorAll(".wizard-progress span").forEach((x,i)=>{
 const sequence=state.service==="phone"?state.step:state.step===0?0:state.step-1;
 x.hidden=i>=(state.service==="phone"?4:3);
 x.classList.toggle("on",i<=sequence);
});
 $("wizard-back").disabled=state.step===0;
 const nextText={2:"Confirm & Continue",3:"Confirm & Continue",4:"Get Verification Code",5:"Confirm & Continue",6:"Demo Payment",7:"Finish Demo"};
 $("wizard-next").firstChild.textContent=nextText[state.step]||"Continue ";
 $("wizard-next").lastChild.textContent=state.step>=2?"":"←";
 if(state.step===0){
  const cards=[
   {id:"phone",name:"Phone Consultation",desc:"Private call with a lawyer",kind:"Voice Call",symbol:'<path d="M9.1 5.8c-.7-.9-2.1-1.1-3-.3L4.3 7.1c-.8.7-1.1 1.8-.7 2.8 3.2 8.1 9.8 14.6 17.9 17.4 1 .3 2.1 0 2.7-.8l1.6-1.9c.8-.9.6-2.3-.3-3l-3.5-2.6c-.9-.7-2.1-.6-2.9.2l-1.8 1.8a20 20 0 0 1-7.2-7.2l1.8-1.8c.8-.8.9-2 .2-2.9L9.1 5.8Z" transform="translate(0 1) scale(.91)"/><path d="M19 5.4a7.6 7.6 0 0 1 7.6 7.6M19 9.3a3.7 3.7 0 0 1 3.7 3.7"/>'},
   {id:"text",name:"Online Consultation",desc:"Chat with a lawyer in Messenger",kind:"Online Chat",symbol:'<rect x="3.5" y="5" width="25" height="19" rx="4"/><path d="M10 11h12M10 16h8M10 24l-5 5v-5"/>'}
  ];
  for(const item of cards){
    const selected=state.service===item.id;
    const button=node("button","vv-consult-card"+(item.id==="phone"?" recommended":"")+(selected?" selected":""),"");
    button.type="button";button.dataset.service=item.id;button.setAttribute("aria-pressed",String(selected));
    const icon=document.createElement("span");icon.className="vv-consult-illustration";icon.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+item.symbol+'</svg>';
    const copy=node("span","vv-consult-copy","");
    copy.append(node("strong","",item.name),node("small","",item.desc),node("em","",item.kind));
    const check=node("span","vv-consult-check",selected?"✓":"");check.setAttribute("aria-hidden","true");
    if(item.id==="phone"){const badge=node("span","vv-recommend-badge","VisitVakil Recommends");button.append(badge);}
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
    if(minutes===30)button.append(node("span","vv-duration-badge","VisitVakil Recommends"));
    const prices={20:349000,30:449000,45:599000};
    const info=node("span","vv-duration-info","");
    info.append(node("small","vv-duration-price-label","Sample Price"));
    info.append(node("strong","vv-duration-price",prices[minutes].toLocaleString("en-US")+" Toman"));
    button.append(node("strong","vv-duration-name",new Intl.NumberFormat("en-US").format(minutes)+" min"),info);
    button.append(node("span","vv-duration-radio",selected?"✓":""));
    button.onclick=()=>{state.duration=minutes;draw()};body.append(button);
  }
  body.append(node("p","vv-duration-note","Sample prices for design only. Final rates are not approved."));
 }
 if(state.step===2){
  const summary=node("div","vv-topic-summary","");
  summary.append(node("span","vv-topic-pill",names[state.service]));
  if(state.service==="phone"&&phoneDurations.includes(state.duration))
    summary.append(node("span","vv-topic-pill",new Intl.NumberFormat("en-US").format(state.duration)+" min"));
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
  summary.setAttribute("aria-label","Your Selection Summary");
  const row=(label,value,important=false)=>{
    const line=node("div","vv-summary-line"+(important?" important":""),"");
    line.append(node("span","vv-summary-label",label),node("strong","vv-summary-value",value));return line;
  };
  summary.append(row("Consultation Type",names[state.service]));
  if(state.service==="phone"){
    const chosen=state.duration&&phoneDurations.includes(state.duration)?state.duration:30;
    summary.append(row("Call Duration",new Intl.NumberFormat("en-US").format(chosen)+" min"));
  }
  summary.append(row("Topic",state.topic||"Not selected"));
  if(state.service==="phone"){
    const previewPrices={20:349000,30:449000,45:599000};
    const price=previewPrices[state.duration];
    summary.append(row("Sample Amount",price?new Intl.NumberFormat("en-US").format(price)+" Toman":"Not set",true));
  }else{
    summary.append(row("Price","To be confirmed",true));
  }
  body.append(summary);
  const field=node("label","vv-short-description","");
  field.append(node("span","vv-short-description-label","Briefly describe your issue"),node("small","","Optional"));
  const textarea=document.createElement("textarea");
  textarea.id="wizard-description";textarea.rows=2;textarea.maxLength=10000;
  textarea.placeholder="Briefly describe your issue (optional)...";
  textarea.value=state.description;
  textarea.addEventListener("input",()=>state.description=textarea.value);
  field.append(textarea);body.append(field);
  body.append(node("p","vv-preview-disclaimer","Design preview only — no request or payment is processed."));
 }
 if(state.step===4){
   const authBox=node("div","vv-auth-demo","");
   authBox.append(node("small","vv-demo-caption","Sign-in status (demo)"));
   const toggle=node("div","vv-auth-toggle","");
   for(const [mode,label] of [[false,"New user"],[true,"Already signed in"]]){
     const button=node("button","vv-auth-option"+(state.demoSignedIn===mode?" selected":""),label);
     button.type="button";button.setAttribute("aria-pressed",String(state.demoSignedIn===mode));
     button.onclick=()=>{state.demoSignedIn=mode;if(mode){state.step=6;}draw();};
     toggle.append(button);
   }
   authBox.append(toggle);
   body.append(authBox);
   const label=node("label","vv-auth-field","");
   label.append(node("span","","Mobile number"));
   const input=document.createElement("input");input.id="vv-mobile";input.type="tel";input.inputMode="numeric";
   input.autocomplete="tel";input.dir="ltr";input.maxLength=11;input.placeholder="09123456789";
   input.value=state.mobile;input.addEventListener("input",()=>state.mobile=input.value);
   label.append(input);body.append(label);
   body.append(node("p","vv-auth-hint","A verification code would be sent to this number. No SMS is sent in this demo."));
 }
 if(state.step===5){
   const caption=node("p","vv-otp-intro","");
   caption.append("Your 6-digit code for ");
   const number=node("b","vv-otp-phone",state.mobile);
   number.dir="ltr";caption.append(number," is ready to enter.");
   body.append(caption);
   const edit=node("button","vv-otp-edit","Edit number");edit.type="button";
   edit.onclick=()=>{state.otp="";state.step=4;draw()};body.append(edit);
   const form=node("div","vv-otp-control","");
   const cells=node("div","vv-otp-cells","");
   for(let i=0;i<6;i++){
     const cell=node("span","vv-otp-cell","");
     cell.setAttribute("aria-hidden","true");
     cells.append(cell);
   }
   const input=document.createElement("input");
   input.id="vv-otp";input.type="text";input.inputMode="numeric";input.autocomplete="one-time-code";
   input.maxLength=6;input.dir="ltr";input.setAttribute("aria-label","6-digit verification code");
   const normalize=value=>value.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/[^0-9]/g,"").slice(0,6);
   input.value=normalize(state.otp);
   const update=()=>{
     const digits=normalize(input.value);input.value=digits;state.otp=digits;
     [...cells.children].forEach((cell,i)=>{
       cell.textContent=digits[i]||"";
       cell.classList.toggle("filled",i<digits.length);
       cell.classList.toggle("active",i===Math.min(digits.length,5));
     });
   };
   input.addEventListener("input",update);
   input.addEventListener("focus",()=>form.classList.add("focused"));
   input.addEventListener("blur",()=>form.classList.remove("focused"));
   form.onclick=()=>input.focus();
   form.append(cells,input);body.append(form);update();
   const resend=node("button","vv-otp-resend","Resend code (demo)");
   resend.type="button";resend.onclick=()=>{
     state.otp="";input.value="";update();input.focus();
     $("wizard-error").textContent="No SMS is sent in demo. Test code: 123456.";
   };
   body.append(resend);
   body.append(node("div","vv-demo-otp","Test code: 123456 — No real SMS."));
 }
 if(state.step===6){
   const summary=node("section","vv-payment-summary","");
   summary.append(node("strong","","Consultation Summary"));
   summary.append(node("p","",names[state.service]+" · "+state.topic+(state.service==="phone"?" · "+new Intl.NumberFormat("en-US").format(state.duration)+" min":"")));
   const previewPrices={20:349000,30:449000,45:599000};
   const price=state.service==="phone"?new Intl.NumberFormat("en-US").format(previewPrices[state.duration]||0)+" Toman":"Price pending";
   summary.append(node("div","vv-payment-price",price));
   body.append(summary);
   body.append(node("p","vv-auth-hint",state.demoSignedIn?"You're signed in and went directly to payment.":"Mobile verified. You can now proceed to payment."));
   body.append(node("p","vv-demo-warning","Demo payment only. No transaction takes place."));
 }
 if(state.step===7){
   const messages=node("section","vv-messenger-mock","");
   messages.append(node("div","vv-messenger-icon","✓"),node("strong","","Demo Payment Complete"),node("p","","Your consultation conversations appear here."));
   messages.append(node("div","vv-messenger-row","Consultation: "+state.topic+" — waiting for a lawyer"));
   body.append(messages);
   body.append(node("p","vv-auth-hint","Demo only. No real request or chat was created."));
 }
}
$("wizard-next").onclick=()=>{
 if(state.step===0){state.step=state.service==="phone"?1:2;draw();return}
 if(state.step===1){if(!phoneDurations.includes(state.duration)){$("wizard-error").textContent="Choose a call duration.";return}state.step=2;draw();return}
 if(state.step===2){if(!state.topic){$("wizard-error").textContent="Choose a legal topic.";return}state.step=3;draw();return}
 if(state.step===3){
   state.description=$("wizard-description")?.value.trim()||"";
   state.step=state.demoSignedIn?6:4;draw();return;
 }
 if(state.step===4){
   const clean=state.mobile.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
   if(!/^09\d{9}$/.test(clean)){$("wizard-error").textContent="Enter a valid 11-digit mobile number.";return;}
   state.mobile=clean;state.step=5;draw();return;
 }
 if(state.step===5){
   const clean=state.otp.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
   if(clean!=="123456"){$("wizard-error").textContent="For this demo, enter 123456.";return;}
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
 const phrases=["Start with the right decision","Make the right choice","Start on the right path"];
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
