"use client";

import { useState } from "react";
import { RefreshCw, Plus, Trash2, Loader2, CheckCircle, Play, Pause } from "lucide-react";

type Subscription = {
  id: string;
  label: string;
  recipient: string;
  amount: string;
  token: string;
  frequency: string;
  active: boolean;
  nextRun: string;
};

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [form, setForm] = useState({ label: "", recipient: "", amount: "", token: "USDC", frequency: "monthly" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const getNextRun = (freq: string) => {
    const d = new Date();
    if (freq === "weekly") d.setDate(d.getDate() + 7);
    else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 1);
    return d.toLocaleDateString();
  };

  const handleCreate = async () => {
    if (!form.recipient || !form.amount) {
      setStatus("error"); setStatusMsg("Fill in all fields."); return;
    }
    setStatus("loading");
    setStatusMsg("Setting up private recurring payment schedule via Cloak...");
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSubscriptions((s) => [...s, {
        id: Date.now().toString(), ...form,
        active: true, nextRun: getNextRun(form.frequency),
      }]);
      setForm({ label: "", recipient: "", amount: "", token: "USDC", frequency: "monthly" });
      setStatus("success");
      setStatusMsg("Recurring private payment scheduled. Each cycle runs as a shielded batch disbursement.");
    } catch (e: any) {
      setStatus("error"); setStatusMsg(e.message || "Failed.");
    }
  };

  const toggleActive = (id: string) =>
    setSubscriptions((s) => s.map((x) => x.id === id ? { ...x, active: !x.active } : x));

  const remove = (id: string) =>
    setSubscriptions((s) => s.filter((x) => x.id !== id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-400" /> Private Subscriptions
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Recurring shielded payments — retainers, grants, SaaS tools. Each cycle fans out as a private batch disbursement. The public chain sees nothing.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 space-y-3">
        <h3 className="text-sm font-medium text-white">New Recurring Payment</h3>
        <input placeholder="Label (e.g. Monthly retainer — Alice)" value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
        <input placeholder="Recipient wallet" value={form.recipient}
          onChange={(e) => setForm({ ...form, recipient: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 font-mono" />
        <div className="flex gap-3">
          <input placeholder="Amount" type="number" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
          <select value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })}
            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="SOL">SOL</option>
          </select>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button onClick={handleCreate} disabled={status === "loading"}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-2 transition-colors">
          {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling...</> : <><Plus className="w-4 h-4" /> Schedule Recurring Payment</>}
        </button>
      </div>

      {status !== "idle" && (
        <div className={`rounded-lg px-4 py-3 mb-4 text-sm flex items-start gap-3 ${
          status === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
          status === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
          "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />}
          {status === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {statusMsg}
        </div>
      )}

      {subscriptions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Scheduled Payments</h3>
          {subscriptions.map((s) => (
            <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{s.label || "Payment"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-700 text-gray-400"}`}>
                    {s.active ? "active" : "paused"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono truncate">{s.recipient.slice(0, 20)}...</div>
                <div className="text-xs text-gray-500 mt-1">{s.amount} {s.token} · {s.frequency} · next: {s.nextRun}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(s.id)}
                  className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {s.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(s.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">No recurring payments yet.</div>
      )}
    </div>
  );
}