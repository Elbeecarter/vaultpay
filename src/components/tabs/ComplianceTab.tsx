"use client";

import { useState } from "react";
import { FileText, Key, Eye, Download, Loader2, CheckCircle, Shield } from "lucide-react";

type ViewingKey = {
  id: string;
  type: "full" | "auditor" | "regulator";
  key: string;
  createdAt: string;
  expiresAt?: string;
  label: string;
};

export default function ComplianceTab() {
  const [viewingKeys, setViewingKeys] = useState<ViewingKey[]>([]);
  const [scanKey, setScanKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [report, setReport] = useState<any>(null);

  const keyTypeConfig = {
    full: { label: "Full Internal Key", desc: "All transactions, amounts, addresses", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    auditor: { label: "Auditor Key", desc: "Amounts only — no addresses", color: "text-blue-400", bg: "bg-blue-500/10" },
    regulator: { label: "Regulator Key", desc: "Time-gated, 30-day validity", color: "text-amber-400", bg: "bg-amber-500/10" },
  };

  const generateKey = async (type: ViewingKey["type"]) => {
    setStatus("loading");
    setStatusMsg(`Generating ${type} viewing key via Cloak compliance rail...`);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const fakeKey = `vk_${type}_${Math.random().toString(36).slice(2, 18)}`;
      const expiry = type === "regulator"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : undefined;
      setViewingKeys((k) => [...k, {
        id: Date.now().toString(), type, key: fakeKey,
        createdAt: new Date().toLocaleDateString(),
        expiresAt: expiry,
        label: keyTypeConfig[type].label,
      }]);
      setStatus("success");
      setStatusMsg(`${keyTypeConfig[type].label} generated. Share only with the intended party.`);
    } catch (e: any) {
      setStatus("error"); setStatusMsg(e.message || "Key generation failed.");
    }
  };

  const runScan = async () => {
    if (!scanKey) { setStatus("error"); setStatusMsg("Enter a viewing key to scan."); return; }
    setStatus("loading"); setStatusMsg("Scanning Cloak shielded transactions with viewing key...");
    try {
      await new Promise((r) => setTimeout(r, 2500));
      setReport({
        totalTransactions: 12,
        totalVolume: "45,200 USDC",
        dateRange: "Apr 1 – Apr 27, 2026",
        transactions: [
          { date: "Apr 27", type: "Payroll batch", amount: "8,400 USDC", recipients: 6 },
          { date: "Apr 20", type: "Treasury transfer", amount: "12,000 USDC", recipients: 1 },
          { date: "Apr 15", type: "Escrow release", amount: "5,000 USDC", recipients: 1 },
          { date: "Apr 10", type: "Payroll batch", amount: "8,400 USDC", recipients: 6 },
          { date: "Apr 3", type: "Private swap", amount: "11,400 USDC", recipients: 1 },
        ],
      });
      setStatus("success"); setStatusMsg("Scan complete. Report generated from viewing key data.");
    } catch (e: any) {
      setStatus("error"); setStatusMsg(e.message || "Scan failed.");
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const content = `VaultPay Compliance Report\n\nDate Range: ${report.dateRange}\nTotal Transactions: ${report.totalTransactions}\nTotal Volume: ${report.totalVolume}\n\nTransactions:\n${report.transactions.map((t: any) => `${t.date} | ${t.type} | ${t.amount}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "vaultpay-compliance-report.txt"; a.click();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Compliance & Audit
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Generate scoped viewing keys for auditors and regulators. Scan transaction history privately without exposing anything to the public ledger.
        </p>
      </div>

      {/* Viewing key generator */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-400" /> Generate Viewing Key
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(keyTypeConfig) as [ViewingKey["type"], typeof keyTypeConfig.full][]).map(([type, cfg]) => (
            <button key={type} onClick={() => generateKey(type)}
              className="text-left bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-colors group">
              <div className={`text-xs font-medium ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded-full inline-block mb-2`}>
                {cfg.label}
              </div>
              <div className="text-xs text-gray-400">{cfg.desc}</div>
              <div className="text-xs text-emerald-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to generate →
              </div>
            </button>
          ))}
        </div>
      </div>

      {viewingKeys.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Active Viewing Keys</h3>
          {viewingKeys.map((k) => (
            <div key={k.id} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">{k.label}</span>
                  {k.expiresAt && <span className="text-xs text-amber-400">expires {k.expiresAt}</span>}
                </div>
                <div className="text-xs font-mono text-gray-400 truncate">{k.key}</div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(k.key)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0">
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compliance scan */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" /> Scan with Viewing Key
        </h3>
        <div className="flex gap-3">
          <input placeholder="Paste viewing key (vk_...)" value={scanKey}
            onChange={(e) => setScanKey(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 font-mono" />
          <button onClick={runScan} disabled={status === "loading"}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Scan
          </button>
        </div>
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

      {report && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-white">Compliance Report</div>
              <div className="text-xs text-gray-400">{report.dateRange}</div>
            </div>
            <button onClick={downloadReport}
              className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">Total transactions</div>
              <div className="text-lg font-semibold text-white">{report.totalTransactions}</div>
            </div>
            <div className="bg-gray-900 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">Total volume</div>
              <div className="text-lg font-semibold text-white">{report.totalVolume}</div>
            </div>
          </div>
          <div className="space-y-2">
            {report.transactions.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-700 last:border-0">
                <span className="text-gray-400">{t.date}</span>
                <span className="text-white">{t.type}</span>
                <span className="text-emerald-400 font-medium">{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}