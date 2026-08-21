import { Activity, ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

export default function App() {
  return <main className="grid-bg min-h-screen px-5 py-6 md:px-10">
    <nav className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950"><LockKeyhole size={19}/></span><div><b className="tracking-[.16em]">IISTA</b><p className="m-0 text-[10px] tracking-[.14em] text-slate-400">INTENT-INVARIANT AUTHORIZATION</p></div></div>
      <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 md:flex"><Activity size={13}/> SYSTEM INTEGRITY ACTIVE</div>
    </nav>
    <section className="mx-auto max-w-7xl pt-20 md:pt-28">
      <p className="mb-5 text-xs font-semibold tracking-[.22em] text-cyan-300">AI COMMERCE SECURITY LAYER</p>
      <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">Authorize intent.<br/><span className="text-slate-400">Not just transactions.</span></h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">IISTA binds every AI action to a cryptographic execution path—then lets the enclave authorize only the exact outcome the user intended.</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[['01','Intent compiled','Budget, domain and allowed tools become signed invariants.'],['02','Path attested','Every transition is hash-chained and agent-attested.'],['03','Commit authorized','The DAE verifies the live invoice before signing.']].map(([n,t,d])=><div key={n} className="panel rounded-2xl p-6"><span className="text-xs text-cyan-300">{n}</span><h2 className="mt-8 text-lg">{t}</h2><p className="text-sm leading-6 text-slate-400">{d}</p><ArrowUpRight size={16} className="mt-5 text-slate-500"/></div>)}
      </div>
      <div className="mt-10 flex items-center gap-3 text-sm text-slate-400"><ShieldCheck className="text-cyan-300" size={18}/> Decoupled authorization enclave · SECP256K1 · HKDF-SHA256</div>
    </section>
  </main>;
}
