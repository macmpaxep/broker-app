import Link from "next/link";

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
    <div className="flex flex-col flex-1 bg-white dark:bg-black">
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-black/10 dark:border-white/10">
        <span className="text-xl font-semibold tracking-tight">Vertex Capital</span>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="hover:opacity-70">
            Возможности
          </a>
          <Link
            href="/demo"
            className="rounded-full bg-foreground text-background px-5 py-2 hover:opacity-90 transition"
          >
            Демо-кабинет
          </Link>
        </nav>
      </header>

      <main className="flex flex-col flex-1">
        <section className="flex flex-col items-center text-center px-6 py-24 sm:py-32 gap-6">
          <h1 className="max-w-2xl text-4xl sm:text-5xl font-semibold tracking-tight">
            Инвестируйте умнее. Торгуйте быстрее.
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Vertex Capital — брокерская платформа нового поколения для акций,
            ETF и опционов. Откройте демо-счёт и посмотрите, как работает
            портфель в реальных условиях рынка.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/demo"
              className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:opacity-90 transition"
            >
              Открыть демо-кабинет
            </Link>
            <a
              href="#features"
              className="rounded-full border border-black/15 dark:border-white/20 px-6 py-3 font-medium hover:bg-black/[.04] dark:hover:bg-white/[.06] transition"
            >
              Узнать больше
            </a>
          </div>
        </section>

        <section
          id="features"
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 sm:px-16 py-16 border-t border-black/10 dark:border-white/10"
        >
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="px-6 sm:px-10 py-6 border-t border-black/10 dark:border-white/10 text-sm text-zinc-500">
        Vertex Capital — демонстрационный учебный проект. Не является
        настоящей брокерской компанией и не предоставляет инвестиционных
        услуг.
      </footer>
    </div>
  );
}
