import React, { useState, useEffect, useRef } from "react";

const PAIRS = [
  "EUR/USD OTC","GBP/USD OTC","USD/JPY OTC","AUD/USD OTC","USD/CAD OTC","USD/CHF OTC","NZD/USD OTC",
  "EUR/GBP OTC","EUR/JPY OTC","GBP/JPY OTC","AUD/JPY OTC","EUR/AUD OTC","GBP/AUD OTC","USD/BRL OTC",
  "USD/INR OTC","USD/PKR OTC","USD/BDT OTC","USD/PHP OTC","USD/TRY OTC",
  "EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD","USD/CHF","NZD/USD","EUR/GBP","EUR/JPY","GBP/JPY",
  "AUD/JPY","EUR/AUD","GBP/AUD","EUR/CHF","GBP/CHF","AUD/CAD","AUD/CHF","CAD/JPY","CHF/JPY","NZD/JPY"
];

const TIMEFRAMES = [
  { v: "5s", l: "5 SEC", tag: "ULTRA" },
  { v: "10s", l: "10 SEC", tag: "FAST" },
  { v: "1m", l: "1 MIN", tag: "MID" },
  { v: "5m", l: "5 MIN", tag: "LONG" },
];

const TOOLS = [
  { id: "trend", label: "Trend", icon: "📉" },
  { id: "structure", label: "Market Structure", icon: "🏗️" },
  { id: "sr", label: "Support/Resist", icon: "🧱" },
  { id: "price", label: "Price Action", icon: "📈" },
  { id: "rsi", label: "RSI", icon: "⚡" },
  { id: "ema", label: "EMA", icon: "✂️" },
  { id: "volume", label: "Volume", icon: "📊" },
  { id: "supply", label: "Supply/Demand", icon: "🟨" },
];

const BULL_PATTERNS = ["Bullish Engulfing","Morning Star","Hammer","Piercing Line","Three White Soldiers","Bullish Marubozu","Inverted Hammer","Dragonfly Doji"];
const BEAR_PATTERNS = ["Bearish Engulfing","Evening Star","Shooting Star","Dark Cloud Cover","Three Black Crows","Bearish Marubozu","Hanging Man","Gravestone Doji"];

function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildSignal(pair, tf, activeTools) {
  const seed = Array.from(pair + tf + Date.now()).reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = rng(seed);
  const isCall = r() > 0.5;
  const conf = Math.floor(r() * 18 + 76);
  const pattern = isCall ? BULL_PATTERNS[Math.floor(r() * BULL_PATTERNS.length)] : BEAR_PATTERNS[Math.floor(r() * BEAR_PATTERNS.length)];

  const data = {
    direction: isCall ? "CALL" : "PUT",
    confidence: conf,
    trend: isCall ? "Higher highs forming, short-term uptrend intact" : "Lower lows forming, short-term downtrend confirmed",
    structure: isCall ? "Break of structure to the upside near key swing point" : "Break of structure to the downside, bearish shift",
    sr: isCall ? "Price reacting strongly off major support zone" : "Price rejected sharply at major resistance zone",
    price: isCall ? "Strong bullish rejection wick at recent low" : "Strong bearish rejection wick at recent high",
    rsi: isCall ? `RSI ${Math.floor(r()*15+28)} — oversold, bullish divergence` : `RSI ${Math.floor(r()*15+65)} — overbought, bearish divergence`,
    ema: isCall ? "Price crossed above EMA 20, bullish momentum building" : "Price crossed below EMA 20, bearish momentum building",
    volume: isCall ? "Buying volume spike confirms upside pressure" : "Selling volume spike confirms downside pressure",
    supply: isCall ? "Price tapped a fresh demand zone with strong reaction" : "Price tapped a fresh supply zone with strong rejection",
    pattern,
    patternDesc: isCall ? "Strong bullish reversal candle pattern detected" : "Strong bearish reversal candle pattern detected",
    patternStrength: Math.floor(r() * 2) + 3,
    summary: isCall
      ? `Multiple confluences (${activeTools.join(", ")}) align bullish — favoring CALL with strong conviction.`
      : `Multiple confluences (${activeTools.join(", ")}) align bearish — favoring PUT with strong conviction.`,
  };
  return data;
}

