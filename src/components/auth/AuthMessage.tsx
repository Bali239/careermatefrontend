export default function AuthMessage({ children, kind = "error" }: { children: React.ReactNode; kind?: "error" | "success" }) {
  return <p className={`auth-message auth-message-${kind}`} role="status">{children}</p>;
}
