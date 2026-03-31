"use client";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// SHARED DATA & HELPERS
// ═══════════════════════════════════════════

const jobTypes = [
  { id: "leak", label: "Leak / Burst Pipe", icon: "💧", basePrice: 80, urgencyMult: true },
  { id: "boiler", label: "Boiler Repair / Service", icon: "🔥", basePrice: 120, urgencyMult: true },
  { id: "bathroom", label: "Bathroom Fit", icon: "🚿", basePrice: 800, urgencyMult: false },
  { id: "radiator", label: "Radiator Install / Fix", icon: "🌡️", basePrice: 100, urgencyMult: false },
  { id: "blocked", label: "Blocked Drain / Toilet", icon: "🚽", basePrice: 70, urgencyMult: true },
  { id: "tap", label: "Tap Repair / Replace", icon: "🔧", basePrice: 60, urgencyMult: false },
  { id: "other", label: "Something Else", icon: "❓", basePrice: 0, urgencyMult: false },
];

const urgencyLevels = [
  { id: "emergency", label: "Emergency — need someone today", mult: 1.8, color: "#ef4444" },
  { id: "soon", label: "This week", mult: 1.2, color: "#f59e0b" },
  { id: "flexible", label: "I'm flexible — just need it done", mult: 1.0, color: "#22c55e" },
];

const timeSlots = ["Mon 8–10am", "Mon 10–12pm", "Mon 1–3pm", "Tue 8–10am", "Tue 10–12pm", "Tue 1–3pm", "Wed 8–10am", "Wed 1–3pm", "Thu 8–10am", "Thu 10–12pm", "Thu 1–3pm", "Fri 8–10am", "Fri 10–12pm"];

const propertySizes = [
  { id: "small", label: "Flat / Small House", mult: 1.0 },
  { id: "medium", label: "Semi / Terraced", mult: 1.15 },
  { id: "large", label: "Detached / Large", mult: 1.3 },
];

function calcQuote(job, urgency, property) {
  const base = job.basePrice;
  const uM = job.urgencyMult ? urgency.mult : 1.0;
  const pM = property.mult;
  return { low: Math.round(base * uM * pM * 0.85), high: Math.round(base * uM * pM * 1.35) };
}

