import { Block, Transaction } from "@blockr/blockr-models";
import { BlockGenerator } from "app/generators";
import { ObjectHasher, ObjectSigner } from "app/utils";
import { inject, injectable } from "inversify";

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

    public async generateProposedBlockAsync(lastBlockHash: string,
                                            pendingTransactions: Transaction[], blockNumber: number,
                                            validatorVersion: string): Promise<Block> {

        return new Promise(async (resolve) => {
            const block = await this.generateBlockAsync(pendingTransactions, validatorVersion, blockNumber,
                new Date(), REWARD_AMOUNT, lastBlockHash);
            block.blockHeader.blockHash = this.objectHasher.hash<Block>(block);

            resolve(block);
        });
    }
}
