const TOKEN_COLORS: Record<string, string> = {
  s: "#c8a060", v: "#7ab8d4", V: "#7ab8d4", c: "#a07850",
  B: "#c87a50", C: "#c87a50", i: "#c05050", m: "#c070a0",
  M: "#c070a0", D: "#8a70c0", d: "#8a70c0",
};

export default function TokenSpan({ tok }: { tok: string}) {
  const isGroup = tok.startsWith("(") || tok.startsWith("<");
  const color = TOKEN_COLORS[tok] ?? isGroup ? "#70a870" : "#c8b89a";
  return (
    <span
      className="inline-block rounded-sm py-0.5 px-1.5 my-0 mx-0.5 font-mono text-sm font-bold"
      style={{
        background: color + "22",
        border: `1px solid ${color}55`
      }}
    >
      {tok}
    </span>
  );
}