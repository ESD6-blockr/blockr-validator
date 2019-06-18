import { logger } from "@blockr/blockr-logger";
import { Block, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ITransactionServiceAdapter, TransactionAdapter } from "../../adapters";
import { QueueStore } from "../../stores/queue.store";

@injectable()
export class TransactionService implements ITransactionServiceAdapter {
    private readonly queueStore: QueueStore;
    private readonly transactionAdapter: TransactionAdapter;

    constructor(@inject(QueueStore) queueStore: QueueStore,
                @inject(TransactionAdapter) transactionAdapter: TransactionAdapter) {
        this.queueStore = queueStore;
        this.transactionAdapter = transactionAdapter;

        TransactionAdapter.serviceAdapter = this;
    }

    public addPendingTransactionAsync(transaction: Transaction): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[TransactionService] Adding new transaction to PendingTransactionQueue.");

            this.queueStore.pendingTransactionQueue.add(transaction);

            resolve();
        });
    }

    public async updatePendingTransactions(victoriousBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[TransactionService] Updating pending transactions in PendingTransactionQueue.");

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
