"use client";
import useWeb3 from "@/hooks/useWeb3";
import { shortenAddr } from "@/utils";
import {
  ConnectButton,
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import React from "react";

const Navbar: React.FC = () => {
  const { isConnected, address, chainId } = useWeb3();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  return (
    <nav style={{ height: "70px" }} className='flex justify-between p-5 h-30'>
      <div>
        <h2 className='font-semibold text-xl'>YieldNest</h2>
      </div>
      <div>
        {isConnected ? (
          chainId == 17000 ? (
            <p
              onClick={openAccountModal}
              className='bg-[#0091f2] text-[white] p-1 rounded-[5px] cursor-pointer'
            >
              {shortenAddr(address)}
            </p>
          ) : (
            <p
              onClick={openChainModal}
              className='bg-[#0091f2] text-[white] p-1 rounded-[5px] cursor-pointer'
            >
              Wrong Network
            </p>
          )
        ) : (
          <ConnectButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
