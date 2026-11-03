"use strict";
const input=document.getElementById("qa-search"),cards=[...document.querySelectorAll("#qa-list .qa-card")],filters=[...document.querySelectorAll("#qa-filters .filter")],empty=document.getElementById("qa-empty");
let selected="all";const normalize=v=>v.trim().replace(/ي/g,"ی").replace(/ك/g,"ک").toLocaleLowerCase("fa");
function render(){const q=normalize(input.value);let visible=0;cards.forEach(c=>{const matchCategory=selected==="all"||c.dataset.topic===selected;const matchText=!q||normalize(c.textContent).includes(q);const yes=matchCategory&&matchText;c.hidden=!yes;if(yes)visible++;});empty.hidden=visible>0;}
filters.forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.filter;filters.forEach(x=>{const yes=x===b;x.classList.toggle("active",yes);x.setAttribute("aria-pressed",String(yes));});render();}));
input.addEventListener("input",render);
