"use strict";
const menuButton=document.getElementById("menu-button");
const menu=document.getElementById("main-menu");
function setMenu(open){menu.hidden=!open;menuButton.setAttribute("aria-expanded",String(open))}
menuButton.addEventListener("click",()=>setMenu(menu.hidden));
document.addEventListener("click",event=>{if(!menu.hidden&&!menu.contains(event.target)&&!menuButton.contains(event.target))setMenu(false)});
document.addEventListener("keydown",event=>{if(event.key==="Escape")setMenu(false)});
const form=document.getElementById("contact-form");
form.addEventListener("submit",event=>{
 event.preventDefault();
 const name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim(),message=form.elements.message.value.trim();
 const status=document.getElementById("form-status");
 status.hidden=false;
 const ascii=phone.replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
 if(name.length<2||message.length<5||!/^09[0-9]{9}$/.test(ascii)){
   status.textContent="لطفاً نام، شماره موبایل ایران و متن پیام را کامل وارد کنید.";return;
 }
 const draft="نام: "+name+"\nشماره تماس: "+ascii+"\nپیام: "+message;
 status.replaceChildren();
 const text=document.createElement("p");text.textContent="پیام شما هنوز ارسال نشده است. برای ادامه، وارد مسنجر و بخش پشتیبانی شوید و متن را در آنجا ارسال کنید.";
 const copy=document.createElement("button");copy.type="button";copy.className="submit-button";copy.style.width="100%";copy.textContent="کپی متن پیام";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(draft);copy.textContent="متن کپی شد"}catch(_){copy.textContent="متن را از کادر زیر کپی کنید";const pre=document.createElement("textarea");pre.value=draft;pre.readOnly=true;status.append(pre)}});
 const link=document.createElement("a");link.href="./index.html";link.className="support-link";link.textContent="ورود به مسنجر و پشتیبانی ←";
 status.append(text,copy,link);
});