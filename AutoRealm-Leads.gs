/**********************************************************************
 *  AUTO REALM — Lead Handler (Google Apps Script)
 *  What it does on every website booking/inquiry:
 *    1. Logs the lead as a new row in this Google Sheet
 *    2. Emails YOU (the owner) the full lead details
 *    3. Sends the CUSTOMER an instant, branded confirmation email
 *
 *  Setup: paste this into a Sheet's Apps Script editor, then Deploy
 *  as a Web App (see the setup guide). No edits needed below except
 *  the two settings in CONFIG if you want to change them.
 **********************************************************************/

var CONFIG = {
  SHEET_ID: "1e6oYvq8dlqtmEYPo7BSDt3JDhW8orOppaxWWbomN7qo", // "Auto Realm — Leads" sheet
  OWNER_EMAIL: "autorealmny@gmail.com",   // where new-lead alerts go
  BUSINESS_NAME: "Auto Realm",
  PHONE: "+1 (347) 798-7033",
  WEBSITE: "https://autorealmnyc.com",
  INSTAGRAM: "https://www.instagram.com/autorealm.co"
};

// Column order for the spreadsheet log
var COLUMNS = [
  "submitted_at", "type", "service", "vehicle",
  "customer_name", "customer_phone", "customer_email",
  "date", "time", "duration", "passengers",
  "pickup", "dropoff", "return_date", "return_time",
  "drive_mode", "fulfillment", "transfer_class", "driver_age",
  "car_make", "car_model", "car_year", "car_color", "car_notes",
  "itinerary", "notes",
  "contract_signed_by", "contract_signed_date", "contract_agreement"
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    logToSheet_(data);
    notifyOwner_(data);
    if (data.customer_email && /\S+@\S+\.\S+/.test(data.customer_email)) {
      sendCustomerConfirmation_(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Simple GET so you can confirm the web app is live (visit the /exec URL)
function doGet() {
  return ContentService.createTextOutput("Auto Realm lead handler is live.");
}

function logToSheet_(data) {
  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  var row = COLUMNS.map(function (k) { return data[k] || ""; });
  sheet.appendRow(row);
}

function notifyOwner_(data) {
  var subject = "🚗 New " + (data.type || "Lead") + " — " +
                (data.customer_name || "Website") +
                (data.vehicle ? " · " + data.vehicle : "");
  var lines = [];
  COLUMNS.forEach(function (k) {
    if (data[k]) lines.push(pretty_(k) + ": " + data[k]);
  });
  var body =
    "New lead from the Auto Realm website:\n\n" +
    lines.join("\n") +
    "\n\n— Reply directly to this email to reach the customer.";
  MailApp.sendEmail({
    to: CONFIG.OWNER_EMAIL,
    subject: subject,
    body: body,
    replyTo: data.customer_email || CONFIG.OWNER_EMAIL,
    name: CONFIG.BUSINESS_NAME + " Website"
  });
}

function sendCustomerConfirmation_(data) {
  var name = (data.customer_name || "there").split(" ")[0];
  var subject = "Auto Realm — we received your request ✅";

  var summary = "";
  if (data.vehicle)  summary += "<tr><td style='padding:4px 12px 4px 0;color:#888'>Vehicle</td><td style='color:#111'>" + esc_(data.vehicle) + "</td></tr>";
  if (data.type)     summary += "<tr><td style='padding:4px 12px 4px 0;color:#888'>Service</td><td style='color:#111'>" + esc_(data.type) + "</td></tr>";
  if (data.date)     summary += "<tr><td style='padding:4px 12px 4px 0;color:#888'>Date</td><td style='color:#111'>" + esc_(data.date) + (data.time ? " · " + esc_(data.time) : "") + "</td></tr>";
  if (data.pickup)   summary += "<tr><td style='padding:4px 12px 4px 0;color:#888'>Pickup</td><td style='color:#111'>" + esc_(data.pickup) + "</td></tr>";

  var html =
  '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#0b0b0b;border-radius:14px;overflow:hidden;border:1px solid #222">' +
    '<div style="background:linear-gradient(135deg,#BF953F,#FCF6BA,#BF953F);padding:22px 26px;text-align:center">' +
      '<div style="font-size:22px;font-weight:700;letter-spacing:.08em;color:#111">AUTO REALM</div>' +
      '<div style="font-size:11px;letter-spacing:.22em;color:#333;text-transform:uppercase;margin-top:2px">Luxury · Limo · Import</div>' +
    '</div>' +
    '<div style="padding:28px 26px;color:#ddd;font-size:15px;line-height:1.7">' +
      '<p style="margin:0 0 14px">Hi ' + esc_(name) + ',</p>' +
      '<p style="margin:0 0 14px">Thank you for reaching out to <strong style="color:#fff">Auto Realm</strong>. We\'ve received your request and a team member will contact you shortly to confirm the details.</p>' +
      (summary ? '<table style="background:#141414;border-radius:10px;padding:10px 14px;margin:6px 0 18px;font-size:14px">' + summary + '</table>' : '') +
      '<p style="margin:0 0 14px">Need us sooner? Call or text <a style="color:#BF953F;text-decoration:none" href="tel:+13477987033">' + CONFIG.PHONE + '</a>.</p>' +
      '<p style="margin:18px 0 0;color:#888;font-size:13px">— The Auto Realm Team<br>' +
        '<a style="color:#BF953F;text-decoration:none" href="' + CONFIG.WEBSITE + '">autorealmnyc.com</a></p>' +
    '</div>' +
  '</div>';

  MailApp.sendEmail({
    to: data.customer_email,
    subject: subject,
    htmlBody: html,
    body: "Hi " + name + ", thanks for reaching out to Auto Realm. We received your request and will contact you shortly. Call/text " + CONFIG.PHONE + ". — Auto Realm",
    name: CONFIG.BUSINESS_NAME
  });
}

function pretty_(k) {
  return k.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}
function esc_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
