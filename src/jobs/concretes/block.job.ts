import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { MessageType } from "../../__mocks__/messageType.model";
import { IPeerMock } from "../../__mocks__/peer";
import { PeerMockConcrete } from "../../__mocks__/peermockconcrete";
import { BlockJobException } from "../../exceptions/blockJob.exception";
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
    private peer: PeerMockConcrete;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ProposedBlockGenerator) proposedBlockGenerator: ProposedBlockGenerator,
                @inject(LotteryService) lotteryService: LotteryService,
                @inject(TransactionService) transactionService: TransactionService,
                @inject(ConstantStore) constantStore: ConstantStore,
                @inject(QueueStore) queueStore: QueueStore,
                @inject(PeerMockConcrete) peer: IPeerMock) {
        super();

        this.fileUtils = fileUtils;
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.lotteryService = lotteryService;
        this.transactionService = transactionService;
        this.constantStore = constantStore;
        this.queueStore = queueStore;
        this.peer = peer;
    }

    protected async onInitAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();

            resolve();
        });
    }

    protected async onCycleAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            logger.info("[BlockJob] Starting cycle.");

            try {
                const proposedBlock: Block = await this.generateProposedBlockAsync();
                // TODO: Shouldn't the peer methods be async?
                this.peer.broadcastMessage(MessageType.NEW_PROPOSED_BLOCK, JSON.stringify(proposedBlock));

                const states: State[] = await this.dataAccessLayer.getStatesAsync();
                const victoriousBlock: Block = await this.lotteryService
                                                            .drawWinningBlock(proposedBlock.blockHeader.parentHash,
                                                                              states);
                await this.transactionService.updatePendingTransactions(victoriousBlock);
                // TODO: Shouldn't the peer methods be async?
                this.peer.broadcastMessage(MessageType.NEW_VICTORIOUS_BLOCK, JSON.stringify(victoriousBlock));

                resolve();
            } catch (error) {
                logger.error(error);
            
                reject(error);
                return;
            }
        });
    }

    private async generateProposedBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            const blockChain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockChain.length === 0) {
                reject(new BlockJobException("[BlockJob] Skipped current cycle because of empty blockchain."));
                return;
            }

            if (!this.keyPair) {
                reject(new BlockJobException("[BlockJob] Skipped current cycle because the keypair is undefined."));
                return;
            }
            
            const lastBlock: Block = blockChain[blockChain.length - 1];
            const proposedBlock: Block = await this.proposedBlockGenerator
                                                        .generateProposedBlockAsync(
                                                            lastBlock,
                                                            this.queueStore.pendingTransactionQueue,
                                                            this.constantStore.VALIDATOR_VERSION,
                                                            this.keyPair.publicKey);
            
            resolve(proposedBlock);
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
