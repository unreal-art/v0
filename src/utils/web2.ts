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
    case "follow":
      return `${senderName} followed you!`;
    default:
      return "You have a new notification!";
  }
};

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getImageResolution(imageUrl: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(`${img.width} × ${img.height} `);
    };
    img.onerror = (err) => reject(err);
  });
}

// export function downloadImage(imageUrl: string, fileName?: string) {
//   const uniqueId = Date.now(); // Unique timestamp
//   const defaultFileName = `downloaded-image-${uniqueId}.jpg`; //  unique filename

//   fetch(imageUrl)
//     .then((response) => response.blob())
//     .then((blob) => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName || defaultFileName;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     })
//     .catch((error) => console.error("Error downloading image:", error));
//

export function downloadImage(imageUrl: string, fileName?: string) {
  fetch(imageUrl, { mode: "cors" }) // Ensure it's a CORS request
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `downloaded-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch((error) => console.error("Error downloading image:", error));
}

export const formatMoney = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

export function splitName(fullName: string) {
  let parts = fullName.trim().split(" ");
  let firstName = parts[0];
  let lastName = parts.slice(1).join(" "); // Handles cases with middle names
  return { firstName, lastName };
}

export function capitalizeFirstAlpha(str: string) {
  if (!str) return str;

  const firstChar = str.charAt(0);
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase() + str.slice(1);
  }

  return str;
}

export function truncateText(
  text: string | undefined | null,
  wordLimit: number = 10,
): string {
  if (!text) return "";
  const words = text.split(" ");
  const mainWord =
    words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  return capitalizeFirstAlpha(mainWord);
}

export function truncateEmail(
  email: string | undefined | null,
  charLimit: number = 20,
): string {
  if (!email) return "";

  if (email.length <= charLimit) return email;

  const [username, domain] = email.split("@");

  // If even the domain is too long, just truncate the whole thing
  if (domain && domain.length >= charLimit - 3) {
    return email.substring(0, charLimit - 3) + "...";
  }

  // Truncate username but keep full domain
  if (domain) {
    const availableForUsername = charLimit - domain.length - 4; // -4 for "@" and "..."
    if (availableForUsername > 3) {
      return username.substring(0, availableForUsername) + "...@" + domain;
    }
  }

  // Fallback: just truncate the whole email
  return email.substring(0, charLimit - 3) + "...";
}

export function formatDisplayName(fullName: string, maxLength = 15) {
  if (!fullName || typeof fullName !== "string") {
    return "";
  }

  // Helper function to capitalize first letter of each name part
  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Clean and split the name, capitalize each part
  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map(capitalizeName);

  if (nameParts.length === 0) {
    return "";
  }

  // If single name, just truncate if needed
  if (nameParts.length === 1) {
    const name = nameParts[0];
    return name.length > maxLength
      ? name.substring(0, maxLength - 3) + "..."
      : name;
  }

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  // Strategy 1: Try full name first
  let result = nameParts.join(" ");
  if (result.length <= maxLength) {
    return result;
  }

  // Strategy 2: Try first + last name only
  result = `${firstName} ${lastName}`;
  if (result.length <= maxLength) {
    return result;
  }

  // Strategy 3: Try first name + last initial
  result = `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  if (result.length <= maxLength) {
    return result;
  }

  // Strategy 4: Just first name
  if (firstName.length <= maxLength) {
    return firstName;
  }

  // Strategy 5: Truncate first name with ellipsis
  return firstName.substring(0, maxLength - 3) + "...";
}

// Helper function to get initials
export function getInitials(fullName: string, maxInitials = 2) {
  if (!fullName || typeof fullName !== "string") {
    return "";
  }

  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return "";
  }

  // For 1-2 names, use all initials
  if (nameParts.length <= maxInitials) {
    return nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  // For more names, use first and last
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
}
