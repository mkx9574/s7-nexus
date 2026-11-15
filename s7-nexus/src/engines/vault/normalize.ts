export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
    .replace(/[إأآٱ]/g, 'ا') // توحيد الألفات
    .replace(/ة/g, 'ه') // تاء مربوطة إلى هاء
    .replace(/ى/g, 'ي') // ألف مقصورة إلى ياء
    .toLowerCase();
}
