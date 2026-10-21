import { NextResponse } from "next/server";
import { WATCHLIST } from "@/lib/watchlist";
import { COMPANY_PROFILES } from "@/lib/companyProfiles";

// Логотипы отдаются из статического снэпшота (src/lib/companyProfiles.ts),
// а не живыми запросами к Finnhub на каждый холодный старт — именно это
// раньше упиралось в лимит бесплатного тарифа (60 запросов/мин) и часть
// логотипов не успевала подгрузиться (ответ 429). Публичные логотипы
// компаний почти не меняются, так что статики достаточно.
export async function GET() {
  const profiles = WATCHLIST.map(({ symbol }) => {
    const p = COMPANY_PROFILES[symbol];
    return { symbol, logo: p?.logo ?? null, name: p?.name ?? null };
  });
  return NextResponse.json({ profiles, cached: true });
}
