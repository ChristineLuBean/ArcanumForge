import { useState, useCallback } from "react";

// ─── RinkWorks Engine ────────────────────────────────────────────────────────

const SINGLE_VOWELS: string = "aeiou";

// Weighted consonants (more common = more weight)
const CONSONANT_WEIGHTS: [string, number][] = [
  ["t", 8], ["s", 8], ["r", 7], ["n", 7], ["l", 6], ["d", 6], ["m", 5], ["c", 5], ["p", 5],
  ["b", 4], ["f", 4], ["g", 4], ["h", 4], ["w", 4], ["k", 3], ["v", 3], ["y", 2], ["j", 1], ["x", 1], ["z", 1], ["q", 1]
];

const VOWEL_COMBOS: string[] = ["ai", "ae", "ao", "au", "ea", "ee", "ei", "eo", "eu", "ia", "ie", "io", "oa", "oe", "oi", "ou", "ua", "ue", "ui", "uo"];
const CONSONANT_COMBOS_BEGIN: string[] = [
  "bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gh", "gl", "gr", "ph", "pl", "pr", "qu", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "str", "sw", "th", "tr", "tw", "wh", "wr", "chr", "phr", "shr", "spl", "spr", "squ", "thr"
];
const CONSONANT_COMBOS_ANY: string[] = [
  ...CONSONANT_COMBOS_BEGIN,
  "ck", "ct", "ld", "lf", "lk", "ll", "lm", "ln", "lp", "lt", "lv", "mb", "mp", "nd", "nk", "nn", "nt", "ph", "rk", "rl", "rm", "rn", "rp", "rs", "rt", "rv", "rw", "sk", "sl", "sm", "sn", "sp", "ss", "st", "sw", "th", "tt", "wl", "xt"
];

const SYLLABLES: string[] = [
  "al", "an", "ar", "as", "ash", "at", "ath", "eld", "en", "esh", "est", "eth", "il", "in", "ir", "ish", "it", "ith",
  "old", "on", "or", "oth", "ul", "un", "ur", "uth", "tor", "ash", "ald", "dar", "mor", "kal", "vel", "ser", "nar",
  "fen", "thal", "dor", "mir", "sol", "ran", "den", "far", "gal", "kar", "lar", "mar", "par", "tar", "var", "zar",
  "bel", "cel", "del", "fel", "gel", "hel", "jel", "kel", "mel", "nel", "pel", "rel", "sel", "tel", "vel", "wel",
  "aer", "aur", "eer", "ier", "oir", "oor", "our", "uer", "air", "bir", "cir", "dir", "fir", "gir", "hir", "kir",
  "mon", "von", "con", "bon", "don", "fon", "gon", "hon", "jon", "lon", "non", "pon", "ron", "son", "ton", "won",
  "ris", "dis", "fis", "gis", "his", "kis", "lis", "mis", "nis", "pis", "quis", "sis", "tis", "vis", "wis", "xis",
  "ade", "afe", "age", "ake", "ale", "ame", "ane", "ape", "are", "ate", "ave", "aze",
  "ibe", "ice", "ide", "ife", "ige", "ike", "ile", "ime", "ine", "ipe", "ire", "ise", "ite", "ive", "ize",
  "obe", "ode", "ofe", "oge", "oke", "ole", "ome", "one", "ope", "ore", "ose", "ote", "ove", "owe", "oze",
  "ube", "ude", "ufe", "uge", "uke", "ule", "ume", "une", "upe", "ure", "use", "ute", "uve", "uze"
];

const INSULT_UNITS: string[] = ["ass", "crud", "dork", "dumb", "fool", "goon", "hack", "jerk", "knob", "lame", "nerd", "prat", "twit", "wank", "boob", "clod", "dolt", "drip", "dunce", "goof", "mutt", "nitwit", "peon", "putz", "runt", "slob", "snob", "twit"];
const MUSHY_UNITS: string[] = ["dear", "love", "darling", "heart", "honey", "sugar", "sweet", "angel", "dove", "gem", "pearl", "rose", "joy", "light", "star", "babe", "pet", "treasure", "lamb", "pumpkin", "button", "bunny", "cookie", "cupcake"];
const MUSHY_ENDINGS: string[] = ["kins", "poo", "bear", "boo", "cake", "pie", "bug", "cup", "drop", "kiss", "love", "muffin", "pie", "plum", "pop", "snug", "sugar", "sweet", "tart", "wink"];
const STUPID_SYLLABLES: string[] = ["ab", "ub", "ob", "ib", "eb", "um", "om", "im", "em", "am", "un", "on", "in", "en", "an"];

