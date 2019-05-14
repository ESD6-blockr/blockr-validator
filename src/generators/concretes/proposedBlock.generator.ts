import { Block, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";
import { ObjectHasher } from "../../utils";
import { BlockGenerator } from "../abstractions/block.generator";

@injectable()
export class ProposedBlockGenerator extends BlockGenerator {
    private objectHasher: ObjectHasher;
    private constantStore: ConstantStore;

    constructor(@inject(ObjectHasher) objectHasher: ObjectHasher,
                @inject(ConstantStore) constantStore: ConstantStore) {
        super();

        this.objectHasher = objectHasher;
        this.constantStore = constantStore;
    }

    public async generateProposedBlockAsync(parentBlock: Block,
                                            pendingTransactions: Set<Transaction>,
                                            validatorVersion: string, validatorPublicKey: string): Promise<Block> {

        return new Promise(async (resolve) => {
            // Whenever the parentBlock is the genesis block, its parentHash is an empty string 
            // and should thus remain an empty string
            const parentHash: string = parentBlock.blockHeader.parentHash
                                            || await this.objectHasher.hashAsync<Block>(parentBlock);
            const blockNumber: number = parentBlock.blockHeader.blockNumber + 1;
            const block = await this.generateBlockAsync(pendingTransactions, validatorVersion, blockNumber,
                new Date(), this.constantStore.BLOCK_REWARD_AMOUNT, parentHash, validatorPublicKey);
            
            resolve(block);
        });
    }
}
