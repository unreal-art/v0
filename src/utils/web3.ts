import { Chain, createThirdwebClient, getContract } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_ID as string,
});

export const getContractInstance = (chain: Chain, address: string) => {
  return getContract({
    client,
    chain,
    address,
  });
};
