import { Block, BlockHeader, Transaction } from "@blockr/blockr-models";
import { BlockGeneratorException } from "../../exceptions";
import { ObjectSigner } from "../../utils";

export abstract class BlockGenerator {
    private objectSigner: ObjectSigner;

    constructor(objectSigner: ObjectSigner) {
        this.objectSigner = objectSigner;
    }

    protected async generateBlockAsync(transactions: Set<Transaction>, version: string, blockNumber: number,
                                       date: Date, blockReward: number,
                                       parentHash: string, validator: string): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockheader = await this.generateBlockHeaderAsync(version, blockNumber,
                                                                        date, blockReward, validator);
                blockheader.parentHash = parentHash;
                
                await this.signTransactionsAsync(transactions);

                resolve(new Block(blockheader, transactions));
            } catch (error) {
                reject(new BlockGeneratorException(error.message));
            }
        });
    }

    private async signTransactionsAsync(transactions: Set<Transaction>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const promises: Array<Promise<string>> = [];

                for (const transaction of transactions.values()) {
                    promises.push(new Promise(async (resolvePromise) => {
                        return resolvePromise(transaction.signature
                            = await this.objectSigner.signAsync(transaction));
                    }));
                }
                await Promise.all(promises);

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private async generateBlockHeaderAsync(version: string, blockNumber: number, date: Date,
                                           blockReward: number, validator: string): Promise<BlockHeader> {
        return new Promise((resolve) => {
            const blockHeader = new BlockHeader(version, blockNumber, date, blockReward);
            blockHeader.validator = validator;
            
            resolve(blockHeader);
        });
    }
}
