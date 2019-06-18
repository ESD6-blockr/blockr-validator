import { ObjectHasher } from "@blockr/blockr-crypto";
import { Block, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";
import { BlockGenerator } from "../abstractions/block.generator";

@injectable()
export class ProposedBlockGenerator extends BlockGenerator {
    private readonly objectHasher: ObjectHasher;
    private readonly constantStore: ConstantStore;

    constructor(@inject(ObjectHasher) objectHasher: ObjectHasher,
                @inject(ConstantStore) constantStore: ConstantStore) {
        super();

        this.objectHasher = objectHasher;
        this.constantStore = constantStore;
    }

    public async generateProposedBlockAsync(parentBlock: Block,
                                            pendingTransactions: Transaction[],
                                            validatorVersion: string, validatorPublicKey: string): Promise<Block> {

        return new Promise(async (resolve) => {
            // Whenever the parentBlock is the genesis block, its parentHash is an empty string 
            // and should thus remain an empty string
           
            const hashableBlock: object = {
                header: parentBlock.blockHeader,
                transactions: parentBlock.transactions,
            };
 
            const parentHash: string = await this.objectHasher.hashAsync(hashableBlock);
            
            const blockNumber: number = parentBlock.blockHeader.blockNumber + 1;
            const block = await this.generateBlockAsync(Array.from(pendingTransactions), validatorVersion, blockNumber,
                new Date(), this.constantStore.BLOCK_REWARD_AMOUNT, parentHash, validatorPublicKey);
            
            resolve(block);
        });
    }
}
