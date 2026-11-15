import { EXAM_DATE, SUBJECTS } from '../lib/config'

const DAY = 86400000
const NA = 'لا توجد أدلة كافية'

export default function CommandCenter() {
  const days = Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / DAY))
  // تقدير أولي من الإعدادات فقط: الأدنى مستوى ثم الأعلى صعوبة
  const weakest = [...SUBJECTS].sort((a, b) => a.level - b.level || b.difficulty - a.difficulty)[0]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">مركز القيادة</h1>
      <div className="card border-amber/40 text-amber text-sm">
        لم تُسجَّل بيانات دراسة حقيقية بعد. الأرقام أدناه إما من الإعدادات الأولية أو محسوبة من تاريخ الامتحان.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Q q="ماذا أدرس الآن؟" a="غير متاح بعد" why="يحتاج المجدول (المرحلة 6) ودروساً مُدخلة في خريطة المنهج." />
        <Q q="الخطوة التالية" a="أدخل المنهج الدراسي" why="لا يمكن قياس الإتقان قبل وجود دروس." />
        <Q q="أضعف مادة (تقدير أولي)" a={weakest.name} why={`مستوى ${weakest.level}/5 وصعوبة ${weakest.difficulty}/5 حسب الإعدادات الأولية.`} />
        <Q q="دروس معرضة للنسيان" a={NA} why="تظهر بعد أول مراجعات (المرحلة 5)." />
        <Q q="هل أتقدم بالمعدل المطلوب؟" a={NA} why="يتطلب منهجاً وسجل دراسة (المرحلتان 3 و9)." />
        <div className="card">
          <div className="text-mute text-sm">المتبقي على الامتحان (24 أبريل 2027)</div>
          <div className="text-4xl font-bold text-cyan mt-1">{days} <span className="text-base text-mute">يوماً</span></div>
        </div>
      </div>
      <div className="card">
        <h2 className="font-bold mb-3">المواد السبع <span className="text-xs text-mute">(مستويات أولية تقديرية)</span></h2>
        <div className="space-y-3">
          {SUBJECTS.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1"><span>{s.name}</span><span className="text-mute">{s.level}/5 · صعوبة {s.difficulty}</span></div>
              <div className="h-2 rounded bg-line"><div className="h-2 rounded bg-cyan" style={{ width: `${s.level * 20}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Q({ q, a, why }: { q: string; a: string; why: string }) {
  return (
    <div className="card">
      <div className="text-mute text-sm">{q}</div>
      <div className="text-lg font-bold mt-1">{a}</div>
      <div className="text-xs text-mute mt-1">{why}</div>
    </div>
  )
}
