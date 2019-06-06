import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ProposedBlockAdapter } from "../../adapters";
import { IProposedBlockServiceAdapter } from "../../adapters/interfaces/proposedBlockService.adapter";
import { QueueStore } from "../../stores";

@injectable()
export class ProposedBlockService implements IProposedBlockServiceAdapter {
    private readonly queueStore: QueueStore;
    private readonly proposedBlockAdapter: ProposedBlockAdapter;

    constructor(@inject(QueueStore) queueStore: QueueStore,
                @inject(ProposedBlockAdapter) proposedBlockAdapter: ProposedBlockAdapter) {
        this.queueStore = queueStore;
        this.proposedBlockAdapter = proposedBlockAdapter;

        this.proposedBlockAdapter.setServiceAdapter(this);
    }

    public async addProposedBlockAsync(proposedBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[BlockService] Adding new proposed block to PendingProposedBlockQueue.");
            this.queueStore.pendingProposedBlockQueue.add(proposedBlock);

            resolve();
        });
    }
}
