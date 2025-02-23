import { ethers } from "ethers";
// Function to generate Ethereum wallet
export const generateEthereumWallet = (): WalletObject => {
  // Generate Ethereum Wallet using ethers.js
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
};

// returns a range of numbers to be used for pagination.
export function getRange(page: number, limit: number) {
  const from = page * limit;
  const to = from + limit - 1;

  return [from, to];
}

export function isValidFileName(name: string): boolean {
  // Basic validation: empty strings are not allowed
  if (!name) return false;

  // Check if it's just a dot (hidden files/folders)
  if (name === ".") return false;

  // Check if it starts with a dot (hidden files/folders)
  if (name.startsWith(".")) {
    // Hidden files/folders are allowed, but we should check if they're valid after the dot
    const rest = name.slice(1);
    return rest.length > 0 && isValidFileName(rest);
  }

  // // Check if it contains invalid characters
  // const invalidChars = /[\/*?:<>|\\]/;
  // if (invalidChars.test(name)) return false;

  // Check if it exceeds maximum length
  const maxNameLength = 255; // Windows limit
  if (name.length > maxNameLength) return false;

  // If we pass all checks, it's a valid file/folder name
  return true;
}

export function isHighQualityImage(filename: string): boolean {
  if (!isValidFileName(filename)) {
    return false;
  }
  // const lowQExt = ["webp", "svg", "ico"];
  const highQExt = ["jpeg", "jpg", "png"];

  return highQExt.includes(filename.toLowerCase().split(".").pop() || "");
}

export function truncateText(
  text: string | undefined | null,
  wordLimit: number = 15,
): string {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
}

export const getNotificationMessage = (
  type: string,
  senderName: string | null | undefined,
) => {
  switch (type) {
    case "like":
      return `${senderName} liked your post!`;
    case "comment":
      return `${senderName} commented on your post!`;
    case "share":
      return `${senderName} just shared your post! Your content is reaching more people.`;
    default:
      return "You have a new notification!";
  }
};
