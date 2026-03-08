import { useState, useCallback } from "react";
import Section from "./components/Section";
import Mono from "./components/Mono";
import Strong from "./components/Strong";
import TokenSpan from "./components/TokenSpan";
import { CircleQuestionMark, CircleX } from "lucide-react";

const CODES = [
  {
    code: "s",
    label: "Syllable",
    color: "#c8a060",
    desc: "A full phonetic syllable drawn from a curated list of fantasy-sounding units.",
    examples: ["al", "mor", "thal", "esh", "vel"],
  },
  {
    code: "v",
    label: "Vowel",
    color: "#7ab8d4",
    desc: "A single vowel: a, e, i, o, or u. Chosen at random with equal probability.",
    examples: ["a", "e", "i", "o", "u"],
  },
  {
    code: "V",
    label: "Vowel or Combo",
    color: "#7ab8d4",
    desc: "Either a single vowel (70% chance) or a vowel digraph like 'ae', 'ou', 'ia' (30% chance).",
    examples: ["a", "ei", "ou", "ia", "ee"],
  },
  {
    code: "c",
    label: "Consonant",
    color: "#a07850",
    desc: "A single consonant, weighted by English frequency. Common letters (t, s, r, n) appear more often than rare ones (q, x, z).",
    examples: ["t", "r", "s", "n", "k"],
  },
  {
    code: "B",
    label: "Beginning Consonant",
    color: "#c87a50",
    desc: "A consonant or blend valid at the start of a syllable — includes combos like 'bl', 'str', 'ph', 'thr', 'squ'.",
    examples: ["bl", "str", "ph", "cr", "wh"],
  },
  {
    code: "C",
    label: "Any Consonant Combo",
    color: "#c87a50",
    desc: "Like B, but also allows end-of-syllable blends: 'ck', 'nd', 'lk', 'tt', 'xt', etc.",
    examples: ["nd", "ck", "lk", "ss", "xt"],
  },
  {
    code: "i",
    label: "Insult Unit",
    color: "#c05050",
    desc: "A short comic insult fragment: 'dork', 'twit', 'boob', 'dunce', etc. Used for silly names.",
    examples: ["dork", "twit", "goon", "prat"],
  },
  {
    code: "m",
    label: "Mushy Unit",
    color: "#c070a0",
    desc: "An affectionate nickname fragment: 'dear', 'honey', 'dove', 'pumpkin', etc.",
    examples: ["honey", "dove", "gem", "bunny"],
  },
  {
    code: "M",
    label: "Mushy Ending",
    color: "#c070a0",
    desc: "A cute diminutive suffix: '-kins', '-boo', '-muffin', '-pop', etc.",
    examples: ["kins", "boo", "muffin", "pop"],
  },
  {
    code: "D",
    label: "Silly Consonant",
    color: "#8a70c0",
    desc: "A consonant from a comic-sounding set: b, d, g, p, t, f, m, n, l, r — weighted toward the plosives.",
    examples: ["b", "d", "p", "g", "t"],
  },
  {
    code: "d",
    label: "Silly Syllable",
    color: "#8a70c0",
    desc: "A short vowel-consonant syllable for goofy names: 'ab', 'ob', 'um', 'on', 'in'.",
    examples: ["ab", "um", "on", "in", "ob"],
  },
];

const CONSTRUCTS = [
  {
    syntax: "( a | b )",
    label: "Literal Choice",
    color: "#70a870",
    desc: "Picks randomly from pipe-separated literal text options. The content inside is treated as plain characters.",
    examples: ["(al|el|il)", "(st|tr|bl)", "(Dur|Bal|Tar)"],
    note: "Nest freely: (a|(b|c)) works.",
  },
  {
    syntax: "< a | b >",
    label: "Template Choice",
    color: "#70c0a8",
    desc: "Like ( ), but the content is interpreted as template codes, not plain text. Use this when your options should themselves generate characters.",
    examples: ["<s|ss>", "<BVC|sVC>", "<v|V>"],
    note: "< > interprets codes; ( ) does not.",
  },
  {
    syntax: "  |  ",
    label: "OR / Alternation",
    color: "#c8a060",
    desc: "Inside any group, the pipe character separates alternatives. The engine picks one branch at random with equal probability.",
    examples: ["(a|e|i)", "<s|ss|sss>"],
    note: "Weight cannot be set; all options are equally likely.",
  },
];

