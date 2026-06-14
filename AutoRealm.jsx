import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ⚙️  AUTO REALM CONFIG  —  Ahmed: update these to go live
   ═══════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  // 📧 EMAIL INTEGRATION (get free form endpoint from https://formspree.io)
  //    1. Sign up at formspree.io with your business email
  //    2. Create a new form → copy the endpoint URL
  //    3. Paste it below — every booking/inquiry will email you automatically
  FORMSPREE_ENDPOINT: "https://formspree.io/f/mdajkzzn",

  // 📊 GOOGLE SHEET DATABASE + AUTO-REPLY (Google Apps Script webhook)
  //    Every lead is logged to a Google Sheet AND triggers an instant
  //    auto-reply email to the customer. Full setup steps are in
  //    AUTO_REALM_AUTOMATION_GUIDE.md. Paste your deployed Apps Script
  //    /exec URL here. Leave "" to skip (Formspree still emails you).
  SHEET_WEBHOOK_URL: "",

  // 📞 BUSINESS CONTACT
  EMAIL:     "autorealmny@gmail.com",
  PHONE:     "+1 (347) 798-7033",
  PHONE_RAW: "+13477987033",
  INSTAGRAM: "https://www.instagram.com/autorealm.co",
  TIKTOK:    "https://www.tiktok.com/@autorealm_",
  FACEBOOK:  "https://www.facebook.com/share/r/17Zpkya3B9/",
  WHATSAPP:  "https://wa.me/13477987033",

  // 📁 PHOTO PATH (upload car photos to /public/fleet-photos/ in your project)
  PHOTO_PATH: "/fleet-photos",

  // 🗺️ GOOGLE PLACES API (optional - for address autocomplete)
  //    Get key at: https://console.cloud.google.com/apis/credentials
  //    Enable: Places API (New) + Maps JavaScript API
  //    Free tier: ~28,000 requests/month
  //    Leave empty to use plain text inputs
  GOOGLE_PLACES_API_KEY: "",

  // 📄 RENTAL CONTRACT PDF (upload to /public/ folder of your project)
  CONTRACT_PDF_URL: "/Auto_Realm_Rental_Agreement.pdf",
  ZELLE_ADDRESS: "autorealmny@gmail.com",
  SECURITY_DEPOSIT: 1000,
};

// 🚗 Car makes for autocomplete in On-Demand & JDM Import forms
const CAR_MAKES = [
  "Acura","Alfa Romeo","Aston Martin","Audi","Bentley","BMW","Bugatti","Cadillac",
  "Chevrolet","Dodge","Ferrari","Ford","Genesis","GMC","Honda","Hyundai","Infiniti",
  "Jaguar","Jeep","Koenigsegg","Lamborghini","Land Rover","Lexus","Lincoln","Lotus",
  "Maserati","Maybach","Mazda","McLaren","Mercedes-AMG","Mercedes-Benz","Mini","Mitsubishi",
  "Nissan","Pagani","Porsche","Range Rover","Rolls-Royce","Rivian","Subaru","Tesla","Toyota",
  "Volkswagen","Volvo",
  // JDM-specific
  "Nissan Skyline","Nissan GT-R","Honda NSX","Toyota Supra","Mazda RX-7","Subaru Impreza WRX","Mitsubishi Lancer Evolution",
];

const COLORS = ["Black","White","Silver","Gray","Red","Blue","Green","Yellow","Orange","Purple","Brown","Gold","Custom Wrap"];
const YEARS = Array.from({length: 30}, (_, i) => 2026 - i);

/* ═════════════ Log lead to Google Sheet + trigger auto-reply ═════════════ */
async function logToSheet(payload) {
  if (!CONFIG.SHEET_WEBHOOK_URL) return false;
  try {
    // no-cors: fire-and-forget POST to Apps Script (it logs + auto-replies)
    await fetch(CONFIG.SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...payload,
        submitted_at: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      }),
    });
    return true;
  } catch { return false; }
}

