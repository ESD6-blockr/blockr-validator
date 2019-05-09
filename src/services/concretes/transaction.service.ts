import { Block } from "@blockr/blockr-models";
import { injectable } from "inversify";
import { QueueStore } from "../../stores/queue.stores";

@injectable()
export class TransactionService {
    private queueStore: QueueStore;

    constructor() {
        this.queueStore = QueueStore.getInstance();
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
