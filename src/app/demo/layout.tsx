import BottomNav from "./BottomNav";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col flex-1"
      style={{ background: "var(--vx-bg)", color: "var(--vx-text)" }}
    >
      <div className="flex flex-col flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
