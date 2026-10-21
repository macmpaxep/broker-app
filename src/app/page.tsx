import Link from "next/link";
import Image from "next/image";

const features = [
  {
    title: "Молниеносное исполнение",
    desc: "Ордера исполняются за миллисекунды на прямом доступе к биржам.",
  },
  {
    title: "0% комиссии",
    desc: "Торгуйте акциями и ETF без комиссии за сделку.",
  },
  {
    title: "Защита активов",
    desc: "Счета защищены SIPC до $500,000 и шифрованием уровня банков.",
  },
];

export default function Home() {
  return (
    <div
      className="flex flex-col flex-1"
      style={{ background: "var(--vx-bg)", color: "var(--vx-text)" }}
    >
      <header
        className="flex items-center justify-between px-6 sm:px-10 py-5"
        style={{ borderBottom: "1px solid var(--vx-border)" }}
      >
        <span className="text-xl font-semibold tracking-tight vx-num">
          Vertex Capital
        </span>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a
            href="#features"
            className="hover:opacity-70"
            style={{ color: "var(--vx-text-dim)" }}
          >
            Возможности
          </a>
          <Link
            href="/demo"
            className="rounded-full px-5 py-2 font-semibold transition hover:opacity-90"
            style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
          >
            Демо-кабинет
          </Link>
        </nav>
      </header>

      <main className="flex flex-col flex-1">
        <section className="flex flex-col items-center text-center px-6 py-24 sm:py-32 gap-6">
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--vx-brand)" }}
          >
            Брокерская платформа нового поколения
          </span>
          <h1 className="max-w-2xl text-4xl sm:text-5xl font-semibold tracking-tight vx-num">
            Инвестируйте умнее.
            <br />
            Торгуйте быстрее.
          </h1>
          <p className="max-w-xl text-lg" style={{ color: "var(--vx-text-dim)" }}>
            Vertex Capital — брокерская платформа для акций, ETF и опционов.
            Откройте демо-счёт и посмотрите, как работает портфель в реальных
            условиях рынка.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/demo"
              className="rounded-full px-6 py-3 font-semibold transition hover:opacity-90"
              style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
            >
              Открыть демо-кабинет
            </Link>
            <a
              href="#features"
              className="rounded-full px-6 py-3 font-medium transition hover:bg-white/5"
              style={{ border: "1px solid var(--vx-border)", color: "var(--vx-text)" }}
            >
              Узнать больше
            </a>
          </div>
          <Image
            src="/trade-preview.jpg"
            alt="Пример закрытой сделки в демо-кабинете Vertex Capital"
            width={1170}
            height={1129}
            priority
            className="w-full max-w-sm rounded-3xl mt-6"
            style={{ border: "1px solid var(--vx-border)" }}
          />
        </section>

        <section
          id="features"
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 sm:px-16 py-16"
          style={{ borderTop: "1px solid var(--vx-border)" }}
        >
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg vx-num">{f.title}</h3>
              <p style={{ color: "var(--vx-text-dim)" }}>{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer
        className="px-6 sm:px-10 py-6 text-sm"
        style={{ borderTop: "1px solid var(--vx-border)", color: "var(--vx-text-faint)" }}
      >
        Vertex Capital — демонстрационный учебный проект. Не является
        настоящей брокерской компанией и не предоставляет инвестиционных
        услуг.
      </footer>
    </div>
  );
}
