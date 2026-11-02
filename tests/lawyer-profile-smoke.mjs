import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on("pageerror",e=>errors.push(e.stack||e.message));
function assert(ok,msg){if(!ok)throw new Error(msg)}
async function tab(name){await page.locator('[data-lawyer-tab="'+name+'"]').click()}
async function profile(){await tab("account");assert(await page.locator("#lawyer-profile").isVisible(),"PROFILE_NOT_VISIBLE");assert(!(await page.locator("#workspace>.layout").isVisible()),"MESSENGER_LAYOUT_SHOULD_BE_HIDDEN_IN_PROFILE")}
try{
 await page.goto("http://127.0.0.1:8765/lawyer.html",{waitUntil:"load"});
 await profile();
 assert((await page.locator("#profile-review-note").count())===0||await page.locator(".profile-review-note").isVisible(),"PROFILE_REVIEW_NOTICE_MISSING");
 assert(await page.locator("#profile-mobile").isDisabled()===false&&await page.locator("#profile-mobile").getAttribute("readonly")!==null,"PROFILE_LOGIN_MOBILE_SHOULD_BE_READONLY");
 const form=page.locator("#lawyer-profile-form");
 await form.locator('[name="firstName"]').fill("پروین");
 await form.locator('[name="lastName"]').fill("آزمون");
 await form.locator('[name="professionalTitle"]').selectOption({label:"کارآموز وکالت"});
 await form.locator('[name="licenseNumber"]').fill("۱۴۰۵۱۲۳");
 await form.locator('[name="licenseIssuer"]').selectOption({label:"مرکز وکلا، کارشناسان رسمی و مشاوران خانواده قوه قضاییه"});
 await form.locator('[name="province"]').fill("هرمزگان");
 await form.locator('[name="city"]').fill("کیش");
 await form.locator('[name="specialty"][value="ملکی و ثبتی"]').check();
 await form.locator('[name="specialty"][value="قراردادها"]').check();
 await form.locator('[name="bio"]').fill("پیش‌نمایش اطلاعات حرفه‌ای وکیل.");
 assert((await page.locator("#profile-display-name").innerText())==="پروین آزمون","LIVE_NAME_PREVIEW_BROKEN");
 assert((await page.locator("#profile-progress-label").innerText())==="۹۰٪","PROFILE_COMPLETENESS_WRONG_BEFORE_AVATAR");
 const base64=await page.evaluate(()=>{
  const canvas=document.createElement("canvas");canvas.width=64;canvas.height=64;
  const ctx=canvas.getContext("2d");ctx.fillStyle="#9a7ed6";ctx.fillRect(0,0,64,64);
  return canvas.toDataURL("image/png").split(",")[1];
 });
 await page.locator("#profile-avatar-file").setInputFiles({name:"sample.png",mimeType:"image/png",buffer:Buffer.from(base64,"base64")});
 await page.waitForFunction(()=>!document.getElementById("profile-avatar-image").hidden);
 assert(await page.locator("#profile-avatar-image").isVisible(),"AVATAR_NOT_PREVIEWED");
 assert((await page.locator("#profile-progress-label").innerText())==="۱۰۰٪","AVATAR_NOT_REFLECTED_IN_PROGRESS");
 const preSave=await page.locator("#profile-avatar-image").getAttribute("src");
 assert(preSave.startsWith("data:image/jpeg;base64,"),"AVATAR_NOT_RESIZED_TO_JPEG");
 await page.locator("#profile-save-button").click();
 assert((await page.locator("#profile-save-status").innerText()).includes("ذخیره شد"),"SAVE_FEEDBACK_MISSING");
 await page.reload({waitUntil:"load"});
 await profile();
 assert((await form.locator('[name="firstName"]').inputValue())==="پروین","FIRST_NAME_NOT_PERSISTED");
 assert((await form.locator('[name="lastName"]').inputValue())==="آزمون","LAST_NAME_NOT_PERSISTED");
 assert((await form.locator('[name="licenseNumber"]').inputValue())==="۱۴۰۵۱۲۳","LICENSE_NOT_PERSISTED");
 assert(await form.locator('[name="specialty"][value="ملکی و ثبتی"]').isChecked(),"SPECIALTIES_NOT_PERSISTED");
 assert((await form.locator('[name="city"]').inputValue())==="کیش","CITY_NOT_PERSISTED");
 assert(await page.locator("#profile-avatar-image").isVisible(),"AVATAR_NOT_PERSISTED");
 assert((await page.locator("#profile-avatar-image").getAttribute("src"))===preSave,"PERSISTED_AVATAR_MISMATCH");
 // Avatar update and remove must be independent from all text fields.
 await page.locator("#profile-avatar-file").setInputFiles({name:"bad.svg",mimeType:"image/svg+xml",buffer:Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")});
 assert((await page.locator("#profile-save-status").innerText()).includes("فقط تصویر"),"SVG_WAS_NOT_REJECTED");
 assert(await page.locator("#profile-avatar-image").isVisible(),"INVALID_UPLOAD_REMOVED_VALID_AVATAR");
 await page.locator("#profile-avatar-remove").click();
 assert(!(await page.locator("#profile-avatar-image").isVisible()),"REMOVE_PREVIEW_NOT_WORKING");
 await page.locator("#profile-save-button").click();
 await page.reload({waitUntil:"load"});
 await profile();
 assert(!(await page.locator("#profile-avatar-image").isVisible()),"REMOVE_NOT_PERSISTED");
 assert((await form.locator('[name="firstName"]').inputValue())==="پروین","AVATAR_REMOVAL_LOST_PROFILE");
 await tab("home");
 assert(await page.locator("#lawyer-dashboard").isVisible(),"DASHBOARD_REGRESSION");
 await tab("support");
 assert(await page.locator("#support-new").isVisible(),"SUPPORT_FOOTER_REGRESSION");
 await tab("activity");
 assert(await page.locator("#offers").isVisible(),"REQUEST_LIST_REGRESSION");
 await tab("chats");
 assert(await page.locator("#cases").isVisible(),"CONSULTATIONS_LIST_REGRESSION");
 assert(errors.length===0,"JS_ERRORS: "+errors.join("\n"));
 console.log("PASS: profile tab, live preview, field persistence, image crop, invalid image rejection, remove avatar, and navigation regression");
}finally{await browser.close();}
