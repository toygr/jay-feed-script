import { IdlAccounts, Program, BorshInstructionCoder } from "@coral-xyz/anchor";
import { IDL, PrivateVesting } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";;
export const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=5272d7ee-b226-41e1-9c7b-1a28d7271db0", "confirmed");

// const provider = getProvider()
export const program = new Program<PrivateVesting>(IDL, {
  connection
});

export const idlCoder = new BorshInstructionCoder(IDL);