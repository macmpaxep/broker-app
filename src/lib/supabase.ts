import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Серверный клиент с service_role ключом — используется только в API-роутах
// (никогда не импортировать из клиентских компонентов). Обходит RLS, поэтому
// держим его подальше от браузера.
// Без сгенерированной схемы БД типизируем как `any` — таблицы кэша простые
// и ad-hoc, полноценные типы не стоят усложнения для пары JSONB-колонок.
let client: SupabaseClient<any, any, any> | null = null;

export function getSupabaseAdmin(): SupabaseClient<any, any, any> | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
