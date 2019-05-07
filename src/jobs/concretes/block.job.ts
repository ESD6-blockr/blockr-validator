import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { ProposedBlockGenerator } from "app/generators";
import { SchedulableJob } from "app/jobs/abstractions/schedulable.job";
import { KeyPairGenerator, ObjectHasher } from "app/utils";
import { FileUtils } from "app/utils/file.util";
import { inject, injectable } from "inversify";
import { join } from "path";

const KEYS_FILE_PATH = `${join(__dirname, "../../../")}.keys`;

@injectable()
export class BlockJob extends SchedulableJob {
    private fileUtils: FileUtils;
    private keyPairGenerator: KeyPairGenerator;
    private dataAccessLayer: DataAccessLayer;
    private proposedBlockGenerator: ProposedBlockGenerator;
    private objectHasher: ObjectHasher;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(KeyPairGenerator) keyPairGenerator: KeyPairGenerator,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ProposedBlockGenerator) proposedBlockGenerator: ProposedBlockGenerator,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
        super(async () => {
            const blockChain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockChain.length === 0) {
                return;
            }

            const lastBlock: Block = blockChain[blockChain.length - 1];
            // Whenever the previous block is the genesis block, the blockHash is undefined 
            // and should thus be replaced with an empty string
            const lastBlockHash: string = lastBlock.blockHeader.blockHash ? lastBlock.blockHeader.blockHash : "";
            // TODO: lastBlockHash should be the hash of the lastBlock object
            // TODO: const proposedBlock: Block = proposedBlockGenerator.generateProposedBlockAsync()
            // TODO: Broadcast proposedBlock in P2P network
            // TODO: Database.getGlobalStateAsync() --> lotteryTask.scheduleTask(lastBlockHash, globalState)
        });

        this.fileUtils = fileUtils;
        this.keyPairGenerator = keyPairGenerator;
        this.dataAccessLayer = dataAccessLayer;
        this.proposedBlockGenerator = proposedBlockGenerator;
        this.objectHasher = objectHasher;

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
