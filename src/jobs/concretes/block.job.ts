import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { join } from "path";
import { ProposedBlockGenerator } from "../../generators";
import { SchedulableJob } from "../../jobs/abstractions/schedulable.job";
import { QueueStore } from "../../stores/queue.stores";
import { KeyPairGenerator } from "../../utils";
import { FileUtils } from "../../utils/file.util";

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
    private queueStore: QueueStore;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(KeyPairGenerator) keyPairGenerator: KeyPairGenerator,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ProposedBlockGenerator) proposedBlockGenerator: ProposedBlockGenerator) {
        super(async () => {
            const blockChain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockChain.length === 0) {
                return;
            }
            
            const lastBlock: Block = blockChain[blockChain.length - 1];
            // TODO: Where should the keyPair be used?
            const proposedBlock: Block = await this.proposedBlockGenerator
                                            .generateProposedBlockAsync(
                                                lastBlock,
                                                this.queueStore.pendingTransactionQueue,
                                                VALIDATOR_VERSION,
                                            );
            
            // TODO: Broadcast proposedBlock in P2P network
            // TODO: Database.getGlobalStateAsync() --> lotteryTask.scheduleTask(lastBlockHash, globalState)
        });

        this.fileUtils = fileUtils;
        this.keyPairGenerator = keyPairGenerator;
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.queueStore = QueueStore.getInstance();

        this.setOnInit(async () => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();
        });
    }

    private async getOrGenerateKeyPairAsync(): Promise<{ publicKey: string; privateKey: string; }> {
        return new Promise(async (resolve) => {
            if (await this.fileUtils.fileExistsAsync(KEYS_FILE_PATH)) {
                resolve(await this.fileUtils.readFileAsync(KEYS_FILE_PATH));
            }

            const keyPair = await this.keyPairGenerator.generateKeyPairAsync();
            await this.fileUtils.appendStringInFileAsync(KEYS_FILE_PATH, JSON.stringify(keyPair));

            resolve(keyPair);
        });
    }
}
