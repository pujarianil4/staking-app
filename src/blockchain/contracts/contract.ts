import { Abi, Hash } from 'viem'
import ynEthAbi from "./abis/ynEth.json"

export const contract= {
 ynEth: {
  address: '0xfd930060e51C10CCBc36F512676B4FD3E7026a1E' as Hash,
  abi: ynEthAbi as Abi
 }
}