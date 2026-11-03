"use strict";
const form=document.getElementById("contact-form");
const dialog=document.getElementById("contact-result");
const output=document.getElementById("result-content");
document.getElementById("close-result").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
form.addEventListener("submit",e=>{
 e.preventDefault();
 const name=form.elements.name.value.trim();
 const phone=form.elements.phone.value.trim().replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
 const message=form.elements.message.value.trim();
 output.replaceChildren();
 if(name.length<2||!/^09[0-9]{9}$/.test(phone)||message.length<5){
   const msg=document.createElement("p");msg.textContent="لطفاً نام، شماره موبایل معتبر و پیام خود را کامل وارد کنید.";output.append(msg);dialog.showModal();return;
 }
 const draft="نام: "+name+"\nشماره تماس: "+phone+"\nپیام: "+message;
 const note=document.createElement("p");note.textContent="پیام شما هنوز ارسال نشده است. در این پیش‌نمایش، متن را کپی کنید و از طریق مسنجر پشتیبانی ارسال کنید.";
 const copy=document.createElement("button");copy.className="action";copy.type="button";copy.textContent="کپی متن پیام";
 copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(draft);copy.textContent="متن کپی شد"}catch{const box=document.createElement("textarea");box.value=draft;box.readOnly=true;output.append(box);box.focus();box.select();copy.textContent="متن را از کادر کپی کنید";}});
 const link=document.createElement("a");link.className="action";link.href="./index.html";link.textContent="ورود به مسنجر پشتیبانی ←";
 output.append(note,copy,link);dialog.showModal();
});