/* ═════════════ Send leads to email via Formspree (supports file uploads) ═════════════ */
async function sendLead(payload, files = {}) {
  // Fire the Google Sheet logger in parallel (non-blocking) — logs + auto-replies
  logToSheet(payload);

  try {
    const hasFiles = Object.values(files).some(f => f);

    if (hasFiles) {
      // FormData mode — needed for license/insurance attachments
      const fd = new FormData();
      Object.entries({
        ...payload,
        _subject: `🚗 Auto Realm — ${payload.type || "New Inquiry"}`,
        submitted_at: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      }).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f, f.name); });

      const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: "POST", headers: { "Accept": "application/json" }, body: fd,
      });
      return res.ok;
    }

    // JSON mode — faster for inquiries without files
    const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        ...payload,
        _subject: `🚗 Auto Realm — ${payload.type || "New Inquiry"}`,
        submitted_at: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      }),
    });
    return res.ok;
  } catch { return false; }
}

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #060606; }
    .sr { font-family: 'Cormorant Garamond', serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
    @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fu1{animation:fadeUp .8s .1s both ease;} .fu2{animation:fadeUp .8s .3s both ease;}
    .fu3{animation:fadeUp .8s .5s both ease;} .fu4{animation:fadeUp .8s .7s both ease;}
    .card { transition: all .4s cubic-bezier(.23,1,.32,1); }
    .card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,.7) !important; }
    .gold-text { background: linear-gradient(135deg,#BF953F,#FCF6BA,#B38728); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .btn-gold { background: linear-gradient(135deg,#BF953F,#FCF6BA,#BF953F); background-size:200% auto; color:#000 !important; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; letter-spacing:.1em; text-transform:uppercase; transition:all .3s ease; animation:shimmer 5s linear infinite; }
    .btn-gold:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 12px 32px rgba(191,149,63,.3) !important; }
    .btn-gold:disabled { opacity:.6; cursor:not-allowed; }
    .btn-ghost { background:transparent; border:1px solid rgba(191,149,63,.5); color:#BF953F; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:500; letter-spacing:.08em; text-transform:uppercase; transition:all .3s; }
    .btn-ghost:hover { border-color:#BF953F; background:rgba(191,149,63,.08); transform:translateY(-2px); }
    .btn-white { background:transparent; border:1px solid rgba(255,255,255,.15); color:#ccc; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:400; letter-spacing:.08em; text-transform:uppercase; transition:all .3s; }
    .btn-white:hover { border-color:rgba(255,255,255,.35); background:rgba(255,255,255,.04); }
    .nav-lnk { color:#777; font-size:11px; letter-spacing:.15em; text-transform:uppercase; cursor:pointer; transition:color .3s; background:none; border:none; font-family:'DM Sans',sans-serif; }
    .nav-lnk:hover { color:#fff; }
    .filter-btn { background:transparent; border:1px solid #1c1c1c; color:#555; font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:7px 18px; border-radius:30px; cursor:pointer; transition:all .3s; font-family:'DM Sans',sans-serif; }
    .filter-btn:hover { border-color:#333; color:#888; }
    .filter-btn.active { border-color:#BF953F; color:#BF953F; background:rgba(191,149,63,.07); }
    .period-btn { background:#0f0f0f; border:1px solid #1c1c1c; color:#555; font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:7px 16px; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
    .period-btn:first-child { border-radius:6px 0 0 6px; }
    .period-btn:last-child { border-radius:0 6px 6px 0; }
    .period-btn.active { background:#BF953F; color:#000; border-color:#BF953F; font-weight:600; }
    .pill { display:inline-flex; align-items:center; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); color:#888; font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:4px 9px; border-radius:20px; white-space:nowrap; }
    input, select, textarea { background:#0f0f0f; border:1px solid #232323; color:#fff; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border-color .3s, box-shadow .3s; width:100%; padding:13px 16px; appearance:none; -webkit-appearance:none; }
    input:focus, select:focus, textarea:focus { border-color:#BF953F; box-shadow:0 0 0 3px rgba(191,149,63,.1); }
    input::placeholder, textarea::placeholder { color:#333; }
    select option { background:#141414; color:#fff; }
    label { display:block; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#4a4a4a; margin-bottom:7px; font-weight:500; }
    ::-webkit-scrollbar { width:3px; height:3px; }
    ::-webkit-scrollbar-track { background:#080808; }
    ::-webkit-scrollbar-thumb { background:#BF953F; border-radius:2px; }
    .svc-row { display:flex; align-items:center; gap:16px; padding:16px 20px; border-radius:10px; border:1px solid #141414; background:rgba(255,255,255,.01); cursor:pointer; transition:all .3s; }
    .svc-row:hover { border-color:rgba(191,149,63,.25); background:rgba(191,149,63,.03); }
    .gallery-img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; opacity:0; transition:opacity .6s ease; }
    .gallery-img.active { opacity:1; }
    .spinner { width:14px; height:14px; border:2px solid rgba(0,0,0,.2); border-top-color:#000; border-radius:50%; animation:spin .8s linear infinite; display:inline-block; }
    @media(max-width:768px) {
      .mob-hide{display:none !important;}
      .mob-1col{grid-template-columns:1fr !important;}
      .section-pad{padding:60px 20px !important;}
      body{padding-bottom:70px !important;}
    }
    @media(min-width:769px) { .mob-only{display:none !important;} }
  `}</style>
);

const G = "#BF953F";

const CARS = [
  { id:1, name:"Mercedes-Benz S580 AMG", sub:"Long Wheelbase · Reclining Package", year:"2024", color:"Obsidian Black", cat:"luxury",
    feats:["S63 AMG Wheels","Reclining Rear Seats","LWB Extended","Cognac Interior","Chauffeur Available"],
    d:495, w:3000, m:12000, badge:"FLAGSHIP", bc:G,
    photos:["s580-10-hero-night.jpg","s580-02-prada-luxury.jpg","s580-08-side-night-glow.jpg","s580-09-interior-red.jpg","s580-07-side-day-clouds.jpg","s580-04-interior-cognac.jpg","s580-03-door-open-cognac.jpg","s580-05-interior-rear-cognac.jpg"],
    g1:"#080808", g2:"#181818", acc:"#BF953F" },
  { id:2, name:"Polaris Slingshot GT", sub:"Limited Edition · #03 of 298 Worldwide", year:"2020", color:"Venom Green", cat:"exotic",
    feats:["#03 of 298 Worldwide","Underglow Lighting","GT Limited Edition","Open-Cockpit","Bronze Wheels"],
    d:300, w:2000, m:8000, badge:"#03 / 298 WORLD", bc:"#39FF14",
    photos:["slingshot-01-hero.jpg","slingshot-04-underglow-multi.jpg","slingshot-02-side.jpg","slingshot-03-front.jpg","slingshot-05-underglow-purple.jpg","slingshot-06-underglow-blue.jpg"],
    g1:"#040e04", g2:"#081c08", acc:"#39FF14" },
  { id:3, name:"Mercedes-Benz C63S AMG", sub:"V8 Biturbo · AMG Performance Coupe", year:"2019", color:"Diamond White", cat:"sport",
    feats:["V8 Biturbo 503 HP","Red & Black AMG Interior","AMG Performance Seats","Panoramic Roof","Star Lights Roof"],
    d:400, w:2500, m:9000, badge:null,
    photos:["c63s-01-nyc-louis-vuitton.jpg","c63s-02-front-day.jpg","c63s-03-side-day.jpg","c63s-04-interior-amg.jpg","c63s-05-interior-seats.jpg"],
    g1:"#0e0e0e", g2:"#1a1a1a", acc:"#E63946" },
  { id:4, name:"BMW M850i Competition", sub:"Fully Blacked Out · M Performance", year:"2019", color:"Triple Black", cat:"sport",
    feats:["Fully Blacked Out","M Sport Package","Crystal Shifter","Cognac Interior","523 HP V8"],
    d:350, w:2250, m:9000, badge:null,
    photos:["m850-01-hero-day.jpg","m850-03-front-sunset.jpg","m850-02-rear-day.jpg","m850-05-interior.jpg","m850-04-taillight.jpg","m850-06-headlight.jpg","m850-07-shifter.jpg"],
    g1:"#060810", g2:"#0e1020", acc:"#3A5BDB" },
  { id:5, name:"Range Rover Sport SVR", sub:"Estoril Blue · Supercharged V8 575HP", year:"2017", color:"Estoril Blue", cat:"suv",
    feats:["Supercharged V8 575HP","SVR Performance Seats","Panoramic Roof","Carbon Trim","Active Sport Exhaust"],
    d:375, w:2500, m:10000, badge:null,
    photos:["svr-01-driveway-hero.jpg","svr-02-front-grille.jpg","svr-03-rear-quarter.jpg","svr-04-svr-seats.jpg","svr-05-svr-seats-detail.jpg"],
    g1:"#0a1428", g2:"#142850", acc:"#2E5BFF" },
  { id:6, name:"Cadillac Escalade", sub:"7-Passenger Premium SUV", year:null, color:"Obsidian Black", cat:"suv",
    feats:["7 Passenger","Self-Drive Available","Chauffeur Available","Airport Transfers","Premium Sound"],
    d:395, w:null, m:null, badge:null, photos:[],
    g1:"#080808", g2:"#161616", acc:"#888" },
];

const CATS = [
  {id:"all",l:"All Vehicles"},{id:"luxury",l:"Luxury"},{id:"sport",l:"Sport"},
  {id:"suv",l:"SUV"},{id:"exotic",l:"Exotic"},
];

const TRANSFERS = [
  { route:"JFK ↔ City", s580:185, esc:200 },
  { route:"LGA ↔ City", s580:150, esc:175 },
  { route:"Newark ↔ City", s580:215, esc:255 },
];

const PROMS = [
  { car:"Mercedes S580 AMG", p2:550, p4:750 },
  { car:"Mercedes C63S AMG", p2:400, p4:550 },
  { car:"BMW M850i Coupe", p2:450, p4:600 },
  { car:"Range Rover SVR", p2:450, p4:600 },
];

const divider = { width:50, height:1, background:`linear-gradient(90deg,transparent,${G},transparent)`, margin:"14px 0" };
const stitle = { fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(34px,5vw,54px)", fontWeight:300, letterSpacing:"0.02em", lineHeight:1.1, color:"#fff" };
const stag = { fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#4a4a4a", fontWeight:500 };

const Sec = ({ id, style, children }) => (
  <section id={id} className="section-pad" style={{ padding:"96px 28px", ...style }}>
    <div style={{ maxWidth:1200, margin:"0 auto" }}>{children}</div>
  </section>
);

function FleetCard({ car, per, plabel, price, onBook }) {
  const [idx, setIdx] = useState(0);
  const hasPhotos = car.photos && car.photos.length > 0;

  return (
    <div className="card" style={{ background:"#0d0d0d", border:"1px solid #181818", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.4)" }}>
      <div style={{ height:220, background:`linear-gradient(135deg,${car.g1},${car.g2})`, position:"relative", overflow:"hidden" }}>
        {hasPhotos ? (
          <>
            {car.photos.map((p,i)=>(
              <img key={i} src={`${CONFIG.PHOTO_PATH}/${p}`} alt={car.name} className={`gallery-img${i===idx?" active":""}`}/>
            ))}
            {car.photos.length>1 && (
              <>
                <button onClick={e=>{e.stopPropagation();setIdx((idx-1+car.photos.length)%car.photos.length);}} style={{ position:"absolute", top:"50%", left:10, transform:"translateY(-50%)", background:"rgba(0,0,0,.55)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,.12)", color:"#fff", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14, zIndex:3 }}>‹</button>
                <button onClick={e=>{e.stopPropagation();setIdx((idx+1)%car.photos.length);}} style={{ position:"absolute", top:"50%", right:10, transform:"translateY(-50%)", background:"rgba(0,0,0,.55)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,.12)", color:"#fff", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14, zIndex:3 }}>›</button>
                <div style={{ position:"absolute", bottom:14, right:13, display:"flex", gap:4, zIndex:3 }}>
                  {car.photos.map((_,i)=>(
                    <div key={i} style={{ width:i===idx?16:5, height:5, borderRadius:3, background:i===idx?car.acc:"rgba(255,255,255,.4)", transition:"all .3s" }}/>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 90%,${car.acc}22 0%,transparent 65%)` }}/>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:car.acc, fontSize:11, letterSpacing:".18em", textTransform:"uppercase", opacity:.5, textAlign:"center", padding:"0 30px" }}>📷 Photos coming soon</div>
          </>
        )}
        {car.badge && (
          <div style={{ position:"absolute", top:12, right:12, background:car.bc||G, color:car.bc&&car.bc!==G?"#fff":"#000", fontSize:9, fontWeight:700, letterSpacing:".1em", padding:"4px 10px", borderRadius:20, textTransform:"uppercase", zIndex:4 }}>{car.badge}</div>
        )}
        <div style={{ position:"absolute", bottom:13, left:13, display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,.55)", padding:"5px 11px", borderRadius:20, backdropFilter:"blur(6px)", zIndex:4 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:car.acc, boxShadow:`0 0 6px ${car.acc}` }}/>
          <span style={{ fontSize:9, color:"#fff", letterSpacing:".08em", fontWeight:500 }}>{car.color}</span>
        </div>
      </div>
      <div style={{ padding:"22px 24px" }}>
        {car.year && <div style={{ ...stag, fontSize:10, marginBottom:5, color:G }}>{car.year}</div>}
        <h3 className="sr" style={{ fontSize:21, fontWeight:500, letterSpacing:".02em", lineHeight:1.2, marginBottom:4 }}>{car.name}</h3>
        <p style={{ fontSize:12, color:"#4a4a4a", letterSpacing:".04em", marginBottom:16 }}>{car.sub}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:22 }}>
          {car.feats.map(f=><span key={f} className="pill">{f}</span>)}
        </div>
        <div style={{ borderTop:"1px solid #161616", paddingTop:18, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12 }}>
          <div>
            <div style={{ fontSize:10, color:"#3a3a3a", letterSpacing:".1em", textTransform:"uppercase", marginBottom:3 }}>{["Daily Rate","Weekly Rate","Monthly Rate"][per]}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
              <span className="sr gold-text" style={{ fontSize:30, fontWeight:600 }}>{price}</span>
              {!["—","Inquire"].includes(price) && <span style={{ fontSize:12, color:"#444" }}>{plabel}</span>}
            </div>
          </div>
          <button className="btn-gold" style={{ padding:"10px 20px", borderRadius:6, fontSize:11, flexShrink:0 }} onClick={()=>onBook(car,"rental")}>Book Now</button>
        </div>
      </div>
    </div>
  );
}

function OnDemandCard({ onClick }) {
  return (
    <div className="card" onClick={onClick} style={{
      background:"linear-gradient(135deg, rgba(191,149,63,.12), rgba(191,149,63,.03))",
      border:"1px dashed rgba(191,149,63,.4)", borderRadius:14, overflow:"hidden", cursor:"pointer",
      display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
      minHeight:480, padding:"40px 30px", textAlign:"center"
    }}>
      <div style={{ fontSize:48, marginBottom:18 }}>🔑</div>
      <div style={{ fontSize:10, color:G, letterSpacing:".15em", textTransform:"uppercase", fontWeight:600, marginBottom:10 }}>Don't See What You Want?</div>
      <h3 className="sr" style={{ fontSize:28, fontWeight:500, lineHeight:1.2, marginBottom:14 }}>Car on <span className="gold-text">Demand</span></h3>
      <p style={{ fontSize:13, color:"#6a6a6a", lineHeight:1.7, maxWidth:280, marginBottom:24 }}>
        Tell us what you want. Lamborghini, Ferrari, Rolls Royce, G-Wagon, Bentley — we source any luxury or exotic car on request.
      </p>
      <button className="btn-gold" style={{ padding:"12px 28px", borderRadius:6, fontSize:11 }}>Submit Inquiry →</button>
      <div style={{ marginTop:22, fontSize:10, color:"#444", letterSpacing:".06em" }}>Average response time: under 2 hours</div>
    </div>
  );
}

function BookModal({ open, onClose, initCar, initSvc }) {
  // Auto-skip step 1 if a service is pre-selected
  const [step, setStep] = useState(initSvc ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    service: initSvc || "rental", vehicle: initCar?.name || "",
    // Car request (JDM/On-Demand)
    carMake:"", carModel:"", carYear:"", carColor:"", carNotes:"",
    // Trip
    pickup:"", pickupZip:"", dropoff:"", dropoffZip:"",
    date:"", time:"", returnDate:"", returnTime:"", hours:"3", pax:"1",
    itinerary:"",
    // Customer
    name:"", phone:"", email:"", notes:"",
    // Rental contract / documents
    licenseFront:null, licenseBack:null, insuranceDoc:null,
    signatureName:"", signatureDate:new Date().toISOString().split("T")[0],
    agreedToTerms:false,
  });
  const u = (k,v) => setForm(f=>({...f,[k]:v}));

  if (!open) return null;
  const isOnDemand = form.service === "ondemand";
  const isImport = form.service === "import";
  const isCarRequest = isOnDemand || isImport;
  const isChauffeur = form.service === "chauffeur" || form.service === "fifa";
  const isRental = form.service === "rental";
  const totalSteps = isRental ? 4 : 3;

  const submit = async () => {
    setSubmitting(true);
    const labels = { rental:"Self-Drive Rental", chauffeur:"Chauffeur Service", transfer:"Airport Transfer", fifa:"FIFA 2026 Package", import:"JDM Import Inquiry", ondemand:"Car on Demand Inquiry" };
    const payload = {
      type: labels[form.service] || "Booking",
      service: form.service,
      vehicle: isCarRequest ? `${form.carYear} ${form.carMake} ${form.carModel} (${form.carColor})`.trim() : form.vehicle,
      car_make: form.carMake, car_model: form.carModel, car_year: form.carYear, car_color: form.carColor, car_notes: form.carNotes,
      pickup: form.pickup + (form.pickupZip ? `, ${form.pickupZip}` : ""),
      dropoff: form.dropoff + (form.dropoffZip ? `, ${form.dropoffZip}` : ""),
      date: form.date, time: form.time,
      return_date: form.returnDate, return_time: form.returnTime,
      duration: form.hours, passengers: form.pax,
      itinerary: form.itinerary,
      customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
      notes: form.notes,
    };
    const files = {};
    if (isRental && form.agreedToTerms) {
      payload.contract_signed_by = form.signatureName;
      payload.contract_signed_date = form.signatureDate;
      payload.contract_agreement = `✓ DIGITALLY SIGNED — Renter "${form.signatureName}" agreed to all terms of Auto Realm Rental Agreement on ${form.signatureDate}. IP/timestamp logged.`;
      if (form.licenseFront) files.license_front = form.licenseFront;
      if (form.licenseBack) files.license_back = form.licenseBack;
      if (form.insuranceDoc) files.insurance_proof = form.insuranceDoc;
    }
    await sendLead(payload, files);
    setSubmitting(false);
    setSuccess(true);
  };

  const close = () => {
    setStep(initSvc?2:1); setSuccess(false); setSubmitting(false);
    setForm({ service:initSvc||"rental", vehicle:"", carMake:"", carModel:"", carYear:"", carColor:"", carNotes:"",
      pickup:"", pickupZip:"", dropoff:"", dropoffZip:"", date:"", time:"", returnDate:"", returnTime:"", hours:"3", pax:"1",
      itinerary:"", name:"", phone:"", email:"", notes:"",
      licenseFront:null, licenseBack:null, insuranceDoc:null,
      signatureName:"", signatureDate:new Date().toISOString().split("T")[0], agreedToTerms:false });
    onClose();
  };

  // TAP TO ADVANCE — pick service auto-jumps to step 2
  const pickService = (id) => { u("service", id); setStep(2); };

  // CONTACT BAR for JDM/Car-On-Demand
  const ContactBar = () => (
    <div style={{
      display:"flex", gap:8, alignItems:"center", flexWrap:"wrap",
      background:"linear-gradient(135deg,rgba(191,149,63,.10),rgba(191,149,63,.03))",
      border:"1px solid rgba(191,149,63,.22)",
      borderRadius:10, padding:"12px 16px", marginBottom:6
    }}>
      <span style={{fontSize:11, color:G, letterSpacing:".08em", fontWeight:600, textTransform:"uppercase"}}>Or contact directly:</span>
      <a href={`tel:${CONFIG.PHONE_RAW}`} style={{textDecoration:"none",color:"#ccc",fontSize:12,padding:"4px 10px",background:"rgba(255,255,255,.04)",borderRadius:6}}>📞 Call</a>
      <a href={CONFIG.WHATSAPP} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",color:"#ccc",fontSize:12,padding:"4px 10px",background:"rgba(255,255,255,.04)",borderRadius:6}}>💬 WhatsApp</a>
      <a href={`mailto:${CONFIG.EMAIL}`} style={{textDecoration:"none",color:"#ccc",fontSize:12,padding:"4px 10px",background:"rgba(255,255,255,.04)",borderRadius:6}}>✉️ Email</a>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.88)", backdropFilter:"blur(18px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .3s ease" }} onClick={e=>{ if(e.target===e.currentTarget) close(); }}>
      <div style={{ background:"#0c0c0c", border:"1px solid #202020", borderRadius:16, width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto", padding:"36px 40px", position:"relative" }}>
        <button onClick={close} style={{ position:"absolute", top:18, right:18, background:"#181818", border:"1px solid #282828", color:"#666", width:34, height:34, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, zIndex:5 }}>×</button>

        {success ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:54, marginBottom:18 }}>✓</div>
            <h3 className="sr gold-text" style={{ fontSize:30, fontWeight:500, marginBottom:14 }}>Inquiry Received</h3>
            <p style={{ color:"#777", fontSize:14, lineHeight:1.8, marginBottom:30, maxWidth:380, margin:"0 auto 30px" }}>
              Thank you {form.name?.split(" ")[0]}. We'll reach out within 60 minutes to confirm details.
            </p>
            <div style={{ background:"#080808", border:"1px solid #181818", borderRadius:8, padding:"16px 22px", marginBottom:24, fontSize:12, color:"#555", lineHeight:1.8 }}>
              📧 Confirmation to <span style={{color:"#aaa"}}>{form.email}</span><br/>
              📞 We'll call <span style={{color:"#aaa"}}>{form.phone}</span>
            </div>
            <button className="btn-gold" style={{ padding:"13px 36px", borderRadius:8, fontSize:12 }} onClick={close}>Close</button>
          </div>
        ) : (
          <>
            <div style={{marginBottom:24}}>
              <div style={stag}>Auto Realm</div>
              <h3 className="sr" style={{fontSize:26, fontWeight:400, marginTop:6}}>
                {step===1?"Choose Service":isCarRequest?(isOnDemand?"Car on Demand":"JDM Import Inquiry"):step===2?"Trip Details":step===3?"Your Info":"Documents & Contract"}
              </h3>
              <div style={{display:"flex",gap:6,marginTop:14}}>
                {Array.from({length:totalSteps}).map((_,i)=>{
                  const n = i+1;
                  return <div key={n} style={{flex:1,height:3,borderRadius:2,background:n<=step?G:"#1e1e1e",transition:"background .3s"}}/>;
                })}
              </div>
            </div>

            {step===1 && (
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                <div>
                  <label>Tap to select a service</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
                    {[
                      {id:"rental",l:"🚗 Self-Drive Rental"},
                      {id:"chauffeur",l:"👔 Chauffeur / Limo"},
                      {id:"transfer",l:"✈️ Airport Transfer"},
                      {id:"fifa",l:"⚽ FIFA 2026"},
                      {id:"ondemand",l:"🔑 Car on Demand"},
                      {id:"import",l:"🇯🇵 JDM Import"},
                    ].map(s=>(
                      <div key={s.id} onClick={()=>pickService(s.id)} style={{
                        padding:"16px 14px", borderRadius:10, cursor:"pointer", fontSize:13, textAlign:"center",
                        border:"1px solid #1e1e1e",
                        background:"rgba(255,255,255,.02)", color:"#aaa",
                        transition:"all .2s ease",
                        fontWeight:500
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.background="rgba(191,149,63,.08)";e.currentTarget.style.color="#fff";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e1e1e";e.currentTarget.style.background="rgba(255,255,255,.02)";e.currentTarget.style.color="#aaa";}}
                      >{s.l}</div>
                    ))}
                  </div>
                  <p style={{fontSize:11,color:"#444",marginTop:14,textAlign:"center",letterSpacing:".06em"}}>↑ Tap any service to continue</p>
                </div>
              </div>
            )}

            {step===2 && isCarRequest && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <ContactBar/>
                <p style={{fontSize:12,color:"#666",lineHeight:1.7,marginTop:-4}}>
                  {isOnDemand
                    ? "Tell us what car you want and we'll source it. Lambo, Ferrari, G-Wagon, Rolls — any year, any color."
                    : "Tell us what JDM car you want imported from Japan. We handle sourcing, shipping, and US compliance."}
                </p>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label>Make *</label>
                    <input list="car-makes" placeholder="Lamborghini" value={form.carMake} onChange={e=>u("carMake",e.target.value)}/>
                    <datalist id="car-makes">
                      {CAR_MAKES.map(m=><option key={m} value={m}/>)}
                    </datalist>
                  </div>
                  <div><label>Model *</label>
                    <input placeholder="Urus, Cullinan, GT-R…" value={form.carModel} onChange={e=>u("carModel",e.target.value)}/>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label>Year</label>
                    <select value={form.carYear} onChange={e=>u("carYear",e.target.value)}>
                      <option value="">Any year</option>
                      {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div><label>Color Preference</label>
                    <select value={form.carColor} onChange={e=>u("carColor",e.target.value)}>
                      <option value="">Any color</option>
                      {COLORS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {isOnDemand && (
                  <div><label>When do you need it?</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <input type="date" value={form.date} onChange={e=>u("date",e.target.value)} style={{colorScheme:"dark"}}/>
                      <select value={form.hours} onChange={e=>u("hours",e.target.value)}>
                        <option>1 day</option><option>2-3 days</option><option>1 week</option><option>2 weeks</option><option>1 month+</option>
                      </select>
                    </div>
                  </div>
                )}

                <div><label>Additional Specs / Notes</label>
                  <textarea placeholder={isImport ? "Trim level, RHD/LHD, mileage limit, mods, budget range…" : "Special requests, trim, additional details…"} rows={3} value={form.carNotes} onChange={e=>u("carNotes",e.target.value)} style={{resize:"vertical"}}/>
                </div>

                <div style={{display:"flex",gap:10,marginTop:6}}>
                  <button className="btn-ghost" style={{flex:1,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn-gold" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(3)} disabled={!form.carMake || !form.carModel}>Continue →</button>
                </div>
              </div>
            )}

            {step===2 && !isCarRequest && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {(form.service==="rental" || form.service==="chauffeur" || form.service==="fifa") && (
                  <div><label>Select Vehicle</label>
                    <select value={form.vehicle} onChange={e=>u("vehicle",e.target.value)}>
                      <option value="">Choose a vehicle…</option>
                      {CARS.map(c=>(<option key={c.id} value={c.name}>{c.year?`${c.year} `:""}{c.name}</option>))}
                      {(form.service==="chauffeur" || form.service==="fifa") && <option value="Escalade/Suburban">Cadillac Escalade / Suburban (7-Pass)</option>}
                      <option value="other">Not listed — request a different car</option>
                    </select>
                  </div>
                )}

                <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:12}}>
                  <div><label>Pickup Address *</label>
                    <input placeholder="Street address, hotel, or venue…" value={form.pickup} onChange={e=>u("pickup",e.target.value)}/>
                  </div>
                  <div><label>ZIP</label>
                    <input placeholder="10001" value={form.pickupZip} onChange={e=>u("pickupZip",e.target.value)} maxLength={5}/>
                  </div>
                </div>

                {(isChauffeur||form.service==="transfer") && (
                  <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:12}}>
                    <div><label>Dropoff / Destination</label>
                      <input placeholder="Airport, address, or venue…" value={form.dropoff} onChange={e=>u("dropoff",e.target.value)}/>
                    </div>
                    <div><label>ZIP</label>
                      <input placeholder="11430" value={form.dropoffZip} onChange={e=>u("dropoffZip",e.target.value)} maxLength={5}/>
                    </div>
                  </div>
                )}

                {form.service==="rental" && (
                  <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:12}}>
                    <div><label>Return Location</label>
                      <input placeholder="Return address…" value={form.dropoff} onChange={e=>u("dropoff",e.target.value)}/>
                    </div>
                    <div><label>ZIP</label>
                      <input placeholder="10001" value={form.dropoffZip} onChange={e=>u("dropoffZip",e.target.value)} maxLength={5}/>
                    </div>
                  </div>
                )}

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label>Date *</label>
                    <input type="date" value={form.date} onChange={e=>u("date",e.target.value)} style={{colorScheme:"dark"}}/>
                  </div>
                  <div><label>Time *</label>
                    <input type="time" value={form.time} onChange={e=>u("time",e.target.value)} style={{colorScheme:"dark"}}/>
                  </div>
                </div>

                {form.service==="rental" && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div><label>Return Date</label>
                      <input type="date" value={form.returnDate} onChange={e=>u("returnDate",e.target.value)} style={{colorScheme:"dark"}}/>
                    </div>
                    <div><label>Return Time</label>
                      <input type="time" value={form.returnTime} onChange={e=>u("returnTime",e.target.value)} style={{colorScheme:"dark"}}/>
                    </div>
                  </div>
                )}

                {isChauffeur && (
                  <div><label>Duration</label>
                    <select value={form.hours} onChange={e=>u("hours",e.target.value)}>
                      {[3,4,5,6,7,8,10,12].map(h=><option key={h} value={h}>{h} hours{h===12?" (full day)":""}</option>)}
                    </select>
                  </div>
                )}

                {isChauffeur && (
                  <div>
                    <label>Itinerary <span style={{textTransform:"none",color:"#555"}}>(stops & schedule)</span></label>
                    <textarea
                      placeholder="e.g. 5:00 PM — Pickup at Plaza Hotel · 6:00 PM — Dinner at Tao Downtown · 9:00 PM — Drinks at 1 OAK · 12:00 AM — Drop-off at hotel"
                      rows={4}
                      value={form.itinerary}
                      onChange={e=>u("itinerary",e.target.value)}
                      style={{resize:"vertical"}}
                    />
                    <p style={{fontSize:11,color:"#555",marginTop:6}}>Tell us your plan — venues, stops, timing. The chauffeur will follow your schedule.</p>
                  </div>
                )}

                <div><label>Passengers</label>
                  <select value={form.pax} onChange={e=>u("pax",e.target.value)}>
                    {[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} passenger{n>1?"s":""}</option>)}
                  </select>
                </div>

                <div style={{display:"flex",gap:10,marginTop:6}}>
                  <button className="btn-ghost" style={{flex:1,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn-gold" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {step===3 && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label>Full Name *</label>
                    <input placeholder="Your full name" value={form.name} onChange={e=>u("name",e.target.value)}/>
                  </div>
                  <div><label>Phone *</label>
                    <input placeholder="+1 (XXX) XXX-XXXX" value={form.phone} onChange={e=>u("phone",e.target.value)}/>
                  </div>
                </div>
                <div><label>Email *</label>
                  <input type="email" placeholder="you@email.com" value={form.email} onChange={e=>u("email",e.target.value)}/>
                </div>
                <div><label>Notes (optional)</label>
                  <textarea placeholder="Special requests, flight number, additional details…" rows={3} value={form.notes} onChange={e=>u("notes",e.target.value)} style={{resize:"vertical"}}/>
                </div>
                <div style={{background:"#080808",border:"1px solid #181818",borderRadius:8,padding:"16px 18px",fontSize:13,color:"#555",lineHeight:1.9}}>
                  <div style={{color:G,fontSize:10,letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Summary</div>
                  <div>Service: <span style={{color:"#bbb"}}>{form.service==="ondemand"?"Car on Demand":form.service==="import"?"JDM Import":form.service==="fifa"?"FIFA 2026":form.service.charAt(0).toUpperCase()+form.service.slice(1)}</span></div>
                  {form.vehicle && !isCarRequest && <div>Vehicle: <span style={{color:"#bbb"}}>{form.vehicle}</span></div>}
                  {isCarRequest && form.carMake && <div>Want: <span style={{color:"#bbb"}}>{form.carYear} {form.carMake} {form.carModel} {form.carColor?`(${form.carColor})`:""}</span></div>}
                  {form.pickup && <div>Pickup: <span style={{color:"#bbb"}}>{form.pickup}{form.pickupZip&&`, ${form.pickupZip}`}</span></div>}
                  {form.date && <div>Date: <span style={{color:"#bbb"}}>{form.date} {form.time}</span></div>}
                  {form.itinerary && <div>Itinerary: <span style={{color:"#bbb"}}>{form.itinerary.substring(0,60)}{form.itinerary.length>60?"…":""}</span></div>}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn-ghost" style={{flex:1,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(2)} disabled={submitting}>← Back</button>
                  {isRental ? (
                    <button className="btn-gold" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(4)} disabled={!form.name || !form.phone || !form.email}>
                      Continue to Contract →
                    </button>
                  ) : (
                    <button className="btn-gold" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:10}} onClick={submit} disabled={submitting || !form.name || !form.phone || !form.email}>
                      {submitting && <span className="spinner"/>}
                      {submitting ? "Sending…" : "Submit Inquiry ✓"}
                    </button>
                  )}
                </div>
                <p style={{fontSize:11,color:"#333",textAlign:"center",lineHeight:1.7}}>
                  {isRental ? "Next: review rental contract, upload documents, sign." : "You'll get a confirmation email · We'll reach out within 60 minutes."}
                </p>
              </div>
            )}

            {step===4 && isRental && (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {/* Auto-filled vehicle info preview */}
                <div style={{background:"linear-gradient(135deg,rgba(191,149,63,.12),rgba(191,149,63,.03))",border:"1px solid rgba(191,149,63,.25)",borderRadius:10,padding:"14px 18px"}}>
                  <div style={{fontSize:10,color:G,letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>You're renting</div>
                  <div style={{fontSize:15,color:"#fff",fontWeight:500,marginBottom:4}}>{form.vehicle || "—"}</div>
                  <div style={{fontSize:12,color:"#888",lineHeight:1.8}}>
                    📅 {form.date} {form.time && `· ${form.time}`}<br/>
                    📍 {form.pickup}{form.pickupZip&&`, ${form.pickupZip}`}<br/>
                    💰 Security deposit: <b style={{color:"#bf953f"}}>${CONFIG.SECURITY_DEPOSIT.toLocaleString()}</b> · Zelle to <span style={{color:"#aaa"}}>{CONFIG.ZELLE_ADDRESS}</span>
                  </div>
                </div>

                {/* Key contract terms summary */}
                <div style={{background:"#080808",border:"1px solid #181818",borderRadius:10,padding:"16px 20px"}}>
                  <div style={{fontSize:10,color:G,letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Key Terms — please read carefully</div>
                  <ul style={{margin:0,padding:"0 0 0 18px",fontSize:11,color:"#999",lineHeight:1.9}}>
                    <li><b style={{color:"#ccc"}}>Mileage:</b> 125 mi/day · $0.50/mi over</li>
                    <li><b style={{color:"#ccc"}}>Travel:</b> Tri-State only · No Canada/Mexico</li>
                    <li><b style={{color:"#ccc"}}>Insurance:</b> Full coverage required (proof at pickup)</li>
                    <li><b style={{color:"#ccc"}}>Smoking/vaping:</b> $200 cleaning fee</li>
                    <li><b style={{color:"#ccc"}}>Rim damage:</b> $1,000 per rim · Tire $250 each</li>
                    <li><b style={{color:"#ccc"}}>Late return:</b> $125/hr or daily rate</li>
                    <li><b style={{color:"#ccc"}}>GPS tracking:</b> Vehicle is monitored throughout rental</li>
                    <li><b style={{color:"#ccc"}}>Prohibited:</b> Rideshare, racing, off-road, sub-renting</li>
                  </ul>
                  <a href={CONFIG.CONTRACT_PDF_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:12,fontSize:11,color:G,textDecoration:"underline",letterSpacing:".05em"}}>
                    📄 Read full agreement (PDF) →
                  </a>
                </div>

                {/* File uploads */}
                <div>
                  <label>Driver's License — Front *</label>
                  <input type="file" accept="image/*,application/pdf" onChange={e=>u("licenseFront",e.target.files?.[0]||null)} style={{padding:"10px",fontSize:12}}/>
                  {form.licenseFront && <p style={{fontSize:10,color:"#888",marginTop:4}}>✓ {form.licenseFront.name}</p>}
                </div>
                <div>
                  <label>Driver's License — Back *</label>
                  <input type="file" accept="image/*,application/pdf" onChange={e=>u("licenseBack",e.target.files?.[0]||null)} style={{padding:"10px",fontSize:12}}/>
                  {form.licenseBack && <p style={{fontSize:10,color:"#888",marginTop:4}}>✓ {form.licenseBack.name}</p>}
                </div>
                <div>
                  <label>Insurance Proof — Full Coverage Declarations Page *</label>
                  <input type="file" accept="image/*,application/pdf" onChange={e=>u("insuranceDoc",e.target.files?.[0]||null)} style={{padding:"10px",fontSize:12}}/>
                  {form.insuranceDoc && <p style={{fontSize:10,color:"#888",marginTop:4}}>✓ {form.insuranceDoc.name}</p>}
                  <p style={{fontSize:10,color:"#444",marginTop:6,lineHeight:1.6}}>Photo or PDF. Must show your name, coverage type, and effective dates.</p>
                </div>

                {/* Digital signature */}
                <div style={{background:"#080808",border:"1px solid #181818",borderRadius:10,padding:"16px 20px"}}>
                  <div style={{fontSize:10,color:G,letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>Digital Signature</div>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:14}}>
                    <div>
                      <label style={{fontSize:10}}>Type your full legal name *</label>
                      <input placeholder="John A. Smith" value={form.signatureName} onChange={e=>u("signatureName",e.target.value)} style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:18}}/>
                    </div>
                    <div>
                      <label style={{fontSize:10}}>Date</label>
                      <input type="date" value={form.signatureDate} onChange={e=>u("signatureDate",e.target.value)} style={{colorScheme:"dark"}}/>
                    </div>
                  </div>
                  <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",fontSize:11,color:"#aaa",lineHeight:1.6}}>
                    <input type="checkbox" checked={form.agreedToTerms} onChange={e=>u("agreedToTerms",e.target.checked)} style={{marginTop:3,width:16,height:16,accentColor:G,cursor:"pointer",flexShrink:0}}/>
                    <span>I have read, fully understood, and voluntarily agree to all terms of the Auto Realm Luxury &amp; Exotic Car Rental Agreement. I accept full responsibility for the vehicle, agree to the $1,000 security deposit and GPS tracking, and confirm all information is accurate. <b style={{color:"#ccc"}}>My typed name above serves as my legal electronic signature</b> under the E-SIGN Act.</span>
                  </label>
                </div>

                <div style={{display:"flex",gap:10}}>
                  <button className="btn-ghost" style={{flex:1,padding:"13px",borderRadius:8,fontSize:13}} onClick={()=>setStep(3)} disabled={submitting}>← Back</button>
                  <button className="btn-gold" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:10}} onClick={submit} disabled={submitting || !form.signatureName || !form.agreedToTerms || !form.licenseFront || !form.licenseBack || !form.insuranceDoc}>
                    {submitting && <span className="spinner"/>}
                    {submitting ? "Submitting…" : "Sign & Submit Booking ✓"}
                  </button>
                </div>
                <p style={{fontSize:11,color:"#333",textAlign:"center",lineHeight:1.7}}>By submitting, your booking + signed agreement + documents go to Auto Realm. We confirm within 60 minutes.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AutoRealm() {
  const [cat, setCat] = useState("all");
  const [per, setPer] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [initCar, setInitCar] = useState(null);
  const [initSvc, setInitSvc] = useState("rental");
  const [mNav, setMNav] = useState(false);

  const openBook = (car=null, svc="rental") => {
    setInitCar(car); setInitSvc(svc); setBookOpen(true);
    if (typeof document !== "undefined") document.body.style.overflow="hidden";
  };
  const closeBook = () => {
    setBookOpen(false);
    if (typeof document !== "undefined") document.body.style.overflow="";
  };

  const scroll = id => {
    if (typeof document !== "undefined") document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
    setMNav(false);
  };

  const filtered = cat==="all" ? CARS : CARS.filter(c=>c.cat===cat);

  const price = car => {
    if(per===0) return car.d?`$${car.d.toLocaleString()}`:"—";
    if(per===1) return car.w?`$${car.w.toLocaleString()}`:"Inquire";
    return car.m?`$${car.m.toLocaleString()}`:"Inquire";
  };
  const plabel = ["/day","/week","/month"][per];

  return (
    <div style={{background:"#060606",color:"#fff",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <Styles/>

      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:900,height:68, display:"flex",alignItems:"center",justifyContent:"space-between", padding:"0 32px", background:"rgba(6,6,6,.94)",backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>scroll("hero")}>
          <div style={{ width:38,height:38,borderRadius:"50%", border:`1px solid ${G}`, display:"flex",alignItems:"center",justifyContent:"center", flexShrink:0 }}>
            <span style={{color:G,fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontWeight:700}}>AR</span>
          </div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:600,letterSpacing:".16em",lineHeight:1.1}}>AUTO REALM</div>
            <div style={{fontSize:8,letterSpacing:".22em",color:"#444",textTransform:"uppercase"}}>Luxury · Limo · Import</div>
          </div>
        </div>
        <div className="mob-hide" style={{display:"flex",alignItems:"center",gap:28}}>
          {[["Fleet","fleet"],["On Demand","ondemand"],["Chauffeur","chauffeur"],["Transfers","transfers"],["FIFA 2026","fifa"],["Imports","imports"]].map(([l,id])=>(
            <button key={id} className="nav-lnk" onClick={()=>scroll(id)}>{l}</button>
          ))}
        </div>
        <button className="btn-gold mob-hide" style={{padding:"10px 26px",borderRadius:6,fontSize:11}} onClick={()=>openBook()}>Book Now</button>
        <button className="mob-only" onClick={()=>setMNav(!mNav)} style={{background:"none",border:"1px solid #222",color:"#fff",padding:"8px 13px",borderRadius:6,cursor:"pointer",fontSize:17}}>{mNav?"✕":"☰"}</button>
      </nav>

      {mNav && (
        <div style={{ position:"fixed",top:68,left:0,right:0,zIndex:800, background:"#0a0a0a",borderBottom:"1px solid #181818", padding:"20px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          {[["Fleet","fleet"],["On Demand","ondemand"],["Chauffeur","chauffeur"],["Transfers","transfers"],["FIFA 2026","fifa"],["Imports","imports"]].map(([l,id])=>(
            <button key={id} className="nav-lnk" style={{textAlign:"left",fontSize:13}} onClick={()=>scroll(id)}>{l}</button>
          ))}
          <button className="btn-gold" style={{padding:"13px",borderRadius:8,fontSize:13,marginTop:6}} onClick={()=>{setMNav(false);openBook();}}>Book Now</button>
        </div>
      )}

      <section id="hero" style={{ minHeight:"100vh", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center", textAlign:"center",padding:"130px 24px 80px", position:"relative",overflow:"hidden" }}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 90% 60% at 50% 35%, rgba(191,149,63,.07) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"50px 50px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:280,background:"linear-gradient(to top,#060606,transparent)",pointerEvents:"none"}}/>
        <div className="fu1" style={{...stag,marginBottom:18}}>New York City's Premier Luxury Experience</div>
        <h1 className="sr fu2" style={{ fontSize:"clamp(70px,16vw,148px)", fontWeight:300, letterSpacing:"0.1em", lineHeight:.9, marginBottom:4 }}>AUTO</h1>
        <h1 className="sr fu2 gold-text" style={{ fontSize:"clamp(70px,16vw,148px)", fontWeight:700, letterSpacing:"0.1em", lineHeight:.9, marginBottom:36 }}>REALM</h1>
        <p className="fu3" style={{fontSize:"clamp(14px,2vw,16px)",color:"#555",maxWidth:480,lineHeight:1.85,letterSpacing:".02em",marginBottom:48}}>Exotic rentals, elite chauffeur services & Japanese imports — where every drive is an experience.</p>
        <div className="fu4" style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
          <button className="btn-gold" style={{padding:"14px 38px",borderRadius:8,fontSize:12}} onClick={()=>scroll("fleet")}>Explore Fleet</button>
          <button className="btn-ghost" style={{padding:"14px 38px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"chauffeur")}>Book Chauffeur</button>
          <button className="btn-white" style={{padding:"14px 38px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"ondemand")}>Car on Demand ↗</button>
        </div>
        <div className="fu4" style={{ display:"flex",gap:0,marginTop:72, border:"1px solid rgba(255,255,255,.05)",borderRadius:12, background:"rgba(255,255,255,.02)",backdropFilter:"blur(6px)", overflow:"hidden",flexWrap:"wrap" }}>
          {[
            ["⭐ 5-Star","Trusted by 500+ clients"],
            ["50+","Cars · Fleet + On-Demand"],
            ["24/7","Same-Day Availability"],
            ["NYC · NJ · DMV","Delivered to Your Door"],
          ].map(([n,l],i)=>(
            <div key={l} style={{ padding:"24px 36px",textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.05)":"none", flex:"1 1 auto" }}>
              <div className="sr gold-text" style={{fontSize:24,fontWeight:600,lineHeight:1.1}}>{n}</div>
              <div style={{fontSize:10,color:"#444",letterSpacing:".1em",textTransform:"uppercase",marginTop:8,whiteSpace:"nowrap"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",animation:"pulse 2.5s infinite",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{width:1,height:50,background:`linear-gradient(to bottom,transparent,${G}55)`}}/>
          <span style={{fontSize:9,letterSpacing:".25em",color:"#333",textTransform:"uppercase"}}>Scroll</span>
        </div>
      </section>

      <Sec id="fleet">
        <div style={{marginBottom:52}}>
          <div style={stag}>The Collection</div>
          <div style={divider}/>
          <h2 className="sr" style={stitle}>Our Fleet</h2>
          <p style={{color:"#4a4a4a",fontSize:15,marginTop:12,maxWidth:440,lineHeight:1.8}}>Handpicked performance and luxury vehicles — each with its own story and presence.</p>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,marginBottom:44,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {CATS.map(f=>(<button key={f.id} className={`filter-btn${cat===f.id?" active":""}`} onClick={()=>setCat(f.id)}>{f.l}</button>))}
          </div>
          <div style={{display:"flex"}}>
            {["Daily","Weekly","Monthly"].map((p,i)=>(<button key={p} className={`period-btn${per===i?" active":""}`} onClick={()=>setPer(i)}>{p}</button>))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:22}}>
          {filtered.map(car=>(<FleetCard key={car.id} car={car} per={per} plabel={plabel} price={price(car)} onBook={openBook}/>))}
          {cat==="all" && <OnDemandCard onClick={()=>openBook(null,"ondemand")}/>}
        </div>
      </Sec>

      <section id="ondemand" style={{background:"#080808",padding:"96px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{ background:"linear-gradient(135deg, rgba(191,149,63,.08), rgba(191,149,63,.02))", border:"1px solid rgba(191,149,63,.2)", borderRadius:18, padding:"56px 48px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-100, right:-100, width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle, rgba(191,149,63,.12), transparent 70%)`, pointerEvents:"none" }}/>
            <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48,alignItems:"center",position:"relative"}} className="mob-1col">
              <div>
                <div style={{...stag,color:G,marginBottom:14}}>🔑 Beyond Our Fleet</div>
                <h2 className="sr" style={{...stitle,marginBottom:18}}>Any Car. <span className="gold-text">On Demand.</span></h2>
                <p style={{color:"#666",fontSize:15,lineHeight:1.85,marginBottom:28,maxWidth:520}}>Want a Lamborghini Urus for your wedding? Rolls Royce Cullinan for a music video? G-Wagon Brabus for a weekend? We source any exotic, luxury, or specialty vehicle on request — short or long term.</p>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
                  {["Lamborghini, Ferrari, McLaren, Porsche","Rolls Royce, Bentley, Maybach","G-Wagon, Cullinan, Urus, Defender","Any year, any spec, any color","Daily, weekly, or monthly terms"].map(f=>(
                    <div key={f} style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:G,flexShrink:0}}/>
                      <span style={{fontSize:13,color:"#777"}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-gold" style={{padding:"14px 38px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"ondemand")}>Submit Your Request →</button>
              </div>
              <div style={{ background:"#0d0d0d", border:"1px solid #1c1c1c", borderRadius:14, padding:"30px", textAlign:"center" }}>
                <div style={{fontSize:54,marginBottom:14,opacity:.9}}>🔑</div>
                <div className="sr" style={{fontSize:22,fontWeight:500,marginBottom:10}}>Average Response</div>
                <div className="sr gold-text" style={{fontSize:48,fontWeight:600,lineHeight:1,marginBottom:6}}>&lt; 2 hrs</div>
                <p style={{fontSize:12,color:"#555",marginTop:14,lineHeight:1.7}}>From request to quote. We work fast because you need to drive faster.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chauffeur" style={{background:"#060606",padding:"96px 28px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"start"}} className="mob-1col">
            <div>
              <div style={stag}>Elite Service</div>
              <div style={divider}/>
              <h2 className="sr" style={stitle}>Chauffeur &<br/>Limo Services</h2>
              <p style={{color:"#4a4a4a",fontSize:15,marginTop:14,lineHeight:1.85,maxWidth:400}}>Professional drivers, immaculate vehicles, and flawless logistics. Airport runs, corporate events, prom nights — we arrive early, every time.</p>
              <div style={{marginTop:36,display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {i:"✈️", t:"Airport Transfers", d:"JFK · LGA · Newark — flat rates + gratuity", fn:()=>scroll("transfers")},
                  {i:"⏱", t:"Hourly Chauffeur", d:"S580 from $125/hr · Escalade from $150/hr · 3hr min", fn:()=>openBook(null,"chauffeur")},
                  {i:"🎓", t:"Prom & Events", d:"Full packages with photoshoot — from $400", fn:()=>scroll("events")},
                  {i:"⚽", t:"FIFA 2026 Packages", d:"Game-day arrivals — book your match-day ride now", fn:()=>openBook(null,"chauffeur")},
                  {i:"📸", t:"Photoshoot & Content", d:"Hourly packages with scenic routes around NYC", fn:()=>openBook(null,"chauffeur")},
                ].map(s=>(
                  <div key={s.t} className="svc-row" onClick={s.fn}>
                    <span style={{fontSize:20,lineHeight:1,flexShrink:0}}>{s.i}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:14,marginBottom:3}}>{s.t}</div>
                      <div style={{fontSize:12,color:"#4a4a4a",lineHeight:1.5}}>{s.d}</div>
                    </div>
                    <span style={{color:"#2a2a2a",fontSize:16,flexShrink:0}}>→</span>
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{marginTop:36,padding:"14px 40px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"chauffeur")}>Book Chauffeur</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[
                {name:"Mercedes-Benz S580 AMG", detail:"Self-Drive: $495/day · 12-Hour Full Day Chauffeur: $1,100 + tax", hourly:"$125/hr", min:"3-hr min", extra:"Tips excluded · Full-day chauffeur available"},
                {name:"Cadillac Escalade / Suburban", detail:"7-passenger premium SUV · Self-drive $395/day", hourly:"$150/hr", min:"2-hr min", extra:"Available for self-rental & chauffeur"},
              ].map(v=>(
                <div key={v.name} style={{ background:"#0d0d0d",border:"1px solid #181818",borderRadius:12,padding:"24px 28px" }}>
                  <div className="sr" style={{fontSize:20,fontWeight:500,marginBottom:8,letterSpacing:".02em"}}>{v.name}</div>
                  <div style={{fontSize:12,color:"#4a4a4a",lineHeight:1.7,marginBottom:6}}>{v.detail}</div>
                  <div style={{fontSize:11,color:"#333",marginBottom:18,letterSpacing:".06em"}}>{v.extra}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div>
                      <span className="sr gold-text" style={{fontSize:28,fontWeight:600}}>{v.hourly}</span>
                      <span style={{fontSize:11,color:"#444",marginLeft:6}}>{v.min}</span>
                    </div>
                    <button className="btn-ghost" style={{padding:"9px 20px",borderRadius:6,fontSize:11}} onClick={()=>openBook(null,"chauffeur")}>Reserve</button>
                  </div>
                </div>
              ))}
              <div style={{ background:"rgba(191,149,63,.05)",border:"1px solid rgba(191,149,63,.15)", borderRadius:10,padding:"18px 22px" }}>
                <div style={{fontSize:12,color:G,fontWeight:600,letterSpacing:".08em",marginBottom:6}}>⭐ Full Day Package</div>
                <div style={{fontSize:13,color:"#666",lineHeight:1.7}}>12-hour Mercedes S580 chauffeur day for <strong style={{color:"#bbb"}}>$1,100 + tax</strong>. Perfect for weddings, corporate, and city tours.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sec id="transfers" style={{background:"#080808"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={stag}>Flat-Rate · No Surge Pricing</div>
          <div style={{...divider,margin:"14px auto"}}/>
          <h2 className="sr" style={stitle}>Airport Transfers</h2>
          <p style={{color:"#4a4a4a",fontSize:15,marginTop:12,maxWidth:420,margin:"12px auto 0",lineHeight:1.8}}>Fixed flat rates — no surprises, no meter running. Plus gratuity.</p>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
            <thead>
              <tr style={{borderBottom:"1px solid #181818"}}>
                {["Route","Mercedes S580","Escalade / Suburban","Note"].map((h,i)=>(<th key={h} style={{ padding:"12px 20px",fontSize:10,color:"#383838", letterSpacing:".12em",textTransform:"uppercase",fontWeight:500, textAlign:i===0?"left":i===3?"right":"center" }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {TRANSFERS.map((t,i)=>(
                <tr key={t.route} style={{borderBottom:"1px solid #111",background:i%2?"rgba(255,255,255,.01)":"transparent"}}>
                  <td style={{padding:"22px 20px",fontSize:16,fontWeight:500,letterSpacing:".02em"}}>{t.route}</td>
                  <td style={{padding:"22px 20px",textAlign:"center"}}><span className="sr gold-text" style={{fontSize:26,fontWeight:600}}>${t.s580}</span></td>
                  <td style={{padding:"22px 20px",textAlign:"center"}}><span style={{fontSize:22,color:"#bbb",fontWeight:500}}>${t.esc}</span></td>
                  <td style={{padding:"22px 20px",textAlign:"right",fontSize:12,color:"#3a3a3a"}}>+ Gratuity</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{textAlign:"center",marginTop:44}}>
          <button className="btn-gold" style={{padding:"14px 44px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"transfer")}>Book a Transfer</button>
        </div>
      </Sec>

      <section id="events" style={{background:"#060606",padding:"96px 28px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{marginBottom:52}}>
            <div style={stag}>Special Occasions</div>
            <div style={divider}/>
            <h2 className="sr" style={stitle}>Prom & Event<br/>Packages</h2>
            <p style={{color:"#4a4a4a",fontSize:15,marginTop:12,maxWidth:500,lineHeight:1.8}}>All-inclusive packages: vehicle, chauffeur, and photoshoot time. Arrive like you own it.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:18}}>
            {PROMS.map(p=>(
              <div key={p.car} style={{ background:"#0d0d0d",border:"1px solid #181818",borderRadius:12, padding:"26px",boxShadow:"0 4px 16px rgba(0,0,0,.4)" }}>
                <div className="sr" style={{fontSize:18,fontWeight:500,marginBottom:18,lineHeight:1.3,letterSpacing:".02em"}}>{p.car}</div>
                {[{l:"2hr Shoot + Transfer",v:p.p2},{l:"4hr Shoot + Transfer",v:p.p4}].map(pkg=>(
                  <div key={pkg.l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center", padding:"14px 0",borderBottom:"1px solid #161616" }}>
                    <span style={{fontSize:12,color:"#555"}}>{pkg.l}</span>
                    <span className="sr gold-text" style={{fontSize:22,fontWeight:600}}>${pkg.v}</span>
                  </div>
                ))}
                <button className="btn-ghost" style={{width:"100%",marginTop:20,padding:"10px",borderRadius:6,fontSize:11}} onClick={()=>openBook(null,"chauffeur")}>Book This Package</button>
              </div>
            ))}
          </div>
          <div id="fifa" style={{ marginTop:48, background:"linear-gradient(135deg,rgba(191,149,63,.10),rgba(191,149,63,.03))", border:"1px solid rgba(191,149,63,.25)",borderRadius:18, padding:"44px 40px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:`radial-gradient(circle, rgba(191,149,63,.15), transparent 70%)`, pointerEvents:"none" }}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:11,letterSpacing:".18em",color:G,textTransform:"uppercase",fontWeight:600,marginBottom:10}}>⚽ FIFA World Cup 2026 · NYC · MetLife Stadium</div>
              <h2 className="sr" style={{fontSize:"clamp(28px,4vw,40px)",fontWeight:400,marginBottom:12,letterSpacing:".01em",lineHeight:1.2}}>FIFA World Cup 2026 <span className="gold-text">Chauffeur</span></h2>
              <p style={{fontSize:15,color:"#888",lineHeight:1.7,maxWidth:620,marginBottom:28}}>
                Seamless luxury transport to MetLife Stadium. Book early — the world is coming to NYC and demand will be unprecedented.
              </p>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,marginBottom:32}}>
                {[
                  {i:"✈️", t:"International VIP Service", d:"Airport transfers from JFK, LGA & EWR — flat rates, white-glove pickup, multilingual support"},
                  {i:"🌎", t:"Global Fleet Experience", d:"Japanese imports, exotics & premium luxury vehicles to match every taste and culture"},
                  {i:"🗣", t:"Multilingual Chauffeurs", d:"Serving clients from around the world — English, Spanish, Urdu, Hindi, Arabic, French available"},
                ].map(b=>(
                  <div key={b.t} style={{background:"rgba(0,0,0,.35)",border:"1px solid rgba(191,149,63,.15)",borderRadius:12,padding:"22px 24px"}}>
                    <div style={{fontSize:24,marginBottom:10}}>{b.i}</div>
                    <div className="sr" style={{fontSize:17,fontWeight:500,marginBottom:8,letterSpacing:".01em"}}>{b.t}</div>
                    <div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{b.d}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <button className="btn-gold" style={{padding:"15px 38px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"fifa")}>Book FIFA Package →</button>
                <button className="btn-ghost" style={{padding:"15px 38px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"transfer")}>Airport Transfer</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sec id="imports">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"center"}} className="mob-1col">
          <div>
            <div style={stag}>Direct from Japan</div>
            <div style={divider}/>
            <h2 className="sr" style={stitle}>Japanese<br/>Imports</h2>
            <p style={{color:"#4a4a4a",fontSize:15,marginTop:14,lineHeight:1.85,maxWidth:420}}>We source and ship rare JDM vehicles directly from Japan to the USA — door to door. From JDM legends to modern classics, if it rolls in Japan, we can get it here.</p>
            <div style={{marginTop:28,display:"flex",flexDirection:"column",gap:10}}>
              {["Custom orders from Japan on demand","Full US compliance & inspection","Transparent door-to-door pricing","Rare & limited production vehicles available","Trucks, sports cars & SUVs"].map(f=>(
                <div key={f} style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:G,flexShrink:0}}/>
                  <span style={{fontSize:13,color:"#666"}}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:14,marginTop:38,flexWrap:"wrap"}}>
              <button className="btn-gold" style={{padding:"14px 32px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"import")}>Inquire Now</button>
              <button className="btn-ghost" style={{padding:"14px 32px",borderRadius:8,fontSize:12}} onClick={()=>openBook(null,"import")}>Order a Car</button>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{ background:"#0d0d0d",border:"1px solid #181818",borderRadius:12, padding:"30px",textAlign:"center" }}>
              <div style={{fontSize:44,marginBottom:14,opacity:.35}}>🇯🇵</div>
              <div className="sr" style={{fontSize:22,fontWeight:500,marginBottom:8}}>Current Inventory</div>
              <p style={{color:"#4a4a4a",fontSize:13,lineHeight:1.8,marginBottom:20}}>New JDM vehicles arriving soon. Contact us for latest available inventory and custom import orders.</p>
              <div style={{ padding:"12px 18px",background:"rgba(191,149,63,.07)", border:"1px solid rgba(191,149,63,.18)",borderRadius:8, fontSize:12,color:G,fontWeight:500 }}>📦 Vehicles in transit — inquire for details</div>
            </div>
            <div style={{background:"#0d0d0d",border:"1px solid #181818",borderRadius:12,padding:"24px"}}>
              <div style={{...stag,marginBottom:16}}>How It Works</div>
              {[["01","Tell us what you want","JDM model, year, specs"],["02","We source it in Japan","Verified, inspected, auction or private"],["03","We ship & comply","Full customs & US compliance handled"],["04","Delivered to your door","NYC and surrounding areas"]].map(([n,t,d])=>(
                <div key={n} style={{display:"flex",gap:14,marginBottom:18,alignItems:"flex-start"}}>
                  <div style={{ width:28,height:28,borderRadius:"50%", border:`1px solid ${G}22`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10,color:G,fontWeight:600,flexShrink:0,marginTop:2 }}>{n}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{t}</div>
                    <div style={{fontSize:11,color:"#444"}}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sec>

      <footer id="contact" style={{background:"#030303",borderTop:"1px solid #111",padding:"80px 28px 36px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:56}} className="mob-1col">
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,letterSpacing:".14em",marginBottom:14}}>AUTO <span className="gold-text">REALM</span></div>
              <p style={{color:"#383838",fontSize:13,lineHeight:1.85,maxWidth:270,marginBottom:24}}>New York's premier destination for exotic car rentals, elite chauffeur services, and direct Japanese vehicle imports.</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <a href={CONFIG.INSTAGRAM} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{padding:"8px 14px",borderRadius:6,fontSize:11,textDecoration:"none",display:"inline-block"}}>📱 Instagram</a>
                <a href={CONFIG.TIKTOK} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{padding:"8px 14px",borderRadius:6,fontSize:11,textDecoration:"none",display:"inline-block"}}>🎵 TikTok</a>
                <a href={CONFIG.FACEBOOK} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{padding:"8px 14px",borderRadius:6,fontSize:11,textDecoration:"none",display:"inline-block"}}>👥 Facebook</a>
                <a href={CONFIG.WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{padding:"8px 14px",borderRadius:6,fontSize:11,textDecoration:"none",display:"inline-block"}}>💬 WhatsApp</a>
              </div>
            </div>
            <div>
              <div style={{...stag,marginBottom:18}}>Fleet</div>
              {CARS.map(c=>(<div key={c.id} style={{fontSize:12,color:"#383838",marginBottom:10,cursor:"pointer"}} onClick={()=>scroll("fleet")}>{c.name}</div>))}
              <div style={{fontSize:12,color:G,marginBottom:10,cursor:"pointer",fontWeight:500}} onClick={()=>openBook(null,"ondemand")}>Car on Demand →</div>
            </div>
            <div>
              <div style={{...stag,marginBottom:18}}>Services</div>
              {["Exotic Rentals","Chauffeur Service","Airport Transfers","Prom Packages","FIFA 2026","JDM Imports","Car on Demand"].map(s=>(<div key={s} style={{fontSize:12,color:"#383838",marginBottom:10,cursor:"pointer"}}>{s}</div>))}
            </div>
            <div>
              <div style={{...stag,marginBottom:18}}>Contact</div>
              <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{fontSize:13,flexShrink:0}}>📍</span>
                <span style={{fontSize:12,color:"#383838",lineHeight:1.5}}>New York City, NY</span>
              </div>
              <a href={`tel:${CONFIG.PHONE_RAW}`} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start",textDecoration:"none"}}>
                <span style={{fontSize:13,flexShrink:0}}>📞</span>
                <span style={{fontSize:12,color:"#888",lineHeight:1.5}}>{CONFIG.PHONE}</span>
              </a>
              <a href={`mailto:${CONFIG.EMAIL}`} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start",textDecoration:"none"}}>
                <span style={{fontSize:13,flexShrink:0}}>✉️</span>
                <span style={{fontSize:12,color:"#888",lineHeight:1.5}}>{CONFIG.EMAIL}</span>
              </a>
              <a href={CONFIG.WHATSAPP} target="_blank" rel="noopener noreferrer" style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start",textDecoration:"none"}}>
                <span style={{fontSize:13,flexShrink:0}}>💬</span>
                <span style={{fontSize:12,color:"#888",lineHeight:1.5}}>WhatsApp us</span>
              </a>
              <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{fontSize:13,flexShrink:0}}>⏰</span>
                <span style={{fontSize:12,color:"#383838",lineHeight:1.5}}>Available 24/7</span>
              </div>
              <button className="btn-gold" style={{marginTop:14,padding:"10px 24px",borderRadius:6,fontSize:11,width:"100%"}} onClick={()=>openBook()}>Book Now</button>
            </div>
          </div>
          <div style={{ borderTop:"1px solid #0e0e0e",paddingTop:24, display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
            <div style={{fontSize:11,color:"#2a2a2a"}}>© 2025 Auto Realm LLC · All rights reserved.</div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {["Privacy Policy","Terms & Conditions","Rental Agreement"].map(l=>(<span key={l} style={{fontSize:11,color:"#2a2a2a",cursor:"pointer"}}>{l}</span>))}
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Bottom Action Bar — 3 main services always 1 tap away */}
      <div className="mob-only" style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:850,
        background:"rgba(6,6,6,.96)", backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(191,149,63,.18)",
        padding:"10px 12px", display:"flex", gap:6,
        boxShadow:"0 -8px 24px rgba(0,0,0,.5)"
      }}>
        {[
          {l:"Rental",  i:"🚗", svc:"rental"},
          {l:"Chauffeur", i:"👔", svc:"chauffeur"},
          {l:"FIFA 2026", i:"⚽", svc:"fifa"},
        ].map(b=>(
          <button key={b.svc} onClick={()=>openBook(null,b.svc)} style={{
            flex:1, background:"linear-gradient(135deg,#BF953F,#FCF6BA,#BF953F)",
            backgroundSize:"200% auto", color:"#000", border:"none",
            padding:"11px 8px", borderRadius:8, fontSize:11,
            fontWeight:600, letterSpacing:".06em", textTransform:"uppercase",
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:5
          }}>
            <span style={{fontSize:14}}>{b.i}</span>{b.l}
          </button>
        ))}
      </div>

      <BookModal open={bookOpen} onClose={closeBook} initCar={initCar} initSvc={initSvc}/>
    </div>
  );
}
