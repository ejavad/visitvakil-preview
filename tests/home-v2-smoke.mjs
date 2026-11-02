import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:8765/home-v2.html",{waitUntil:"load"});
 if(await page.locator(".service-options").count())throw Error("SERVICE_CARDS_SHOULD_NOT_APPEAR_ON_HOME");
 if(await page.locator(".topic-grid").count())throw Error("TOPIC_CARDS_SHOULD_NOT_APPEAR_ON_HOME");
 if(await page.locator("#wizard").evaluate(x=>x.open))throw Error("WIZARD_VISIBLE_BEFORE_CLICK");
 if(!(await page.locator("h1").innerText()).includes("مشاوره حقوقی"))throw Error("HERO_MISSING");
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
