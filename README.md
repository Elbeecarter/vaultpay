# VaultPay — Private Financial OS for DAOs & Teams

> Built on [Cloak](https://cloak.ag) · Powered by Solana

VaultPay is the private financial operating system for DAOs, protocols, and remote-first organizations. Run payroll, treasury operations, escrow, recurring subscriptions, and compliance — all shielded on Solana via Cloak's ZK-proof infrastructure. Amounts and addresses never appear on the public ledger.

## The Problem

Every transaction on Solana is public by default. For organizations this is an operational risk:

- Payroll amounts are permanently indexed and searchable by anyone
- Treasury movements telegraph strategy before execution completes
- Vendor payment flows are parsed by competitors in real time
- B2B deal sizes are visible the moment funds move

VaultPay closes that gap entirely — making Cloak the private financial layer for any crypto-native organization. Without Cloak, none of these modules can exist. Privacy is not a feature here — it is the precondition.

## How Cloak SDK Powers VaultPay

All five Cloak SDK capabilities are used meaningfully. Remove any one and a specific feature breaks.

| Module | Cloak SDK Capability | Why It Is Load-Bearing |
|--------|---------------------|----------------------|
| Private Payroll | Batch disbursement + stealth addresses | Salaries fan out to many recipients in one shielded transaction — amounts and addresses hidden |
| Treasury Transfer | Private transfers (USDC, USDT, SOL) | Fund movements between accounts leave no public trail |
| Treasury Swap | Private swaps via Orca | Token swaps routed through Cloak shielded pool — path and amounts hidden |
| Escrow | Shielded deposit + viewing keys | Funds locked privately, released on milestone, auditable only by key holder |
| Subscriptions | Recurring batch disbursement | Automated private standing orders — each cycle is a shielded fan-out |
| Compliance | Scoped viewing keys + scanTransactions | Three-tier audit system — full, auditor, and regulator keys |

## Two Original Innovations

### 1. Private Escrow with Conditional Release
Funds are locked into Cloak's shielded UTXO pool and released privately on milestone completion. Neither the client nor contractor's financials are ever visible on-chain. No third party can determine the deal size, the parties involved, or the timeline. This is the first private milestone-based escrow on Solana — a primitive that only exists because of Cloak's shielded pool.

### 2. Private Recurring Subscriptions
Recurring shielded payment schedules for retainers, grants, and SaaS tools — executed as automated batch disbursements through Cloak on a daily, weekly, or monthly cycle. Each cycle, the public chain sees only commitment updates — no amounts, no addresses, no schedule. A compliance report viewable only by the admin's viewing key captures the full private history. This primitive does not exist anywhere else on Solana today.

## Features

- **Private Payroll** — Upload recipients and amounts, run a shielded batch disbursement in one click. Stealth addresses ensure each recipient receives funds privately.
- **Treasury Operations** — Move funds between accounts privately or swap tokens via Orca without revealing amounts or path on-chain.
- **Private Escrow** — Lock funds in a shielded vault, release on milestone completion. Full lifecycle privacy — deposit, hold, and release all happen inside Cloak.
- **Recurring Subscriptions** — Schedule private standing orders for any recipient. Pause, resume, or cancel at any time.
- **Compliance Dashboard** — Generate three tiers of viewing keys: Full Internal (all data), Auditor (amounts only), Regulator (time-gated 30-day validity). Scan transaction history and download structured compliance reports.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Privacy Layer | `@cloak.dev/sdk` — UTXO shielded pool, Groth16 proofs |
| Blockchain | Solana (`@solana/web3.js`) |
| Wallet | Solana Wallet Adapter (Phantom, Solflare) |
| Compliance Reports | jsPDF |
| Deployment | Vercel |

## Cloak SDK Integration Details

**Program ID:** `zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW`

**Relay URL:** `https://api.cloak.ag`

**Core SDK functions used:**

```typescript
// Shielded deposit into UTXO pool
transact({ inputUtxos, outputUtxos, externalAmount, depositor }, options)

// Private transfer to recipient — full amount
fullWithdraw(outputUtxos, recipient, options)

// Private transfer to recipient — partial amount, keep change shielded
partialWithdraw(outputUtxos, recipient, amount, options)

// Private swap via Orca through shielded pool
swapWithChange(inputUtxos, amountIn, outputMint, recipientAta, minOut, options, recipient)

// Compliance scan with viewing key
scanTransactions({ connection, programId, viewingKeyNk, limit })
toComplianceReport(scan)

// Viewing key derivation
generateUtxoKeypair()
getNkFromUtxoPrivateKey(privateKey)
```

## Setup & Run Locally

**1. Clone the repo**
```bash
git clone https://github.com/Elbeecarter/vaultpay.git
cd vaultpay
```

**2. Install dependencies**
```bash
npm install --legacy-peer-deps
```

**3. Create `.env.local`**
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_CLOAK_PROGRAM_ID=zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW
NEXT_PUBLIC_CLOAK_RELAY_URL=https://api.cloak.ag
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
NEXT_PUBLIC_USDT_MINT=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
```

**4. Run the development server**
```bash
npm run dev
```

**5. Open in browser**
http://localhost:3000

Connect your Phantom or Solflare wallet and explore all five modules.

## Live Demo

🔗 **Live App:** [https://vaultpay-xi.vercel.app](https://vaultpay-xi.vercel.app)

📁 **GitHub:** [https://github.com/Elbeecarter/vaultpay](https://github.com/Elbeecarter/vaultpay)

## Target Users

Any DAO, protocol, or remote-first team currently paying contributors in USDC or USDT who needs financial privacy as an operational requirement — not a nice-to-have. Specifically:

- **DAOs** running contributor payroll without exposing salary structures
- **Protocols** moving treasury funds without telegraphing strategy
- **Startups** settling vendor and agency payments privately
- **Grant programs** disbursing funds without revealing recipient identities
- **Cross-border teams** receiving stablecoin payments without permanent public records

## Why Privacy Is Load-Bearing

The moment any of these organizations' payment flows become public, the product fails its users. A DAO whose payroll is readable on-chain cannot retain contributors who value financial privacy. A protocol whose treasury movements are public cannot execute strategy without being front-run. VaultPay is the product that makes Solana viable for these organizations — and Cloak is the only infrastructure that makes VaultPay possible.

## License

MIT
