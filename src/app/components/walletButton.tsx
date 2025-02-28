"use client";

import { inAppWallet } from "thirdweb/wallets";
import { torusMainnet, torusTestnet } from "$/constants/chains";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_ID as string,
});

const chains = [torusTestnet, torusMainnet];
const metadata = {
  name: "unreal",
  url: "https://unreal.art",
  description: "An ai media agent",
};

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "email", "passkey", "wallet"],
    },
  }),
];

const WalletButton: React.FC = () => {
  return (
    <ConnectButton
      theme={"dark"}
      appMetadata={metadata}
      client={client}
      wallets={wallets}
      chains={chains}
    />
  );
};

export default WalletButton;
