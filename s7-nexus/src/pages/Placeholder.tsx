export default function Placeholder({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="card text-center py-16">
      <h1 className="text-xl font-bold mb-2">{title}</h1>
      <p className="text-mute text-sm">هذه الصفحة غير مبنية بعد. موعدها: المرحلة {phase}.</p>
    </div>
  )
}
