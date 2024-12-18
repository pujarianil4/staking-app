import { useState } from "react";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { contract } from "@/blockchain/contracts/contract";
import { config } from "@/blockchain/configs/wagmi";
import { erc20Abi } from "viem";

type UseWriteContractResponse = {
  isLoading: boolean;
  isSuccess: boolean;
  write: (functionName: string, args: any[]) => Promise<void>;
};

export default function useWriteContract(): UseWriteContractResponse {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { ynEth } = contract;
  const write = async (functionName: string, args: any[]) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      let result = null;
      if (functionName == "approve") {
        // @ts-ignore
        result = await writeContract(config, {
          abi: erc20Abi,
          address: "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
          functionName,
          args,
        });
      } else {
        // @ts-ignore
        result = await writeContract(config, {
          abi: ynEth.abi,
          address: ynEth.address,
          functionName,
          args,
        });
      }

      if (result) {
        // Wait for the transaction receipt (confirmation)
        const receipt = await waitForTransactionReceipt(config, {
          hash: result,
        });

        if (receipt.status == "success") {
          setIsSuccess(true);
        } else {
          throw new Error("Transation failed!");
        }
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSuccess,
    write,
  };
}
