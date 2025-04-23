import { KeyPair, transactions, providers, utils } from "near-api-js";
import sha256 from "js-sha256";
import dotenv from "dotenv";
import { KeyPairString } from "near-api-js/lib/utils";

dotenv.config({ path: "../.env" });

const RPC_URL = "https://test.rpc.fastnear.com";
const privateKey = process.env.NEAR_PRIVATE_KEY!;
const accountId = process.env.ACCOUNT_ID!;
const keyPair = KeyPair.fromString(privateKey as KeyPairString);
const provider = new providers.JsonRpcProvider({ url: RPC_URL });

/**
 * Sends a NEAR transfer transaction from your wallet to a receiver.
 */
export async function signAndSendNearTx(
  receiverId: string,
  amountNear: string, // e.g., "1" for 1 NEAR
) {
  // Get current nonce and block hash
  const accessKey = await provider.query<{
    nonce: number;
    block_hash: string;
  }>(`access_key/${accountId}/${keyPair.getPublicKey().toString()}`, "");
  const nonce = accessKey.nonce + 1;
  const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

  // Create transfer action
  const actions = [
    transactions.transfer(utils.format.parseNearAmount(amountNear)!),
  ];

  // Construct and serialize transaction
  const transaction = transactions.createTransaction(
    accountId,
    keyPair.getPublicKey(),
    receiverId,
    nonce,
    actions,
    recentBlockHash,
  );

  const serializedTx = utils.serialize.serialize(
    transactions.SCHEMA.Transaction,
    transaction,
  );
  const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx));

  // Sign the transaction
  const signature = keyPair.sign(serializedTxHash);
  const signedTransaction = new transactions.SignedTransaction({
    transaction,
    signature: new transactions.Signature({
      keyType: transaction.publicKey.keyType,
      data: signature.signature,
    }),
  });

  // Send it!
  const result = await provider.sendTransaction(signedTransaction);
  return result;
}
