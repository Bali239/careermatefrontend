export default function AuthMessage({ children, kind = "error" }: { children: React.ReactNode; kind?: "error" | "success" }) {
  return <p className={`m-0 rounded-lg px-3 py-[11px] text-[11px] leading-relaxed ${kind === "error" ? "bg-[#fff0f1] text-[#9d3742]" : "bg-[#eaf8f0] text-[#297653]"}`} role="status">{children}</p>;
}
