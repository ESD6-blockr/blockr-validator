import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ProposedBlockGenerator } from "../../generators";
import { SchedulableJob } from "../../jobs/abstractions/schedulable.job";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { ConstantStore } from "../../stores";
import { QueueStore } from "../../stores/queue.stores";
import { FileUtils } from "../../utils/file.util";

@injectable()
export class BlockJob extends SchedulableJob {
    private fileUtils: FileUtils;
    private dataAccessLayer: DataAccessLayer;
    private proposedBlockGenerator: ProposedBlockGenerator;
    private lotteryService: LotteryService;
    private transactionService: TransactionService;
    private constantStore: ConstantStore;
    private queueStore: QueueStore;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ProposedBlockGenerator) proposedBlockGenerator: ProposedBlockGenerator,
                @inject(LotteryService) lotterService: LotteryService,
                @inject(TransactionService) transactionService: TransactionService) {
        super(async () => {
            logger.info("[BlockJob] Starting cycle.");

            const blockChain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockChain.length === 0) {
                logger.info("[BlockJob] Skipped current cycle because of empty blockchain.");
                return;
            }

            if (!this.keyPair) {
                logger.error("[BlockJob] Skipped current cycle because the keypair is undefined.");
                return;
            }
            
            const lastBlock: Block = blockChain[blockChain.length - 1];
            const proposedBlock: Block = await this.proposedBlockGenerator
                                                        .generateProposedBlockAsync(
                                                            lastBlock,
                                                            this.queueStore.pendingTransactionQueue,
                                                            this.constantStore.VALIDATOR_VERSION,
                                                            this.keyPair.publicKey,
                                                        );
            
            // TODO: Broadcast proposedBlock in P2P network

            const states: State[] = await this.dataAccessLayer.getStatesAsync();
            let victoriousBlock: Block;
            try {
                victoriousBlock = await this.lotteryService.drawWinningBlock(proposedBlock.blockHeader.parentHash,
                                                                             states);
            } catch (error) {
                logger.warning("[BlockJob] Canceled current cycle because no victorious block has been drawn.");
                return;
            }

            await this.transactionService.updatePendingTransactions(victoriousBlock);
            

            // TODO: Broadcast victoriousBlock in P2P network
        });

        this.fileUtils = fileUtils;
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.lotteryService = lotterService;
        this.transactionService = transactionService;
        this.constantStore = ConstantStore.getInstance();
        this.queueStore = QueueStore.getInstance();

        this.setOnInit(async () => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();
        });
    }

    private async getOrGenerateKeyPairAsync(): Promise<{ publicKey: string; privateKey: string; }> {
        return new Promise(async (resolve) => {
            logger.info("[BlockJob] Grabbing and/or generating keypair.");

            if (await this.fileUtils.fileExistsAsync(this.constantStore.KEYS_FILE_PATH)) {
                resolve(await this.fileUtils.readFileAsync(this.constantStore.KEYS_FILE_PATH));
            }

            // TODO: Get keypair -> save key? 
            const keyPair = {publicKey: "", privateKey: ""};

            await this.fileUtils.appendStringInFileAsync(this.constantStore.KEYS_FILE_PATH, JSON.stringify(keyPair));

            resolve(keyPair);
        });
    }
}
