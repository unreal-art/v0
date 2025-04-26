import { axiosInstanceLocal } from "@/lib/axiosInstance";
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
  success: boolean;
  data?: {
    message: string;
    transactionhash?: string;
  };
  error?: {
    message: string;
    details?: string;
    statusCode?: number;
  };
  warning?: string;
}

export const useTokenTransfer = () => {
  return useMutation<TokenTransferResponse, Error, TokenTransferParams>({
    mutationFn: async (transferData: TokenTransferParams) => {
      try {
        const response = await axiosInstanceLocal.post<TokenTransferResponse>(
          "api/transfer-tokens",
          transferData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Check if the response indicates an error
        if (!response.data.success && response.data.error) {
          throw new Error(
            response.data.error.details
              ? `${response.data.error.message}: ${response.data.error.details}`
              : response.data.error.message
          );
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
          // Handle structured API errors
          const responseData = error.response.data;

          if (responseData.error) {
            throw new Error(
              responseData.error.details
                ? `${responseData.error.message}: ${responseData.error.details}`
                : responseData.error.message
            );
          }

          throw new Error(responseData.message || "Token transfer failed");
        }

        // Handle network or other errors
        throw error instanceof Error
          ? error
          : new Error("Token transfer failed");
      }
    },
  });
};
