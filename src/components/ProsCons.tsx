export default function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-2 font-semibold">Pros</h4>
        <ul className="list-disc pl-5">
          {pros.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 font-semibold">Cons</h4>
        <ul className="list-disc pl-5">
          {cons.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    </div>
  )
}

