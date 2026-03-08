import { useState } from "react";
import Section from "./Section";
import Mono from "./Mono";
import Strong from "./components/Strong";
import { CircleQuestionMark, CircleX } from "lucide-react";

const CODES = [
  { code: "s", label: "Syllable", color: "#c8a060", desc: "A full phonetic syllable drawn from a curated list of fantasy-sounding units.", examples: ["al", "mor", "thal", "esh", "vel"] },
  { code: "v", label: "Vowel", color: "#7ab8d4", desc: "A single vowel: a, e, i, o, or u. Chosen at random with equal probability.", examples: ["a", "e", "i", "o", "u"] },
  { code: "V", label: "Vowel or Combo", color: "#7ab8d4", desc: "Either a single vowel (70% chance) or a vowel digraph like 'ae', 'ou', 'ia' (30% chance).", examples: ["a", "ei", "ou", "ia", "ee"] },
  { code: "c", label: "Consonant", color: "#a07850", desc: "A single consonant, weighted by English frequency. Common letters (t, s, r, n) appear more often than rare ones (q, x, z).", examples: ["t", "r", "s", "n", "k"] },
  { code: "B", label: "Beginning Consonant", color: "#c87a50", desc: "A consonant or blend valid at the start of a syllable — includes combos like 'bl', 'str', 'ph', 'thr', 'squ'.", examples: ["bl", "str", "ph", "cr", "wh"] },
  { code: "C", label: "Any Consonant Combo", color: "#c87a50", desc: "Like B, but also allows end-of-syllable blends: 'ck', 'nd', 'lk', 'tt', 'xt', etc.", examples: ["nd", "ck", "lk", "ss", "xt"] },
  { code: "i", label: "Insult Unit", color: "#c05050", desc: "A short comic insult fragment: 'dork', 'twit', 'boob', 'dunce', etc. Used for silly names.", examples: ["dork", "twit", "goon", "prat"] },
  { code: "m", label: "Mushy Unit", color: "#c070a0", desc: "An affectionate nickname fragment: 'dear', 'honey', 'dove', 'pumpkin', etc.", examples: ["honey", "dove", "gem", "bunny"] },
  { code: "M", label: "Mushy Ending", color: "#c070a0", desc: "A cute diminutive suffix: '-kins', '-boo', '-muffin', '-pop', etc.", examples: ["kins", "boo", "muffin", "pop"] },
  { code: "D", label: "Silly Consonant", color: "#8a70c0", desc: "A consonant from a comic-sounding set: b, d, g, p, t, f, m, n, l, r — weighted toward the plosives.", examples: ["b", "d", "p", "g", "t"] },
  { code: "d", label: "Silly Syllable", color: "#8a70c0", desc: "A short vowel-consonant syllable for goofy names: 'ab', 'ob', 'um', 'on', 'in'.", examples: ["ab", "um", "on", "in", "ob"] },
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
  { template: "ss", breakdown: ["s", "s"], result: "Two random syllables concatenated.", sample: "Thalven, Morish, Darsel" },
  { template: "BVC", breakdown: ["B", "V", "C"], result: "Begin-consonant + vowel/combo + any-consonant. A clean fantasy syllable.", sample: "Phraen, Bloun, Strixt" },
  { template: "BVCs", breakdown: ["B", "V", "C", "s"], result: "BVC with a syllable suffix. Slightly longer name.", sample: "Strenaldar, Criemond" },
  { template: "(al|el|il)ss", breakdown: ["(al|el|il)", "s", "s"], result: "A fixed Elvish-style prefix with two syllables.", sample: "Alvendar, Ilmoran" },
  { template: "ss(ien|ian)", breakdown: ["s", "s", "(ien|ian)"], result: "Two syllables + a feminine Elvish ending.", sample: "Mordorian, Selvesian" },
  { template: "<s|ss>v", breakdown: ["<s|ss>", "v"], result: "One or two syllables, then a trailing vowel. Soft, open sound.", sample: "Velmire, Thali, Eshona" },
];

const TOKEN_COLORS: Record<string, string> = {
  s: "#c8a060", v: "#7ab8d4", V: "#7ab8d4", c: "#a07850",
  B: "#c87a50", C: "#c87a50", i: "#c05050", m: "#c070a0",
  M: "#c070a0", D: "#8a70c0", d: "#8a70c0",
};

function TokenSpan({tok}: { tok: string }) {
  
}

export default function GuideModal() {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [activeEx, setActiveEx] = useState<number | null>(null);

  return (
    <div>

          <div
            onClick={() => setGuideModal(false)}
            className="fixed top-0 left-0 bg-[rgba(13,11,15,0.6)] z-2 w-full h-full pt-36 flex items-center flex-col backdrop-blur-sm overflow-y-scroll overflow-x-clip cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center max-w-180 w-full px-3 md:px-0 pb-8"
            >
                      {/* Close button*/}
          <div
            onClick={() => setGuideModal(false)}
            className="sticky w-min h-min top-4 z-10 p-1.5 md:p-2 cursor-pointer border border-bleached-cedar-950
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
                  background:
                    "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
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
                  <Strong>constructs</Strong> that the engine reads left to
                  right, resolving each symbol into random text. The results are
                  concatenated into a name.
                </p>
                <p className="mt-3">
                  For example, the template <Mono>BVC</Mono> means: generate a
                  beginning-consonant blend, then a vowel, then any consonant
                  combo. Each of those three codes is resolved independently,
                  producing a different name every time.
                </p>
                <p className="mt-3">
                  The engine also supports <Strong>grouping constructs</Strong>{" "}
                  — parentheses and angle brackets — which let you define
                  branching alternatives and nested structures.
                </p>
              </Section>
              <Section title="Single-Character Codes">
                <p className="italic mb-4">
                  Click a code to expand its details
                </p>
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
                          >
                            <p className="text-[#a09080] text-sm leading-[1.65] m-0 mb-2.5">
                              {desc}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>
          </div>
        </div>
  )
}