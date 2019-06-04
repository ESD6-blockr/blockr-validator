import { Block, Transaction } from "@blockr/blockr-models";
import { injectable } from "inversify";

/* The store for pending transaction and proposed block queues.
   This class should be used as a Singleton. */
@injectable()
export class QueueStore {
    public pendingTransactionQueue: Set<Transaction>;
    public pendingProposedBlockQueue: Set<Block>;

    public constructor() {
        this.pendingTransactionQueue = new Set<Transaction>();
        this.pendingProposedBlockQueue = new Set<Block>();
    }
}
