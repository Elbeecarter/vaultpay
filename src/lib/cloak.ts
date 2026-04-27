import {
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  createUtxo,
  createZeroUtxo,
  fullWithdraw,
  generateUtxoKeypair,
  getNkFromUtxoPrivateKey,
  partialWithdraw,
  swapWithChange,
  transact,
  scanTransactions,
  toComplianceReport,
} from "@cloak.dev/sdk";
import {
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT!
);
export const USDT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDT_MINT!
);

export function getConnection() {
  return new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    "confirmed"
  );
}

export type SupportedMint = "SOL" | "USDC" | "USDT";

export function mintPublicKey(token: SupportedMint): PublicKey {
  if (token === "SOL") return NATIVE_SOL_MINT;
  if (token === "USDC") return USDC_MINT;
  return USDT_MINT;
}

export type PayrollRecipient = {
  wallet: string;
  amount: bigint;
  label?: string;
};

/**
 * CORE — Private single transfer (deposit + withdraw in one flow)
 */
export async function privateTransfer({
  signer,
  recipient,
  amount,
  token,
}: {
  signer: Keypair;
  recipient: PublicKey;
  amount: bigint;
  token: SupportedMint;
}) {
  const connection = getConnection();
  const mint = mintPublicKey(token);
  const owner = await generateUtxoKeypair();
  const viewingKeyNk = getNkFromUtxoPrivateKey(owner.privateKey);

  const depositOutput = await createUtxo(amount, owner, mint);

  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(mint)],
      outputUtxos: [depositOutput],
      externalAmount: amount,
      depositor: signer.publicKey,
    },
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: signer,
      walletPublicKey: signer.publicKey,
      chainNoteViewingKeyNk: viewingKeyNk,
    }
  );

  return fullWithdraw(deposited.outputUtxos, recipient, {
    connection,
    programId: CLOAK_PROGRAM_ID,
    depositorKeypair: signer,
    walletPublicKey: signer.publicKey,
    cachedMerkleTree: deposited.merkleTree,
  });
}

/**
 * CORE — Batch payroll disbursement (private fan-out)
 */
export async function batchDisbursement({
  signer,
  recipients,
  token,
  onProgress,
}: {
  signer: Keypair;
  recipients: PayrollRecipient[];
  token: SupportedMint;
  onProgress?: (index: number, total: number, label?: string) => void;
}) {
  const results = [];
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    onProgress?.(i, recipients.length, r.label);
    const result = await privateTransfer({
      signer,
      recipient: new PublicKey(r.wallet),
      amount: r.amount,
      token,
    });
    results.push({ recipient: r.wallet, result });
  }
  return results;
}

/**
 * CORE — Private swap (SOL → token via Orca, shielded)
 */
export async function privateSwap({
  signer,
  amountIn,
  outputMint,
  recipientWallet,
  minAmountOut = 1n,
}: {
  signer: Keypair;
  amountIn: bigint;
  outputMint: SupportedMint;
  recipientWallet: PublicKey;
  minAmountOut?: bigint;
}) {
  const connection = getConnection();
  const mint = mintPublicKey(outputMint);
  const owner = await generateUtxoKeypair();
  const viewingKeyNk = getNkFromUtxoPrivateKey(owner.privateKey);
  const swapInput = await createUtxo(amountIn, owner, NATIVE_SOL_MINT);

  const swapDeposit = await transact(
    {
      inputUtxos: [await createZeroUtxo(NATIVE_SOL_MINT)],
      outputUtxos: [swapInput],
      externalAmount: amountIn,
      depositor: signer.publicKey,
    },
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: signer,
      walletPublicKey: signer.publicKey,
      chainNoteViewingKeyNk: viewingKeyNk,
    }
  );

  const recipientAta = getAssociatedTokenAddressSync(mint, recipientWallet);

  return swapWithChange(
    [swapDeposit.outputUtxos[0]],
    amountIn,
    mint,
    recipientAta,
    minAmountOut,
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: signer,
      walletPublicKey: signer.publicKey,
      cachedMerkleTree: swapDeposit.merkleTree,
    },
    recipientWallet
  );
}

/**
 * CORE — Compliance scan with viewing key
 */
export async function complianceScan(viewingKeyNk: Uint8Array) {
  const connection = getConnection();
  const scan = await scanTransactions({
    connection,
    programId: CLOAK_PROGRAM_ID,
    viewingKeyNk,
    limit: 250,
  });
  return toComplianceReport(scan);
}

/**
 * CORE — Shielded escrow deposit (locks funds privately)
 */
export async function escrowDeposit({
  signer,
  amount,
  token,
}: {
  signer: Keypair;
  amount: bigint;
  token: SupportedMint;
}) {
  const connection = getConnection();
  const mint = mintPublicKey(token);
  const escrowOwner = await generateUtxoKeypair();
  const viewingKeyNk = getNkFromUtxoPrivateKey(escrowOwner.privateKey);
  const escrowUtxo = await createUtxo(amount, escrowOwner, mint);

  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(mint)],
      outputUtxos: [escrowUtxo],
      externalAmount: amount,
      depositor: signer.publicKey,
    },
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: signer,
      walletPublicKey: signer.publicKey,
      chainNoteViewingKeyNk: viewingKeyNk,
    }
  );

  return {
    escrowOwner,
    viewingKeyNk,
    outputUtxos: deposited.outputUtxos,
    merkleTree: deposited.merkleTree,
    amount,
    token,
    createdAt: Date.now(),
  };
}

/**
 * CORE — Escrow release (private transfer to recipient on milestone)
 */
export async function escrowRelease({
  signer,
  escrowData,
  recipient,
}: {
  signer: Keypair;
  escrowData: Awaited<ReturnType<typeof escrowDeposit>>;
  recipient: PublicKey;
}) {
  const connection = getConnection();
  return partialWithdraw(
    escrowData.outputUtxos,
    recipient,
    escrowData.amount,
    {
      connection,
      programId: CLOAK_PROGRAM_ID,
      depositorKeypair: signer,
      walletPublicKey: signer.publicKey,
      cachedMerkleTree: escrowData.merkleTree,
    }
  );
}