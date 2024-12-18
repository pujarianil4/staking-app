"use client";

import React, { useState, ChangeEvent } from "react";
import { erc20Abi, formatEther, parseUnits } from "viem";
import useTokenData from "@/hooks/useTokenData";
import useWriteContract from "@/hooks/useWriteContract";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useWeb3 from "@/hooks/useWeb3";
import { shortenAddr } from "@/utils";
import { contract } from "@/blockchain/contracts/contract";
import { useReadContract } from "wagmi";

// Reusable InfoCard Component
interface InfoCardProps {
  label: string;
  value: string | number | null;
  isLoading: boolean;
}
const InfoCard: React.FC<InfoCardProps> = ({ label, value, isLoading }) => (
  <div className='bg-white p-6 rounded-lg shadow-md text-center border-[2px] border-solid border-[#0091f2] '>
    <h2 className='text-xl font-semibold text-gray-700 mb-2'>{label}</h2>
    <p className='text-2xl font-bold'>
      {isLoading ? "Loading..." : value ?? "N/A"}
    </p>
  </div>
);

const DashBoard: React.FC = () => {
  const { data, isLoading, isContractsLoading, refetchUserBalance } =
    useTokenData();
  const { openConnectModal } = useConnectModal();
  const { balance, isConnected, address, chainId } = useWeb3();
  const { write, isLoading: isTransactionLoading } = useWriteContract();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const { ynEth } = contract;
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>("");
  const [depositAmount, setDepositAmount] = useState<number | string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    data: wEthAllowance,
    refetch: refetchAllowance,
    // @ts-ignore
  } = useReadContract({
    address: "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
    abi: erc20Abi,
    functionName: "allowance",
    args: [address || "0x0000000000000000000000", ynEth.address],
    query: {
      enabled: !!address,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  });

  const handleTabChange = (tab: "deposit" | "withdraw") => {
    setActiveTab(tab);
    setErrorMsg("");
    setDepositAmount("");
    setWithdrawAmount("");
  };
  // Handle Input Change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) < 0) {
      return;
    }
    const value = parseFloat(e.target.value);
    if (activeTab == "deposit") {
      setDepositAmount(e.target.value);

      if (Number(value) > (Number(balance?.formatted) || 0)) {
        setErrorMsg("Insufficient Balance");
      } else {
        setErrorMsg("");
      }
    } else {
      setWithdrawAmount(e.target.value);
      if (Number(value) > (Number(data.userBalance) || 0)) {
        setErrorMsg("Insufficient Balance");
      } else {
        setErrorMsg("");
      }
    }
  };

  // Handle Deposit Transaction
  const handleDeposit = async () => {
    if (!isConnected) return openConnectModal?.();

    const value = parseFloat(depositAmount.toString());
    if (!value || isNaN(value)) {
      setErrorMsg("Invalid Value");
      return;
    }

    if (Number(value) > (Number(balance?.formatted) || 0)) {
      setErrorMsg("Insufficient Balance");
      return;
    }

    try {
      const amountInWei = parseUnits(String(value), Number(balance?.decimals));

      if (Number(formatEther(wEthAllowance)) < Number(value)) {
        await write("approve", [ynEth.address, amountInWei]);
      }
      await write("deposit", [amountInWei, address]);
      setDepositAmount("");
      refetchUserBalance();
      refetchAllowance();
      alert("Transaction Successful");
    } catch (error) {
      console.log("Error", error);
      refetchAllowance();
      setErrorMsg("Transaction Failed. Please try again.");
      setTimeout(() => setErrorMsg(""), 2000);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) return openConnectModal?.();

    const value = parseFloat(withdrawAmount.toString());
    if (!value || isNaN(value)) {
      setErrorMsg("Invalid Value");
      return;
    }

    if (Number(value) > (Number(data.userBalance) || 0)) {
      setErrorMsg("Insufficient Balance");
      return;
    }

    try {
      const amountInWei = parseUnits(String(value), Number(balance?.decimals));
      await write("redeem", [amountInWei, address, address]);
      setWithdrawAmount("");
      refetchUserBalance();
      alert("Transaction Successful");
    } catch (error) {
      setErrorMsg("Transaction Failed. Please try again.");
      setTimeout(() => setErrorMsg(""), 2000);
    }
  };

  const isDepositDisabled =
    !data?.tokenName ||
    !isConnected ||
    isLoading ||
    !depositAmount ||
    isTransactionLoading ||
    errorMsg ||
    chainId == 1700;

  const isWithdrawDisabled =
    !data?.userBalance ||
    !isConnected ||
    isLoading ||
    !withdrawAmount ||
    isTransactionLoading ||
    errorMsg ||
    chainId == 1700;

  return (
    <div className='min-h-screen bg-gray-100 text-black'>
      <div className='container mx-auto p-6'>
        <h1 className='text-4xl font-bold text-center mb-1'>
          Yieldnest FE Test
        </h1>
        <p className='text-center mb-2'>User Address: {shortenAddr(address)}</p>

        {/* Token Info Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3 gap-6 mb-8'>
          <InfoCard
            label='Token Name'
            value={data?.tokenName}
            isLoading={isContractsLoading}
          />
          <InfoCard
            label='Symbol'
            value={data?.tokenSymbol}
            isLoading={isContractsLoading}
          />
          <InfoCard
            label='Decimals'
            value={data?.tokenDecimals}
            isLoading={isContractsLoading}
          />
          {/* <InfoCard
            label='Total Supply'
            value={data?.totalSupply}
            isLoading={isContractsLoading}
          />
          <InfoCard
            label='Your Balance'
            value={data?.userBalance}
            isLoading={isLoading}
          /> */}
        </div>

        <div className='m-10'>
          {isConnected && (
            <h2>
              <span className='font-bold'>UserBalance:</span>{" "}
              {data?.userBalance ? (
                <span>{`${data?.userBalance} 
                ${data?.tokenSymbol}`}</span>
              ) : isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>N/A</span>
              )}
            </h2>
          )}

          <h2>
            <span className='font-bold'>Total Supply:</span>{" "}
            {data.totalSupply ? (
              <span>
                {" "}
                {`${data?.totalSupply} 
              ${data?.tokenSymbol}`}
              </span>
            ) : isContractsLoading ? (
              <span>Loading...</span>
            ) : (
              <span>N/A</span>
            )}
          </h2>
        </div>

        {/* Deposit Section */}
        {/* <div className='bg-white p-6 rounded-lg shadow-md mx-auto max-w-lg'>
          <h2 className='text-2xl font-semibold text-center mb-4'>
            Deposit Tokens
          </h2>

          <input
            type='number'
            value={depositAmount}
            onChange={handleInputChange}
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500'
            placeholder='Enter amount to deposit'
            min='0'
          />

          <button
            onClick={handleDeposit}
            disabled={isDepositDisabled}
            className={`mt-4 w-full font-semibold py-3 rounded-lg transition duration-300 ${
              isDepositDisabled
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-[#0091f2] text-white hover:bg-gray-800"
            }`}
          >
            {isConnected
              ? isTransactionLoading
                ? "Processing..."
                : "Deposit"
              : "Connect Wallet"}
          </button>

          {errorMsg && (
            <p className='text-red-500 mt-2 text-center'>{errorMsg}</p>
          )}
        </div> */}

        <div className='bg-white p-6 rounded-lg shadow-md mx-auto max-w-lg'>
          {/* Tabs */}
          <div className='flex justify-center mb-6 gap-4'>
            <button
              onClick={() => handleTabChange("deposit")}
              className={`px-4 py-2 font-semibold rounded-lg ${
                activeTab === "deposit"
                  ? "bg-[#0091f2] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => handleTabChange("withdraw")}
              className={`px-4 py-2 font-semibold rounded-lg ${
                activeTab === "withdraw"
                  ? "bg-[#0091f2] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Content */}
          {activeTab === "deposit" && (
            <div>
              <h2 className='text-2xl font-semibold text-center mb-4'>
                Deposit Tokens
              </h2>

              <input
                type='number'
                value={depositAmount}
                onChange={handleInputChange}
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500'
                placeholder='Enter amount to deposit'
                min='0'
              />

              <button
                onClick={handleDeposit}
                disabled={isDepositDisabled}
                className={`mt-4 w-full font-semibold py-3 rounded-lg transition duration-300 ${
                  isDepositDisabled
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-[#0091f2] text-white hover:bg-gray-800"
                }`}
              >
                {isConnected
                  ? isTransactionLoading
                    ? "Processing..."
                    : "Deposit"
                  : "Connect Wallet"}
              </button>

              {errorMsg && (
                <p className='text-red-500 mt-2 text-center'>{errorMsg}</p>
              )}
            </div>
          )}

          {activeTab === "withdraw" && (
            <div>
              <h2 className='text-2xl font-semibold text-center mb-4'>
                Withdraw Tokens
              </h2>

              <input
                type='number'
                value={withdrawAmount}
                onChange={handleInputChange}
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500'
                placeholder='Enter amount to withdraw'
                min='0'
              />

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawDisabled}
                className={`mt-4 w-full font-semibold py-3 rounded-lg transition duration-300 ${
                  isWithdrawDisabled
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-[#0091f2] text-white hover:bg-gray-800"
                }`}
              >
                {isConnected
                  ? isTransactionLoading
                    ? "Processing..."
                    : "Withdraw"
                  : "Connect Wallet"}
              </button>

              {errorMsg && (
                <p className='text-red-500 mt-2 text-center'>{errorMsg}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
