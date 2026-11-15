// الإعدادات الثابتة من المواصفة (القسم 1 و 2). قيم أولية تقديرية وليست حقائق دائمة.
export const EXAM_DATE = new Date('2027-04-24T00:00:00')
export const MAX_STUDY_HOURS = 14 // سقف نظري وليس هدفاً يومياً
export const SUBJECTS = [
  { id: 'math', name: 'الرياضيات', level: 2, difficulty: 3 },
  { id: 'phys', name: 'الفيزياء', level: 2, difficulty: 3 },
  { id: 'chem', name: 'الكيمياء', level: 2, difficulty: 3 },
  { id: 'bio', name: 'الأحياء', level: 3, difficulty: 3 },
  { id: 'ar', name: 'اللغة العربية', level: 2, difficulty: 5 },
  { id: 'en', name: 'اللغة الإنجليزية', level: 4, difficulty: 2 },
  { id: 'quran', name: 'القرآن الكريم', level: 4, difficulty: 2 },
] as const