const EXAMPLES = [
  {
    template: "ss",
    breakdown: ["s", "s"],
    result: "Two random syllables concatenated.",
    sample: "Thalven, Morish, Darsel",
  },
  {
    template: "BVC",
    breakdown: ["B", "V", "C"],
    result:
      "Begin-consonant + vowel/combo + any-consonant. A clean fantasy syllable.",
    sample: "Phraen, Bloun, Strixt",
  },
  {
    template: "BVCs",
    breakdown: ["B", "V", "C", "s"],
    result: "BVC with a syllable suffix. Slightly longer name.",
    sample: "Strenaldar, Criemond",
  },
  {
    template: "(al|el|il)ss",
    breakdown: ["(al|el|il)", "s", "s"],
    result: "A fixed Elvish-style prefix with two syllables.",
    sample: "Alvendar, Ilmoran",
  },
  {
    template: "ss(ien|ian)",
    breakdown: ["s", "s", "(ien|ian)"],
    result: "Two syllables + a feminine Elvish ending.",
    sample: "Mordorian, Selvesian",
  },
  {
    template: "<s|ss>v",
    breakdown: ["<s|ss>", "v"],
    result: "One or two syllables, then a trailing vowel. Soft, open sound.",
    sample: "Velmire, Thali, Eshona",
  },
];

const TOKEN_COLORS: Record<string, string> = {
  s: "#c8a060",
  v: "#7ab8d4",
  V: "#7ab8d4",
  c: "#a07850",
  B: "#c87a50",
  C: "#c87a50",
  i: "#c05050",
  m: "#c070a0",
  M: "#c070a0",
  D: "#8a70c0",
  d: "#8a70c0",
};

const TIPS = [
  [
    "Collapse Triples",
    "When enabled, the engine prevents three or more identical consecutive letters (e.g., 'lll' → 'll'). Certain letters that should never double (q, x, y, w, h, j, v) are reduced to single occurrences automatically.",
  ],
  [
    "Case",
    "The engine always capitalizes the first character of the final name, regardless of what the template produces.",
  ],
  [
    "( ) vs < >",
    "This is the most common source of confusion. Use ( ) when your options are literal strings like place-names or fixed endings. Use < > when your options should themselves invoke codes (e.g., <BVC|sV>).",
  ],
  [
    "Nesting",
    "Both ( ) and < > can contain the other type nested inside them. The inner group is resolved first, and its result is treated as a literal string in the outer context.",
  ],
  [
    "Empty options",
    "(a|) is valid — the empty branch produces nothing. This is useful for optional suffixes: (iel|ael|) adds an ending only some of the time.",
  ],
];
// ─── RinkWorks Engine ────────────────────────────────────────────────────────

const SINGLE_VOWELS: string = "aeiou";

// Weighted consonants (more common = more weight)
const CONSONANT_WEIGHTS: [string, number][] = [
  ["t", 8],
  ["s", 8],
  ["r", 7],
  ["n", 7],
  ["l", 6],
  ["d", 6],
  ["m", 5],
  ["c", 5],
  ["p", 5],
  ["b", 4],
  ["f", 4],
  ["g", 4],
  ["h", 4],
  ["w", 4],
  ["k", 3],
  ["v", 3],
  ["y", 2],
  ["j", 1],
  ["x", 1],
  ["z", 1],
  ["q", 1],
];

const VOWEL_COMBOS: string[] = [
  "ai",
  "ae",
  "ao",
  "au",
  "ea",
  "ee",
  "ei",
  "eo",
  "eu",
  "ia",
  "ie",
  "io",
  "oa",
  "oe",
  "oi",
  "ou",
  "ua",
  "ue",
  "ui",
  "uo",
];
const CONSONANT_COMBOS_BEGIN: string[] = [
  "bl",
  "br",
  "ch",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gh",
  "gl",
  "gr",
  "ph",
  "pl",
  "pr",
  "qu",
  "sc",
  "sh",
  "sk",
  "sl",
  "sm",
  "sn",
  "sp",
  "st",
  "str",
  "sw",
  "th",
  "tr",
  "tw",
  "wh",
  "wr",
  "chr",
  "phr",
  "shr",
  "spl",
  "spr",
  "squ",
  "thr",
];
const CONSONANT_COMBOS_ANY: string[] = [
  ...CONSONANT_COMBOS_BEGIN,
  "ck",
  "ct",
  "ld",
  "lf",
  "lk",
  "ll",
  "lm",
  "ln",
  "lp",
  "lt",
  "lv",
  "mb",
  "mp",
  "nd",
  "nk",
  "nn",
  "nt",
  "ph",
  "rk",
  "rl",
  "rm",
  "rn",
  "rp",
  "rs",
  "rt",
  "rv",
  "rw",
  "sk",
  "sl",
  "sm",
  "sn",
  "sp",
  "ss",
  "st",
  "sw",
  "th",
  "tt",
  "wl",
  "xt",
];

