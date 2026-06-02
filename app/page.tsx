"use client";
import { useState } from "react";

const EVENT_CATS = ["all","music","food","arts","sports","festivals","outdoors","indigenous"];
const ATTR_CATS  = ["all","nature","history","food","arts","adventure","indigenous"];
const gold = "#c9a96e";

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 20, border: "1px solid",
      borderColor: active ? "#1a1a1a" : "#ddd",
      background: active ? "#1a1a1a" : "transparent",
      color: active ? "#fff" : "#999",
      fontSize: 11, fontFamily: "Georgia,serif", cursor: "pointer",
    }}>{label}</button>
  );
}

function Card({ item, keyId, isEvent, selected, onToggle }: any) {
  const sel = selected.has(keyId);
  return (
    <div onClick={() => onToggle(keyId)} style={{
      display: "grid", gridTemplateColumns: "28px 1fr", gap: 12,
      padding: "14px 16px", borderRadius: 4, cursor: "pointer",
      background: sel ? "#fffcf4" : "#fff",
      border: `1px solid ${sel ? gold + "88" : "#e8e4dc"}`,
    }}>
      <div style={{
        width: 17, height: 17, borderRadius: 3, marginTop: 2, flexShrink: 0,
        border: `1.5px solid ${sel ? gold : "#ccc"}`,
        background: sel ? gold : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {sel && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 3 }}>
          {item.name}
          {item.anchor && (
            <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: gold, border: `1px solid ${gold}66`, borderRadius: 2, padding: "1px 5px", marginLeft: 8 }}>Anchor</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          {isEvent && item.date && <span>📅 {item.date}</span>}
          {item.location && <span>📍 {item.location}</span>}
          <span style={{ textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{item.category}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.65 }}>{item.description}</p>
        {item.tip && (
          <div style={{ marginTop: 8, borderLeft: `2px solid ${gold}55`, paddingLeft: 10, fontSize: 12, color: "#999", lineHeight: 1.5 }}>
            💡 {item.tip}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripPlanner() {
  const [screen, setScreen] = useState<"search"|"events"|"attractions"|"list">("search");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [data, setData]           = useState<any>(null);
  const [tab, setTab]             = useState("events");
  const [eventCat, setEventCat]   = useState("all");
  const [attrCat, setAttrCat]     = useState("all");
  const [selected, setSelected]   = useState(new Set<string>());

  const toggle = (key: string) => setSelected(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  const canSearch = destination.trim() && startDate && endDate;

  const handleSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setData(null);
    setSelected(new Set());
    setTab("events");
    setEventCat("all");
    setAttrCat("all");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate, endDate, interests }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
      setScreen("events");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const events      = data?.events      || [];
  const attractions = data?.attractions || [];
  const visibleEvents = eventCat === "all" ? events : events.filter((e: any) => e.category === eventCat);
  const visibleAttrs  = attrCat  === "all" ? attractions : attractions.filter((a: any) => a.category === attrCat);
  const myEvents = events.filter((_: any, i: number) => selected.has(`e${i}`));
  const myAttrs  = attractions.filter((_: any, i: number) => selected.has(`a${i}`));
  const myCount  = myEvents.length + myAttrs.length;

  const iStyle: any = { width: "100%", height: 42, background: "#f7f4ef", border: "1px solid #ddd", borderRadius: 3, color: "#1a1a1a", fontSize: 14, fontFamily: "Georgia,serif", padding: "0 14px", boxSizing: "border-box", outline: "none" };
  const lStyle: any = { fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 6, display: "block" };

  const tabBtn = (label: string, count: number, t: string) => (
    <button onClick={() => setTab(t)} style={{
      padding: "10px 18px", border: "none", background: "transparent",
      borderBottom: `2px solid ${tab === t ? "#1a1a1a" : "transparent"}`,
      color: tab === t ? "#1a1a1a" : "#aaa", fontSize: 12,
      fontFamily: "Georgia,serif", letterSpacing: "0.08em",
      textTransform: "uppercase" as const, cursor: "pointer", marginBottom: -2,
    }}>{label} <span style={{ opacity: 0.5 }}>({count})</span></button>
  );

  if (screen === "search") return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", fontFamily: "Georgia,serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Trip Planner</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 400, color: "#f7f4ef", lineHeight: 1.2 }}>Are you going on<br/>an adventure?</h1>
        <p style={{ margin: "0 0 36px", fontSize: 13, color: "#555", fontStyle: "italic" }}>Enter a destination and dates to find events and attractions.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lStyle}>Destination or Region</label>
            <input value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Southern Alberta, Tuscany, New Orleans"
              style={iStyle} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lStyle}>From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={lStyle}>To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={iStyle} />
            </div>
          </div>
          <div>
            <label style={lStyle}>Interests <span style={{ color: "#444" }}>(optional)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {["music","food","arts","sports","festivals","outdoors","indigenous","nature","history","adventure"].map(cat => {
                const active = interests.split(",").map(s => s.trim()).filter(Boolean).includes(cat);
                return (
                  <button key={cat} onClick={() => {
                    const current = interests.split(",").map(s => s.trim()).filter(Boolean);
                    const next = active ? current.filter(c => c !== cat) : [...current, cat];
                    setInterests(next.join(", "));
                  }} style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: active ? gold : "#333",
                    background: active ? gold : "transparent",
                    color: active ? "#1a1a1a" : "#777",
                    fontSize: 12, fontFamily: "Georgia,serif", cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                  }}>{cat}</button>
                );
              })}
            </div>
          </div>
          {error && <div style={{ color: "#e07070", fontSize: 12 }}>{error}</div>}
          <button onClick={handleSearch} disabled={!canSearch || loading} style={{
            marginTop: 8, height: 46, background: canSearch && !loading ? gold : "#2a2a2a",
            color: canSearch && !loading ? "#1a1a1a" : "#444", border: "none", borderRadius: 3,
            fontSize: 13, fontFamily: "Georgia,serif", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase", cursor: canSearch && !loading ? "pointer" : "not-allowed",
          }}>
            {loading ? "Finding events…" : "Find Events & Attractions →"}
          </button>
        </div>
      </div>
    </div>
  );

  const navBar = (title: string, onBack: () => void, backLabel: string, onNext?: () => void, nextLabel?: string) => (
    <div style={{ background: "#1a1a1a", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 }}>Trip Planner</div>
        <div style={{ fontSize: 18, fontWeight: 400, color: "#f7f4ef" }}>{destination}</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 2, fontStyle: "italic" }}>{startDate} – {endDate}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8 }}>
        <div style={{ fontSize: 12, color: gold, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 600 }}>{title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", borderRadius: 3, color: "#888", fontSize: 11, fontFamily: "Georgia,serif", padding: "6px 12px", cursor: "pointer" }}>
            ← {backLabel}
          </button>
          {onNext && (
            <button onClick={onNext} style={{ background: gold, border: "none", borderRadius: 3, color: "#1a1a1a", fontSize: 11, fontFamily: "Georgia,serif", fontWeight: 600, padding: "6px 12px", cursor: "pointer" }}>
              {nextLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (screen === "events") return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "Georgia,serif", color: "#1a1a1a" }}>
      {navBar("Events", () => setScreen("search"), "Search", () => setScreen("attractions"), "Attractions")}
      <div style={{ padding: "20px 24px" }}>
        {data?.vibeCheck && (
          <div style={{ background: "#fff", borderLeft: `3px solid ${gold}`, padding: "14px 18px", marginBottom: 20, borderRadius: "0 3px 3px 0" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: gold, marginBottom: 6 }}>Vibe Check</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#555", fontStyle: "italic" }}>{data.vibeCheck}</p>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
          {EVENT_CATS.map(c => <Pill key={c} label={c} active={eventCat === c} onClick={() => setEventCat(c)} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {visibleEvents.length === 0
            ? <div style={{ textAlign: "center", padding: "30px 0", color: "#bbb", fontSize: 13 }}>No events in this category.</div>
            : visibleEvents.map((ev: any) => {
                const i = events.indexOf(ev);
                return <Card key={i} item={ev} keyId={`e${i}`} isEvent selected={selected} onToggle={toggle} />;
              })
          }
        </div>
      </div>
    </div>
  );

  if (screen === "attractions") return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "Georgia,serif", color: "#1a1a1a" }}>
      {navBar("Attractions", () => setScreen("events"), "Events", () => setScreen("list"), "My List")}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
          {ATTR_CATS.map(c => <Pill key={c} label={c} active={attrCat === c} onClick={() => setAttrCat(c)} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {visibleAttrs.length === 0
            ? <div style={{ textAlign: "center", padding: "30px 0", color: "#bbb", fontSize: 13 }}>No attractions in this category.</div>
            : visibleAttrs.map((a: any) => {
                const i = attractions.indexOf(a);
                return <Card key={i} item={a} keyId={`a${i}`} isEvent={false} selected={selected} onToggle={toggle} />;
              })
          }
        </div>
      </div>
    </div>
  );

  if (screen === "list") return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "Georgia,serif", color: "#1a1a1a" }}>
      {navBar("My List", () => setScreen("attractions"), "Attractions")}
      <div style={{ padding: "20px 24px" }}>
        {myCount === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Nothing selected yet.</div>
            <button onClick={() => setScreen("events")} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: 3, color: "#aaa", fontSize: 12, fontFamily: "Georgia,serif", padding: "8px 16px", cursor: "pointer" }}>← Back to Events</button>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 4, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#1a1a1a", marginBottom: 14 }}>My List ({myCount})</div>
            {myEvents.length > 0 && (
              <div style={{ marginBottom: myAttrs.length > 0 ? 16 : 0 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: gold, marginBottom: 8 }}>Events</div>
                {[...myEvents].sort((a: any, b: any) => {
                  const parse = (s: string) => new Date(s.replace(/[–—].+/, "").replace(/\(.+\)/, "").replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*\s+/i, "").trim()).getTime();
                  return parse(a.date) - parse(b.date);
                }).map((ev: any, i: number, arr: any[]) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0ece4" : "none", alignItems: "start" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: gold, lineHeight: 1.5, paddingTop: 1 }}>
                      {ev.date.replace(/,?\s*\d{4}/, "").replace(/\(.+\)/, "").trim()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{ev.name}</div>
                      {ev.location && <div style={{ fontSize: 12, color: "#aaa" }}>{ev.location}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {myAttrs.length > 0 && (
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: gold, marginBottom: 8 }}>Attractions</div>
                {[...myAttrs].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((a: any, i: number, arr: any[]) => (
                  <div key={i} style={{ padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0ece4" : "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                      {a.location && <span>📍 {a.location}</span>}
                      {a.hours && <span>🕐 {a.hours}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return <div />;
}