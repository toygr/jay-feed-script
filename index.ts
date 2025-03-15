
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
        fs.writeFileSync("Succeeded.txt", `${buyInfo.tx},${signature}\n`, { flag: 'a' });

    } catch (error: any) {
        console.log("ERROR >>>", error, "<<<")
        if ((error.message as string).includes("Blockhash not found")) {
            await giveToken(buyInfo)
        } else {
            fs.writeFileSync("Failed.txt", buyInfo.tx + (error.message as string) + '\n', { flag: 'a' });
        }
    }
}
async function main() {
    fs.readFile('soldInfo.csv', 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const infos = data.split('\r\n')
        for (const info of infos) {
            const rawData = info.split(',')
            const buyInfo: BuyInfoType = {
                address: rawData[2],
                amount: parseInt(rawData[3]),
                tx: rawData[5],
                code: parseInt(rawData[6])
            }
            try {
                await giveToken(buyInfo)
            } catch (error) {
                console.error("Failed tx:", buyInfo.tx)
                fs.writeFileSync("Failed.txt", buyInfo.tx + '\n', { flag: 'a' });
            }
            await new Promise((res) => setTimeout(res, 1000))
        }
    }
    )
}
main();