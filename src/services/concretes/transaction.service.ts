import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { QueueStore } from "../../stores/queue.store";

@injectable()
export class TransactionService {
    private readonly queueStore: QueueStore;

    constructor(@inject(QueueStore) queueStore: QueueStore) {
        this.queueStore = queueStore;
    }

    public async updatePendingTransactions(victoriousBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            for (const transaction of victoriousBlock.transactions) {
                // There is no need to check whether the transaction is present in the queue as the delete method
                // will already perform this check and will simply return false if the element could not be found.
                this.queueStore.pendingTransactionQueue.delete(transaction);
            }
            
            this.queueStore.pendingProposedBlockQueue.clear();

            resolve();
        });
    }
}
