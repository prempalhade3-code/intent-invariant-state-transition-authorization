import { AlertTriangle, Check, Play } from "lucide-react";
export const scenarios=[
  ["standard","Authorized path","Signed $20 invoice within the $25 intent cap."],
  ["injection","Prompt injection","Injected $200 price violates the spend invariant."],
  ["toctou","TOCTOU price change","Commit-time oracle sees the price change from $20 to $50."],
  ["deviation","Path deviation","An unauthorized API tool and malicious domain enter the path."],
  ["tampered","History tampering","A changed state node breaks the signed hash chain."],
  ["merchant_substitution","Proof substitution","A forged merchant invoice proof fails pinned-key verification."],
  ["unauthorized_signing","Unauthorized signing","A payment without a trusted DAE envelope is rejected."],
] as const;
export type Scenario=typeof scenarios[number][0];
export function ControlPanel({active,onRun,loading}:{active:Scenario;onRun:(s:Scenario)=>void;loading:boolean}){return <section className="panel rounded-2xl p-6"><p className="text-xs tracking-[.18em] text-slate-500">SECURITY SCENARIOS</p><div className="mt-4 space-y-2">{scenarios.map(([id,title,detail])=><button key={id} onClick={()=>onRun(id)} disabled={loading} className={`w-full rounded-xl border p-3 text-left transition ${active===id?'border-cyan-300/50 bg-cyan-300/10':'border-slate-700/70 hover:border-slate-500'}`}><div className="flex items-center gap-2 text-sm font-semibold">{id==='standard'?<Check size={14} className="text-emerald-300"/>:<AlertTriangle size={14} className="text-amber-300"/>}{title}<Play size={12} className="ml-auto text-slate-500"/></div><p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p></button>)}</div></section>}
