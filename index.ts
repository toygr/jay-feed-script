
import fs from 'fs'
import * as anchor from "@coral-xyz/anchor";
import { connection, program } from './anchor/setup';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { BuyInfoType } from './types';
import { adminKey } from './key';

const giveToken = async (buyInfo: BuyInfoType) => {
    const tx = await program.methods.giveToken(new anchor.BN(buyInfo.amount * 2.5), buyInfo.code).accounts({
        user: new PublicKey(buyInfo.address),
        admin: adminKey.publicKey,
    }).signers([adminKey]).transaction()
    try {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({ commitment: "confirmed" });
        const message = new TransactionMessage({
            payerKey: adminKey.publicKey,
            instructions: tx.instructions,
            recentBlockhash: blockhash
        }).compileToV0Message();

        const versionedTx = new VersionedTransaction(message)
        versionedTx.sign([adminKey])
        const signature = await connection.sendTransaction(versionedTx);
        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
        }, "confirmed");
        console.log(`${buyInfo.tx}: https://solscan.io/tx/${signature}`);
        await fs.promises.appendFile("Succeeded.txt", `${buyInfo.tx},${signature}\n`);

    } catch (error: any) {
        console.log("ERROR >>>", error, "<<<")
        if ((error.message as string).includes("Blockhash not found")) {
            await giveToken(buyInfo)
        } else {
            await fs.promises.appendFile("Failed.txt", buyInfo.tx + (error.message as string) + '\n');
        }
    }
}
async function main() {
    try {
        const data = await fs.promises.readFile('soldInfo.csv', 'utf8');
        const infos = data.split(/\r?\n/).filter(line => line.trim());

        for (const info of infos) {
            const rawData = info.split(',')
            const buyInfo: BuyInfoType = {
                address: rawData[2],
                amount: parseInt(rawData[3]),
                tx: rawData[5],
                code: parseInt(rawData[6])
            }
            try {
                await giveToken(buyInfo);
            } catch (error) {
                console.error("Failed tx:", buyInfo.tx);
                await fs.promises.appendFile("Failed.txt", `${buyInfo.tx}\n`);
            }
            await new Promise(res => setTimeout(res, 1000));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}
main();