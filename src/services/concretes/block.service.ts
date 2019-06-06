import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockAdapter } from "../../adapters";
import { IBlockServiceAdapter } from "../../adapters/interfaces/blockService.adapter";
import { QueueStore } from "../../stores";

@injectable()
export class BlockService implements IBlockServiceAdapter {
    private readonly queueStore: QueueStore;
    private readonly blockAdapter: BlockAdapter;

    constructor(@inject(QueueStore) queueStore: QueueStore,
                @inject(BlockAdapter) blockAdapter: BlockAdapter) {
        this.queueStore = queueStore;
        this.blockAdapter = blockAdapter;

        this.blockAdapter.setServiceAdapter(this);
    }

    public async addProposedBlockAsync(proposedBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[BlockService] Adding new proposed block to PendingProposedBlockQueue.");
            this.queueStore.pendingProposedBlockQueue.add(proposedBlock);

            resolve();
        });
    }
    
    public async addVictoriousBlockAsync(victoriousBlock: Block): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
