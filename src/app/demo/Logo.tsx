import Image from "next/image";

const LOGO_COLORS: Record<string, string> = {
  NVDA: "#76b900",
  AMD: "#ed1c24",
  AMZN: "#ff9900",
  HOOD: "#00c805",
  IONQ: "#1b1f3b",
  RGTI: "#6366f1",
};

export default function Logo({
  symbol,
  logo,
  size = 40,
}: {
  symbol: string;
  logo?: string | null;
  size?: number;
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={symbol}
        width={size}
        height={size}
        unoptimized
        className="rounded-full object-contain bg-white border border-black/5 shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        backgroundColor: LOGO_COLORS[symbol] ?? "#71717a",
        width: size,
        height: size,
        fontSize: size * 0.32,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
