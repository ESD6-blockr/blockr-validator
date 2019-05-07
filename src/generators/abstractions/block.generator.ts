import { Block, BlockHeader, Transaction } from "@blockr/blockr-models";
import { BlockGeneratorException } from "app/exceptions";
import { ObjectSigner } from "app/utils";

export abstract class BlockGenerator {
    private objectSigner: ObjectSigner;

    constructor(objectSigner: ObjectSigner) {
        this.objectSigner = objectSigner;
    }

    protected async generateBlockAsync(transactions: Transaction[], version: string, blockNumber: number,
                                       date: Date, blockReward: number,
                                       parentHash: string): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockheader = await this.generateBlockHeaderAsync(version, blockNumber,
                                                                        date, blockReward);
                blockheader.parentHash = parentHash;
                
                await this.signTransactionsAsync(transactions);

                resolve(new Block(blockheader, transactions));
            } catch (error) {
                reject(new BlockGeneratorException(error.message));
            }
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

    private async generateBlockHeaderAsync(version: string, blockNumber: number, date: Date,
                                           blockReward: number): Promise<BlockHeader> {
        return new Promise((resolve) => {
            resolve(new BlockHeader(
                version, blockNumber, date, blockReward),
            );
        });
    }
}
