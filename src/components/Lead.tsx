export default function Lead({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-subtle p-4 text-base text-brand-text shadow-subtle">
      {children}
    </div>
  )
}
