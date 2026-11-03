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
 if(!await page.locator("#site-links").isVisible())throw Error("MENU_NOT_OPEN");
 await page.locator("#site-menu").click();
 if(await page.locator("#site-links").isVisible())throw Error("MENU_NOT_CLOSED");
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
 await page.locator("#wizard-body .wizard-choice").filter({hasText:"مشاوره تلفنی"}).click();
 await page.locator("#wizard-next").click();
 await page.locator("#wizard-body .wizard-choice").filter({hasText:"ملکی و ثبتی"}).click();
 await page.locator("#wizard-next").click();
 await page.locator("#wizard-description").fill("درخواست بررسی اختلاف قرارداد ملکی در منطقه");
 await page.locator("#wizard-next").click();
 await page.getByText("پیش‌نمایش تکمیل شد").waitFor();
 if(!await page.getByRole("link",{name:/مشاهده مسنجر کاربر/}).isVisible())throw Error("MESSENGER_LINK_MISSING");
 await page.locator("#close-wizard").click();
 if(await page.locator("#wizard").evaluate(x=>x.open))throw Error("CLOSE_FAILED");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 if(overflow)throw Error("MOBILE_HORIZONTAL_OVERFLOW");
 if(errors.length)throw Error("JS_ERRORS:"+errors.join(";"));
 console.log("PASS: minimal single-CTA homepage, hidden wizard, full three-step consultation flow, mobile width");
}finally{await browser.close()}
