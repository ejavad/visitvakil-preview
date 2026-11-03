"use strict";
(function(){
  if(document.getElementById("site-links")) return; // Homepage owns the exact same drawer.
  const host=document.querySelector(".site-header, .top, .admin-top, .wrap");
  if(!host) return;
  const oldContactMenu=document.querySelector(".menu-wrap");
  if(oldContactMenu) oldContactMenu.hidden=true;
  if(host.classList.contains("wrap")) host.classList.add("vv-shared-showcase");
  host.classList.add("vv-shared-host");
  const trigger=document.createElement("button");
  trigger.type="button";trigger.className="vv-shared-trigger";
  trigger.setAttribute("aria-label","باز کردن فهرست");
  trigger.setAttribute("aria-controls","vv-global-drawer");
  trigger.setAttribute("aria-expanded","false");
  trigger.innerHTML='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  host.append(trigger);
  const scrim=document.createElement("div");
  scrim.className="vv-shared-scrim";scrim.hidden=true;
  const drawer=document.createElement("nav");
  drawer.id="vv-global-drawer";drawer.className="vv-shared-drawer";drawer.hidden=true;
  drawer.setAttribute("aria-label","فهرست خدمات ویزیت وکیل");
  drawer.setAttribute("tabindex","-1");
  drawer.innerHTML=`
  <div class="vv-s-head">
    <a href="./home-v2.html" class="vv-s-brand"><img src="./assets/visitvakil-logo-yellow.svg" alt="" width="48" height="48"><span><strong>ویزیت وکیل</strong><small>مشاوره حقوقی آنلاین</small></span></a>
    <button class="vv-s-close" type="button" aria-label="بستن فهرست">×</button>
  </div>
  <div class="vv-s-body">
    <p class="vv-s-label">چطور می‌توانیم کمک کنیم؟</p>
    <a class="vv-s-main" href="./home-v2.html"><span class="vv-s-icon">✳</span><span><strong>مشاوره حقوقی</strong><small>متنی و تلفنی، با وکیل</small></span><span class="vv-s-chevron">‹</span></a>
    <a class="vv-s-main vv-s-secondary" href="./questions.html"><span class="vv-s-icon">؟</span><span><strong>پرسش‌های حقوقی</strong><small>راهنمایی‌ها و پاسخ‌های حقوقی</small></span><span class="vv-s-chevron">‹</span></a>
    <details class="vv-s-expand"><summary><span class="vv-s-icon">≡</span><strong>راهنمای خدمات حقوقی</strong><span>+</span></summary><div><a href="https://visitvakil.ir/online-lawyer/">مشاوره آنلاین با وکیل</a><a href="https://visitvakil.ir/legal-topics/">موضوعات و راهنماهای حقوقی</a></div></details>
    <details class="vv-s-expand"><summary><span class="vv-s-icon">▤</span><strong>موضوعات حقوقی</strong><span>+</span></summary><div><a href="https://visitvakil.ir/legal-topics/">ملکی و ثبتی، خانواده، کیفری و سایر موضوعات</a></div></details>
    <p class="vv-s-label vv-s-label-gap">ویزیت وکیل</p>
    <div class="vv-s-grid">
      <a href="./about-us.html">درباره ما</a>
      <a href="./contact-us.html">تماس با ما</a>
      <a href="https://visitvakil.ir/">همکاری وکلا</a>
      <a href="./lawyers.html">لیست وکلا</a>
      <a href="https://visitvakil.ir/">حریم خصوصی</a>
      <a href="https://visitvakil.ir/">قوانین استفاده</a>
    </div>
  </div>
  <div class="vv-s-bottom"><a href="https://visitvakil.liara.run/login.html">ورود / ثبت‌نام <span>←</span></a><small>پیش‌نمایش رابط کاربری ویزیت وکیل</small></div>`;
  document.body.append(scrim,drawer);
  const closeButton=drawer.querySelector(".vv-s-close");
  let lastFocus=null;
  function toggle(open){
    if(open)lastFocus=document.activeElement;
    drawer.hidden=!open;scrim.hidden=!open;document.body.classList.toggle("vv-shared-open",open);
    trigger.setAttribute("aria-expanded",String(open));
    if(open)closeButton.focus();else if(lastFocus&&typeof lastFocus.focus==="function"){lastFocus.focus();lastFocus=null;}
  }
  trigger.addEventListener("click",()=>toggle(drawer.hidden));
  closeButton.addEventListener("click",()=>toggle(false));
  scrim.addEventListener("click",()=>toggle(false));
  drawer.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>toggle(false)));
  document.addEventListener("keydown",e=>{
    if(drawer.hidden)return;
    if(e.key==="Escape"){toggle(false);return;}
    if(e.key==="Tab"){
      const focusable=[...drawer.querySelectorAll('a[href],button:not([disabled]),summary')].filter(x=>x.getClientRects().length);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
})();
