export type RephrasedIdea = { headline: string; summary: string };

// Перефразирует заголовок новости через Claude Haiku в более "инвесторский"
// формат — короткий заголовок-идея + 2 предложения пояснения. Источник —
// только заголовок + издатель (публичный поиск Yahoo не отдаёт тело
// статьи), поэтому модель разворачивает и переосмысляет заголовок, а не
// пересказывает статью целиком.
export async function rephraseHeadline(
  title: string,
  publisher: string
): Promise<RephrasedIdea | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `Ты — редактор инвестиционной рубрики "Идеи" в брокерском приложении. Вот заголовок новости с финансового рынка (источник: ${publisher}):

"${title}"

Перефразируй его в формате инвестиционной идеи для частного инвестора на русском языке. Верни ТОЛЬКО JSON без markdown-разметки и пояснений, в формате:
{"headline": "короткий цепляющий заголовок до 70 символов", "summary": "2 предложения: что произошло и почему это может быть важно для инвестора"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Anthropic API: HTTP ${res.status}`);
    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.headline !== "string" || typeof parsed.summary !== "string") {
      return null;
    }
    return { headline: parsed.headline, summary: parsed.summary };
  } catch {
    return null;
  }
}
