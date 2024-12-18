import React from "react";
import { useAccount, useBalance } from "wagmi";

export default function useWeb3() {
  const { address, isConnected, chainId } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  return { address, isConnected, balance, chainId };
}
