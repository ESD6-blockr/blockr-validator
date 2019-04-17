import { Block, BlockHeader, Transaction, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { GenesisGeneratorException } from "../../exceptions/genesisGenerationException";
import { ObjectSigner } from "../../utils/objectSigner";

/* The maximum amount of coins withint the blockchain */
const GENESIS_COIN_AMOUNT: number = 900000000;
/* The maximum amount of coins withint the blockchain */
const GENESIS_STAKE_AMOUNT: number = 1;
/* The public key of the current node */
const PUBLIC_KEY: string = process.env.PUBLIC_KEY ? process.env.PUBLIC_KEY : "";
/* Genesis block reward */
const BLOCK_REWARD: number = 10;

@injectable()
export class GenesisBlockGenerator {
    private objectSigner: ObjectSigner;

    constructor(@inject(ObjectSigner) objectSigner: ObjectSigner) {
        this.objectSigner = objectSigner;
    }

    public async buildGenesisBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockheader = await this.createBlockHeaderAsync();

                const transactions = await this.createTransactionsAsync();
                await this.signTransactionsAsync(transactions);

                resolve(new Block(blockheader, transactions));
            } catch (error) {
                reject(new GenesisGeneratorException(error.message));
            }
        });
    }

    public async createTransactionsAsync(): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            if (PUBLIC_KEY === "") {
                reject(new GenesisGeneratorException("Genesis block" +
                    " could not be initiated due to a missing public key."));
            }

            const currentTime = +new Date();

            resolve([
                new Transaction(PUBLIC_KEY, GENESIS_COIN_AMOUNT,
                    currentTime, TransactionType.COIN, ""),
                new Transaction(PUBLIC_KEY, GENESIS_STAKE_AMOUNT,
                    currentTime, TransactionType.STAKE, ""),
            ]);
        });
    }

    private async signTransactionsAsync(transactions: Transaction[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const promises: Array<Promise<string>> = [];

                for (const transaction of transactions) {
                    promises.push(this.objectSigner.signAsync(transaction));
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

    private async createBlockHeaderAsync(): Promise<BlockHeader> {
        return new Promise((resolve, reject) => {
            if (PUBLIC_KEY === "") {
                reject(new GenesisGeneratorException("Genises block" +
                " could not be initiated due to a missing private key."));
            }

            // TODO: refactor the BlockHeader constructor
            resolve(new BlockHeader("", 0, PUBLIC_KEY,
                +new Date(), BLOCK_REWARD, "", ""),
            );
        });
    }
}
