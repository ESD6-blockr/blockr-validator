import { SchedulableJob } from "app/jobs/abstractions/schedulable.job";
import { KeyPairGenerator } from "app/utils";
import { FileUtils } from "app/utils/file.util";
import { inject, injectable } from "inversify";
import { join } from "path";

const KEYS_FILE_PATH = `${join(__dirname, "../../../")}.keys`;

@injectable()
export class BlockJob extends SchedulableJob {
    private fileUtils: FileUtils;
    private keyPairGenerator: KeyPairGenerator;
    private keyPair?: { publicKey: string; privateKey: string; };

    constructor(@inject(FileUtils) fileUtils: FileUtils,
                @inject(KeyPairGenerator) keyPairGenerator: KeyPairGenerator) {
        super(() => {
            // Database.getBlockchainAsync().then((resultBlock) => {
            //     const lastBlock = resultBlock[resultBlock.length - 1];
            //     let lasthash = lastBlock.blockHeader.blockHash;
            //     if (!lasthash) lasthash = '';
            //     this.blockTask.createAndSend(resultKeyPair.pubKey, lasthash, TemporaryStorage.getPendingTransactionsAsArray(), lastBlock.blockHeader.blockNumber + 1);
            //     Database.getGlobalStateAsync().then((globalState) => {
            //       this.lotteryTask.scheduleTask(lasthash, globalState);
            //     });
            //   });
        });

        this.fileUtils = fileUtils;
        this.keyPairGenerator = keyPairGenerator;

        this.setOnInit(async () => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();
        });
    }

    private async getOrGenerateKeyPairAsync(): Promise<{ publicKey: string; privateKey: string; }> {
        return new Promise(async (resolve) => {
            if (await this.fileUtils.fileExists(KEYS_FILE_PATH)) {
                resolve(await this.fileUtils.readFile(KEYS_FILE_PATH));
            }

            const keyPair = await this.keyPairGenerator.generateKeyPairAsync();
            await this.fileUtils.appendStringFile(KEYS_FILE_PATH, JSON.stringify(keyPair));

            resolve(keyPair);
        });
    }
}
