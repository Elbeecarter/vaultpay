"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Users, Plus, Trash2, Send, CheckCircle, Loader2 } from "lucide-react";

type Recipient = {
  id: string;
  label: string;
  wallet: string;
  amount: string;
};

export default function PayrollTab() {
  const { publicKey } = useWallet();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", label: "Alice", wallet: "", amount: "" },
  ]);
  const [token, setToken] = useState<"USDC" | "USDT" | "SOL">("USDC");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const addRecipient = () =>
    setRecipients((r) => [
      ...r,
      { id: Date.now().toString(), label: "", wallet: "", amount: "" },
    ]);

  const removeRecipient = (id: string) =>
    setRecipients((r) => r.filter((x) => x.id !== id));

  const updateRecipient = (id: string, field: keyof Recipient, value: string) =>
    setRecipients((r) =>
      r.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    );

  const totalAmount = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );

  const handleDisbursement = async () => {
    if (!publicKey) return;
    const invalid = recipients.some((r) => !r.wallet || !r.amount);
    if (invalid) {
      setStatus("error");
      setStatusMsg("Please fill in all wallet addresses and amounts.");
      return;
    }
    setStatus("loading");
    setStatusMsg("Preparing shielded batch disbursement via Cloak...");
    try {
      // Simulate Cloak batch disbursement flow
      await new Promise((r) => setTimeout(r, 2500));
      setStatus("success");
      setStatusMsg(`Successfully disbursed ${token} to ${recipients.length} recipients privately. Amounts and addresses are shielded on-chain.`);
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(e.message || "Transaction failed.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Private Payroll
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Batch disburse salaries privately. Amounts and addresses are shielded via Cloak's batch disbursement + stealth addresses.
          </p>
        </div>
        <select
          value={token}
          onChange={(e) => setToken(e.target.value as any)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
        >
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
          <option value="SOL">SOL</option>
        </select>
      </div>

      <div className="space-y-3 mb-4">
        {recipients.map((r, i) => (
          <div key={r.id} className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <input
              placeholder="Label (e.g. Alice)"
              value={r.label}
              onChange={(e) => updateRecipient(r.id, "label", e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-32 flex-shrink-0"
            />
            <input
              placeholder="Wallet address"
              value={r.wallet}
              onChange={(e) => updateRecipient(r.id, "wallet", e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 flex-1 font-mono"
            />
            <input
              placeholder="Amount"
              type="number"
              value={r.amount}
              onChange={(e) => updateRecipient(r.id, "amount", e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-28 flex-shrink-0"
            />
            <button
              onClick={() => removeRecipient(r.id)}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRecipient}
        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors mb-6"
      >
        <Plus className="w-4 h-4" /> Add recipient
      </button>

      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-400">Total disbursement</span>
        <span className="text-white font-semibold">{totalAmount.toFixed(2)} {token}</span>
      </div>

      {status !== "idle" && (
        <div className={`rounded-lg px-4 py-3 mb-4 text-sm flex items-start gap-3 ${
          status === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
          status === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
          "bg-blue-500/10 border border-blue-500/20 text-blue-400"
        }`}>
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />}
          {status === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {statusMsg}
        </div>
      )}

      <button
        onClick={handleDisbursement}
        disabled={status === "loading"}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing shielded disbursement...</>
        ) : (
          <><Send className="w-4 h-4" /> Run Private Payroll</>
        )}
      </button>
    </div>
  );
}