function weightedChoice(weights: [string, number][]): string {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [item, w] of weights) { r -= w; if (r <= 0) return item; }
  return weights[weights.length - 1][0];
}

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genConsonant(): string { return weightedChoice(CONSONANT_WEIGHTS); }
function genVowel(): string { return SINGLE_VOWELS[Math.floor(Math.random() * SINGLE_VOWELS.length)]; }
function genVowelOrCombo(): string { return Math.random() < 0.3 ? randomFrom(VOWEL_COMBOS) : genVowel(); }
function genConsonantBegin(): string { return Math.random() < 0.3 ? randomFrom(CONSONANT_COMBOS_BEGIN) : genConsonant(); }
function genConsonantAny(): string { return Math.random() < 0.3 ? randomFrom(CONSONANT_COMBOS_ANY) : genConsonant(); }
function genSyllable(): string { return randomFrom(SYLLABLES); }
function genInsult(): string { return randomFrom(INSULT_UNITS); }
function genMushy(): string { return randomFrom(MUSHY_UNITS); }
function genMushyEnd(): string { return randomFrom(MUSHY_ENDINGS); }
function genStupidConsonant(): string { return weightedChoice([["b", 3], ["d", 3], ["g", 3], ["p", 3], ["t", 3], ["f", 2], ["m", 2], ["n", 2], ["l", 2], ["r", 2]]); }
function genStupidSyllable(): string { return randomFrom(STUPID_SYLLABLES); }

// Parse and execute a template
function parseTemplate(template: string): string {
  let pos = 0;

  function parseLiteral(): string[] {
    // inside ( ), collect | separated literal options
    const options: string[] = [];
    let current: string[] = [];
    while (pos < template.length && template[pos] !== ')') {
      if (template[pos] === '|') {
        options.push(current.join(''));
        current = [];
        pos++;
      } else if (template[pos] === '(') {
        pos++;
        const nested = parseLiteral();
        current.push(randomFrom(nested));
      } else if (template[pos] === '<') {
        pos++;
        const nested = parseAngle();
        current.push(randomFrom(nested));
      } else {
        current.push(template[pos]);
        pos++;
      }
    }
    options.push(current.join(''));
    if (template[pos] === ')') pos++;
    return options;
  }

  function parseAngle(): string[] {
    // inside < >, collect | separated template-code options
    const options: string[] = [];
    let current: string[] = [];
    while (pos < template.length && template[pos] !== '>') {
      if (template[pos] === '|') {
        options.push(current.join(''));
        current = [];
        pos++;
      } else if (template[pos] === '(') {
        pos++;
        const nested = parseLiteral();
        current.push(randomFrom(nested));
      } else if (template[pos] === '<') {
        pos++;
        const nested = parseAngle();
        current.push(randomFrom(nested));
      } else {
        current.push(evalCode(template[pos]));
        pos++;
      }
    }
    options.push(current.join(''));
    if (template[pos] === '>') pos++;
    return options;
  }

  function evalCode(c: string): string {
    switch (c) {
      case 's': return genSyllable();
      case 'v': return genVowel();
      case 'V': return genVowelOrCombo();
      case 'c': return genConsonant();
      case 'B': return genConsonantBegin();
      case 'C': return genConsonantAny();
      case 'i': return genInsult();
      case 'm': return genMushy();
      case 'M': return genMushyEnd();
      case 'D': return genStupidConsonant();
      case 'd': return genStupidSyllable();
      case "'": return "'";
      case '-': return '-';
      default: return c;
    }
  }

  let result = '';
  while (pos < template.length) {
    const ch = template[pos];
    if (ch === '(') {
      pos++;
      const options = parseLiteral();
      result += randomFrom(options);
    } else if (ch === '<') {
      pos++;
      const options = parseAngle();
      result += randomFrom(options);
    } else {
      result += evalCode(ch);
      pos++;
    }
  }
  return result;
}