const SYLLABLES: string[] = [
  "al",
  "an",
  "ar",
  "as",
  "ash",
  "at",
  "ath",
  "eld",
  "en",
  "esh",
  "est",
  "eth",
  "il",
  "in",
  "ir",
  "ish",
  "it",
  "ith",
  "old",
  "on",
  "or",
  "oth",
  "ul",
  "un",
  "ur",
  "uth",
  "tor",
  "ash",
  "ald",
  "dar",
  "mor",
  "kal",
  "vel",
  "ser",
  "nar",
  "fen",
  "thal",
  "dor",
  "mir",
  "sol",
  "ran",
  "den",
  "far",
  "gal",
  "kar",
  "lar",
  "mar",
  "par",
  "tar",
  "var",
  "zar",
  "bel",
  "cel",
  "del",
  "fel",
  "gel",
  "hel",
  "jel",
  "kel",
  "mel",
  "nel",
  "pel",
  "rel",
  "sel",
  "tel",
  "vel",
  "wel",
  "aer",
  "aur",
  "eer",
  "ier",
  "oir",
  "oor",
  "our",
  "uer",
  "air",
  "bir",
  "cir",
  "dir",
  "fir",
  "gir",
  "hir",
  "kir",
  "mon",
  "von",
  "con",
  "bon",
  "don",
  "fon",
  "gon",
  "hon",
  "jon",
  "lon",
  "non",
  "pon",
  "ron",
  "son",
  "ton",
  "won",
  "ris",
  "dis",
  "fis",
  "gis",
  "his",
  "kis",
  "lis",
  "mis",
  "nis",
  "pis",
  "quis",
  "sis",
  "tis",
  "vis",
  "wis",
  "xis",
  "ade",
  "afe",
  "age",
  "ake",
  "ale",
  "ame",
  "ane",
  "ape",
  "are",
  "ate",
  "ave",
  "aze",
  "ibe",
  "ice",
  "ide",
  "ife",
  "ige",
  "ike",
  "ile",
  "ime",
  "ine",
  "ipe",
  "ire",
  "ise",
  "ite",
  "ive",
  "ize",
  "obe",
  "ode",
  "ofe",
  "oge",
  "oke",
  "ole",
  "ome",
  "one",
  "ope",
  "ore",
  "ose",
  "ote",
  "ove",
  "owe",
  "oze",
  "ube",
  "ude",
  "ufe",
  "uge",
  "uke",
  "ule",
  "ume",
  "une",
  "upe",
  "ure",
  "use",
  "ute",
  "uve",
  "uze",
];

const INSULT_UNITS: string[] = [
  "ass",
  "crud",
  "dork",
  "dumb",
  "fool",
  "goon",
  "hack",
  "jerk",
  "knob",
  "lame",
  "nerd",
  "prat",
  "twit",
  "wank",
  "boob",
  "clod",
  "dolt",
  "drip",
  "dunce",
  "goof",
  "mutt",
  "nitwit",
  "peon",
  "putz",
  "runt",
  "slob",
  "snob",
  "twit",
];
const MUSHY_UNITS: string[] = [
  "dear",
  "love",
  "darling",
  "heart",
  "honey",
  "sugar",
  "sweet",
  "angel",
  "dove",
  "gem",
  "pearl",
  "rose",
  "joy",
  "light",
  "star",
  "babe",
  "pet",
  "treasure",
  "lamb",
  "pumpkin",
  "button",
  "bunny",
  "cookie",
  "cupcake",
];
const MUSHY_ENDINGS: string[] = [
  "kins",
  "poo",
  "bear",
  "boo",
  "cake",
  "pie",
  "bug",
  "cup",
  "drop",
  "kiss",
  "love",
  "muffin",
  "pie",
  "plum",
  "pop",
  "snug",
  "sugar",
  "sweet",
  "tart",
  "wink",
];
const STUPID_SYLLABLES: string[] = [
  "ab",
  "ub",
  "ob",
  "ib",
  "eb",
  "um",
  "om",
  "im",
  "em",
  "am",
  "un",
  "on",
  "in",
  "en",
  "an",
];

function weightedChoice(weights: [string, number][]): string {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [item, w] of weights) {
    r -= w;
    if (r <= 0) return item;
  }
  return weights[weights.length - 1][0];
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genConsonant(): string {
  return weightedChoice(CONSONANT_WEIGHTS);
}
function genVowel(): string {
  return SINGLE_VOWELS[Math.floor(Math.random() * SINGLE_VOWELS.length)];
}
function genVowelOrCombo(): string {
  return Math.random() < 0.3 ? randomFrom(VOWEL_COMBOS) : genVowel();
}
function genConsonantBegin(): string {
  return Math.random() < 0.3
    ? randomFrom(CONSONANT_COMBOS_BEGIN)
    : genConsonant();
}
function genConsonantAny(): string {
  return Math.random() < 0.3
    ? randomFrom(CONSONANT_COMBOS_ANY)
    : genConsonant();
}
function genSyllable(): string {
  return randomFrom(SYLLABLES);
}
function genInsult(): string {
  return randomFrom(INSULT_UNITS);
}
function genMushy(): string {
  return randomFrom(MUSHY_UNITS);
}
function genMushyEnd(): string {
  return randomFrom(MUSHY_ENDINGS);
}
function genStupidConsonant(): string {
  return weightedChoice([
    ["b", 3],
    ["d", 3],
    ["g", 3],
    ["p", 3],
    ["t", 3],
    ["f", 2],
    ["m", 2],
    ["n", 2],
    ["l", 2],
    ["r", 2],
  ]);
}
function genStupidSyllable(): string {
  return randomFrom(STUPID_SYLLABLES);
}

