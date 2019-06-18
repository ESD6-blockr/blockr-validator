import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ProposedBlockAdapter } from "../../adapters";
import { IProposedBlockServiceAdapter } from "../../adapters/interfaces/proposedBlockService.adapter";
import { QueueStore } from "../../stores";

/**
 * Injectable
 */
@injectable()
export class ProposedBlockService implements IProposedBlockServiceAdapter {
    private readonly queueStore: QueueStore;
    private readonly proposedBlockAdapter: ProposedBlockAdapter;

    /**
     * Creates an instance of proposed block service.
     * @param queueStore 
     * @param proposedBlockAdapter 
     */
    constructor(@inject(QueueStore) queueStore: QueueStore,
                @inject(ProposedBlockAdapter) proposedBlockAdapter: ProposedBlockAdapter) {
        this.queueStore = queueStore;
        this.proposedBlockAdapter = proposedBlockAdapter;

        this.proposedBlockAdapter.setServiceAdapter(this);
    }

    /**
     * Adds proposed block async
     * @param proposedBlock 
     * @returns proposed block async 
     */
    public async addProposedBlockAsync(proposedBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[ProposedBlockService] Adding new proposed block to PendingProposedBlockQueue.");
            this.queueStore.pendingProposedBlockQueue.add(proposedBlock);

            resolve();
        });
    }
}
