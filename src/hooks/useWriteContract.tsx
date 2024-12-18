import { useState } from "react";
import {
  writeContract,
  waitForTransactionReceipt,
  sendTransaction,
} from "@wagmi/core";
import { contract } from "@/blockchain/contracts/contract";
import { config } from "@/blockchain/configs/wagmi";

type UseWriteContractResponse = {
  isLoading: boolean;
  isSuccess: boolean;
  write: (functionName: string, args: any[], value?: bigint) => Promise<void>;
};

export default function useWriteContract(): UseWriteContractResponse {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { ynEth } = contract;
  const write = async (functionName: string, args: any[], value?: bigint) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      let result = null;
      if (functionName == "transfer") {
        result = await sendTransaction(config, {
          to: ynEth.address,
          value: value,
        });
      } else {
        // @ts-ignore
        result = (await writeContract(config, {
          abi: ynEth.abi,
          address: ynEth.address,
          functionName,
          args,
        })) as any;
      }

      console.log("result", result);

      if (result) {
        // Wait for the transaction receipt (confirmation)
        const receipt = await waitForTransactionReceipt(config, {
          hash: result,
        });

        console.log("receipt", receipt);

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