function LeadScore({ data }) {
  let s = 50;
  if (data.job) s += 15;
  if (data.urgency?.id === "emergency") s += 20;
  else if (data.urgency?.id === "soon") s += 10;
  if (data.name) s += 5;
  if (data.phone) s += 5;
  if (data.slot) s += 5;
  s = Math.min(s, 100);
  const col = s > 70 ? "#16a34a" : s > 40 ? "#eab308" : "#94a3b8";
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead Quality Score (plumber sees this)</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: col }}>{s}/100</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${s}%`, height: "100%", background: col, borderRadius: 10, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function DemoBanner({ label, onClose }) {
  return (
    <div style={{ background: "#0f172a", color: "#94a3b8", padding: "10px 20px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <span>🔍 <strong style={{ color: "#facc15" }}>Lead Yard Demo</strong> — {label}</span>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", padding: "5px 16px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✕ Back to Lead Yard</button>
    </div>
  );
}

// ═══════════════════════════════════════════
// QUOTE BOT (shared between demos)
// ═══════════════════════════════════════════

function QuoteBot({ theme, businessName, onClose, onBook }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [msgs, setMsgs] = useState([{ from: "bot", text: `Hi! I'm ${businessName}'s quick quote tool. Let me give you a rough idea of cost — no commitment. What kind of job do you need?` }]);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const add = (from, text) => setMsgs(p => [...p, { from, text }]);

  const pickJob = (j) => { setData(p => ({ ...p, job: j })); add("user", j.label); if (j.id === "other") { setTimeout(() => { add("bot", "For custom jobs I'd recommend booking an enquiry so we can take a proper look. Want me to take you there?"); setStep(99); }, 400); } else { setTimeout(() => { add("bot", "Got it. How urgent is this?"); setStep(1); }, 400); } };
  const pickUrg = (u) => { setData(p => ({ ...p, urgency: u })); add("user", u.label); setTimeout(() => { add("bot", "What type of property?"); setStep(2); }, 400); };
  const pickProp = (pr) => {
    add("user", pr.label);
    setData(prev => {
      const d = { ...prev, property: pr };
      const q = calcQuote(d.job, d.urgency, pr);
      setTimeout(() => {
        add("bot", `Based on what you've told me, a ${d.job.label.toLowerCase()} for a ${pr.label.toLowerCase()} would typically run £${q.low} – £${q.high}.${d.urgency.id === "emergency" ? " Emergency call-outs carry a premium, but we prioritise getting to you fast." : ""} This is a rough guide — final price depends on what we find on site. Want to book a slot?`);
        setStep(3);
      }, 500);
      return d;
    });
  };

  const t = theme;
  return (
    <div style={{ fontFamily: t.font, background: t.chatBg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DemoBanner label="Quote Bot in action" onClose={onClose} />
      <div style={{ background: t.primary, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onBook("home")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>←</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{businessName} — Quick Quote</div>
          <div style={{ color: t.primaryLight || "rgba(255,255,255,0.7)", fontSize: 12 }}>Get a rough price in 60 seconds</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "bot" ? "flex-start" : "flex-end", marginBottom: 12 }}>
            <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: m.from === "bot" ? "16px 16px 16px 4px" : "16px 16px 4px 16px", background: m.from === "bot" ? "#fff" : t.primary, color: m.from === "bot" ? "#334155" : "#fff", fontSize: 14, lineHeight: 1.55, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>{m.text}</div>
          </div>
        ))}
        <div ref={end} />
        <div style={{ marginTop: 8 }}>
          {step === 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{jobTypes.map(j => <button key={j.id} onClick={() => pickJob(j)} style={{ padding: "10px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} onMouseEnter={e => e.currentTarget.style.borderColor = t.primary} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}><span>{j.icon}</span> {j.label}</button>)}</div>}
          {step === 1 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{urgencyLevels.map(u => <button key={u.id} onClick={() => pickUrg(u)} style={{ padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", borderLeft: `4px solid ${u.color}` }}>{u.label}</button>)}</div>}
          {step === 2 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{propertySizes.map(p => <button key={p.id} onClick={() => pickProp(p)} style={{ padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>{p.label}</button>)}</div>}
          {step === 3 && <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onBook("booking", data)} style={{ padding: "12px 20px", background: t.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Book a slot →</button>
            <button onClick={() => { setStep(0); setData({}); setMsgs([{ from: "bot", text: "No problem! Want a quote for something else?" }]); }} style={{ padding: "12px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#475569" }}>Start again</button>
          </div>}
          {step === 99 && <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onBook("booking")} style={{ padding: "12px 20px", background: t.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Book an enquiry →</button>
            <button onClick={() => onBook("home")} style={{ padding: "12px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#475569" }}>Go back</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BOOKING FORM (shared)
// ═══════════════════════════════════════════

function BookingForm({ theme, businessName, onClose, onNav, prefill }) {
  const [step, setStep] = useState(prefill?.job ? 1 : 0);
  const [data, setData] = useState(prefill || {});
  const t = theme;

  return (
    <div style={{ fontFamily: t.font, background: t.chatBg || "#f1f5f9", minHeight: "100vh" }}>
      <DemoBanner label="Pre-qualifying booking form" onClose={onClose} />
      <div style={{ background: t.primary, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNav("home")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>←</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Book an Enquiry</div>
          <div style={{ color: t.primaryLight || "rgba(255,255,255,0.7)", fontSize: 12 }}>Pick a time — no commitment</div>
        </div>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
        <LeadScore data={data} />
        {step === 0 && (<div><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>What do you need done?</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{jobTypes.map(j => <button key={j.id} onClick={() => { setData(p => ({ ...p, job: j })); setStep(1); }} style={{ padding: 16, background: data.job?.id === j.id ? `${t.primary}12` : "#fff", border: data.job?.id === j.id ? `2px solid ${t.primary}` : "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 24, marginBottom: 4 }}>{j.icon}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{j.label}</div></button>)}</div></div>)}
        {step === 1 && (<div><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>How urgent?</h3><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{urgencyLevels.map(u => <button key={u.id} onClick={() => { setData(p => ({ ...p, urgency: u })); setStep(2); }} style={{ padding: "14px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 600, borderLeft: `4px solid ${u.color}` }}>{u.label}</button>)}</div></div>)}
        {step === 2 && (<div><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Pick a time slot</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>{timeSlots.map(s => <button key={s} onClick={() => { setData(p => ({ ...p, slot: s })); setStep(3); }} style={{ padding: "10px 8px", background: data.slot === s ? t.primary : "#fff", color: data.slot === s ? "#fff" : "#334155", border: data.slot === s ? "none" : "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{s}</button>)}</div></div>)}
        {step === 3 && (<div><h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Your details</h3><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[{ k: "name", p: "Your name", t: "text" }, { k: "phone", p: "Phone number", t: "tel" }, { k: "postcode", p: "Postcode", t: "text" }].map(f => <input key={f.k} type={f.t} placeholder={f.p} value={data[f.k] || ""} onChange={e => setData(p => ({ ...p, [f.k]: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, outline: "none", background: "#fff" }} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />)}<textarea placeholder="Anything else we should know? (optional)" rows={3} value={data.notes || ""} onChange={e => setData(p => ({ ...p, notes: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", background: "#fff" }} /><button onClick={() => setStep(4)} style={{ padding: "14px 24px", background: t.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 4 }}>Submit Enquiry →</button></div></div>)}
        {step === 4 && (<div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 48, marginBottom: 16 }}>✅</div><h3 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Enquiry Submitted!</h3><p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 24px" }}>We'll review your details and get back to you shortly. You've been booked for <strong>{data.slot}</strong>.</p><div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, maxWidth: 360, margin: "0 auto" }}><p style={{ fontSize: 13, color: "#166534", fontWeight: 600, marginBottom: 4 }}>What happens next:</p><p style={{ fontSize: 13, color: "#15803d", lineHeight: 1.6, margin: 0 }}>We review your job, confirm your slot, and give you a final price before any work starts. No surprises.</p></div><button onClick={() => onNav("home")} style={{ marginTop: 24, padding: "12px 24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#475569" }}>← Back to Home</button></div>)}
        {step > 0 && step < 4 && <button onClick={() => setStep(p => p - 1)} style={{ marginTop: 16, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>← Go back</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MARK'S PLUMBING DEMO
// ═══════════════════════════════════════════

const marksTheme = { font: "'Inter', sans-serif", primary: "#1e40af", primaryLight: "#93c5fd", chatBg: "#f1f5f9", heroBg: "linear-gradient(135deg, #1e3a8a, #0f172a)" };

function MarksPlumbing({ onClose }) {
  const [view, setView] = useState("home");
  const [prefill, setPrefill] = useState(null);

  const nav = (v, d) => { if (v === "booking") { setPrefill(d || null); } setView(v); };

  if (view === "quote") return <QuoteBot theme={marksTheme} businessName="Mark's Plumbing" onClose={onClose} onBook={nav} />;
  if (view === "booking") return <BookingForm theme={marksTheme} businessName="Mark's Plumbing" onClose={onClose} onNav={nav} prefill={prefill} />;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <DemoBanner label="This is what your customers would see" onClose={onClose} />
      {/* Hero */}
      <div style={{ background: marksTheme.heroBg, padding: "70px 24px 60px", textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(147,197,253,0.3)", background: "rgba(147,197,253,0.1)", fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 20, letterSpacing: "1px", textTransform: "uppercase" }}>Middlesbrough & Teesside</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>Mark's Plumbing</h1>
        <p style={{ fontSize: 18, color: "#bfdbfe", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.5 }}>Honest prices. No call-out fees. Get a rough quote in 60 seconds.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setView("quote")} style={{ padding: "14px 30px", background: "#facc15", color: "#0f172a", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 24px rgba(250,204,21,0.25)", transition: "transform 0.15s" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>Get a Quick Quote →</button>
          <button onClick={() => setView("booking")} style={{ padding: "14px 30px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Book an Enquiry</button>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "28px 24px", maxWidth: 720, margin: "0 auto" }}>
        {[{ i: "⭐", t: "4.9/5 — 120+ reviews" }, { i: "🔧", t: "15 years experience" }, { i: "💷", t: "No hidden fees" }, { i: "🕐", t: "Same-day emergency" }].map((x, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#334155", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}><span style={{ fontSize: 16 }}>{x.i}</span>{x.t}</div>
        ))}
      </div>

      {/* Services */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 24px 70px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>What We Do</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {jobTypes.filter(j => j.id !== "other").map(j => (
            <div key={j.id} onClick={() => { setView("quote"); }} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "22px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{j.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{j.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#0f172a", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Mark's Plumbing</div>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Middlesbrough & Teesside — Call, book, or get an instant quote</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PRESTIGE PLUMBING DEMO
// ═══════════════════════════════════════════

const prestigeTheme = { font: "'Inter', sans-serif", primary: "#18181b", primaryLight: "#a1a1aa", chatBg: "#fafafa", heroBg: "#ffffff" };

function PrestigePlumbing({ onClose }) {
  const [view, setView] = useState("home");
  const [prefill, setPrefill] = useState(null);

  const nav = (v, d) => { if (v === "booking") setPrefill(d || null); setView(v); };

  if (view === "quote") return <QuoteBot theme={prestigeTheme} businessName="Prestige Plumbing" onClose={onClose} onBook={nav} />;
  if (view === "booking") return <BookingForm theme={prestigeTheme} businessName="Prestige Plumbing" onClose={onClose} onNav={nav} prefill={prefill} />;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: "100vh", color: "#18181b" }}>
      <DemoBanner label="Minimal style — same powerful tools" onClose={onClose} />

      {/* Hero */}
      <div style={{ padding: "80px 24px 60px", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>P</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-1.5px", margin: "0 0 16px", lineHeight: 1.1 }}>Prestige Plumbing</h1>
        <p style={{ fontSize: 16, color: "#71717a", maxWidth: 420, margin: "0 auto 12px", lineHeight: 1.6 }}>Professional plumbing for homeowners who expect quality. No mess, no fuss, no surprises on the bill.</p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "0 0 36px", flexWrap: "wrap" }}>
          {["London & Surrey", "Gas Safe Registered", "5-Year Guarantee"].map(t => (
            <span key={t} style={{ fontSize: 12, fontWeight: 500, color: "#a1a1aa", padding: "4px 12px", border: "1px solid #e4e4e7", borderRadius: 100 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setView("quote")} style={{ padding: "13px 28px", background: "#18181b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "opacity 0.15s" }} onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}>Get a Quote</button>
          <button onClick={() => setView("booking")} style={{ padding: "13px 28px", background: "#fff", color: "#18181b", border: "1px solid #d4d4d8", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Book Online</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f4f4f5", maxWidth: 600, margin: "0 auto" }} />

      {/* Services */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 24, textAlign: "center" }}>Services</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {jobTypes.filter(j => j.id !== "other").map((j, i) => (
            <div key={j.id} onClick={() => setView("quote")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: "1px solid #f4f4f5", cursor: "pointer", transition: "padding-left 0.2s" }} onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"} onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 20 }}>{j.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{j.label}</span>
              </div>
              <span style={{ fontSize: 13, color: "#a1a1aa" }}>from £{j.basePrice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust section */}
      <div style={{ background: "#fafafa", padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "center" }}>
          {[{ n: "500+", l: "Jobs completed" }, { n: "4.9", l: "Average rating" }, { n: "12", l: "Years in business" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#18181b", letterSpacing: "-1px" }}>{s.n}</div>
              <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#18181b", marginBottom: 16 }}>Ready to get started?</p>
        <button onClick={() => setView("quote")} style={{ padding: "13px 32px", background: "#18181b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Get a Quick Quote →</button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #f4f4f5", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>Prestige Plumbing</div>
        <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0 }}>London & Surrey — Professional plumbing services</p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// LEAD YARD AGENCY SITE (MAIN)
// ═══════════════════════════════════════════

const agencyNav = ["Services", "Portfolio", "About", "Contact"];
const agencyServices = [
  { icon: "🎯", title: "Lead Qualifying Websites", desc: "Websites that filter out time wasters before they reach you. Only serious enquiries hit your inbox." },
  { icon: "📅", title: "Smart Booking Systems", desc: "Let customers book themselves in on your terms. No more 7am Sunday phone calls." },
  { icon: "💬", title: "Instant Quote Tools", desc: "Automated rough quotes that set expectations upfront — so you stop doing free estimates for tyre kickers." },
  { icon: "📊", title: "Business Dashboards", desc: "See your leads, bookings, and pipeline in one place. Know exactly what's coming next week." },
];

const portfolio = [
  { title: "Mark's Plumbing", niche: "Plumbing", tag: "Quote Bot + Lead Scoring + Smart Booking", desc: "A Middlesbrough-based plumber buried in time-waster calls. We built a conversational quote bot, priority-scored booking system, and pre-qualifying enquiry flow.", color: "#3b82f6", status: "Live Demo", demoId: "marks" },
  { title: "Prestige Plumbing", niche: "Plumbing", tag: "Minimal Design + Quote Bot + Booking", desc: "A premium London plumber wanting a clean, professional online presence. Same powerful tools — lead qualifying, instant quotes, smart booking — wrapped in a minimal design.", color: "#18181b", status: "Live Demo", demoId: "prestige" },
  { title: "Apex Roofing", niche: "Construction", tag: "Smart Booking + Photo Upload", desc: "Coming soon — a roofing contractor site with photo-based job assessment and automated scheduling.", color: "#f59e0b", status: "Coming Soon", demoId: null },
];

const filterTags = ["All", "Plumbing", "Construction"];

export default function LeadYardApp() {
  const [demo, setDemo] = useState(null);
  const [filter, setFilter] = useState("All");
  const [scrollY, setScrollY] = useState(0);
  const [vis, setVis] = useState({});
  const refs = useRef({});

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setVis(p => ({ ...p, [e.target.id]: true })); }), { threshold: 0.12 }); Object.values(refs.current).forEach(r => { if (r) o.observe(r); }); return () => o.disconnect(); }, []);

  const filtered = filter === "All" ? portfolio : portfolio.filter(p => p.niche === filter);
  const to = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const an = id => vis[id] ? { opacity: 1, transform: "translateY(0)" } : { opacity: 0, transform: "translateY(30px)" };

  if (demo === "marks") return <MarksPlumbing onClose={() => setDemo(null)} />;
  if (demo === "prestige") return <PrestigePlumbing onClose={() => setDemo(null)} />;

  const y = "#eab308", yl = "#facc15";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#0a0a0f", color: "#e4e4e7", minHeight: "100vh", overflowX: "hidden" }}>
      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrollY > 50 ? "rgba(10,10,15,0.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: scrollY > 50 ? `1px solid ${y}20` : "1px solid transparent", transition: "all 0.3s" }}>
        <div style={{ fontSize: 22, fontWeight: 800, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span style={{ color: y }}>Lead</span> Yard</div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {agencyNav.map(i => <span key={i} onClick={() => to(i.toLowerCase())} style={{ fontSize: 14, fontWeight: 500, color: "#a1a1aa", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = y} onMouseLeave={e => e.target.style.color = "#a1a1aa"}>{i}</span>)}
          <button onClick={() => to("contact")} style={{ padding: "10px 22px", background: `linear-gradient(135deg, ${y}, #ca8a04)`, border: "none", borderRadius: 8, color: "#0a0a0f", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 0 20px ${y}40` }}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${y}18, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, border: `1px solid ${y}40`, background: `${y}12`, fontSize: 13, fontWeight: 500, color: yl, marginBottom: 28, letterSpacing: "0.5px" }}>WEBSITES THAT WORK AS HARD AS YOU DO</div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", maxWidth: 800, margin: "0 0 24px" }}>Stop losing money to <span style={{ background: `linear-gradient(135deg, ${y}, ${yl}, ${y})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>shit leads</span></h1>
        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#a1a1aa", maxWidth: 560, lineHeight: 1.6, margin: "0 0 40px" }}>We build websites for trade businesses that qualify leads, automate bookings, and stop time wasters — so you only deal with jobs worth doing.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => to("portfolio")} style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${y}, #ca8a04)`, border: "none", borderRadius: 10, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 0 30px ${y}40` }}>See Our Work</button>
          <button onClick={() => to("contact")} style={{ padding: "14px 32px", background: "transparent", border: `1px solid ${y}60`, borderRadius: 10, color: yl, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Talk To Us</button>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" ref={el => refs.current.services = el} style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto", transition: "all 0.8s", ...an("services") }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", color: y, textTransform: "uppercase" }}>What We Build</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Not just websites. <span style={{ color: y }}>Business tools.</span></h2>
          <p style={{ color: "#71717a", fontSize: 16, maxWidth: 500, margin: "16px auto 0" }}>Every build solves a specific problem your business actually has.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {agencyServices.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${y}18`, borderRadius: 16, padding: 32, transition: "all 0.3s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${y}55`; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${y}18`; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "#f4f4f5" }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" ref={el => refs.current.process = el} style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", transition: "all 0.8s", ...an("process") }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", color: y, textTransform: "uppercase" }}>How It Works</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Three steps. No bollocks.</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[{ s: "01", t: "You tell us what's broken", d: "A quick call where we figure out what's actually costing you time and money. No sales pitch — just questions." }, { s: "02", t: "We build it in days, not months", d: "You get a working site with real tools — lead filtering, booking, quoting — not a Wix template with stock photos." }, { s: "03", t: "You get back to actual work", d: "Your site handles the admin. You handle the jobs. We stay on for support and updates." }].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 28, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${y}12` }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: y, opacity: 0.6, fontFamily: "monospace", minWidth: 50 }}>{item.s}</span>
              <div><h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5", marginBottom: 6 }}>{item.t}</h3><p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>{item.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" ref={el => refs.current.portfolio = el} style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto", transition: "all 0.8s", ...an("portfolio") }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", color: y, textTransform: "uppercase" }}>Our Work</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Built for trades. <span style={{ color: y }}>Proven to work.</span></h2>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40 }}>
          {filterTags.map(tag => <button key={tag} onClick={() => setFilter(tag)} style={{ padding: "8px 20px", borderRadius: 100, border: filter === tag ? `1px solid ${y}` : "1px solid rgba(255,255,255,0.1)", background: filter === tag ? `${y}18` : "transparent", color: filter === tag ? yl : "#71717a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{tag}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {filtered.map(item => (
            <div key={item.title} style={{ borderRadius: 16, border: `1px solid ${y}15`, background: "rgba(255,255,255,0.02)", overflow: "hidden", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + "55"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${y}15`; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ height: 150, background: `linear-gradient(135deg, ${item.color}18, ${item.color}06)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: item.color, opacity: 0.15 }}>{item.title.split(" ").map(w => w[0]).join("")}</span>
                <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: item.status === "Live Demo" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: item.status === "Live Demo" ? "#34d399" : "#fbbf24" }}>{item.status}</span>
              </div>
              <div style={{ padding: 24 }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${y}15`, color: yl }}>{item.niche}</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f4f4f5", margin: "10px 0 6px" }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: y, fontWeight: 600, marginBottom: 10 }}>{item.tag}</p>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>{item.desc}</p>
                {item.demoId && <button onClick={() => setDemo(item.demoId)} style={{ marginTop: 16, padding: "10px 20px", background: item.color === "#18181b" ? "#18181b" : `linear-gradient(135deg, ${item.color}, ${item.color}cc)`, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>View Live Demo →</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={el => refs.current.about = el} style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto", transition: "all 0.8s", ...an("about") }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", color: y, textTransform: "uppercase" }}>Who We Are</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Two builders. <span style={{ color: y }}>No fluff.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[{ name: "Kaleb", role: "Builder", desc: "Designs and builds everything from the ground up. Obsessed with making things that actually work — not just look pretty.", accent: y }, { name: "Connor", role: "Growth", desc: "Your first point of contact. Figures out what your business needs and makes sure what we deliver moves the needle.", accent: "#ca8a04" }].map(p => (
            <div key={p.name} style={{ padding: 32, borderRadius: 16, border: `1px solid ${y}15`, background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${p.accent}30, ${p.accent}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, fontWeight: 800, color: p.accent }}>{p.name[0]}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", marginBottom: 4 }}>{p.name}</h3>
              <span style={{ fontSize: 13, fontWeight: 600, color: p.accent, letterSpacing: "1px", textTransform: "uppercase" }}>{p.role}</span>
              <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.7, marginTop: 16 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" ref={el => refs.current.contact = el} style={{ padding: "100px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center", transition: "all 0.8s", ...an("contact") }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "2px", color: y, textTransform: "uppercase" }}>Get In Touch</span>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginTop: 12 }}>Ready to stop losing leads?</h2>
        <p style={{ color: "#71717a", fontSize: 16, margin: "16px 0 40px", lineHeight: 1.6 }}>Tell us what's costing you time. We'll tell you exactly how we'd fix it — no obligation.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[{ t: "text", p: "Your name" }, { t: "email", p: "Your email" }, { t: "tel", p: "Phone number" }, { t: "text", p: "Your trade (e.g. Plumber, Roofer, Electrician)" }].map((f, i) => <input key={i} type={f.t} placeholder={f.p} style={{ padding: "14px 18px", borderRadius: 10, border: `1px solid ${y}30`, background: "rgba(255,255,255,0.04)", color: "#e4e4e7", fontSize: 15, outline: "none" }} onFocus={e => e.target.style.borderColor = y} onBlur={e => e.target.style.borderColor = `${y}30`} />)}
          <textarea placeholder="What's the biggest problem your business has right now?" rows={4} style={{ padding: "14px 18px", borderRadius: 10, border: `1px solid ${y}30`, background: "rgba(255,255,255,0.04)", color: "#e4e4e7", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          <button style={{ padding: "16px 32px", background: `linear-gradient(135deg, ${y}, #ca8a04)`, border: "none", borderRadius: 10, color: "#0a0a0f", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `0 0 30px ${y}40`, marginTop: 8 }}>Let's Talk →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "40px 24px", borderTop: `1px solid ${y}15`, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}><span style={{ color: y }}>Lead</span> Yard</div>
        <p style={{ fontSize: 13, color: "#52525b" }}>Websites that work as hard as you do.</p>
        <p style={{ fontSize: 12, color: "#3f3f46", marginTop: 8 }}>© 2026 Lead Yard. All rights reserved.</p>
      </footer>
    </div>
  );
}