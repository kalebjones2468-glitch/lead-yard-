"use client";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════

const jobTypes = [
  { id: "leak", label: "Leak / Burst Pipe", icon: "💧", basePrice: 80, urgencyMult: true, desc: "Emergency repairs for leaking or burst pipes" },
  { id: "boiler", label: "Boiler Repair / Service", icon: "🔥", basePrice: 120, urgencyMult: true, desc: "Annual servicing, breakdowns & repairs" },
  { id: "bathroom", label: "Bathroom Fit", icon: "🚿", basePrice: 800, urgencyMult: false, desc: "Full or partial bathroom installations" },
  { id: "radiator", label: "Radiator Install / Fix", icon: "🌡️", basePrice: 100, urgencyMult: false, desc: "New radiators, bleeding, balancing & fixes" },
  { id: "blocked", label: "Blocked Drain / Toilet", icon: "🚽", basePrice: 70, urgencyMult: true, desc: "Unblocking drains, toilets & sinks" },
  { id: "tap", label: "Tap Repair / Replace", icon: "🔧", basePrice: 60, urgencyMult: false, desc: "Dripping taps, replacements & upgrades" },
  { id: "other", label: "Something Else", icon: "❓", basePrice: 0, urgencyMult: false, desc: "Custom jobs — tell us what you need" },
];

const urgencyLevels = [
  { id: "emergency", label: "🔴 Emergency — need someone today", mult: 1.8, color: "#ef4444" },
  { id: "soon", label: "🟡 This week if possible", mult: 1.2, color: "#f59e0b" },
  { id: "flexible", label: "🟢 I'm flexible — just need it done", mult: 1.0, color: "#22c55e" },
];

const timeSlots = ["Mon 8–10am", "Mon 10–12pm", "Mon 1–3pm", "Tue 8–10am", "Tue 10–12pm", "Tue 1–3pm", "Wed 8–10am", "Wed 1–3pm", "Thu 8–10am", "Thu 10–12pm", "Thu 1–3pm", "Fri 8–10am", "Fri 10–12pm"];

const propertySizes = [
  { id: "small", label: "Flat / Small House", mult: 1.0 },
  { id: "medium", label: "Semi / Terraced", mult: 1.15 },
  { id: "large", label: "Detached / Large", mult: 1.3 },
];

function calcQuote(j, u, p) { const b = j.basePrice, um = j.urgencyMult ? u.mult : 1, pm = p.mult; return { low: Math.round(b*um*pm*0.85), high: Math.round(b*um*pm*1.35) }; }

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════

