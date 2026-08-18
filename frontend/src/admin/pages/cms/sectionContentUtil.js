/** Backend returns section content as a flat list of { field_key, field_value, field_type, language: { code } } rows.
 * Decode into { [langCode]: { [fieldKey]: value } }, parsing JSON-typed fields (arrays like points/cards) back out. */
export function contentArrayToByLang(contentArray) {
  const byLang = {};
  for (const item of contentArray ?? []) {
    const code = item.language?.code;
    if (!code) continue;
    if (!byLang[code]) byLang[code] = {};
    byLang[code][item.field_key] =
      item.field_type === "json" && item.field_value != null ? JSON.parse(item.field_value) : item.field_value;
  }
  return byLang;
}

export const FLAG_BY_CODE = { en: "🇬🇧", hi: "🇮🇳", es: "🇪🇸", ar: "🇸🇦", fr: "🇫🇷", de: "🇩🇪", pt: "🇵🇹", zh: "🇨🇳" };