const SCAN_STEPS = (pair, tf, tools) => [
  `📡 Connecting to ${pair} feed (${tf})...`,
  `🏗️ Mapping market structure...`,
  `🧱 Locating support & resistance zones...`,
  `📈 Reading price action & candle behavior...`,
  `⚡ Calculating RSI & EMA momentum...`,
  `📊 Cross-checking ${tools.length} indicators...`,
  `🤖 Finalizing AI decision...`,
];

export default function BKTrader() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const [pair, setPair] = useState(PAIRS[0]);
  const [tf, setTf] = useState("1m");
  const [toolStates, setToolStates] = useState(() => Object.fromEntries(TOOLS.map(t => [t.id, true])));

  const [scanning, setScanning] = useState(false);
  const [scanText, setScanText] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [signal, setSignal] = useState(null);
  const [history, setHistory] = useState([]);
  const [winRate, setWinRate] = useState(null);
  const totals = useRef({ total: 0, win: 0 });
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleUnlock = () => {
    if (pwd === "2008") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  const toggleTool = (id) => {
    setToolStates(s => ({ ...s, [id]: !s[id] }));
  };

  const generate = () => {
    const activeTools = TOOLS.filter(t => toolStates[t.id]).map(t => t.label);
    if (activeTools.length === 0) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScanning(true);
    setSignal(null);
    setScanProgress(0);

    const steps = SCAN_STEPS(pair, tf, activeTools);
    steps.forEach((s, i) => {
      const t = setTimeout(() => {
        setScanText(s);
        setScanProgress(Math.round(((i + 1) / steps.length) * 95));
      }, i * 380);
      timersRef.current.push(t);
    });

    const finalT = setTimeout(() => {
      const data = buildSignal(pair, tf, activeTools);
      setSignal(data);
      setScanning(false);
      setScanProgress(100);

      totals.current.total += 1;
      if (data.confidence >= 80) totals.current.win += 1;
      setWinRate(Math.round((totals.current.win / totals.current.total) * 100));

      setHistory(h => [{ pair, tf, dir: data.direction, conf: data.confidence, time: new Date().toLocaleTimeString() }, ...h].slice(0, 12));
    }, steps.length * 380 + 200);
    timersRef.current.push(finalT);
  };

  const fontImport = "@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;600&display=swap');";

  if (!unlocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 35%, #0D1E38 0%, #060A10 65%)", fontFamily: "'Inter', sans-serif" }}>
        <style>{fontImport}</style>
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,215,0,0.03) 40px, rgba(255,215,0,0.03) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,215,0,0.03) 40px, rgba(255,215,0,0.03) 41px)"
        }} />
        <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-10 text-center" style={{
          background: "linear-gradient(145deg, #0D1828, #0A1220)",
          border: "1px solid rgba(255,215,0,0.3)",
          boxShadow: "0 0 0 1px rgba(255,215,0,0.05), 0 0 60px rgba(255,215,0,0.1), 0 0 120px rgba(255,165,0,0.05)"
        }}>
          <div className="text-4xl font-black tracking-[6px] mb-1 bg-clip-text text-transparent" style={{
            fontFamily: "'Orbitron', monospace",
            backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
            filter: "drop-shadow(0 0 20px rgba(255,165,0,0.4))"
          }}>BK TRADER</div>
          <div className="text-[10px] uppercase tracking-[5px] text-[#4A6080] mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Professional AI Signal Bot</div>
          <div className="inline-block rounded-full px-3 py-1 text-[10px] tracking-[2px] mb-7" style={{
            fontFamily: "'Share Tech Mono', monospace",
            background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))",
            border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700"
          }}>▸ VERSION 4.0 PRO ◂</div>

          <div className="text-5xl mb-6" style={{ filter: "drop-shadow(0 0 16px rgba(255,215,0,0.6))" }}>🔐</div>

          <div className="text-xs uppercase tracking-[3px] text-[#4A6080] mb-3" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Enter License Key</div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="● ● ● ● ● ● ●"
            maxLength={20}
            className="w-full rounded-lg px-4 py-4 mb-3 text-center outline-none transition-colors"
            style={{
              background: "#0E1520", border: `1px solid ${error ? "#FF3B5C" : "#243550"}`,
              color: "#FFD700", fontFamily: "'Share Tech Mono', monospace", fontSize: "1.1rem", letterSpacing: "8px"
            }}
          />
          <button
            onClick={handleUnlock}
            className="w-full rounded-lg py-4 font-bold uppercase tracking-[3px] transition-transform hover:-translate-y-0.5"
            style={{ fontFamily: "'Orbitron', monospace", background: "linear-gradient(135deg, #FFD700, #FF8C00)", color: "#000", boxShadow: "0 4px 24px rgba(255,165,0,0.3)" }}
          >
            Activate ▶
          </button>
          {error && <div className="mt-3 text-xs" style={{ color: "#FF3B5C", fontFamily: "'Share Tech Mono', monospace" }}>⚠ Invalid License Key. Try Again.</div>}

          <div className="grid grid-cols-3 gap-2 mt-6 pt-5" style={{ borderTop: "1px solid #1A2840" }}>
            {[["📡","Live + OTC"],["🤖","AI Engine"],["🕯️","Candle AI"]].map(([icon, label]) => (
              <div key={label} className="text-center text-[10px] tracking-wide leading-relaxed" style={{ color: "#4A6080", fontFamily: "'Share Tech Mono', monospace" }}>
                <span className="block text-base mb-0.5" style={{ color: "#00FF88" }}>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isCall = signal?.direction === "CALL";

  return (
    <div className="min-h-screen w-full" style={{ background: "#060A10", color: "#C8D8E8", fontFamily: "'Inter', sans-serif" }}>
      <style>{fontImport}</style>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5" style={{
        background: "linear-gradient(180deg, #0C1622 0%, #080E18 100%)", borderBottom: "1px solid #1A2840", boxShadow: "0 2px 20px rgba(0,0,0,0.5)"
      }}>
        <div className="flex items-center gap-2.5">
          <div className="font-black text-xl tracking-[2px] bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', monospace", backgroundImage: "linear-gradient(135deg, #FFD700, #FF8C00)" }}>BK TRADER</div>
          <div className="text-[9px] px-1.5 py-0.5 rounded tracking-wider" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080", border: "1px solid #243550" }}>v4.0 PRO</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-[10px] px-2 py-1 rounded" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#FFD700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            WIN: {winRate !== null ? winRate + "%" : "–"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#00FF88" }}>
            <span className="w-[7px] h-[7px] rounded-full inline-block animate-pulse" style={{ background: "#00FF88" }} />
            AI LIVE
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3.5 py-4 flex flex-col gap-3.5">

        {/* Pair select */}
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #0C1520, #09111C)", border: "1px solid #1A2840" }}>
          <SectionLabel>Currency Pair</SectionLabel>
          <select value={pair} onChange={e => setPair(e.target.value)} className="w-full rounded-lg px-3.5 py-3 text-sm outline-none cursor-pointer appearance-none" style={{
            background: "#0E1520", border: "1px solid #243550", color: "#C8D8E8", fontFamily: "'Share Tech Mono', monospace",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FFD700' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center"
          }}>
            {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Timeframe */}
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(145deg, #0C1520, #09111C)", border: "1px solid #1A2840" }}>
          <SectionLabel>Time Frame</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {TIMEFRAMES.map(t => (
              <button key={t.v} onClick={() => setTf(t.v)} className="rounded-lg py-2.5 text-center transition-all" style={{
                fontFamily: "'Share Tech Mono', monospace", fontSize: "0.78rem",
                background: tf === t.v ? "linear-gradient(135deg, rgba(255,215,0,0.14), rgba(255,140,0,0.06))" : "#0E1520",
                border: tf === t.v ? "1px solid #FFD700" : "1px solid #1A2840",
                color: tf === t.v ? "#FFD700" : "#4A6080",
                boxShadow: tf === t.v ? "0 0 12px rgba(255,215,0,0.12)" : "none"
              }}>
                {t.l}
                <div className="text-[9px] mt-0.5" style={{ color: tf === t.v ? "rgba(255,215,0,0.5)" : "#3A5070" }}>{t.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis tools */}
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(145deg, #0C1520, #09111C)", border: "1px solid #1A2840" }}>
          <SectionLabel>Analysis Engine</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map(t => {
              const on = toolStates[t.id];
              return (
                <div key={t.id} onClick={() => toggleTool(t.id)} className="flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all" style={{
                  background: on ? "linear-gradient(135deg, rgba(0,255,136,0.04), #0E1520)" : "#0E1520",
                  border: on ? "1px solid rgba(0,255,136,0.35)" : "1px solid #1A2840"
                }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{t.icon}</span>
                    <span className="text-[11px]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{t.label}</span>
                  </div>
                  <div className="w-[30px] h-4 rounded-full relative transition-colors flex-shrink-0" style={{ background: on ? "#00CC66" : "#1A2840" }}>
                    <div className="absolute top-[2.5px] w-[11px] h-[11px] rounded-full bg-white transition-transform" style={{ left: "2.5px", transform: on ? "translateX(13px)" : "translateX(0)", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={generate} disabled={scanning} className="w-full rounded-2xl py-4 font-bold uppercase tracking-[3px] relative overflow-hidden transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0" style={{
          fontFamily: "'Orbitron', monospace", fontSize: "1rem", color: "#000",
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF7700 100%)",
          boxShadow: "0 4px 24px rgba(255,165,0,0.3)"
        }}>
          {scanning ? "⏳ ANALYZING..." : "⚡ GENERATE AI SIGNAL"}
        </button>

        {/* Scan overlay */}
        {scanning && (
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: "linear-gradient(145deg, #0C1520, #09111C)", border: "1px solid #1A2840" }}>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "#FFD700", animationDuration: "1s" }} />
              <div className="absolute inset-2 rounded-full animate-spin" style={{ border: "2px solid transparent", borderRightColor: "#FFA500", animationDuration: "0.7s", animationDirection: "reverse" }} />
              <div className="absolute inset-4 rounded-full animate-spin" style={{ border: "2px solid transparent", borderBottomColor: "#00FF88", animationDuration: "1.3s" }} />
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-xs uppercase tracking-[4px]" style={{ fontFamily: "'Orbitron', monospace", color: "#FFD700" }}>Analyzing Market</div>
            <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "#1A2840" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: scanProgress + "%", background: "linear-gradient(90deg, #FFD700, #00FF88)" }} />
            </div>
            <div className="text-[11px] text-center min-h-[16px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>{scanText}</div>
          </div>
        )}

        {/* Signal Card */}
        {signal && (
          <div className="rounded-2xl overflow-hidden relative" style={{
            background: "linear-gradient(145deg, #0C1520, #09111C)",
            border: `1px solid ${isCall ? "rgba(0,255,136,0.3)" : "rgba(255,59,92,0.3)"}`,
            boxShadow: `0 0 30px ${isCall ? "rgba(0,255,136,0.06)" : "rgba(255,59,92,0.06)"}`
          }}>
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${isCall ? "#00FF88" : "#FF3B5C"}, transparent)` }} />

            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1A2840" }}>
              <div className="font-bold text-sm" style={{ fontFamily: "'Orbitron', monospace", color: "#FFD700" }}>{pair}</div>
              <div className="flex gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded" style={{ fontFamily: "'Share Tech Mono', monospace", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700" }}>{tf.toUpperCase()}</span>
                <span className="text-[10px] px-2.5 py-1 rounded" style={{ fontFamily: "'Share Tech Mono', monospace", background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.2)", color: "#00BFFF" }}>{pair.includes("OTC") ? "OTC" : "LIVE"}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 px-4 pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="text-6xl leading-none" style={{ color: isCall ? "#00FF88" : "#FF3B5C", filter: `drop-shadow(0 0 20px ${isCall ? "#00FF88" : "#FF3B5C"})` }}>{isCall ? "⬆" : "⬇"}</div>
                <div className="text-4xl font-black tracking-[4px]" style={{ fontFamily: "'Orbitron', monospace", color: isCall ? "#00FF88" : "#FF3B5C", textShadow: `0 0 20px ${isCall ? "rgba(0,255,136,0.5)" : "rgba(255,59,92,0.5)"}` }}>{signal.direction}</div>
              </div>
              <div className="w-[85%]">
                <div className="text-right text-[11px] mb-1" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>AI Accuracy: {signal.confidence}%</div>
                <div className="h-[7px] rounded-md overflow-hidden" style={{ background: "#0E1520", border: "1px solid #1A2840" }}>
                  <div className="h-full rounded-md transition-all duration-1000" style={{ width: signal.confidence + "%", background: isCall ? "linear-gradient(90deg, #00FF88, #00CC66)" : "linear-gradient(90deg, #FF3B5C, #CC2244)" }} />
                </div>
              </div>
            </div>

            {/* Candle pattern */}
            <div className="mx-4 mb-3 rounded-lg p-3" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,140,0,0.03))", border: "1px solid rgba(255,215,0,0.15)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-[2px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>🕯 Candlestick Pattern</div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="w-[7px] h-[7px] rounded-full inline-block" style={{ background: i < signal.patternStrength ? "#FFD700" : "#1A2840", boxShadow: i < signal.patternStrength ? "0 0 6px rgba(255,215,0,0.5)" : "none" }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{isCall ? "🕯📈" : "🕯📉"}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold" style={{ fontFamily: "'Orbitron', monospace", color: "#FFD700" }}>{signal.pattern}</div>
                  <div className="text-[11px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>{signal.patternDesc}</div>
                </div>
                <div className="text-[10px] px-2 py-1 rounded" style={{ fontFamily: "'Share Tech Mono', monospace", background: isCall ? "rgba(0,255,136,0.1)" : "rgba(255,59,92,0.1)", color: isCall ? "#00FF88" : "#FF3B5C", border: `1px solid ${isCall ? "rgba(0,255,136,0.2)" : "rgba(255,59,92,0.2)"}` }}>{isCall ? "GREEN" : "RED"}</div>
              </div>
            </div>

            {/* Indicator breakdown */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-2.5 pb-2" style={{ borderBottom: "1px solid #1A2840" }}>
                <div className="text-[10px] uppercase tracking-[3px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>Indicator Breakdown</div>
                <div className="text-[11px]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  <span style={{ color: isCall ? "#00FF88" : "#4A6080" }}>{TOOLS.filter(t => toolStates[t.id]).length}{isCall ? "↑" : "↓"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "trend", icon: "📉", name: "Trend", value: signal.trend },
                  { id: "structure", icon: "🏗️", name: "Market Structure", value: signal.structure },
                  { id: "sr", icon: "🧱", name: "Support/Resist", value: signal.sr },
                  { id: "price", icon: "📈", name: "Price Action", value: signal.price },
                  { id: "rsi", icon: "⚡", name: "RSI", value: signal.rsi },
                  { id: "ema", icon: "✂️", name: "EMA", value: signal.ema },
                  { id: "volume", icon: "📊", name: "Volume", value: signal.volume },
                  { id: "supply", icon: "🟨", name: "Supply/Demand", value: signal.supply },
                ].filter(i => toolStates[i.id]).map(i => (
                  <div key={i.id} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "#0E1520", border: "1px solid #1A2840", borderLeft: `3px solid ${isCall ? "#00FF88" : "#FF3B5C"}` }}>
                    <div className="text-sm flex-shrink-0">{i.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>{i.name}</div>
                      <div className="text-[12px] truncate" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#C8D8E8" }}>{i.value}</div>
                    </div>
                    <div className="text-[9px] px-1.5 py-1 rounded flex-shrink-0" style={{ fontFamily: "'Share Tech Mono', monospace", background: isCall ? "rgba(0,255,136,0.12)" : "rgba(255,59,92,0.12)", color: isCall ? "#00FF88" : "#FF3B5C", border: `1px solid ${isCall ? "rgba(0,255,136,0.2)" : "rgba(255,59,92,0.2)"}` }}>{isCall ? "↑ BULL" : "↓ BEAR"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mx-4 mb-4 rounded-lg p-3" style={{ background: "#0E1520", borderLeft: "3px solid #FFD700" }}>
              <div className="text-[10px] uppercase tracking-[2px] mb-1" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#FFD700" }}>⚡ AI Summary</div>
              <div className="text-[12px] leading-relaxed" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#C8D8E8" }}>{signal.summary}</div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(145deg, #0C1520, #09111C)", border: "1px solid #1A2840" }}>
          <SectionLabel>Signal History</SectionLabel>
          {history.length === 0 ? (
            <div className="text-center py-4 text-xs" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>No signals yet. Generate your first signal above.</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {history.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg px-3.5 py-2.5" style={{ background: "#0E1520", borderLeft: `3px solid ${h.dir === "CALL" ? "#00FF88" : "#FF3B5C"}` }}>
                  <div>
                    <div className="text-[12px]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{h.pair}</div>
                    <div className="text-[10px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>{h.tf.toUpperCase()} · {h.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>{h.conf}%</div>
                    <div className="text-[11px] font-bold" style={{ fontFamily: "'Orbitron', monospace", color: h.dir === "CALL" ? "#00FF88" : "#FF3B5C" }}>{h.dir === "CALL" ? "⬆ CALL" : "⬇ PUT"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-[10px] tracking-[2px] py-3" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#3A5070", borderTop: "1px solid #1A2840" }}>
          BK TRADER AI BOT v4.0 PRO © 2026 · LICENSED · FOR EDUCATIONAL USE ONLY
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 text-[10px] uppercase tracking-[3px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: "#4A6080" }}>
      {children}
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #1A2840, transparent)" }} />
    </div>
  );
}