function collapseTriples(name: string): string {
  // Reduce 3+ same letters to 2; reduce impossible doubles to 1
  const NEVER_DOUBLE = new Set(['q', 'x', 'y', 'w', 'h', 'j', 'v']);
  let result = name.replace(/(.)\1{2,}/g, '$1$1');
  for (const ch of NEVER_DOUBLE) {
    result = result.replace(new RegExp(ch + ch, 'gi'), ch);
  }
  return result;
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function generateName(template: string, collapse: boolean): string {
  let name = parseTemplate(template);
  if (collapse) name = collapseTriples(name);
  return capitalize(name);
}

// ─── Presets ─────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  templates: string[];
}

const PRESETS: Preset[] = [
  { label: "Default Mix", templates: ["ss", "BVC", "BVCs", "sBVC", "<s|ss>", "BvC", "sVC", "BVCv"] },
  { label: "Elvish", templates: ["ss(ien|ian)", "<Bv|V>(l|r|n|s)v", "(ae|ai|el|il|ol)(r|l|n|s)v", "Bv(s|ss)", "(al|el|il|ol|ul)ss"] },
  { label: "Orcish", templates: ["BVC", "(gr|br|kr|dr)<VC|VCC>", "(ug|og|ag)(r|k|m)", "(grot|brot|krot)VC", "<s>VC"] },
  { label: "Dwarven", templates: ["(d|th|k|g)VCC", "<s>(in|im|on|om|un|um)", "(Dur|Bal|Tar|Mar|Bor|Gim)(in|im|li|ri|ak)", "(k|g|d|t)VCCv", "ssVC"] },
  { label: "Demonic", templates: ["(z|x|v)(a|e)(r|l|k|th)", "(mez|bel|gor|vel|mal)(ix|ath|ior|ion)", "(z|x)(ar|er|ir|or|ur)(il|al|el|on|an)", "BV(xx|zz|kk)V", "(az|ez|iz|oz|uz)(ar|er|ir|al|el)"] },
  { label: "Nordic", templates: ["(Björn|Orm|Sigurd|Ragnar|Leif|Ulf)(r|ar|ar)", "(Ás|Bjarg|Ulf|Sig|Orm)(björn|bjørn|mund|laug|ríðr)", "(Erik|Olaf|Gunnar|Harald|Ivar)(r|)", "(Ey|Þór|Frøy|Óðin)(<s|ss>)"] },
  { label: "Celestial", templates: ["(aer|aur|sol|lux|ver)(iel|iel|ael|eel|oen)", "(sar|nar|tal|val|ael)(ion|iel|iath|ias|ean)", "V(r|n|l)Vs", "(al|el|il|ol)V(r|n|l)vs", "(ith|ath|eth|oth|uth)(ael|iel|oel|uel)"] },
  { label: "Chaotic/Silly", templates: ["ss(ly|ily|ish|ing)", "(d|t|p|w)(r)VCv", "<s|ss>M", "im(d|t|p|b)Mv", "(boo|poo|goo|woo)(ble|gle|fle|dle)"] },
];

type GeneratorMode = "simple" | "advanced";

// ─── Component ───────────────────────────────────────────────────────────────

