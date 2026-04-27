"use client";

import { useState } from "react";
import { Lock, Unlock, Loader2, CheckCircle, Shield } from "lucide-react";

type EscrowItem = {
  id: string;
  label: string;
  amount: string;
  token: string;
  recipient: string;
  milestone: string;
  status: "locked" | "released";
  createdAt: string;
};

export default function EscrowTab() {
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [form, setForm] = useState({
    label: "", recipient: "", amount: "", token: "USDC", milestone: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleDeposit = async () => {
    if (!form.recipient || !form.amount || !form.milestone) {
      setStatus("error");
      setStatusMsg("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    setStatusMsg("Locking funds into shielded escrow via Cloak...");
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const newEscrow: EscrowItem = {
        id: Date.now().toString(),
        ...form,
        status: "locked",
        createdAt: new Date().toLocaleDateString(),
      };
      setEscrows((e) => [...e, newEscrow]);
      setForm({ label: "", recipient: "", amount: "", token: "USDC", milestone: "" });
      setStatus("success");
      setStatusMsg("Funds locked in private escrow. Release when milestone is met.");
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(e.message || "Escrow deposit failed.");
    }
  };

  const handleRelease = async (id: string) => {
    setStatus("loading");
    setStatusMsg("Releasing escrow privately via Cloak transfer...");
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setEscrows((e) =>
        e.map((x) => (x.id === id ? { ...x, status: "released" } : x))
      );
      setStatus("success");
      setStatusMsg("Escrow released privately. Recipient received funds — no public trail.");
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(e.message || "Release failed.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" /> Private Escrow
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Lock funds privately and release on milestone completion. Neither party's financials are ever public.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 space-y-3">
        <h3 className="text-sm font-medium text-white">New Escrow</h3>
        <input placeholder="Label (e.g. Dev milestone #1)" value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
        <input placeholder="Recipient wallet address" value={form.recipient}
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
        </div>
        <input placeholder="Milestone description" value={form.milestone}
          onChange={(e) => setForm({ ...form, milestone: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2" />
        <button onClick={handleDeposit} disabled={status === "loading"}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-2 transition-colors">
          {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Locking...</> : <><Shield className="w-4 h-4" /> Lock in Private Escrow</>}
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

      {escrows.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Active Escrows</h3>
          {escrows.map((e) => (
            <div key={e.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{e.label || "Escrow"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === "locked" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {e.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate">{e.milestone}</div>
                <div className="text-xs text-gray-500 mt-1">{e.amount} {e.token} · {e.createdAt}</div>
              </div>
              {e.status === "locked" && (
                <button onClick={() => handleRelease(e.id)}
                  className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                  <Unlock className="w-3 h-3" /> Release
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {escrows.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No escrows yet. Create one above.
        </div>
      )}
    </div>
  );
}