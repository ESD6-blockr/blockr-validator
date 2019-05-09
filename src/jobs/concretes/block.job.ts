import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { join } from "path";
import { ProposedBlockGenerator } from "../../generators";
import { SchedulableJob } from "../../jobs/abstractions/schedulable.job";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { QueueStore } from "../../stores/queue.stores";
import { KeyPairGenerator } from "../../utils";
import { FileUtils } from "../../utils/file.util";
import { logger } from "../../utils/logger.util";

/* The file path of the .keys file */
const KEYS_FILE_PATH = `${join(__dirname, "../../../")}.keys`;

/* The current version of the validator */
const VALIDATOR_VERSION: string = process.env.VALIDATOR_VERSION || "";

@injectable()
export class BlockJob extends SchedulableJob {
    private fileUtils: FileUtils;
    private keyPairGenerator: KeyPairGenerator;
    private dataAccessLayer: DataAccessLayer;
    private proposedBlockGenerator: ProposedBlockGenerator;
    private lotteryService: LotteryService;
    private transactionService: TransactionService;
    private queueStore: QueueStore;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(KeyPairGenerator) keyPairGenerator: KeyPairGenerator,
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
                                                VALIDATOR_VERSION,
                                                this.keyPair.publicKey,
                                            );
            
            // TODO: Broadcast proposedBlock in P2P network

            const states: State[] = await this.dataAccessLayer.getStatesAsync();
            const victoriousBlock: Block = await this.lotteryService
                                                        .drawWinningBlock(proposedBlock.blockHeader.parentHash, states);

            await this.transactionService.updatePendingTransactions(victoriousBlock);
            

            // TODO: Broadcast victoriousBlock in P2P network
        });

        this.fileUtils = fileUtils;
        this.keyPairGenerator = keyPairGenerator;
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.lotteryService = lotterService;
        this.transactionService = transactionService;
        this.queueStore = QueueStore.getInstance();

        this.setOnInit(async () => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();
        });
    }

    private async getOrGenerateKeyPairAsync(): Promise<{ publicKey: string; privateKey: string; }> {
        return new Promise(async (resolve) => {
            logger.info("[BlockJob] Grabbing and/or generating keypair.");

            if (await this.fileUtils.fileExistsAsync(KEYS_FILE_PATH)) {
                resolve(await this.fileUtils.readFileAsync(KEYS_FILE_PATH));
            }

            const keyPair = await this.keyPairGenerator.generateKeyPairAsync();
            await this.fileUtils.appendStringInFileAsync(KEYS_FILE_PATH, JSON.stringify(keyPair));

            resolve(keyPair);
        });
    }
}
