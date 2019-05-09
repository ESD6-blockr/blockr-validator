import { Block, Transaction } from "@blockr/blockr-models";

/* The store for pending transaction and proposed block queues.
   This class should be used as a Singleton. */
export class QueueStore {
    public static getInstance(): QueueStore {
        if (!this.instance) {
            this.instance = new QueueStore();
        }
        
        return this.instance;
    }
    
    private static instance: QueueStore;
    public pendingTransactionQueue: Set<Transaction>;
    public pendingProposedBlockQueue: Set<Block>;

    private constructor() {
        this.pendingTransactionQueue = new Set();
        this.pendingProposedBlockQueue = new Set();
    }
}
