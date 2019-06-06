import { Block, BlockHeader, BlockType, Transaction } from "@blockr/blockr-models";
import { BlockGeneratorException } from "../../exceptions";

export abstract class BlockGenerator {
    protected async generateBlockAsync(transactions: Transaction[], version: string, blockNumber: number,
                                       date: Date, blockReward: number,
                                       parentHash: string, validator: string): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockheader = await this.generateBlockHeaderAsync(
                    version, blockNumber,
                    date, blockReward, validator,
                );

                blockheader.parentHash = parentHash;

                resolve(new Block(BlockType.REGULAR, blockheader, transactions));
            } catch (error) {
                reject(new BlockGeneratorException(error.message));
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
