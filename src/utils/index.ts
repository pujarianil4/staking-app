import { Hash } from 'viem'

export const shortenAddr = (addr: Hash= '0x000000000')=> {
return `${addr.substring(0, 6)}...${addr.substring(addr.length-4,addr.length)}`
}