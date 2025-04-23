import { KeyPair, transactions, providers, utils } from "near-api-js";
import sha256 from "js-sha256";
import dotenv from "dotenv";
import { KeyPairString } from "near-api-js/lib/utils";

dotenv.config({ path: "../.env" });
const privateKey = process.env.NEAR_PRIVATE_KEY;
const accountId = process.env.ACCOUNT_ID;

const keyPair = KeyPair.fromString(privateKey as KeyPairString);

const provider = new providers.JsonRpcProvider({
  url: "https://test.rpc.fastnear.com",
});

// Get the nonce of the key
const accessKey = await provider.query(
  `access_key/${accountId}/${keyPair.getPublicKey().toString()}`,
  "",
);
const nonce = ++accessKey.nonce;

// Get a recent block hash
const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

// Construct actions
// const actions = [transactions.transfer(utils.format.parseNearAmount("1"))];
const amount = utils.format.parseNearAmount("1");
if (!amount) throw new Error("Invalid transfer amount");

const actions = [transactions.transfer(BigInt(amount))];

// Construct transaction
const transaction = transactions.createTransaction(
  accountId as string,
  keyPair.getPublicKey(),
  "receiver-account.testnet",
  nonce,
  actions,
  recentBlockHash,
);

// Serialize transaction
const serializedTx = utils.serialize.serialize(
  transactions.SCHEMA.Transaction,
  transaction,
);

// Get serialized transaction hash
const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx));

// Get signature
const signature = keyPair.sign(serializedTxHash);

// Construct signed transaction
const signedTransaction = new transactions.SignedTransaction({
  transaction,
  signature: new transactions.Signature({
    keyType: transaction.publicKey.keyType,
    data: signature.signature,
  }),
});

// Send transaction
const sendTransactionResult = await provider.sendTransaction(signedTransaction);
console.log(sendTransactionResult);
