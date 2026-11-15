// phase = المرحلة التي ستُبنى فيها الصفحة فعلياً
export const PAGES = [
  { id: 'command', label: 'مركز القيادة', phase: 1 },
  { id: 'subjects', label: 'المواد السبع', phase: 3 },
  { id: 'syllabus', label: 'خريطة المنهج', phase: 3 },
  { id: 'twin', label: 'التوأم المعرفي', phase: 3 },
  { id: 'mission', label: 'مهمة الدراسة', phase: 3 },
  { id: 'lab', label: 'مختبر التشخيص', phase: 4 },
  { id: 'memory', label: 'محرك الذاكرة', phase: 5 },
  { id: 'exam', label: 'محاكي الامتحان', phase: 4 },
  { id: 'graph', label: 'خريطة المعرفة', phase: 7 },
  { id: 'scheduler', label: 'المجدول الذاتي', phase: 6 },
  { id: 'predict', label: 'الذكاء التنبؤي', phase: 9 },
  { id: 'whatif', label: 'محاكي ماذا لو', phase: 9 },
  { id: 'analytics', label: 'التحليلات', phase: 9 },
  { id: 'audit', label: 'سجل التدقيق', phase: 6 },
  { id: 'settings', label: 'الإعدادات', phase: 2 },
] as const
export type PageId = typeof PAGES[number]['id']
