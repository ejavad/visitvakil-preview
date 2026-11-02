import { chromium } from "playwright";

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];
page.on("pageerror",e=>errors.push(e.stack||e.message));

async function tab(name){await page.locator('[data-lawyer-tab="'+name+'"]').click()}
function assert(condition,message){if(!condition)throw new Error(message)}
async function visible(selector){return page.locator(selector).isVisible()}

try {
 await page.goto("http://127.0.0.1:8765/lawyer.html",{waitUntil:"load"});
 await tab("chats");
 assert(await page.locator("#cases .consultation-thread").count()===1,"INITIAL_ACCEPTED_CHAT_MISSING");
 assert(await visible("#cases"),"CHATS_LIST_NOT_VISIBLE");
 await tab("activity");
 assert(await page.locator("#offers .lawyer-offer-thread").count()===3,"INITIAL_OFFERS_MISSING");
 await page.locator("#offers .lawyer-offer-thread").first().click();
 assert((await page.locator("#workspace").getAttribute("data-lawyer-tab"))==="chats","ACCEPT_DID_NOT_SWITCH_TO_CHATS");
 assert(await visible("#send"),"ACCEPT_DID_NOT_OPEN_COMPOSER");
 assert(await page.locator("#offers .lawyer-offer-thread").count()===2,"ACCEPT_DID_NOT_REMOVE_OFFER");
 assert((await page.locator("#header").innerText()).includes("ملکی"),"WRONG_ACCEPTED_CHAT");
 await page.locator("#body").fill("پیام مشاوره ملکی");
 await page.locator('#send button[type="submit"]').click();
 assert(await page.locator("#messages").getByText("پیام مشاوره ملکی").count()===1,"FIRST_CHAT_MESSAGE_MISSING");
 await page.locator("#lawyer-back").click();
 assert(await visible("#cases"),"BACK_DID_NOT_RETURN_TO_CHATS");
 assert(await page.locator("#cases .consultation-thread").count()===2,"ACCEPTED_CHAT_NOT_IN_LIST");
 assert((await page.locator("#cases").innerText()).includes("پیام مشاوره ملکی"),"CHAT_PREVIEW_NOT_UPDATED");
 await tab("activity");
 assert(await page.locator("#offers .lawyer-offer-thread").count()===2,"ACCEPTED_OFFER_REAPPEARED");
 await page.locator("#offers .lawyer-offer-thread").filter({hasText:"کیفری"}).click();
 assert((await page.locator("#header").innerText()).includes("کیفری"),"CRIMINAL_CHAT_NOT_SELECTED");
 assert(!(await page.locator("#messages").innerText()).includes("پیام مشاوره ملکی"),"CROSS_CHAT_MESSAGE_LEAK");
 await page.locator("#body").fill("پیام مشاوره کیفری");
 await page.locator('#send button[type="submit"]').click();
 assert(await page.locator("#messages").getByText("پیام مشاوره کیفری").count()===1,"CRIMINAL_CHAT_MESSAGE_MISSING");
 await page.locator("#lawyer-back").click();
 assert(await page.locator("#cases .consultation-thread").count()===3,"MULTIPLE_ACCEPTED_CHATS_NOT_LISTED");
 await page.locator("#cases .consultation-thread").filter({hasText:"ملکی"}).click();
 assert((await page.locator("#messages").innerText()).includes("پیام مشاوره ملکی"),"REOPEN_PROPERTY_CHAT_LOST_HISTORY");
 assert(!(await page.locator("#messages").innerText()).includes("پیام مشاوره کیفری"),"OTHER_CHAT_MESSAGES_SHOWN");
 await page.reload({waitUntil:"load"});
 await tab("chats");
 assert(await page.locator("#cases .consultation-thread").count()===3,"ACCEPTED_CHATS_NOT_PERSISTED_ON_RELOAD");
 await page.locator("#cases .consultation-thread").filter({hasText:"کیفری"}).click();
 assert((await page.locator("#messages").innerText()).includes("پیام مشاوره کیفری"),"CHAT_HISTORY_NOT_PERSISTED_ON_RELOAD");
 await tab("support");
 assert(await visible("#support-new"),"SUPPORT_FOOTER_REGRESSED");
 assert(await visible("#support-list"),"SUPPORT_TICKETS_NOT_VISIBLE");
 assert(errors.length===0,"JS_ERRORS: "+errors.join("\n"));
 console.log("PASS: offers -> acceptance -> chats -> send -> back -> distinct chat -> persistence -> support");
} finally { await browser.close(); }
