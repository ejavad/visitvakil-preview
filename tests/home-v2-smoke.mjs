import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:8765/home-v2.html",{waitUntil:"load"});
 if(await page.locator(".service-options").count())throw Error("SERVICE_CARDS_SHOULD_NOT_APPEAR_ON_HOME");
 if(await page.locator(".topic-grid").count())throw Error("TOPIC_CARDS_SHOULD_NOT_APPEAR_ON_HOME");
 if(await page.locator("#wizard").evaluate(x=>x.open))throw Error("WIZARD_VISIBLE_BEFORE_CLICK");
 if(!(await page.locator("h1").innerText()).includes("آغاز یک تصمیم درست"))throw Error("HERO_MISSING");
 if(await page.locator("#site-links").isVisible())throw Error("MENU_SHOULD_BE_CLOSED");
 await page.locator("#site-menu").click();
 if(!await page.locator("#site-links").isVisible())throw Error("DRAWER_NOT_OPEN");
 if(!await page.locator("#menu-scrim").isVisible())throw Error("DRAWER_BACKDROP_NOT_OPEN");
 if(!await page.locator(".vv-drawer-brand img").evaluate(el=>el.complete&&el.naturalWidth>0))throw Error("DRAWER_BRAND_LOGO_FAILED");
 await page.locator(".vv-nav-expand").first().locator("summary").click();
 if(!await page.locator(".vv-nav-expand").first().evaluate(el=>el.open))throw Error("NAV_SUBMENU_NOT_OPEN");
 await page.keyboard.press("Escape");
 if(await page.locator("#site-links").isVisible())throw Error("DRAWER_ESC_FAILED");
 await page.locator("#site-menu").click();
 await page.locator("#menu-consult").click();
 if(await page.locator("#site-links").isVisible())throw Error("DRAWER_STILL_OPEN_AFTER_CONSULT");
 if(!await page.locator("#wizard").evaluate(el=>el.open))throw Error("DRAWER_CONSULT_WIZARD_NOT_OPEN");
 await page.locator("#close-wizard").click();
 await page.locator("#site-menu").click();
 await page.locator("#menu-close").click();
 if(await page.locator("#site-links").isVisible())throw Error("DRAWER_CLOSE_FAILED");
 for(const selector of [".approved-lawyers img",".approved-badges img"]){
   const image=page.locator(selector);
   if(!(await image.evaluate(el=>el.complete&&el.naturalWidth>0)))throw Error("IMAGE_MISSING:"+selector);
 }
 const portrait=await page.locator(".approved-lawyers img").evaluate(el=>({src:el.currentSrc,width:el.naturalWidth,height:el.naturalHeight}));
 if(!portrait.src.includes("approved-lawyers-original.webp")||portrait.width!==832||portrait.height!==201)throw Error("HQ_WEBP_NOT_LOADED:"+JSON.stringify(portrait));
 if(!(await page.locator(".approved-cta").evaluate(el=>getComputedStyle(el).backgroundColor)))throw Error("CTA_MISSING");
 const logo=await page.locator(".approved-logo img").evaluate(el=>({loaded:el.complete&&el.naturalWidth>0,src:el.currentSrc}));
 if(!logo.loaded||!logo.src.includes("visitvakil-logo-yellow.svg"))throw Error("NEW_LOGO_NOT_LOADED");
 if((await page.locator(".approved-cta").innerText()).includes("←"))throw Error("UNWANTED_ARROW");
 await page.locator("#start-wizard").click();
 if(!await page.locator("#wizard").evaluate(x=>x.open))throw Error("WIZARD_NOT_OPEN");
 const modalLogo=await page.locator("#wizard .brandmark img").evaluate(el=>({loaded:el.complete&&el.naturalWidth>0,src:el.currentSrc}));
 if(!modalLogo.loaded||!modalLogo.src.includes("visitvakil-logo-yellow.svg"))throw Error("WIZARD_BRAND_LOGO_NOT_UNIFIED");

 const recommended=page.locator("#wizard-body .vv-consult-card.recommended");
 if(!await recommended.isVisible())throw Error("RECOMMENDED_PHONE_CARD_MISSING");
 if(!await recommended.getByText("پیشنهاد ویزیت وکیل").isVisible())throw Error("RECOMMENDATION_BADGE_MISSING");
 if(!await recommended.locator("svg").count())throw Error("PHONE_ICON_MISSING");
 await recommended.click();
 await page.locator("#wizard-next").click();
 const durationCards=page.locator("#wizard-body .vv-duration-card");
 if(await durationCards.count()!==3)throw Error("PHONE_DURATION_CARDS_MISSING");
 const thirty=page.locator("#wizard-body .vv-duration-card[data-duration=\"30\"]");
 if(!await thirty.isVisible())throw Error("RECOMMENDED_30_MIN_MISSING");
 for(const price of ["۳۴۹٬۰۰۰","۴۴۹٬۰۰۰","۵۹۹٬۰۰۰"]){
   if(!(await page.locator("#wizard-body").innerText()).includes(price))throw Error("PREVIEW_PRICE_MISSING:"+price);
 }
 await thirty.click();
 await page.locator("#wizard-next").click();
 const topicCards=page.locator("#wizard-body .vv-topic-card");
 if(await topicCards.count()!==6)throw Error("TOPIC_GRID_MUST_HAVE_6_CARDS");
 const gridColumns=await page.locator(".vv-topic-grid").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
 if(gridColumns!==2)throw Error("TOPIC_GRID_MUST_HAVE_2_COLUMNS:"+gridColumns);
 const propertyCard=topicCards.filter({hasText:"ملکی و املاک"});
 await propertyCard.click();
 if(await propertyCard.getAttribute("aria-pressed")!=="true")throw Error("TOPIC_SELECTION_NOT_APPLIED");
 if(!(await page.locator("#wizard-next").innerText()).includes("تأیید و ادامه"))throw Error("TOPIC_NEXT_LABEL_MISSING");
 await page.locator("#wizard-next").click();
 await page.locator("#wizard-description").fill("درخواست بررسی اختلاف قرارداد ملکی در منطقه");
 await page.locator("#wizard-next").click();
 await page.getByText("پیش‌نمایش تکمیل شد").waitFor();
 if(!await page.getByRole("link",{name:/مشاهده مسنجر کاربر/}).isVisible())throw Error("MESSENGER_LINK_MISSING");
 await page.locator("#close-wizard").click();
 if(await page.locator("#wizard").evaluate(x=>x.open))throw Error("CLOSE_FAILED");
 const aligned=await page.evaluate(()=>{
 const badge=document.querySelector(".approved-badges img").getBoundingClientRect();
 const phone=document.querySelector(".approved-phone").getBoundingClientRect();
 const digits=document.querySelector(".approved-phone span").getBoundingClientRect();
 const icon=document.querySelector(".approved-phone svg").getBoundingClientRect();
 return {badgeWidth:badge.width,phoneWidth:phone.width,centerDelta:Math.abs(badge.x+badge.width/2-phone.x-phone.width/2),contentsFit:digits.right<=phone.right+0.5&&icon.left>=phone.left-0.5};
 });
 if(Math.abs(aligned.badgeWidth-aligned.phoneWidth)>1||aligned.centerDelta>1||!aligned.contentsFit)throw Error("FOOTER_PHONE_NOT_ALIGNED:"+JSON.stringify(aligned));
 const more=page.locator("#about-toggle");
 if(await more.evaluate(el=>el.open))throw Error("PLUS_SHOULD_START_CLOSED");
 await more.locator("summary").click();
 if(!await more.evaluate(el=>el.open))throw Error("PLUS_DID_NOT_OPEN");
 const guide=page.locator("#legal-guide");
 if(!await guide.getByRole("heading",{name:"مشاوره وکیل؛ راهنمای مشاوره حقوقی آنلاین و تلفنی"}).isVisible())throw Error("LEGAL_GUIDE_HEADING_MISSING");
 if(await guide.locator(".approved-unverified-copy").count())throw Error("OLD_PLACEHOLDER_COPY_PRESENT");
 if(await guide.locator("h3").count()!==4)throw Error("LEGAL_GUIDE_SECTIONS_MISSING");
 if(await guide.locator(".approved-guide-links a").count()!==3)throw Error("LEGAL_GUIDE_LINKS_MISSING");

 const footerAfter=await page.evaluate(()=>{
  const copy=document.querySelector(".approved-expanded-copy").getBoundingClientRect();
  const footer=document.querySelector(".approved-footer").getBoundingClientRect();
  return footer.top>=copy.bottom-1;
 });
 if(!footerAfter)throw Error("FOOTER_MUST_FOLLOW_EXPANDED_TEXT");
 await more.locator("summary").click();
 if(await more.evaluate(el=>el.open))throw Error("PLUS_DID_NOT_CLOSE");
 if(await page.locator(".approved-divider").count())throw Error("FOOTER_DIVIDER_NOT_REMOVED");
 const iconGap=await page.evaluate(()=>{const svg=document.querySelector(".approved-phone svg").getBoundingClientRect(),number=document.querySelector(".approved-phone span").getBoundingClientRect();return Math.min(Math.abs(svg.left-number.right),Math.abs(number.left-svg.right));});
 if(iconGap>3)throw Error("PHONE_ICON_TOO_FAR:"+iconGap);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 if(overflow)throw Error("MOBILE_HORIZONTAL_OVERFLOW");
 for(const path of ["index.html","lawyer.html","admin.html","showcase.html"]){
   await page.goto("http://127.0.0.1:8765/"+path,{waitUntil:"load"});
   const logos=await page.locator(".mark img,.admin-mark img,.v img").evaluateAll(els=>els.map(el=>({loaded:el.complete&&el.naturalWidth>0,src:el.currentSrc})));
   if(!logos.length||logos.some(l=>!l.loaded||!l.src.includes("visitvakil-logo-yellow.svg")))throw Error("OTHER_LOGO_MISMATCH:"+path+":"+JSON.stringify(logos));
 }
 if(errors.length)throw Error("JS_ERRORS:"+errors.join(";"));
 console.log("PASS: minimal single-CTA homepage, hidden wizard, full three-step consultation flow, mobile width");
}finally{await browser.close()}
