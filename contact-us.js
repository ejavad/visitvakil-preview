"use strict";
const tabs=[...document.querySelectorAll(".tab")];
function chooseTab(id){
 tabs.forEach(tab=>{const active=tab.id===id;tab.classList.toggle("active",active);tab.setAttribute("aria-selected",String(active));document.getElementById(tab.getAttribute("aria-controls")).hidden=!active;});
}
tabs.forEach((tab,i)=>{tab.addEventListener("click",()=>chooseTab(tab.id));tab.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();const next=tabs[(i+(e.key==="ArrowLeft"?1:tabs.length-1))%tabs.length];chooseTab(next.id);next.focus();}})});
const form=document.getElementById("contact-form");
const status=document.getElementById("form-status");
const statusBody=document.getElementById("status-body");
document.getElementById("close-status").addEventListener("click",()=>status.hidden=true);
form.addEventListener("submit",event=>{
 event.preventDefault();
 const name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim(),message=form.elements.message.value.trim();
 const ascii=phone.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
 status.hidden=false;statusBody.replaceChildren();
 if(name.length<2||message.length<5||!/^09[0-9]{9}$/.test(ascii)){statusBody.textContent="نام، شماره موبایل ایران و متن پیام را کامل وارد کنید.";return;}
 const draft="نام: "+name+"\nشماره تماس: "+ascii+"\nپیام: "+message;
 const text=document.createElement("p");text.textContent="پیام هنوز ارسال نشده است. متن را کپی کنید و در مسنجر پشتیبانی بفرستید.";
 const copy=document.createElement("button");copy.type="button";copy.className="submit-button";copy.textContent="کپی متن پیام";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(draft);copy.textContent="متن کپی شد"}catch(_){copy.textContent="متن را از کادر زیر کپی کنید";const pre=document.createElement("textarea");pre.value=draft;pre.readOnly=true;statusBody.append(pre)}});
 const link=document.createElement("a");link.href="./index.html";link.className="support-link";link.textContent="ورود به مسنجر پشتیبانی ←";
 statusBody.append(text,copy,link);
});
