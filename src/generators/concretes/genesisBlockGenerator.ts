import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { injectable } from "inversify";
import { GenesisGeneratorException } from "../../exceptions/genesisGenerationException";
import { ObjectSigner } from "../../utils/objectSigner";

/* The maximum amount of coins withint the blockchain */
const GENESIS_COIN_AMOUNT: number = 900000000;
/* The public key of the current node */
const PUBLIC_KEY: string = process.env.PUBLIC_KEY ? process.env.PUBLIC_KEY : "";

@injectable()
export class GenesisBlockGenerator {
    public async buildGenesisBlock(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            const transactions = await this.createTransactions();
            await this.signTransactionsAsync(transactions);
            // TODO: I AM HERE
        });
    }

    public async createTransactions(): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            if (PUBLIC_KEY === "") {
                reject(new GenesisGeneratorException("Genesis block" +
                    " could not be initiated due to a missing public key."));
            }

            const currentTime = +new Date();

            resolve([
                new Transaction(
                    PUBLIC_KEY,
                    GENESIS_COIN_AMOUNT,
                    currentTime,
                    TransactionType.COIN,
                    "",
                ),
                new Transaction(
                    PUBLIC_KEY,
                    GENESIS_COIN_AMOUNT,
                    currentTime,
                    TransactionType.STAKE,
                    "",
                ),
            ]);
        });
    }

    private async signTransactionsAsync(transactions: Transaction[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const objectSigner = new ObjectSigner();
                const promises: Array<Promise<string>> = [];

                for (const transaction of transactions) {
                    promises.push(objectSigner.signAsync(transaction));
                }

                const signatures = await Promise.all(promises);

                for (let i = 0; i < transactions.length; i++) {
                    transactions[i].signature = signatures[i];
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