// Parse and execute a template
function parseTemplate(template: string): string {
  let pos = 0;

  function parseLiteral(): string[] {
    // inside ( ), collect | separated literal options
    const options: string[] = [];
    let current: string[] = [];
    while (pos < template.length && template[pos] !== ")") {
      if (template[pos] === "|") {
        options.push(current.join(""));
        current = [];
        pos++;
      } else if (template[pos] === "(") {
        pos++;
        const nested = parseLiteral();
        current.push(randomFrom(nested));
      } else if (template[pos] === "<") {
        pos++;
        const nested = parseAngle();
        current.push(randomFrom(nested));
      } else {
        current.push(template[pos]);
        pos++;
      }
    }
    options.push(current.join(""));
    if (template[pos] === ")") pos++;
    return options;
  }

  function parseAngle(): string[] {
    // inside < >, collect | separated template-code options
    const options: string[] = [];
    let current: string[] = [];
    while (pos < template.length && template[pos] !== ">") {
      if (template[pos] === "|") {
        options.push(current.join(""));
        current = [];
        pos++;
      } else if (template[pos] === "(") {
        pos++;
        const nested = parseLiteral();
        current.push(randomFrom(nested));
      } else if (template[pos] === "<") {
        pos++;
        const nested = parseAngle();
        current.push(randomFrom(nested));
      } else {
        current.push(evalCode(template[pos]));
        pos++;
      }
    }
    options.push(current.join(""));
    if (template[pos] === ">") pos++;
    return options;
  }

  function evalCode(c: string): string {
    switch (c) {
      case "s":
        return genSyllable();
      case "v":
        return genVowel();
      case "V":
        return genVowelOrCombo();
      case "c":
        return genConsonant();
      case "B":
        return genConsonantBegin();
      case "C":
        return genConsonantAny();
      case "i":
        return genInsult();
      case "m":
        return genMushy();
      case "M":
        return genMushyEnd();
      case "D":
        return genStupidConsonant();
      case "d":
        return genStupidSyllable();
      case "'":
        return "'";
      case "-":
        return "-";
      default:
        return c;
    }
  }

  let result = "";
  while (pos < template.length) {
    const ch = template[pos];
    if (ch === "(") {
      pos++;
      const options = parseLiteral();
      result += randomFrom(options);
    } else if (ch === "<") {
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
  const NEVER_DOUBLE = new Set(["q", "x", "y", "w", "h", "j", "v"]);
  let result = name.replace(/(.)\1{2,}/g, "$1$1");
  for (const ch of NEVER_DOUBLE) {
    result = result.replace(new RegExp(ch + ch, "gi"), ch);
  }
  return result;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  {
    label: "Default Mix",
    templates: ["ss", "BVC", "BVCs", "sBVC", "<s|ss>", "BvC", "sVC", "BVCv"],
  },
  {
    label: "Elvish",
    templates: [
      "ss(ien|ian)",
      "<Bv|V>(l|r|n|s)v",
      "(ae|ai|el|il|ol)(r|l|n|s)v",
      "Bv(s|ss)",
      "(al|el|il|ol|ul)ss",
    ],
  },
  {
    label: "Orcish",
    templates: [
      "BVC",
      "(gr|br|kr|dr)<VC|VCC>",
      "(ug|og|ag)(r|k|m)",
      "(grot|brot|krot)VC",
      "<s>VC",
    ],
  },
  {
    label: "Dwarven",
    templates: [
      "(d|th|k|g)VCC",
      "<s>(in|im|on|om|un|um)",
      "(Dur|Bal|Tar|Mar|Bor|Gim)(in|im|li|ri|ak)",
      "(k|g|d|t)VCCv",
      "ssVC",
    ],
  },
  {
    label: "Demonic",
    templates: [
      "(z|x|v)(a|e)(r|l|k|th)",
      "(mez|bel|gor|vel|mal)(ix|ath|ior|ion)",
      "(z|x)(ar|er|ir|or|ur)(il|al|el|on|an)",
      "BV(xx|zz|kk)V",
      "(az|ez|iz|oz|uz)(ar|er|ir|al|el)",
    ],
  },
  {
    label: "Nordic",
    templates: [
      "(Björn|Orm|Sigurd|Ragnar|Leif|Ulf)(r|ar|ar)",
      "(Ás|Bjarg|Ulf|Sig|Orm)(björn|bjørn|mund|laug|ríðr)",
      "(Erik|Olaf|Gunnar|Harald|Ivar)(r|)",
      "(Ey|Þór|Frøy|Óðin)(<s|ss>)",
    ],
  },
  {
    label: "Celestial",
    templates: [
      "(aer|aur|sol|lux|ver)(iel|iel|ael|eel|oen)",
      "(sar|nar|tal|val|ael)(ion|iel|iath|ias|ean)",
      "V(r|n|l)Vs",
      "(al|el|il|ol)V(r|n|l)vs",
      "(ith|ath|eth|oth|uth)(ael|iel|oel|uel)",
    ],
  },
  {
    label: "Chaotic/Silly",
    templates: [
      "ss(ly|ily|ish|ing)",
      "(d|t|p|w)(r)VCv",
      "<s|ss>M",
      "im(d|t|p|b)Mv",
      "(boo|poo|goo|woo)(ble|gle|fle|dle)",
    ],
  },
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
  const [guideModal, setGuideModal] = useState<boolean>(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [activeEx, setActiveEx] = useState<number | null>(null);

  const generate = useCallback(() => {
    setError("");
    const templates =
      mode === "simple" ? PRESETS[preset].templates : [advTemplate.trim()];

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
    <div className="min-h-screen bg-woodsmoke-950 text-indian-khaki-300 font-serif py-8 px-4 relative">
      {/* Atmospheric background texture */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--color-black-russian-950)_0%,var(--color-woodsmoke-950)_70%)]" />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Advanced Guide Modal */}

      {guideModal && (
        <div
          onClick={() => setGuideModal(false)}
          className="fixed top-0 left-0 bg-[rgba(13,11,15,0.6)] z-2 w-full h-full pt-36 flex items-center flex-col backdrop-blur-sm overflow-y-scroll overflow-x-clip cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute flex flex-col items-center max-w-180 w-full px-3 md:px-0 pb-8 cursor-default"
          >
            {/* Close button*/}
            <div
              onClick={() => setGuideModal(false)}
              className="sticky w-min h-min self-end top-10.5 z-10 p-1.5 md:p-2 cursor-pointer border border-bleached-cedar-950
    hover:border-bleached-cedar-900 bg-bastille-950 hover:bg-[#261930] text-sandstone-800
    hover:text-sandstone-600 rounded-lg transition-all duration-200"
              style={{
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <CircleX className="size-5 md:size-6" />
            </div>
            {/* Header Card */}
            <div
              className="max-w-180 md:w-180 border border-bleached-cedar-950 rounded-lg p-6 mb-6 text-center"
              style={{
                background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <h2
                className="font-trajan-pro sm:text-xl md:text-3xl font-bold text-raffia-200 tracking-wider m-0"
                style={{
                  textShadow: "0 0 40px rgba(180,120,60,0.3)",
                }}
              >
                The Template Grimoire
              </h2>
              <div
                className="h-px my-3.5 mx-auto w-[70%]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #5a3e22, #8b6535, #5a3e22, transparent)",
                }}
              />
              <p className="text-sm text-beaver-500 m-0 italic max-w-120 mx-auto">
                A guide to the Arcanum Forge — How templates are read,
                interpreted, and woven into names.
              </p>
            </div>
            {/* How it works — overview */}
            <Section title="How It Works">
              <p>
                A template is a short string of <Strong>codes</Strong> and{" "}
                <Strong>constructs</Strong> that the engine reads left to right,
                resolving each symbol into random text. The results are
                concatenated into a name.
              </p>
              <p className="mt-3">
                For example, the template <Mono>BVC</Mono> means: generate a
                beginning-consonant blend, then a vowel, then any consonant
                combo. Each of those three codes is resolved independently,
                producing a different name every time.
              </p>
              <p className="mt-3">
                The engine also supports <Strong>grouping constructs</Strong> —
                parentheses and angle brackets — which let you define branching
                alternatives and nested structures.
              </p>
            </Section>
            <Section title="Single-Character Codes">
              <p className="italic mb-4">Click a code to expand its details</p>
              <div className="grid grid-cols-[auto-fill_minmax(320px,1fr)] gap-2">
                {CODES.map(({ code, label, color, desc, examples }) => {
                  const open = activeCode === code;
                  return (
                    <div
                      key={code}
                      onClick={() => setActiveCode(open ? null : code)}
                      className="rounded-md py-3 px-4 cursor-pointer transition-all duration-200"
                      style={{
                        background: open ? "#130f1e" : "#0f0c14",
                        border: `1px solid ${open ? color + "66" : "#2a1f35"}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono text-sm font-black rounded-sm py-0.5 px-2 min-w-7 text-center"
                          style={{
                            background: color + "20",
                            border: `1px solid ${color}44`,
                          }}
                        >
                          {code}
                        </span>
                        <span className="text-[#d4c4a8] text-xs font-semibold flex-1">
                          {label}
                        </span>
                        <span className="text-[#4a3a2a] text-xs">
                          {open ? "▲" : "▼"}
                        </span>
                      </div>
                      {open && (
                        <div
                          className="mt-3 pt-3"
                          style={{ borderTop: `1px solid ${color}22` }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[#a09080] text-sm leading-[1.65] m-0 mb-2.5">
                            {desc}
                          </p>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            <p className="text-judge-gray-800 font-xs my-2 italic">
                              example outputs →
                            </p>
                            {examples.map((ex) => (
                              <span
                                key={ex}
                                className="h-min py-0.5 px-2 font-mono text-xs"
                                style={{
                                  background: color + "15",
                                  border: `1px solid ${color}33`,
                                }}
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
            <Section title="Grouping Constructs">
              <div className="flex flex-col gap-3">
                {CONSTRUCTS.map(
                  ({ syntax, label, color, desc, examples, note }) => (
                    <div
                      key={syntax}
                      className="bg-[#0f0c14] border border-bleached-cedar-950 rounded-md py-4 p-5"
                      style={{
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div className="flex items-baseline gap-3 mb-2">
                        <span
                          className="font-mono text-sm font-black py-0.5 px-2 rounded-md"
                          style={{
                            background: color + "18",
                            border: `1px solid ${color}44`,
                          }}
                        >
                          {syntax}
                        </span>
                        <span className="text-[#d4c4a8] text-sm font-semibold">
                          {label}
                        </span>
                      </div>
                      <p className="text-[#a09080] text-sm leading-[1.65] mb-2.5">
                        {desc}
                      </p>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {examples.map((ex) => (
                          <span
                            key={ex}
                            className="rounded-sm py-0.5 px-2 font-mono text-xs"
                            style={{
                              background: color + "13",
                              border: `1px solid ${color}30`,
                            }}
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                      <p className="text-[#6a5141] text-xs m-0 italic">
                        {note}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </Section>
            <Section title="Worked Examples">
              <p className="text-sm text-sandstone-600 italic mt-0 mb-4">
                Click an example to see it broken down token by token.
              </p>
              <div className="flex flex-col gap-2.5">
                {EXAMPLES.map(({ template, breakdown, result, sample }, i) => {
                  const open = activeEx === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveEx(open ? null : i)}
                      className="rounded-md py-3.5 px-4.5 cursor-pointer transition-all duration-200"
                      style={{
                        background: open ? "#130f1e" : "#0f0c14",
                        border: `1px solid ${open ? "#5a3e2288" : "#2a1f35"}`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-extrabold text-sm text=[#c8a060] bg-[#c8a06018] border border[#c8a06033] rounded-sm py-0.5 px-2.5">
                          {template}
                        </span>
                        <span className="text-[#7a5a5a] text-sm flex-1 italic">
                          {result}
                        </span>
                        <span className="text-[#4a3a2a] text-xs">
                          {open ? "▲" : "▼"}
                        </span>
                      </div>
                      {open && (
                        <div className="mt-3.5 pt-3.5 border-t border-[#2a1f3a]">
                          {/* Token breakdown */}
                          <div className="mb-3">
                            <span className="text-xs text-judge-gray-800 tracking-widest uppercase">
                              Tokens →
                            </span>
                            {breakdown.map((tok, j) => (
                              <TokenSpan key={j} tok={tok} />
                            ))}
                          </div>
                          {/* Legend for this template's tokens */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {breakdown
                              .filter(
                                (t) =>
                                  !t.startsWith("(") &&
                                  !t.startsWith("<") &&
                                  TOKEN_COLORS[t],
                              )
                              .map((tok, j) => {
                                const info = CODES.find((c) => c.code === tok);
                                if (!info) return null;
                                return (
                                  <span
                                    key={j}
                                    className="text-xs rounded-sm py-0.5 px-2"
                                    style={{
                                      color: TOKEN_COLORS[tok],
                                      background: TOKEN_COLORS[tok] + "18",
                                      border: `1px solid ${TOKEN_COLORS[tok]}33`,
                                    }}
                                  >
                                    <strong className="font-mono">{tok}</strong>{" "}
                                    = {info.label}
                                  </span>
                                );
                              })}
                          </div>
                          <div className="text-xs text-sandstone-600 italic">
                            <span className="text-judge-gray-800 tracking-widest uppercase text-xs">
                              Sample output:
                            </span>
                            <span className="text-[#d4c4a8]">{sample}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
            {/* Tips */}
            <Section title="Tips & Notes">
              <div className="flex flex-col gap-2.5">
                {TIPS.map(([title, body], i) => (
                  <div
                    key={i}
                    className="bg-[#0f0c14] border border-[#221a2e] rounded-md py-3 px-4 flex gap-3.5"
                  >
                    <span className="text-[#8b6535] font-bold text-sm min-w-1.5">
                      ✦
                    </span>
                    <div>
                      <div className="text-[#d4c4a8] font-bold text-sm mb-1.5">
                        {title}
                      </div>
                      <p className="text-[#8a7868] text-sm leading-5">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      )}

      <div className="relative z-1 max-w-180 my-0 mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] text-tobacco-brown-500 uppercase mb-3">
            ✦ An Alchemic Nomenclature Engine ✦
          </div>
          <h1
            className="font-trajan-pro sm:text-4xl md:text-5xl font-bold text-raffia-200 tracking-wider m-0"
            style={{
              textShadow:
                "0 0 40px rgba(180,120,60,0.3), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            Arcanum Forge
          </h1>
          <div
            className="h-px w-[80%] my-4 mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, #5a3e22, #8b6535, #5a3e22, transparent)",
            }}
          />
          <p className="text-sm text-beaver-300 m-0 italic">
            From nothing, a name.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-0.5 mb-6 rounded-md p-1 border border-bleached-cedar-950">
          {(["simple", "advanced"] as GeneratorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 px-4 border-0 rounded-sm cursor-pointer text-sm tracking-widest uppercase text-inherit transition-all duration-200"
              style={{
                background:
                  mode === m
                    ? "linear-gradient(135deg, #3d2a14, #5a3e22)"
                    : "transparent",
                color: mode === m ? "#f6efde" : "#8d7041",
                boxShadow: mode === m ? "0 0 12px rgba(90,62,34,0.4)" : "none",
              }}
            >
              {m === "simple" ? "⚔ Simple" : "✦ Advanced"}
            </button>
          ))}
        </div>

        {/* Control panel */}
        <div
          className="border border-bleached-cedar-950 rounded-lg p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {mode === "simple" ? (
            <div>
              <label className="block text-tobacco-brown-500 text-xs tracking-widest uppercase mb-2">
                Name Style
              </label>
              <select
                value={preset}
                onChange={(e) => setPreset(+e.target.value)}
                className="w-full py-2.5 px-4 bg-woodsmoke-950 border border-tobacco-brown-500 rounded-sm text-indian-khaki-300 text-sm cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238b6535' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
              >
                {PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-tobacco-brown-500 text-sm tracking-widest uppercase">
                  Name Generation Template
                </label>
                <button
                  className="border border-sandstone-800 hover:border-sandstone-600 hover:bg-bastille-950 rounded-sm flex gap-1 items-center py-1 pr-2 pl-1.5 cursor-pointer transition-all duration-200"
                  onClick={() => setGuideModal(true)}
                >
                  <CircleQuestionMark className="text-sandstone-600 w-5.5 h-5.5" />
                  <span className="text-sandstone-400 text-xs">Guide</span>
                </button>
              </div>
              <input
                value={advTemplate}
                onChange={(e) => setAdvTemplate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="e.g. ss or BVC or (al|el)(r|n)Vs"
                className="w-full py-2.5 px-4 bg-woodsmoke-950 border border-tobacco-brown-800 rounded-sm text-indian-khaki-300 text-sm font-mono box-border outline-0"
                style={{
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#a58a4d")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#614832")}
              />
              {/* Quick reference */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["s", "syllable"],
                  ["v", "vowel"],
                  ["V", "vowel+combo"],
                  ["c", "consonant"],
                  ["B", "consonant begin"],
                  ["C", "consonant any"],
                  ["i", "insult unit"],
                  ["m", "mushy"],
                  ["M", "mushy end"],
                  ["D", "silly cons."],
                  ["d", "silly syl."],
                  ["( )", "literal"],
                  ["< >", "template"],
                  ["  |  ", "OR"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-bastille-950 border border-bleached-cedar-950 rounded-sm py-1 px-2 text-xs flex gap-1 items-center"
                  >
                    <span className="font-mono font-bold text-tobacco-brown-500">
                      {k}
                    </span>
                    <span className="text-judge-gray-700">{v}</span>
                  </div>
                ))}
              </div>
              {/* Sample templates */}
              <div className="mt-2.5">
                <span className="text-tobacco-brown-500 text-xs tracking-widest">
                  SAMPLES:{" "}
                </span>
                {[
                  "ss",
                  "BVC",
                  "BVCs",
                  "s'vCv",
                  "(st|tr)VC",
                  "ss(ien|ian)",
                  "<s|ss>v",
                  "(ma)<VC|s>",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAdvTemplate(t)}
                    className="border border-tobacco-brown-950 rounded-sm py-0.5 px-2 m-0.5 text-xs font-mono cursor-pointer transition-all duration-150 text-[#8a6a40]"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#8b6535";
                      e.currentTarget.style.color = "#c8a060";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a1f30";
                      e.currentTarget.style.color = "#8a6a40";
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="flex gap-4 mt-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-tobacco-brown-500 text-xs tracking-widest uppercase whitespace-nowrap">
                Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(+e.target.value)}
                className="py-1.5 px-2.5 border rounded-sm"
                style={{
                  background: "#0d0b0f",
                  border: "1px solid #3a2a1a",
                  color: "#c8b89a",
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {[12, 24, 48, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {mode === "advanced" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() => setCollapse((c) => !c)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    transition: "background 0.2s",
                    cursor: "pointer",
                    background: collapse
                      ? "linear-gradient(90deg, #5a3e22, #8b6535)"
                      : "#1e1620",
                    border: "1px solid #3a2a1a",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: collapse ? "#e8d5b0" : "#3a2a3a",
                      transition: "left 0.2s",
                      left: collapse ? 18 : 2,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#7a6a5a",
                    letterSpacing: "0.1em",
                  }}
                >
                  Collapse Triples
                </span>
              </label>
            )}

            <button
              onClick={generate}
              disabled={generating}
              style={{
                marginLeft: "auto",
                padding: "0.6rem 1.8rem",
                background: generating
                  ? "#1e1620"
                  : "linear-gradient(135deg, #5a3e22 0%, #8b6535 50%, #5a3e22 100%)",
                border: "1px solid #8b6535",
                borderRadius: 4,
                color: "#e8d5b0",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                cursor: generating ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: generating
                  ? "none"
                  : "0 0 20px rgba(139,101,53,0.25)",
              }}
              onMouseEnter={(e) => {
                if (!generating)
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(139,101,53,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = generating
                  ? "none"
                  : "0 0 20px rgba(139,101,53,0.25)";
              }}
            >
              {generating ? "Weaving..." : "✦ Generate"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#1f0a0a",
              border: "1px solid #5a1a1a",
              borderRadius: 6,
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#c05050",
              fontSize: "0.85rem",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {names.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
              border: "1px solid #2a1f35",
              borderRadius: 8,
              padding: "1.5rem",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  color: "#7a5c3a",
                  textTransform: "uppercase",
                }}
              >
                Generated Names
              </div>
              <button
                onClick={copyAll}
                style={{
                  background: "none",
                  border: "1px solid #2a1f35",
                  borderRadius: 4,
                  padding: "0.3rem 0.8rem",
                  color: copied === "__all__" ? "#8bc58b" : "#7a5c3a",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {copied === "__all__" ? "✓ Copied All" : "Copy All"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {names.map((name, i) => (
                <div
                  key={i}
                  onClick={() => copyName(name)}
                  style={{
                    padding: "0.6rem 0.9rem",
                    background:
                      copied === name
                        ? "linear-gradient(135deg, #0f1f0f, #1a2f1a)"
                        : "#0d0b10",
                    border: `1px solid ${copied === name ? "#4a7a4a" : "#221a2e"}`,
                    borderRadius: 5,
                    cursor: "pointer",
                    color: copied === name ? "#8bc58b" : "#d4c4a8",
                    fontSize: "1.05rem",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                    userSelect: "none",
                    textAlign: "center",
                    fontStyle: "italic",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    if (copied !== name) {
                      e.currentTarget.style.borderColor = "#5a3e22";
                      e.currentTarget.style.background = "#130f18";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (copied !== name) {
                      e.currentTarget.style.borderColor = "#221a2e";
                      e.currentTarget.style.background = "#0d0b10";
                    }
                  }}
                >
                  {copied === name ? "✓ Copied" : name}
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: "0.68rem",
                color: "#4a3a2a",
                textAlign: "center",
                margin: "0.9rem 0 0",
                fontStyle: "italic",
              }}
            >
              Click any name to copy it
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "0.68rem",
            color: "#3a2a1a",
            letterSpacing: "0.15em",
          }}
        >
          ENGINE BASED ON{" "}
          <a
            className="underline"
            href="http://rinkworks.com/namegen/"
            target="_blank"
          >
            RINKWORKS FANTASY NAME GENERATOR
          </a>
        </div>
      </div>
    </div>
  );
}
