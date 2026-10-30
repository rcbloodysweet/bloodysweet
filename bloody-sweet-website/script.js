/* ====== EDIT YOUR BUSINESS DETAILS HERE ====== */
const CONFIG = {
  phone: "917996234625",          // WhatsApp number with country code
  price: 20,                      // starting price per piece (₹)
  fssai: "",                      // add your FSSAI licence number here when you get it

  // Social links: paste your page links between the quotes
  social: { facebook: "", tiktok: "", x: "" },

  // Product photos: paste image links here when ready
  productPhoto: "",
  chocolatePhoto: "",             // photo link for the kunafa chocolate section
  chocolatePrice: "",             // e.g. "₹149" (leave empty to show "Price on WhatsApp")
  gallery: [],                    // e.g. ["https://.../kunafa-1.jpg", "https://.../kunafa-2.jpg"]

  // REAL customer reviews only, copied from WhatsApp / Instagram / Google
  // e.g. { name: "Customer's first name", area: "Koramangala", stars: 5, text: "What they said" }
  reviews: []
};
/* ============================================ */

const $ = s => document.querySelector(s);
const waLink = msg => "https://wa.me/" + CONFIG.phone + "?text=" + encodeURIComponent(msg);
const openWA = msg => { window.open(waLink(msg), "_blank", "noopener"); };

function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("show"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),2600); }

// All simple WhatsApp buttons
document.querySelectorAll("[data-wa]").forEach(a=>{ a.href = waLink(a.dataset.wa); a.target="_blank"; a.rel="noopener"; });

// Header shows after scrolling past hero
const topBar = $("#top");
const onScroll = () => topBar.classList.toggle("show", window.scrollY > 40 || $("#nav").classList.contains("open"));
window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

// Mobile menu
const menuBtn=$("#menuBtn"), nav=$("#nav");
menuBtn.addEventListener("click",()=>{ const o=nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded",o); onScroll(); });
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{ nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded",false); }));

// ---- Order builder ----
let qty = 1;
const MAX = 500;
function renderQty(){
  $("#qty").textContent = qty;
  $("#total").textContent = "₹" + (qty * CONFIG.price).toLocaleString("en-IN");
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed", Number(c.dataset.q)===qty));
}
$("#plus").addEventListener("click",()=>{ if(qty<MAX){qty++;renderQty();} else toast("For more than 500 pieces, use the bulk order form."); });
$("#minus").addEventListener("click",()=>{ if(qty>1){qty--;renderQty();} });
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{ qty=Number(c.dataset.q); renderQty(); }));
renderQty();

function setErr(input, msg){ const e = input.parentElement.querySelector(".err"); if(e) e.textContent = msg||""; input.setAttribute("aria-invalid", msg ? "true":"false"); return !msg; }

$("#sendOrder").addEventListener("click",()=>{
  const name=$("#oName"), area=$("#oArea");
  let ok = setErr(name, name.value.trim() ? "" : "Enter your name so we know who's ordering.");
  ok = setErr(area, area.value.trim() ? "" : "Enter your area so we can check delivery.") && ok;
  if(!ok){ (name.value.trim()?area:name).focus(); return; }
  const msg = `Hi Bloody Sweet! 🍫💚
I'd like to order:
• Mini Kunafa × ${qty}
• Estimated total: ₹${(qty*CONFIG.price).toLocaleString("en-IN")}
Name: ${name.value.trim()}
Area: ${area.value.trim()}, Bengaluru
${$("#oMode").value}`;
  openWA(msg); toast("Opening WhatsApp with your order");
});

// ---- Bulk form ----
const bDate=$("#bDate"); const today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
bDate.min = today.toISOString().slice(0,10);
$("#bulkForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f = id => $(id);
  const checks = [
    [f("#bName"), v=>v ? "" : "Enter your name."],
    [f("#bPhone"), v=>/^[6-9]\d{9}$/.test(v.replace(/\D/g,"").slice(-10)) && v.replace(/\D/g,"").length>=10 ? "" : "Enter a valid 10-digit mobile number."],
    [f("#bQty"), v=>Number(v)>=10 ? "" : "Enter at least 10 pieces for a bulk order."],
    [f("#bDate"), v=>v && v>=bDate.min ? "" : "Choose an event date from today onwards."],
    [f("#bArea"), v=>v ? "" : "Enter your area in Bengaluru."]
  ];
  let first=null;
  checks.forEach(([el,fn])=>{ const m=fn(el.value.trim()); setErr(el,m); if(m && !first) first=el; });
  if(first){ first.focus(); return; }
  const n = Number(f("#bQty").value);
  const d = new Date(f("#bDate").value+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  const msg = `Hi Bloody Sweet! I'd like a bulk order quote 🎉
Name: ${f("#bName").value.trim()}
Phone: ${f("#bPhone").value.trim()}
Occasion: ${f("#bEvent").value}
Quantity: ${n} pieces
Date: ${d}
Area: ${f("#bArea").value.trim()}, Bengaluru${f("#bNotes").value.trim() ? "\nNotes: "+f("#bNotes").value.trim() : ""}`;
  openWA(msg); toast("Opening WhatsApp with your quote request");
});

// Social links: open the page if set, otherwise say "coming soon"
[["facebook","#sFacebook"],["tiktok","#sTiktok"],["x","#sX"]].forEach(([k,id])=>{
  const a=$(id), url=CONFIG.social[k];
  if(url){ a.href=url; a.target="_blank"; a.rel="noopener"; }
  else a.addEventListener("click",e=>{ e.preventDefault(); toast("Coming soon. Follow us on Instagram for now."); });
});

// Photos
const esc = t => String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
if(CONFIG.productPhoto) $("#productPhoto").innerHTML = `<img class="stage-photo" src="${esc(CONFIG.productPhoto)}" alt="Bloody Sweet kunafa chocolate">`;
if(CONFIG.chocolatePhoto) $("#chocPhoto").innerHTML = `<img class="stage-photo" src="${esc(CONFIG.chocolatePhoto)}" alt="Bloody Sweet kunafa chocolate">`;
if(CONFIG.chocolatePrice) $("#chocPrice").textContent = "From " + CONFIG.chocolatePrice;
if(CONFIG.gallery.length){
  $("#galleryGrid").innerHTML = CONFIG.gallery.map((src,i)=>`<figure><img src="${esc(src)}" alt="Bloody Sweet kunafa chocolate photo ${i+1}" loading="lazy"></figure>`).join("");
}

// Reviews
if(CONFIG.reviews.length){
  $("#reviewGrid").innerHTML = CONFIG.reviews.map(r=>{
    const n=Math.max(1,Math.min(5,Math.round(Number(r.stars))||5));
    return `<figure class="review"><div class="stars" aria-label="${n} out of 5 stars">${"★".repeat(n)}${"☆".repeat(5-n)}</div><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.name)}${r.area?` <span>${esc(r.area)}</span>`:""}</figcaption></figure>`;
  }).join("");
} else $("#reviewEmpty").hidden = false;

if(matchMedia("(prefers-reduced-motion: reduce)").matches){ $("#madeVideo").pause(); $("#heroVideo").pause(); }

// FSSAI slot
$("#fssai").textContent = CONFIG.fssai ? "FSSAI Lic. No. " + CONFIG.fssai : "FSSAI licence number will be added soon.";
$("#yr").textContent = new Date().getFullYear();

