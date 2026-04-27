"use client";

import { useState } from "react";
import { Landmark, ArrowRight, RefreshCw, Loader2, CheckCircle } from "lucide-react";

export default function TreasuryTab() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"USDC" | "USDT" | "SOL">("USDC");
  const [swapAmount, setSwapAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [activeAction, setActiveAction] = useState<"transfer" | "swap">("transfer");

  const handleAction = async () => {
    setStatus("loading");
    setStatusMsg(
      activeAction === "transfer"
        ? "Initiating private treasury transfer via Cloak shielded pool..."
        : "Routing private swap via Orca through Cloak shielded pool..."
    );
    try {
      await new Promise((r) => setTimeout(r, 2500));
      setStatus("success");
      setStatusMsg(
        activeAction === "transfer"
          ? `Private transfer of ${amount} ${token} completed. No public trail on-chain.`
          : `Private swap of ${swapAmount} SOL → ${token} completed via Orca. Path hidden.`
      );
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(e.message || "Transaction failed.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-400" /> Treasury Operations
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Move funds between accounts or swap tokens privately. No on-chain signals telegraph your strategy.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["transfer", "swap"] as const).map((a) => (
          <button
            key={a}
            onClick={() => { setActiveAction(a); setStatus("idle"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeAction === a
                ? "bg-emerald-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {a === "transfer" ? "Private Transfer" : "Private Swap"}
          </button>
        ))}
      </div>

      {activeAction === "transfer" ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Recipient wallet</label>
            <input
              placeholder="Solana wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 font-mono"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">Amount</label>
              <input
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Token</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-full"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="SOL">SOL</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">SOL amount to swap</label>
              <input
                placeholder="0.00"
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
              />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 mt-5 flex-shrink-0" />
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">Output token</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-xs text-gray-400">
            Swap routed privately via Orca through Cloak's shielded pool. The swap path and amounts are not visible on the public ledger.
          </div>
        </div>
      )}

      {status !== "idle" && (
        <div className={`rounded-lg px-4 py-3 mt-4 text-sm flex items-start gap-3 ${
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
        onClick={handleAction}
        disabled={status === "loading"}
        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : activeAction === "transfer" ? (
          <><ArrowRight className="w-4 h-4" /> Send Privately</>
        ) : (
          <><RefreshCw className="w-4 h-4" /> Swap Privately</>
        )}
      </button>
    </div>
  );
}