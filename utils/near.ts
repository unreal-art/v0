import { KeyPair } from 'near-api-js';
import { encode } from 'bs58';

/**
 * Signs a message with a NEAR private key.
 * @param privateKey - NEAR private key (e.g. "ed25519:...")
 * @param message - Message to sign
 * @returns Base58-encoded signature
 */
export function signMessageWithNearKey(privateKey: string, message: string): string {
  // Convert message to bytes
  const messageBuffer = Buffer.from(message);

  // Load KeyPair from private key string
  const keyPair = KeyPair.fromString(privateKey);

  // Sign message
  const { signature } = keyPair.sign(messageBuffer);

  // Return base58-encoded signature
  return encode(signature);
}


