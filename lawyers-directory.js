"use strict";
const input=document.getElementById("lawyer-search"),cards=[...document.querySelectorAll("#lawyer-cards .lawyer-card")],empty=document.getElementById("lawyer-empty"),filters=[...document.querySelectorAll("#lawyer-filters .filter")],feedback=document.getElementById("lawyer-feedback");
let selected="all";
function normalize(v){return v.trim().replace(/[ي]/g,"ی").replace(/[ك]/g,"ک").toLocaleLowerCase("fa");}
function render(){let visible=0;const query=normalize(input.value);cards.forEach(card=>{const text=normalize(card.dataset.tags+" "+card.textContent);const show=(selected==="all"||text.includes(normalize(selected)))&&(!query||text.includes(query));card.hidden=!show;if(show)visible++;});empty.hidden=visible>0;}
filters.forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.filter;filters.forEach(x=>{let yes=x===b;x.classList.toggle("active",yes);x.setAttribute("aria-pressed",String(yes))});render()}));
input.addEventListener("input",render);
document.querySelectorAll(".demo-profile").forEach(button=>button.addEventListener("click",()=>{feedback.textContent="این کارت فقط نمونه طراحی است. پس از اتصال اطلاعات تأییدشده وکلای واقعی، صفحه اختصاصی هر وکیل از همین‌جا باز می‌شود.";feedback.scrollIntoView({block:"nearest",behavior:"smooth"})}));
