"use client";

import { contract } from "@/blockchain/contracts/contract";
import { formatEther, Hash } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

type FunctionConfig = {
  label: keyof TokenInfo;
  isNumber: boolean;
};

type TokenInfo = {
  [key: string]: string | null;
};

type ContractResult = {
  result: string | number | bigint | boolean;
  status: string;
};

const functionConfig: Record<string, FunctionConfig> = {
  name: { label: "tokenName", isNumber: false },
  symbol: { label: "tokenSymbol", isNumber: false },
  decimals: { label: "tokenDecimals", isNumber: false },
  totalSupply: { label: "totalSupply", isNumber: true },
};

export default function useTokenData() {
  const { address: userAddress } = useAccount();
  const { ynEth } = contract;

  // Fetch user balance

  const {
    data: userBalanceData,
    queryKey: balanceQueryKey,
    isLoading: isBalanceLoading,
    refetch: refetchUserBalance,
    // @ts-ignore
  } = useReadContract({
    address: ynEth.address,
    abi: ynEth.abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress as Hash] : undefined,
    query: {
      enabled: !!userAddress,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  });

  // Fetch token contract details
  const contracts = Object.keys(functionConfig).map((fn) => ({
    address: ynEth.address,
    abi: ynEth.abi,
    functionName: fn as keyof TokenInfo,
  }));

  const { data: contractData, isLoading: isContractsLoading } =
    // @ts-ignore
    useReadContracts({
      contracts,
      query: {
        enabled: !!ynEth.address,
        refetchOnMount: false,
      },
    });

  // Prepare the token info
  const tokenInfo: TokenInfo = {
    userBalance:
      userBalanceData !== undefined
        ? formatEther(userBalanceData as bigint)
        : null,
    tokenName: null,
    tokenSymbol: null,
    tokenDecimals: null,
    totalSupply: null,
  };

  contractData?.forEach((contractResult: ContractResult, index: number) => {
    const fnName = Object.keys(functionConfig)[
      index
    ] as keyof typeof functionConfig;
    const { label, isNumber } = functionConfig[fnName];

    if (
      contractResult?.result !== undefined &&
      contractResult.status === "success"
    ) {
      tokenInfo[label as keyof TokenInfo] = isNumber
        ? formatEther(BigInt(contractResult.result)) // Apply format for numbers
        : String(contractResult.result); // Use as-is for strings
    } else {
      tokenInfo[label] = null; // If result is missing, set it to null
    }
  });

  console.log("loading", tokenInfo, isBalanceLoading, isContractsLoading);

  return {
    data: tokenInfo,
    refetchUserBalance,
    isLoading: isBalanceLoading || isContractsLoading,
    isContractsLoading,
  };
}
