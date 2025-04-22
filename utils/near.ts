import { KeyPair } from 'near-api-js';
import bs58 from 'bs58';

const encode = bs58.encode;

interface SignMessageParams {
  message: string;
  nonce: string;
  recipient: string;
  callbackUrl: string;
}

interface AuthResponse {
  signature: string;
  accountId: string;
  publicKey: string;
  message: string;
  nonce: string;
  recipient: string;
  callbackUrl: string;
}

// Replace with your NEAR credentials
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY;
const ACCOUNT_ID = 'hirocoin.testnet';

// Create KeyPair once for reuse
const keyPair = KeyPair.fromString(PRIVATE_KEY);

/**
 * Signs a NEAR login message with your wallet private key.
 */
export async function signNearLoginMessage({
  message,
  nonce,
  recipient,
  callbackUrl 
}: SignMessageParams): Promise<AuthResponse> {
  const fullMessage = `${message}:${nonce}:${recipient}:${callbackUrl}`;
  const messageBytes = Buffer.from(fullMessage);

  const { signature } = keyPair.sign(messageBytes);
  const publicKey = keyPair.getPublicKey();

  return {
    signature: encode(signature),
    accountId: ACCOUNT_ID,
    publicKey: publicKey.toString(), // base58 format
    message,
    nonce,
    recipient,
    callbackUrl
  };
}
