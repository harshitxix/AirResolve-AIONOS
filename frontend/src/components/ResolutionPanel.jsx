import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Info, Activity, AlertTriangle, FileCheck, ArrowUpRight } from 'lucide-react';

const ResolutionPanel = ({ state }) => {
  const { policy_result, actions_taken, requires_escalation, escalation_reason } = state;

  return (
    <div className="h-full flex flex-col gap-3.5 overflow-hidden">
      {/* Policy Engine Evaluation Card */}
      <div className="console-card p-4 shrink-0 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Policy Engine</h2>
          </div>
          {policy_result && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Rules Evaluated
            </span>
          )}
        </div>

        {policy_result ? (
          <div className="space-y-3">
            {/* Applicable Rules */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Matched Policies</p>
              <div className="flex flex-wrap gap-1.5">
                {policy_result.applicable_policies.map((policy, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200/70 flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3 text-sky-500" />
                    {policy}
                  </span>
                ))}
              </div>
            </div>

            {/* Calculated Entitlements Checklist */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Entitlements Matrix</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(policy_result.entitlements).map(([key, value]) => {
                  if (typeof value === 'boolean') {
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between text-[11px] font-medium p-1.5 px-2 rounded-lg border ${
                          value
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-slate-50/80 border-slate-100 text-slate-400'
                        }`}
                      >
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        {value ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Engine Notes */}
            {policy_result.notes && policy_result.notes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <ul className="space-y-1">
                  {policy_result.notes.map((note, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-tight">
                      <Info className="w-3 h-3 mt-0.5 text-sky-500 shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 mb-1.5 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-medium">Awaiting conversation to evaluate policies</p>
          </div>
        )}
      </div>

      {/* Action Dispatch & Audit Trail (Fills remaining height with internal scroll) */}
      <div className="console-card p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Actions & Escalations</h2>
          </div>
          {actions_taken && actions_taken.length > 0 && (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {actions_taken.length} Dispatched
            </span>
          )}
        </div>

        {/* Escalation Warning Banner */}
        {requires_escalation && (
          <div className="mb-3 bg-rose-50 border border-rose-200/90 p-2.5 rounded-xl flex items-start gap-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-800">Supervisor Escalation Triggered</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-tight">{escalation_reason}</p>
            </div>
          </div>
        )}

        {/* Action Log List (Independent Scroll Container) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
          {actions_taken && actions_taken.length > 0 ? (
            actions_taken.map((action, i) => {
              const isEscalated = action.status === 'ESCALATED';
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isEscalated
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {isEscalated ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {action.action || action.status}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                      isEscalated ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {action.status}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-0.5 text-[11px] opacity-85">
                    {action.reason && <p><strong>Reason:</strong> {action.reason}</p>}
                    {action.amount && <p><strong>Amount:</strong> {action.amount}</p>}
                    {action.route && <p><strong>Route:</strong> {action.route}</p>}
                    {action.timeframe && <p><strong>Timeframe:</strong> {action.timeframe}</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-6">
              <Activity className="w-8 h-8 mb-1.5 text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">No actions executed yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolutionPanel;
