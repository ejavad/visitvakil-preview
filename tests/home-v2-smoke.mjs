import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:8765/home-v2.html",{waitUntil:"load"});
 await page.getByRole("button",{name:/مشاوره تلفنی/}).first().click();
 if((await page.locator('[data-service="phone"]').getAttribute("aria-pressed"))!=="true")throw Error("SERVICE_NOT_SELECTED");
 await page.locator("#start-wizard").click();
 if(!await page.locator("#wizard").evaluate(x=>x.open))throw Error("WIZARD_NOT_OPEN");
 await page.locator("#wizard-next").click();
 await page.locator("#wizard-body .wizard-choice").filter({hasText:"ملکی و ثبتی"}).click();
 await page.locator("#wizard-next").click();
 await page.locator("#wizard-description").fill("درخواست بررسی اختلاف قرارداد ملکی در منطقه");
 await page.locator("#wizard-next").click();
 await page.getByText("پیش‌نمایش تکمیل شد").waitFor();
 if(!await page.getByRole("link",{name:/مشاهده مسنجر کاربر/}).isVisible())throw Error("NO_MESSENGER_LINK");
 await page.locator("#close-wizard").click();
 await page.locator('[data-topic="خانواده"]').click();
 if(!(await page.locator("#wizard-title").innerText()).includes("موضوع"))throw Error("TOPIC_FLOW_FAILED");
 if(!await page.locator("#wizard-body .chosen").filter({hasText:"خانواده"}).isVisible())throw Error("TOPIC_NOT_SELECTED");
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 if(overflow)throw Error("MOBILE_HORIZONTAL_OVERFLOW");
 if(errors.length)throw Error("JS_ERRORS:"+errors.join(";"));
 console.log("PASS: homepage mobile layout, service selection, wizard, topic shortcut and safe demo");
} finally {await browser.close()}
