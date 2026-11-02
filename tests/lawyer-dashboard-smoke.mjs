import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];
page.on("pageerror",e=>errors.push(e.stack||e.message));
function assert(ok,msg){if(!ok)throw new Error(msg)}
async function tab(name){await page.locator('[data-lawyer-tab="'+name+'"]').click()}
async function openDesk(){await tab("home");assert(await page.locator("#lawyer-dashboard").isVisible(),"DASHBOARD_NOT_VISIBLE");assert(!await page.locator("#workspace>.layout").isVisible(),"MESSENGER_LAYOUT_NOT_HIDDEN")}
async function stat(id){return (await page.locator(id).innerText()).trim()}
try{
 await page.goto("http://127.0.0.1:8765/lawyer.html",{waitUntil:"load"});
 await openDesk();
 assert(await page.locator('.desk-grid .desk-tile').count()===6,"SIX_TILES_REQUIRED");
 assert(await stat("#desk-requests")==="۳","WRONG_INITIAL_REQUEST_COUNT");
 assert(await stat("#desk-active")==="۱","WRONG_INITIAL_ACTIVE_COUNT");
 assert(await stat("#desk-completed")==="۰","WRONG_INITIAL_COMPLETED_COUNT");
 const size=await page.locator("#desk-overview").evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight}));
 assert(size.scroll<=size.client+2,"DASHBOARD_SCROLLS_AT_390x844: "+JSON.stringify(size));
 await page.locator('[data-desk-action="finance"]').first().click();
 assert(await page.locator("#desk-finance").isVisible(),"FINANCE_PAGE_NOT_OPEN");
 assert((await page.locator("#desk-finance").innerText()).includes("اطلاعات مالی هنوز متصل نیست"),"FINANCE_UNGROUNDED_AMOUNTS");
 await page.locator('#desk-finance [data-desk-back]').click();
 assert(await page.locator("#desk-overview").isVisible(),"DESK_BACK_FAILED");
 await page.locator('[data-desk-action="reports"]').first().click();
 assert(await page.locator("#desk-reports").isVisible(),"REPORTS_PAGE_NOT_OPEN");
 assert(await stat("#desk-report-total")==="۱","REPORT_TOTAL_INCORRECT");
 await page.locator('#desk-reports [data-desk-back]').click();
 await page.locator('#desk-overview [data-desk-action="requests"]').click();
 assert((await page.locator("#workspace").getAttribute("data-lawyer-tab"))==="activity","REQUEST_TILE_NAV_FAILED");
 await page.locator('#offers .lawyer-offer-thread').first().click();
 assert(await page.locator("#send").isVisible(),"ACCEPT_CHAT_NOT_OPEN");
 await openDesk();
 assert(await stat("#desk-requests")==="۲","REQUESTS_NOT_DECREMENTED");
 assert(await stat("#desk-active")==="۲","ACTIVE_NOT_INCREMENTED");
 assert((await page.locator("#desk-latest-title").innerText()).includes("ملکی"),"LATEST_NOT_UPDATED");
 await page.locator('#desk-overview [data-desk-action="active"]').click();
 assert((await page.locator("#workspace").getAttribute("data-lawyer-tab"))==="chats","ACTIVE_TILE_NAV_FAILED");
 assert(await page.locator('#cases .consultation-thread').count()===2,"ACTIVE_FILTER_WRONG");
 assert((await page.locator('[data-chat-filter="active"]').getAttribute("aria-pressed"))==="true","ACTIVE_FILTER_NOT_SELECTED");
 await page.locator('#cases .consultation-thread').first().click();
 page.once("dialog",d=>d.accept());
 await page.locator("#complete-consultation").click();
 await openDesk();
 assert(await stat("#desk-active")==="۱","COMPLETION_NOT_REFLECTED_ACTIVE");
 assert(await stat("#desk-completed")==="۱","COMPLETION_NOT_REFLECTED_COMPLETED");
 await page.locator('#desk-overview [data-desk-action="completed"]').click();
 assert(await page.locator("#cases .consultation-thread").count()===1,"COMPLETED_FILTER_WRONG");
 await page.locator('#cases .consultation-thread').first().click();
 assert(!await page.locator("#send").isVisible(),"COMPLETED_CHAT_WRITABLE");
 await openDesk();
 await page.locator('#desk-availability').click();
 assert((await page.locator("#desk-availability-label").innerText()).includes("غیرفعال"),"READY_STATUS_DID_NOT_TOGGLE");
 await page.locator('#desk-availability').click();
 assert((await page.locator("#desk-availability-label").innerText()).includes("آماده"),"READY_STATUS_NOT_RESTORED");
 await tab("support");
 assert(await page.locator("#support-new").isVisible(),"SUPPORT_REGRESSION_FROM_DESK");
 await openDesk();
 await page.reload({waitUntil:"load"});
 await openDesk();
 assert(await stat("#desk-completed")==="۱","DASHBOARD_STATS_NOT_PERSISTED");
 await page.setViewportSize({width:360,height:640});
 const compact=await page.locator("#desk-overview").evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight}));
 assert(compact.scroll<=compact.client+2,"DASHBOARD_SCROLLS_AT_360x640: "+JSON.stringify(compact));
 assert(errors.length===0,"JS_ERRORS: "+errors.join("\n"));
 console.log("PASS: desk counters, no scroll, finance, reports, workflow, filtering, completion, availability, persistence, support");
} finally {await browser.close();}