function DemoBanner({ label, onClose }) {
  return (<div style={{ background: "#0f172a", padding: "10px 20px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ color: "#94a3b8" }}>🔍 <strong style={{ color: "#facc15" }}>Lead Yard Demo</strong> — {label}</span>
    <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", padding: "5px 16px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✕ Exit Demo</button>
  </div>);
}

function LeadScore({ data }) {
  let s = 40;
  if (data.job) s += 15; if (data.urgency?.id === "emergency") s += 20; else if (data.urgency?.id === "soon") s += 10;
  if (data.name?.length > 1) s += 5; if (data.phone?.length > 5) s += 5; if (data.slot) s += 5; if (data.postcode?.length > 2) s += 5;
  s = Math.min(s, 100);
  const col = s > 75 ? "#16a34a" : s > 50 ? "#eab308" : "#94a3b8";
  const lab = s > 75 ? "High Quality" : s > 50 ? "Medium" : "Needs Info";
  return (<div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <div><span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead Score</span><span style={{ fontSize: 11, fontWeight: 600, color: col, marginLeft: 8, padding: "2px 8px", background: col+"15", borderRadius: 4 }}>{lab}</span></div>
      <span style={{ fontSize: 16, fontWeight: 800, color: col }}>{s}</span>
    </div>
    <div style={{ height: 5, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}><div style={{ width: `${s}%`, height: "100%", background: col, borderRadius: 10, transition: "width 0.5s" }} /></div>
    <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>⚡ Higher score = faster response from the plumber</p>
  </div>);
}

// ═══════════════════════════════════════════
// QUOTE BOT
// ═══════════════════════════════════════════

function QuoteBot({ theme: t, name, onClose, onBook }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [msgs, setMsgs] = useState([{ from: "bot", text: `Hey! 👋 I can give you a rough cost in 60 seconds — no commitment. What kind of job do you need?` }]);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const add = (f, tx) => setMsgs(p => [...p, { from: f, text: tx }]);

  const pickJob = j => { setData(p => ({ ...p, job: j })); add("user", j.label); if (j.id === "other") { setTimeout(() => { add("bot", "For custom jobs it's best to book a quick enquiry so we can take a proper look 👇"); setStep(99); }, 400); } else { setTimeout(() => { add("bot", `${j.label} — got it. How urgent is this?`); setStep(1); }, 400); } };
  const pickUrg = u => { setData(p => ({ ...p, urgency: u })); add("user", u.label.replace(/🔴 |🟡 |🟢 /g, "")); setTimeout(() => { add("bot", "Last question — what type of property?"); setStep(2); }, 400); };
  const pickProp = pr => { add("user", pr.label); setData(prev => { const d = { ...prev, property: pr }; const q = calcQuote(d.job, d.urgency, pr); setTimeout(() => { add("bot", `💷 For a ${d.job.label.toLowerCase()} in a ${pr.label.toLowerCase()}, you're looking at roughly £${q.low} – £${q.high}.${d.urgency.id === "emergency" ? "\n\nEmergency call-outs carry a premium but we prioritise getting there fast." : ""}\n\nFinal price depends on what we find on site. No hidden extras.\n\nWant to book a slot? 👇`); setStep(3); }, 600); return d; }); };

  const btnBase = { padding: "13px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1e293b", textAlign: "left", transition: "all 0.15s" };

  return (<div style={{ fontFamily: "'Inter',sans-serif", background: t.chatBg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <DemoBanner label="Quote Bot in action" onClose={onClose} />
    <div style={{ background: t.primary, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => onBook("home")} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Quick Quote</div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>60-second estimate • No commitment</div></div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
      {msgs.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: m.from === "bot" ? "flex-start" : "flex-end", marginBottom: 14 }}>
        {m.from === "bot" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, marginRight: 8, flexShrink: 0, marginTop: 2 }}>{name[0]}</div>}
        <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.from === "bot" ? "4px 16px 16px 16px" : "16px 16px 4px 16px", background: m.from === "bot" ? "#fff" : t.primary, color: m.from === "bot" ? "#1e293b" : "#fff", fontSize: 14, lineHeight: 1.6, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", whiteSpace: "pre-line" }}>{m.text}</div>
      </div>))}
      <div ref={end} />
      <div style={{ marginTop: 10 }}>
        {step === 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{jobTypes.map(j => <button key={j.id} onClick={() => pickJob(j)} style={{ ...btnBase, display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.borderColor = t.primary} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}><span style={{ fontSize: 18 }}>{j.icon}</span>{j.label}</button>)}</div>}
        {step === 1 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{urgencyLevels.map(u => <button key={u.id} onClick={() => pickUrg(u)} style={{ ...btnBase, borderLeft: `4px solid ${u.color}` }}>{u.label}</button>)}</div>}
        {step === 2 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{propertySizes.map(p => <button key={p.id} onClick={() => pickProp(p)} style={btnBase}>{p.label}</button>)}</div>}
        {step === 3 && <div style={{ display: "flex", gap: 10 }}><button onClick={() => onBook("booking", data)} style={{ padding: "13px 24px", background: t.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", flex: 1 }}>Book a Slot →</button><button onClick={() => { setStep(0); setData({}); setMsgs([{ from: "bot", text: "No worries! Want a quote for something else?" }]); }} style={{ ...btnBase, textAlign: "center", flex: 0 }}>Reset</button></div>}
        {step === 99 && <div style={{ display: "flex", gap: 10 }}><button onClick={() => onBook("booking")} style={{ padding: "13px 24px", background: t.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", flex: 1 }}>Book an Enquiry →</button></div>}
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// BOOKING FORM
// ═══════════════════════════════════════════

function BookingForm({ theme: t, name, onClose, onNav, prefill }) {
  const [step, setStep] = useState(prefill?.job ? 1 : 0);
  const [data, setData] = useState(prefill || {});
  const inp = { padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 15, outline: "none", background: "#fff", color: "#1e293b", width: "100%", boxSizing: "border-box" };

  return (<div style={{ fontFamily: "'Inter',sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
    <DemoBanner label="Smart booking form" onClose={onClose} />
    <div style={{ background: t.primary, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => onNav("home")} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Book an Enquiry</div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>30 seconds • No commitment</div></div>
    </div>
    <div style={{ maxWidth: 540, margin: "0 auto", padding: 20 }}>
      <LeadScore data={data} />
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>{[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: step > i ? t.primary : step === i ? t.primary+"60" : "#e2e8f0", transition: "all 0.3s" }} />)}</div>

      {step === 0 && <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>What do you need done?</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{jobTypes.map(j => <button key={j.id} onClick={() => { setData(p => ({ ...p, job: j })); setStep(1); }} style={{ padding: "18px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ fontSize: 24, marginBottom: 6 }}>{j.icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{j.label}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{j.desc}</div></button>)}</div></div>}
      {step === 1 && <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>How urgent?</h3><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{urgencyLevels.map(u => <button key={u.id} onClick={() => { setData(p => ({ ...p, urgency: u })); setStep(2); }} style={{ padding: "16px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600, borderLeft: `5px solid ${u.color}`, color: "#0f172a" }}>{u.label}</button>)}</div></div>}
      {step === 2 && <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Pick a time</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{timeSlots.map(s => <button key={s} onClick={() => { setData(p => ({ ...p, slot: s })); setStep(3); }} style={{ padding: "12px 8px", background: data.slot === s ? t.primary : "#fff", color: data.slot === s ? "#fff" : "#334155", border: data.slot === s ? "none" : "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{s}</button>)}</div></div>}
      {step === 3 && <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Your details</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Full name" value={data.name||""} onChange={e => setData(p => ({ ...p, name: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=t.primary} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
        <input placeholder="Phone number" type="tel" value={data.phone||""} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=t.primary} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
        <input placeholder="Postcode" value={data.postcode||""} onChange={e => setData(p => ({ ...p, postcode: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=t.primary} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
        <textarea placeholder="Describe the problem (optional)" rows={3} value={data.notes||""} onChange={e => setData(p => ({ ...p, notes: e.target.value }))} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
        <button onClick={() => setStep(4)} style={{ padding: "16px", background: t.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Submit Enquiry →</button>
      </div></div>}
      {step === 4 && <div style={{ textAlign: "center", padding: "50px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✅</div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>You're Booked In!</h3>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px" }}>You're down for <strong style={{ color: "#0f172a" }}>{data.slot}</strong>. We'll confirm by text within the hour.</p>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: 20, maxWidth: 380, margin: "0 auto", textAlign: "left" }}>
          <p style={{ fontSize: 14, color: "#166534", fontWeight: 700, marginBottom: 8 }}>What happens next:</p>
          <p style={{ fontSize: 13, color: "#15803d", lineHeight: 1.8, margin: 0 }}>1. We review your job details<br/>2. Confirm your slot by text<br/>3. Final price on site — no surprises</p>
        </div>
        <button onClick={() => onNav("home")} style={{ marginTop: 28, padding: "12px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#475569" }}>← Back to Home</button>
      </div>}
      {step > 0 && step < 4 && <button onClick={() => setStep(p => p-1)} style={{ marginTop: 18, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← Back</button>}
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// MARK'S PLUMBING
// ═══════════════════════════════════════════

function MarksPlumbing({ onClose }) {
  const [view, setView] = useState("home");
  const [prefill, setPrefill] = useState(null);
  const nav = (v, d) => { if (v === "booking") setPrefill(d||null); setView(v); };
  const t = { primary: "#1e40af", chatBg: "#f1f5f9" };

  if (view === "quote") return <QuoteBot theme={t} name="Mark's Plumbing" onClose={onClose} onBook={nav} />;
  if (view === "booking") return <BookingForm theme={t} name="Mark's Plumbing" onClose={onClose} onNav={nav} prefill={prefill} />;

  const areas = ["Middlesbrough", "Stockton", "Redcar", "Thornaby", "Yarm", "Guisborough", "Saltburn", "Marske", "Billingham", "Norton", "Eaglescliffe", "Ingleby Barwick"];

  return (<div style={{ fontFamily: "'Inter',sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
    <DemoBanner label="Mark's Plumbing — dark theme with hero image" onClose={onClose} />

    {/* Top bar */}
    <div style={{ background: "#1e40af", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#bfdbfe" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} /> Available 24/7 — Emergency Plumber</div>
      <span style={{ color: "#fff", fontWeight: 700 }}>📞 01234 567 890</span>
    </div>

    {/* Nav */}
    <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontWeight: 800, fontSize: 20 }}><span style={{ color: "#60a5fa" }}>Mark's</span> Plumbing</div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {["Services", "Reviews", "Areas"].map(n => <span key={n} style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>{n}</span>)}
        <button onClick={() => setView("quote")} style={{ padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Get a Quote</button>
      </div>
    </div>

    {/* Hero */}
    <div style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(30,64,175,0.75)), url('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&q=80') center/cover", padding: "90px 24px 80px", position: "relative" }}>
      <div style={{ maxWidth: 700 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.1)", fontSize: 13, fontWeight: 600, color: "#93c5fd", marginBottom: 28 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} /> Available Today — Middlesbrough & Teesside
        </div>
        <h1 style={{ fontSize: "clamp(36px,5vw,58px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-2px", margin: "0 0 20px" }}>Your Local Plumber —<br /><span style={{ color: "#60a5fa" }}>No Nonsense Pricing</span></h1>
        <p style={{ fontSize: 18, color: "#cbd5e1", maxWidth: 520, lineHeight: 1.6, margin: "0 0 36px" }}>When a burst pipe, boiler breakdown, or blocked drain strikes — get a rough quote in 60 seconds. No call needed, no obligation, no hidden fees.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => setView("quote")} style={{ padding: "16px 32px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 24px rgba(59,130,246,0.3)", display: "flex", alignItems: "center", gap: 8 }}>Get a Quick Quote <span>→</span></button>
          <button onClick={() => setView("booking")} style={{ padding: "16px 32px", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>📞 Or Call 01234 567 890</button>
        </div>
      </div>
    </div>

    {/* Trust bar */}
    <div style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", textAlign: "center", padding: "24px 16px", gap: 16 }}>
        {[{ i: "🕐", t: "24/7 Availability", d: "Day, night, weekends" }, { i: "💷", t: "Transparent Pricing", d: "Quote before work begins" }, { i: "✅", t: "Workmanship Guarantee", d: "We put it right at no extra cost" }, { i: "🔒", t: "Gas Safe Registered", d: "Qualified & fully insured" }].map((s, i) => (
          <div key={i}><div style={{ fontSize: 22, marginBottom: 6 }}>{s.i}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{s.t}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.d}</div></div>
        ))}
      </div>
    </div>

    {/* Services */}
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#f1f5f9" }}>Our Services</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>Click any service for an instant rough quote</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
        {jobTypes.filter(j => j.id !== "other").map(j => (
          <div key={j.id} onClick={() => setView("quote")} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "28px 22px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{j.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{j.label}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 12 }}>{j.desc}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>From £{j.basePrice} →</div>
          </div>
        ))}
      </div>
    </div>

    {/* Reviews */}
    <div style={{ background: "#1e293b", padding: "56px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, color: "#f1f5f9" }}>What Our Customers Say</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
          {[
            { name: "Sarah T.", text: "Called at 8am with a burst pipe, Mark was here by 10. Fixed it fast, fair price. Can't ask for more.", area: "Middlesbrough" },
            { name: "Dave M.", text: "Used the online quote tool — dead easy. Price on site matched what the website said. No messing about.", area: "Stockton" },
            { name: "Karen P.", text: "Booked a bathroom fit online. Mark kept me updated the whole way through. Brilliant job.", area: "Yarm" },
          ].map((r, i) => (
            <div key={i} style={{ padding: 22, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ color: "#facc15", fontSize: 14, marginBottom: 10 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 14px" }}>"{r.text}"</p>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{r.name}</span><span style={{ fontSize: 12, color: "#64748b" }}> — {r.area}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Areas */}
    <div style={{ padding: "56px 24px", textAlign: "center" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#f1f5f9" }}>📍 Areas We Cover</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Serving Middlesbrough, Teesside & surrounding areas</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 700, margin: "0 auto" }}>
        {areas.map(a => <span key={a} style={{ padding: "8px 18px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>{a}</span>)}
      </div>
    </div>

    {/* CTA */}
    <div style={{ background: "linear-gradient(135deg, #1e40af, #1e3a8a)", padding: "56px 24px", textAlign: "center" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Got a plumbing problem?</h2>
      <p style={{ color: "#93c5fd", fontSize: 16, marginBottom: 28 }}>Get a rough quote in 60 seconds — or call us directly</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => setView("quote")} style={{ padding: "16px 32px", background: "#facc15", color: "#0f172a", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Get a Quick Quote →</button>
        <button onClick={() => setView("booking")} style={{ padding: "16px 32px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Book Online</button>
      </div>
    </div>

    {/* Footer */}
    <div style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 16, marginBottom: 6 }}><span style={{ color: "#60a5fa" }}>Mark's</span> Plumbing</div>
      <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Middlesbrough & Teesside • Gas Safe Registered • No Hidden Fees</p>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// PRESTIGE PLUMBING
// ═══════════════════════════════════════════

function PrestigePlumbing({ onClose }) {
  const [view, setView] = useState("home");
  const [prefill, setPrefill] = useState(null);
  const nav = (v, d) => { if (v === "booking") setPrefill(d||null); setView(v); };
  const t = { primary: "#18181b", chatBg: "#fafafa" };

  if (view === "quote") return <QuoteBot theme={t} name="Prestige Plumbing" onClose={onClose} onBook={nav} />;
  if (view === "booking") return <BookingForm theme={t} name="Prestige Plumbing" onClose={onClose} onNav={nav} prefill={prefill} />;

  return (<div style={{ fontFamily: "'Inter',sans-serif", background: "#fff", minHeight: "100vh", color: "#18181b" }}>
    <DemoBanner label="Prestige — premium minimal style" onClose={onClose} />
    <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f4f4f5", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 18 }}>Prestige <span style={{ fontWeight: 400, color: "#a1a1aa" }}>Plumbing</span></div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}><span style={{ fontSize: 13, color: "#a1a1aa" }}>020 7123 4567</span><button onClick={() => setView("quote")} style={{ padding: "8px 18px", background: "#18181b", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Get a Quote</button></div>
    </div>

    <div style={{ padding: "90px 24px 70px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "inline-flex", gap: 8, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {["London & Surrey", "Gas Safe", "5-Year Guarantee"].map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", padding: "5px 12px", border: "1px solid #e4e4e7", borderRadius: 100 }}>{t}</span>)}
      </div>
      <h1 style={{ fontSize: "clamp(36px,5vw,58px)", fontWeight: 700, letterSpacing: "-2px", margin: "0 0 18px", lineHeight: 1.08 }}>Plumbing done<br /><span style={{ color: "#a1a1aa" }}>properly.</span></h1>
      <p style={{ fontSize: 17, color: "#71717a", maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.65 }}>Professional plumbing for homeowners who expect quality. No mess, no fuss, no surprises on the bill.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => setView("quote")} style={{ padding: "14px 32px", background: "#18181b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Get a Quote</button>
        <button onClick={() => setView("booking")} style={{ padding: "14px 32px", background: "#fff", color: "#18181b", border: "1px solid #d4d4d8", borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Book Online</button>
      </div>
    </div>

    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 48px" }}>
      <div style={{ height: 1, background: "#f4f4f5", marginBottom: 48 }} />
      <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 20 }}>Services</h2>
      {jobTypes.filter(j => j.id !== "other").map(j => (
        <div key={j.id} onClick={() => setView("quote")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #f4f4f5", cursor: "pointer", transition: "padding-left 0.15s" }} onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"} onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontSize: 22 }}>{j.icon}</span><div><div style={{ fontSize: 15, fontWeight: 600 }}>{j.label}</div><div style={{ fontSize: 12, color: "#a1a1aa" }}>{j.desc}</div></div></div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>£{j.basePrice}+</span>
        </div>
      ))}
    </div>

    <div style={{ background: "#fafafa", padding: "48px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "center" }}>
        {[{ n: "500+", l: "Jobs completed" }, { n: "4.9★", l: "Average rating" }, { n: "12yrs", l: "In business" }].map((s, i) => <div key={i}><div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>{s.n}</div><div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>{s.l}</div></div>)}
      </div>
    </div>

    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 20 }}>Reviews</h2>
      {[{ name: "James H.", text: "Exceptional work on our bathroom renovation. Clean, punctual, flawless finish.", area: "Richmond" }, { name: "Catherine W.", text: "Used the online quote tool — refreshingly transparent. Price matched exactly.", area: "Guildford" }].map((r, i) => (
        <div key={i} style={{ padding: "20px 0", borderBottom: "1px solid #f4f4f5" }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>★★★★★</div>
          <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.6, margin: "0 0 8px" }}>"{r.text}"</p>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span><span style={{ fontSize: 12, color: "#a1a1aa" }}> — {r.area}</span>
        </div>
      ))}
    </div>

    <div style={{ padding: "48px 24px", textAlign: "center", borderTop: "1px solid #f4f4f5" }}>
      <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Ready to get started?</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => setView("quote")} style={{ padding: "14px 32px", background: "#18181b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Get a Quote →</button>
        <button onClick={() => setView("booking")} style={{ padding: "14px 32px", border: "1px solid #d4d4d8", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", color: "#18181b", background: "#fff" }}>Book Online</button>
      </div>
    </div>

    <div style={{ borderTop: "1px solid #f4f4f5", padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Prestige Plumbing</div>
      <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0 }}>London & Surrey • Gas Safe Registered • 5-Year Guarantee</p>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// LEAD YARD MAIN SITE
// ═══════════════════════════════════════════

const portfolio = [
  { title: "Mark's Plumbing", niche: "Plumbing", tag: "Quote Bot • Lead Scoring • Smart Booking", desc: "Middlesbrough plumber drowning in tyre-kicker calls. We built a quote bot, lead-scoring system, and booking flow that pre-qualifies every lead.", color: "#3b82f6", status: "Live Demo", demoId: "marks" },
  { title: "Prestige Plumbing", niche: "Plumbing", tag: "Minimal Design • Quote Bot • Booking", desc: "Premium London plumber wanting a high-end presence. Same powerful tools, completely different design — proof we don't do one-size-fits-all.", color: "#18181b", status: "Live Demo", demoId: "prestige" },
];

export default function App() {
  const [demo, setDemo] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [vis, setVis] = useState({});
  const refs = useRef({});
  const [intakeStep, setIntakeStep] = useState(0);
  const [intakeData, setIntakeData] = useState({ services: [] });
  const [intakeFiles, setIntakeFiles] = useState({ logo: [], work: [] });
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitIntake = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("access_key", "abea9365-380e-4000-a6a3-1a46d7f74a0a");
      formData.append("subject", "New Lead Yard Intake Submission");
      formData.append("from_name", "Lead Yard Website");
      formData.append("Business Name", intakeData.business || "");
      formData.append("Contact Name", intakeData.name || "");
      formData.append("Phone", intakeData.phone || "");
      formData.append("Email", intakeData.email || "");
      formData.append("Area Covered", intakeData.area || "");
      formData.append("Services", intakeData.services.join(", "));
      formData.append("Biggest Problem", intakeData.problem || "");
      intakeFiles.logo.forEach(f => formData.append("Logo/Brand Files", f));
      intakeFiles.work.forEach(f => formData.append("Work Photos", f));
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) { setIntakeSubmitted(true); }
      else { setSubmitError("Something went wrong. Please try again or contact us directly."); }
    } catch (e) {
      setSubmitError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setVis(p => ({ ...p, [e.target.id]: true })); }), { threshold: 0.1 }); Object.values(refs.current).forEach(r => { if (r) o.observe(r); }); return () => o.disconnect(); }, []);

  if (demo === "marks") return <MarksPlumbing onClose={() => setDemo(null)} />;
  if (demo === "prestige") return <PrestigePlumbing onClose={() => setDemo(null)} />;

  const to = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const an = id => vis[id] ? { opacity: 1, transform: "translateY(0)" } : { opacity: 0, transform: "translateY(30px)" };
  const y = "#eab308", yl = "#facc15";
  const inp = { padding: "14px 18px", borderRadius: 12, border: `1px solid ${y}20`, background: "rgba(255,255,255,0.03)", color: "#e4e4e7", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" };

  const toggleService = s => setIntakeData(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));

  return (<div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: "#0a0a0f", color: "#e4e4e7", minHeight: "100vh", overflowX: "hidden" }}>

    {/* NAV */}
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrollY > 50 ? "rgba(10,10,15,0.97)" : "transparent", backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: scrollY > 50 ? `1px solid ${y}15` : "1px solid transparent", transition: "all 0.3s" }}>
      <div style={{ fontSize: 22, fontWeight: 800, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span style={{ color: y }}>Lead</span> Yard</div>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {["Demos", "How It Works", "Testimonials", "Get Started"].map(i => <span key={i} onClick={() => to(i.toLowerCase().replace(/ /g, "-"))} style={{ fontSize: 13, fontWeight: 500, color: "#a1a1aa", cursor: "pointer" }} onMouseEnter={e => e.target.style.color = y} onMouseLeave={e => e.target.style.color = "#a1a1aa"}>{i}</span>)}
        <button onClick={() => to("get-started")} style={{ padding: "9px 20px", background: y, border: "none", borderRadius: 8, color: "#0a0a0f", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Start Your Build</button>
      </div>
    </nav>

    {/* HERO */}
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: `radial-gradient(circle, ${y}10, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ padding: "6px 16px", borderRadius: 100, border: `1px solid ${y}35`, background: `${y}08`, fontSize: 13, fontWeight: 600, color: yl, marginBottom: 28, display: "inline-block" }}>WEBSITES THAT GENERATE LEADS — NOT JUST LOOK PRETTY</div>
      <h1 style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-2.5px", maxWidth: 820, margin: "0 0 24px" }}>Your website should<br /><span style={{ background: `linear-gradient(135deg, ${y}, ${yl})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>make you money</span></h1>
      <p style={{ fontSize: "clamp(16px,2vw,19px)", color: "#94a3b8", maxWidth: 540, lineHeight: 1.65, margin: "0 0 40px" }}>We build websites for trade businesses that qualify leads, give instant quotes, and book jobs automatically — so you stop chasing and start earning.</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => to("demos")} style={{ padding: "15px 34px", background: y, border: "none", borderRadius: 10, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 0 30px ${y}30` }}>See Live Demos</button>
        <button onClick={() => to("get-started")} style={{ padding: "15px 34px", background: "transparent", border: `1px solid ${y}50`, borderRadius: 10, color: yl, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Start Your Build</button>
      </div>
    </section>

    {/* DEMOS */}
    <section id="demos" ref={el => refs.current.demos = el} style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", transition: "all 0.8s", ...an("demos") }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", color: y, textTransform: "uppercase" }}>Live Demos</span>
        <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Try them yourself.</h2>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>These are fully working sites — not mockups. Click through the quote bot and booking system.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {portfolio.map(item => (
          <div key={item.title} style={{ borderRadius: 18, border: `1px solid ${y}10`, background: "rgba(255,255,255,0.02)", overflow: "hidden", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color+"44"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${y}10`; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ height: 140, background: `linear-gradient(135deg, ${item.color}18, ${item.color}06)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: item.color, opacity: 0.12 }}>{item.title}</span>
              <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{item.status}</span>
            </div>
            <div style={{ padding: "20px 22px 24px" }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f4f4f5", margin: "0 0 4px" }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: y, fontWeight: 600, marginBottom: 10 }}>{item.tag}</p>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16 }}>{item.desc}</p>
              <button onClick={() => setDemo(item.demoId)} style={{ padding: "12px 22px", background: item.color, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>Try Live Demo →</button>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section id="how-it-works" ref={el => refs.current["how-it-works"] = el} style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto", transition: "all 0.8s", ...an("how-it-works") }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", color: y, textTransform: "uppercase" }}>How It Works</span>
        <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Three steps. No bollocks.</h2>
      </div>
      {[{ s: "01", t: "Fill out the form below", d: "Tell us about your business — what you do, where you work, what problems you need solved. Takes 2 minutes." },
        { s: "02", t: "We build it in days", d: "You get a working site with a quote bot, booking system, and lead scoring — all tailored to your brand. Live in 5 working days." },
        { s: "03", t: "You get back to actual work", d: "Your site handles the enquiries. You handle the jobs. We stay on for support and updates." }
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "24px 0", borderBottom: i < 2 ? `1px solid ${y}08` : "none" }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: y, opacity: 0.5, fontFamily: "monospace", minWidth: 44 }}>{item.s}</span>
          <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5", marginBottom: 6 }}>{item.t}</h3><p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{item.d}</p></div>
        </div>
      ))}
    </section>

    {/* TESTIMONIALS */}
    <section id="testimonials" ref={el => refs.current.testimonials = el} style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", transition: "all 0.8s", ...an("testimonials") }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", color: y, textTransform: "uppercase" }}>Testimonials</span>
        <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>What people are saying</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
        {[
          { name: "Mike R.", role: "Plumber, Walsall", text: "Before Lead Yard I was getting calls from people just price-shopping. Now every enquiry that comes through has already seen the price and still wants to book. Complete game changer." },
          { name: "Steve H.", role: "Joiner, Birmingham", text: "The quote bot on my site saves me at least an hour a day. Customers get a rough price instantly and I only speak to the serious ones. Wish I'd had this years ago." },
          { name: "Danny T.", role: "Plumber, Middlesbrough", text: "Connor sorted everything. Explained what they'd build, had it live within the week. I'm not tech-savvy at all but the whole process was dead simple." },
        ].map((r, i) => (
          <div key={i} style={{ padding: 24, borderRadius: 16, border: `1px solid ${y}10`, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ color: "#facc15", fontSize: 14, marginBottom: 12 }}>★★★★★</div>
            <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.65, margin: "0 0 16px" }}>"{r.text}"</p>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{r.name}</span><span style={{ fontSize: 12, color: "#64748b" }}> — {r.role}</span></div>
          </div>
        ))}
      </div>
    </section>

    {/* INTAKE FORM */}
    <section id="get-started" ref={el => refs.current["get-started"] = el} style={{ padding: "80px 24px", maxWidth: 600, margin: "0 auto", transition: "all 0.8s", ...an("get-started") }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", color: y, textTransform: "uppercase" }}>Get Started</span>
        <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Tell us about your business</h2>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Takes 2 minutes. We'll get back to you within 24 hours with a plan.</p>
      </div>

      {!intakeSubmitted ? (
        <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${y}12`, borderRadius: 20, padding: "32px 28px" }}>
          {/* Progress */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>{[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: intakeStep > i ? y : intakeStep === i ? y+"60" : "rgba(255,255,255,0.06)", transition: "all 0.3s" }} />)}</div>

          {intakeStep === 0 && (<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5", marginBottom: 4 }}>About You</h3>
            <input placeholder="Business name" value={intakeData.business||""} onChange={e => setIntakeData(p => ({ ...p, business: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=y} onBlur={e => e.target.style.borderColor=`${y}20`} />
            <input placeholder="Your name" value={intakeData.name||""} onChange={e => setIntakeData(p => ({ ...p, name: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=y} onBlur={e => e.target.style.borderColor=`${y}20`} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Phone number" type="tel" value={intakeData.phone||""} onChange={e => setIntakeData(p => ({ ...p, phone: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=y} onBlur={e => e.target.style.borderColor=`${y}20`} />
              <input placeholder="Email" type="email" value={intakeData.email||""} onChange={e => setIntakeData(p => ({ ...p, email: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=y} onBlur={e => e.target.style.borderColor=`${y}20`} />
            </div>
            <input placeholder="What area do you cover? (e.g. Birmingham & surrounding)" value={intakeData.area||""} onChange={e => setIntakeData(p => ({ ...p, area: e.target.value }))} style={inp} onFocus={e => e.target.style.borderColor=y} onBlur={e => e.target.style.borderColor=`${y}20`} />
            <button onClick={() => setIntakeStep(1)} style={{ padding: "16px", background: y, border: "none", borderRadius: 12, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 4 }}>Next →</button>
          </div>)}

          {intakeStep === 1 && (<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5", marginBottom: 4 }}>Your Services</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: -8 }}>Select all that apply</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["General Plumbing", "Heating & Gas", "Bathroom Fitting", "Drainage", "Boiler Install/Repair", "Kitchen Plumbing", "Emergency Call-Outs", "Commercial Work"].map(s => (
                <button key={s} onClick={() => toggleService(s)} style={{ padding: "14px 16px", background: intakeData.services.includes(s) ? `${y}15` : "rgba(255,255,255,0.03)", border: intakeData.services.includes(s) ? `2px solid ${y}` : "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: intakeData.services.includes(s) ? yl : "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>{intakeData.services.includes(s) ? "✓ " : ""}{s}</button>
              ))}
            </div>
            <textarea placeholder="What's the biggest problem in your business right now? (e.g. too many time wasters, no online presence, phone rings at bad times...)" rows={4} value={intakeData.problem||""} onChange={e => setIntakeData(p => ({ ...p, problem: e.target.value }))} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setIntakeStep(0)} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={() => setIntakeStep(2)} style={{ padding: "14px", background: y, border: "none", borderRadius: 12, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1 }}>Next →</button>
            </div>
          </div>)}

          {intakeStep === 2 && (<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5", marginBottom: 4 }}>Your Brand (Optional)</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: -8 }}>Upload any branding, logos, or photos of your work — this helps us build something that looks like you</p>

            {/* Logo upload */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, display: "block" }}>Logo or brand images</label>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 20px", borderRadius: 14, border: `2px dashed ${y}30`, background: `${y}05`, cursor: "pointer", transition: "all 0.2s" }}>
                <span style={{ fontSize: 28 }}>📁</span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Click to upload logo / brand photos</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>PNG, JPG up to 10MB</span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => setIntakeFiles(p => ({ ...p, logo: [...p.logo, ...Array.from(e.target.files)] }))} />
              </label>
              {intakeFiles.logo.length > 0 && <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>{intakeFiles.logo.map((f,i) => <span key={i} style={{ padding: "4px 12px", background: `${y}15`, borderRadius: 8, fontSize: 12, color: yl }}>📎 {f.name}</span>)}</div>}
            </div>

            {/* Work photos */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, display: "block" }}>Photos of previous work (before/after, finished jobs, etc.)</label>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 20px", borderRadius: 14, border: `2px dashed ${y}30`, background: `${y}05`, cursor: "pointer" }}>
                <span style={{ fontSize: 28 }}>📸</span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Click to upload work photos</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>PNG, JPG up to 10MB each</span>
                <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => setIntakeFiles(p => ({ ...p, work: [...p.work, ...Array.from(e.target.files)] }))} />
              </label>
              {intakeFiles.work.length > 0 && <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>{intakeFiles.work.map((f,i) => <span key={i} style={{ padding: "4px 12px", background: `${y}15`, borderRadius: 8, fontSize: 12, color: yl }}>📎 {f.name}</span>)}</div>}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setIntakeStep(1)} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={submitIntake} disabled={submitting} style={{ padding: "14px", background: submitting ? `${y}80` : y, border: "none", borderRadius: 12, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: submitting ? "wait" : "pointer", flex: 1 }}>{submitting ? "Submitting..." : "Submit →"}</button>
            </div>
            {submitError && <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center", marginTop: 8 }}>{submitError}</p>}
          </div>)}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", border: `1px solid ${y}12`, borderRadius: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${y}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✅</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: "#f4f4f5", marginBottom: 8 }}>We've Got Your Details!</h3>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 24px" }}>We'll review everything and get back to you within 24 hours with a plan for your website. No obligation.</p>
          <div style={{ background: `${y}08`, border: `1px solid ${y}20`, borderRadius: 14, padding: 20, maxWidth: 380, margin: "0 auto", textAlign: "left" }}>
            <p style={{ fontSize: 14, color: yl, fontWeight: 700, marginBottom: 8 }}>What happens next:</p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>1. We review your info & photos<br/>2. We send you a plan + mockup<br/>3. If you like it — we build. If not — no hard feelings.</p>
          </div>
        </div>
      )}
    </section>

    {/* FOOTER */}
    <footer style={{ padding: "36px 24px", borderTop: `1px solid ${y}10`, textAlign: "center", marginTop: 40 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}><span style={{ color: y }}>Lead</span> Yard</div>
      <p style={{ fontSize: 12, color: "#52525b" }}>Websites that work as hard as you do.</p>
      <p style={{ fontSize: 11, color: "#3f3f46", marginTop: 6 }}>© 2026 Lead Yard. All rights reserved.</p>
    </footer>
  </div>);
}