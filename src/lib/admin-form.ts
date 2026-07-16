// Collects the optional zh/ms/hi translation fields (named e.g. titleZh/titleMs/titleHi by
// the AdminTranslations form section) off a submitted FormData, for spreading into the JSON
// payload the Lambda's applyLocalized() reads. Only fields actually present in the form are
// included — an absent field leaves that locale's stored text untouched.
export function collectTranslations(formData: FormData, bases: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const base of bases) {
    for (const suffix of ["Zh", "Ms", "Hi"]) {
      const value = formData.get(`${base}${suffix}`);
      if (typeof value === "string") out[`${base}${suffix}`] = value;
    }
  }
  return out;
}
