import { Block, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ObjectHasher, ObjectSigner } from "../../utils";
import { BlockGenerator } from "../abstractions/block.generator";

/* Proposed block reward amount */
const REWARD_AMOUNT: number = 1;

@injectable()
export class ProposedBlockGenerator extends BlockGenerator {
    private objectHasher: ObjectHasher;

    constructor(@inject(ObjectSigner) objectSigner: ObjectSigner,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
        super(objectSigner);

        this.objectHasher = objectHasher;
    }

    public async generateProposedBlockAsync(parentBlock: Block,
                                            pendingTransactions: Transaction[],
                                            validatorVersion: string): Promise<Block> {

        return new Promise(async (resolve) => {
            // Whenever the parentBlock is the genesis block, its parentHash is an empty string 
            // and should thus remain an empty string
            const parentHash: string = parentBlock.blockHeader.parentHash
                                       || await this.objectHasher.hashAsync<Block>(parentBlock);
            const blockNumber: number = parentBlock.blockHeader.blockNumber + 1;
            const block = await this.generateBlockAsync(pendingTransactions, validatorVersion, blockNumber,
                new Date(), REWARD_AMOUNT, parentHash);
            
            resolve(block);
        });
    }
}
