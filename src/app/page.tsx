"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Shield,
  Users,
  Landmark,
  Lock,
  RefreshCw,
  FileText,
} from "lucide-react";
import PayrollTab from "@/components/tabs/PayrollTab";
import TreasuryTab from "@/components/tabs/TreasuryTab";
import EscrowTab from "@/components/tabs/EscrowTab";
import SubscriptionsTab from "@/components/tabs/SubscriptionsTab";
import ComplianceTab from "@/components/tabs/ComplianceTab";

const tabs = [
  { id: "payroll", label: "Payroll", icon: Users },
  { id: "treasury", label: "Treasury", icon: Landmark },
  { id: "escrow", label: "Escrow", icon: Lock },
  { id: "subscriptions", label: "Subscriptions", icon: RefreshCw },
  { id: "compliance", label: "Compliance", icon: FileText },
];

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState("payroll");

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">VaultPay</h1>
            <p className="text-xs text-gray-400">Private Financial OS · Powered by Cloak</p>
          </div>
        </div>
        <WalletMultiButton className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-lg !text-sm !py-2 !px-4" />
      </header>

      {!connected ? (
        /* Landing — not connected */
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Private finance for DAOs & teams
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mb-8">
            Run payroll, treasury ops, escrow, subscriptions and compliance —
            all shielded on Solana via Cloak. Amounts and addresses never touch
            the public ledger.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-10">
            {[
              { icon: Users, label: "Private Payroll", desc: "Batch disburse salaries — shielded" },
              { icon: Lock, label: "Escrow", desc: "Milestone-based private release" },
              { icon: FileText, label: "Compliance", desc: "Viewing keys for auditors" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left">
                <Icon className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </div>
            ))}
          </div>
          <WalletMultiButton className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-xl !text-base !py-3 !px-8" />
        </div>
      ) : (
        /* Dashboard — connected */
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Wallet info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Connected:</span>
              <span className="text-sm font-mono text-white">
                {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
              </span>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              Mainnet
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === id
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            {activeTab === "payroll" && <PayrollTab />}
            {activeTab === "treasury" && <TreasuryTab />}
            {activeTab === "escrow" && <EscrowTab />}
            {activeTab === "subscriptions" && <SubscriptionsTab />}
            {activeTab === "compliance" && <ComplianceTab />}
          </div>
        </div>
      )}
    </main>
  );
}