export default function FantasyNameGen() {
  const [mode, setMode] = useState<GeneratorMode>("simple");
  const [preset, setPreset] = useState<number>(0);
  const [advTemplate, setAdvTemplate] = useState<string>("");
  const [collapse, setCollapse] = useState<boolean>(true);
  const [count, setCount] = useState<number>(12);
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const generate = useCallback(() => {
    setError("");
    const templates = mode === "simple"
      ? PRESETS[preset].templates
      : [advTemplate.trim()];

    if (mode === "advanced" && !advTemplate.trim()) {
      setError("Enter a template to proceed.");
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      try {
        const generated = Array.from({ length: count }, () => {
          const t = randomFrom(templates);
          return generateName(t, collapse);
        });
        setNames(generated);
      } catch (e) {
        setError("Template error: " + (e as Error).message);
      }
      setGenerating(false);
    }, 120);
  }, [mode, preset, advTemplate, collapse, count]);

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(names.join(", ")).then(() => {
      setCopied("__all__");
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0b0f",
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      color: "#c8b89a",
      padding: "2rem 1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Atmospheric background texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a0f1f 0%, #0d0b0f 70%)",
      }} />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.5,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.4em", color: "#7a5c3a", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            ✦ An Alchemic Nomenclature Engine ✦
          </div>
          <h1 style={{
            fontFamily: "'Trajan Pro', 'Times New Roman', Times, serif",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 700,
            color: "#e8d5b0",
            letterSpacing: "0.06em",
            margin: 0,
            textShadow: "0 0 40px rgba(180,120,60,0.3), 0 2px 4px rgba(0,0,0,0.8)",
          }}>
            Arcanum Forge
          </h1>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #5a3e22, #8b6535, #5a3e22, transparent)", margin: "1rem auto", width: "80%" }} />
          <p style={{ fontSize: "0.85rem", color: "#8a7060", margin: 0, fontStyle: "italic" }}>
            From nothing, a name.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: "1.5rem", background: "#130f18", borderRadius: 6, padding: 3, border: "1px solid #2a1f35" }}>
          {(["simple", "advanced"] as GeneratorMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "0.6rem 1rem", border: "none", borderRadius: 4, cursor: "pointer",
              background: mode === m ? "linear-gradient(135deg, #3d2a14, #5a3e22)" : "transparent",
              color: mode === m ? "#e8d5b0" : "#6a5a4a",
              fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase",
              fontFamily: "inherit", transition: "all 0.2s",
              boxShadow: mode === m ? "0 0 12px rgba(90,62,34,0.4)" : "none",
            }}>
              {m === "simple" ? "⚔ Simple" : "✦ Advanced"}
            </button>
          ))}
        </div>

        {/* Control panel */}
        <div style={{
          background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
          border: "1px solid #2a1f35",
          borderRadius: 8, padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>
          {mode === "simple" ? (
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.2em", color: "#7a5c3a", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Name Style
              </label>
              <select value={preset} onChange={e => setPreset(+e.target.value)} style={{
                width: "100%", padding: "0.65rem 1rem",
                background: "#0d0b0f", border: "1px solid #3a2a1a",
                borderRadius: 4, color: "#c8b89a", fontSize: "0.95rem",
                fontFamily: "inherit", cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238b6535' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center",
              }}>
                {PRESETS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.2em", color: "#7a5c3a", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Name Generation Template
              </label>
              <input value={advTemplate} onChange={e => setAdvTemplate(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                placeholder="e.g. ss or BVC or (al|el)(r|n)Vs"
                style={{
                  width: "100%", padding: "0.65rem 1rem",
                  background: "#0d0b0f", border: "1px solid #3a2a1a",
                  borderRadius: 4, color: "#c8b89a", fontSize: "0.95rem",
                  fontFamily: "'Courier New', monospace", boxSizing: "border-box",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#8b6535"}
                onBlur={e => e.currentTarget.style.borderColor = "#3a2a1a"}
              />
              {/* Quick reference */}
              <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {[["s", "syllable"], ["v", "vowel"], ["V", "vowel+combo"], ["c", "consonant"], ["B", "consonant begin"], ["C", "consonant any"], ["i", "insult unit"], ["m", "mushy"], ["M", "mushy end"], ["D", "silly cons."], ["d", "silly syl."], ["( )", "literal"], ["< >", "template"], ["  |  ", "OR"]].map(([k, v]) => (
                  <div key={k} style={{
                    background: "#1a1220", border: "1px solid #2a1f30",
                    borderRadius: 3, padding: "0.2rem 0.5rem",
                    fontSize: "0.68rem", display: "flex", gap: "0.3rem", alignItems: "center",
                  }}>
                    <span style={{ color: "#c8a060", fontFamily: "monospace", fontWeight: 700 }}>{k}</span>
                    <span style={{ color: "#5a4a3a" }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Sample templates */}
              <div style={{ marginTop: "0.6rem" }}>
                <span style={{ fontSize: "0.68rem", color: "#5a4a3a", letterSpacing: "0.1em" }}>SAMPLES: </span>
                {["ss", "BVC", "BVCs", "s'vCv", "(st|tr)VC", "ss(ien|ian)", "<s|ss>v", "(ma)<VC|s>"].map(t => (
                  <button key={t} onClick={() => setAdvTemplate(t)} style={{
                    background: "none", border: "1px solid #2a1f30", borderRadius: 3,
                    padding: "0.15rem 0.45rem", margin: "0.15rem",
                    color: "#8a6a40", fontSize: "0.7rem", fontFamily: "monospace",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#8b6535"; e.currentTarget.style.color = "#c8a060"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a1f30"; e.currentTarget.style.color = "#8a6a40"; }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.72rem", letterSpacing: "0.15em", color: "#7a5c3a", textTransform: "uppercase", whiteSpace: "nowrap" }}>Count</label>
              <select value={count} onChange={e => setCount(+e.target.value)} style={{
                padding: "0.4rem 0.6rem", background: "#0d0b0f", border: "1px solid #3a2a1a",
                borderRadius: 4, color: "#c8b89a", fontSize: "0.85rem", fontFamily: "inherit", cursor: "pointer",
              }}>
                {[10, 20, 50 ,100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {mode === "advanced" && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <div onClick={() => setCollapse(c => !c)} style={{
                  width: 36, height: 20, borderRadius: 10, transition: "background 0.2s", cursor: "pointer",
                  background: collapse ? "linear-gradient(90deg, #5a3e22, #8b6535)" : "#1e1620",
                  border: "1px solid #3a2a1a", position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%",
                    background: collapse ? "#e8d5b0" : "#3a2a3a",
                    transition: "left 0.2s",
                    left: collapse ? 18 : 2,
                  }} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#7a6a5a", letterSpacing: "0.1em" }}>Collapse Triples</span>
              </label>
            )}

            <button onClick={generate} disabled={generating} style={{
              marginLeft: "auto",
              padding: "0.6rem 1.8rem",
              background: generating ? "#1e1620" : "linear-gradient(135deg, #5a3e22 0%, #8b6535 50%, #5a3e22 100%)",
              border: "1px solid #8b6535",
              borderRadius: 4, color: "#e8d5b0",
              fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: "inherit", cursor: generating ? "not-allowed" : "pointer",
              transition: "all 0.2s", boxShadow: generating ? "none" : "0 0 20px rgba(139,101,53,0.25)",
            }}
              onMouseEnter={e => { if (!generating) e.currentTarget.style.boxShadow = "0 0 30px rgba(139,101,53,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = generating ? "none" : "0 0 20px rgba(139,101,53,0.25)"; }}>
              {generating ? "Weaving..." : "✦ Generate"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#1f0a0a", border: "1px solid #5a1a1a", borderRadius: 6, padding: "0.75rem 1rem", marginBottom: "1rem", color: "#c05050", fontSize: "0.85rem" }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {names.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
            border: "1px solid #2a1f35",
            borderRadius: 8, padding: "1.5rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.72rem", letterSpacing: "0.2em", color: "#7a5c3a", textTransform: "uppercase" }}>
                Generated Names
              </div>
              <button onClick={copyAll} style={{
                background: "none", border: "1px solid #2a1f35", borderRadius: 4,
                padding: "0.3rem 0.8rem", color: copied === "__all__" ? "#8bc58b" : "#7a5c3a",
                fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
              }}>
                {copied === "__all__" ? "✓ Copied All" : "Copy All"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
              {names.map((name, i) => (
                <div key={i} onClick={() => copyName(name)} style={{
                  padding: "0.6rem 0.9rem",
                  background: copied === name ? "linear-gradient(135deg, #0f1f0f, #1a2f1a)" : "#0d0b10",
                  border: `1px solid ${copied === name ? "#4a7a4a" : "#221a2e"}`,
                  borderRadius: 5, cursor: "pointer",
                  color: copied === name ? "#8bc58b" : "#d4c4a8",
                  fontSize: "1.05rem",
                  letterSpacing: "0.05em",
                  transition: "all 0.15s",
                  userSelect: "none",
                  textAlign: "center",
                  fontStyle: "italic",
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
                  onMouseEnter={e => { if (copied !== name) { e.currentTarget.style.borderColor = "#5a3e22"; e.currentTarget.style.background = "#130f18"; } }}
                  onMouseLeave={e => { if (copied !== name) { e.currentTarget.style.borderColor = "#221a2e"; e.currentTarget.style.background = "#0d0b10"; } }}>
                  {copied === name ? "✓ Copied" : name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.68rem", color: "#4a3a2a", textAlign: "center", margin: "0.9rem 0 0", fontStyle: "italic" }}>
              Click any name to copy it
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.68rem", color: "#3a2a1a", letterSpacing: "0.15em" }}>
          ENGINE BASED ON <a className="underline" href="http://rinkworks.com/namegen/" target="_blank">RINKWORKS FANTASY NAME GENERATOR</a>
        </div>
      </div>
    </div>
  );
}