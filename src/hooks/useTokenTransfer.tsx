import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface TokenTransferParams {
  owner: string;
  signature: string;
  value: string;
  deadline: number;
  spender: string;
  partnerwallet: string;
  vendor: string;
}

interface TokenTransferResponse {
  message: string;
  transactionhash?: string;
}

interface TokenTransferError {
  message: string;
}

export const useTokenTransfer = () => {
  return useMutation<
    TokenTransferResponse,
    TokenTransferError,
    TokenTransferParams
  >({
    mutationFn: async (transferData: TokenTransferParams) => {
      try {
        const response = await axios.post<TokenTransferResponse>(
          "/api/transfer-tokens",
          transferData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(
            error.response.data.message || "Token transfer failed"
          );
        }
        throw new Error("Token transfer failed");
      }
    },
  });
};
