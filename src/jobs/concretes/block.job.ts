import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockJobException } from "../../exceptions/blockJob.exception";
import { ProposedBlockGenerator } from "../../generators";
import { SchedulableJob } from "../../jobs/abstractions/schedulable.job";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { ConstantStore, QueueStore } from "../../stores";

@injectable()
export class BlockJob extends SchedulableJob {
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly proposedBlockGenerator: ProposedBlockGenerator;
    private readonly lotteryService: LotteryService;
    private readonly transactionService: TransactionService;
    private readonly constantStore: ConstantStore;
    private readonly queueStore: QueueStore;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ProposedBlockGenerator) proposedBlockGenerator: ProposedBlockGenerator,
                @inject(LotteryService) lotteryService: LotteryService,
                @inject(TransactionService) transactionService: TransactionService,
                @inject(ConstantStore) constantStore: ConstantStore,
                @inject(QueueStore) queueStore: QueueStore) {
        super();
        
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.lotteryService = lotteryService;
        this.transactionService = transactionService;
        this.constantStore = constantStore;
        this.queueStore = queueStore;
    }

    protected async onCycleAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            logger.info("[BlockJob] Starting cycle.");

            try {
                const proposedBlock: Block = await this.generateProposedBlockAsync();
                // TODO: Shouldn't the peer methods be async?
               // this.peer.broadcastMessage(MessageType.NEW_PROPOSED_BLOCK, JSON.stringify(proposedBlock));

                const states: State[] = await this.dataAccessLayer.getStatesAsync();
                const victoriousBlock: Block | undefined = await this.lotteryService
                                                            .drawWinningBlock(proposedBlock.blockHeader.parentHash,
                                                                              states);

                if (!victoriousBlock) {
                    logger.warn("[BlockJob] Skipped current cycle because no victorious block could be chosen.");

                    resolve();
                    return;
                }
                
                await this.transactionService.updatePendingTransactions(victoriousBlock);
                // TODO: Shouldn't the peer methods be async?
                // this.peer.broadcastMessage(MessageType.NEW_VICTORIOUS_BLOCK, JSON.stringify(victoriousBlock));

                resolve();
            } catch (error) {
                reject(error);
                return;
            }
        });
    }

    private async generateProposedBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            const blockChain: Block[] = await this.dataAccessLayer.getBlocksByQueryAsync({});

            if (blockChain.length === 0) {
                reject(new BlockJobException("[BlockJob] Skipped current cycle because of empty blockchain."));
                return;
            }

            if (this.constantStore.VALIDATOR_PUBLIC_KEY.length === 0) {
                reject(new BlockJobException("[BlockJob] Skipped current cycle because the " +
                                             "validator's public key is undefined."));
                return;
            }
            
            const lastBlock: Block = blockChain[blockChain.length - 1];
            const proposedBlock: Block = await this.proposedBlockGenerator
                                                        .generateProposedBlockAsync(
                                                            lastBlock,
                                                            this.queueStore.pendingTransactionQueue,
                                                            this.constantStore.VALIDATOR_VERSION,
                                                            this.constantStore.VALIDATOR_PUBLIC_KEY);
            
            resolve(proposedBlock);
        });
    }
}
