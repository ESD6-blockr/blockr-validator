import { CryptoKeyUtil } from "@blockr/blockr-crypto";
import { logger } from "@blockr/blockr-logger";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";
import { FileUtils } from "../../utils/file.util";

@injectable()
export class AdminKeyService {
    private readonly cryptoKeyUtil: CryptoKeyUtil;
    private readonly fileUtils: FileUtils;
    private readonly constantStore: ConstantStore;

    constructor(@inject(CryptoKeyUtil) cryptoKeyUtil: CryptoKeyUtil,
                @inject(FileUtils) fileUtils: FileUtils,
                @inject(ConstantStore) constantStore: ConstantStore) {

        this.cryptoKeyUtil = cryptoKeyUtil;
        this.fileUtils = fileUtils;
        this.constantStore = constantStore;
    }

    public async initiateOrRequestAdminKeyIfInexistentAsync(shouldGenerateKey: boolean): Promise<void> {
        return new Promise(async (resolve) => {
            if (shouldGenerateKey) {
                this.generateAndSaveAdminKeyAsync();
                return;
            }
    
            if (await this.fileUtils.fileExistsAsync(this.constantStore.KEYS_FILE_PATH)) {
                logger.info("[AdminKeyService] Grabbing Admin Key Pair From Keys File.");
                this.constantStore.ADMIN_PUBLIC_KEY = await this.fileUtils
                                                                    .readFileAsync(this.constantStore.KEYS_FILE_PATH);
                return;
            }
            
            logger.info("[AdminKeyService] Grabbing Admin Key Pair From Keys File.");
            // send broadcast request for admin pubkey
            // TODO: the value should be received from the broadcast reply
            this.constantStore.ADMIN_PUBLIC_KEY = "";
            await this.saveAdminKeyInFile();
            
            resolve();
        });
    }

    private async generateAndSaveAdminKeyAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[AdminKeyService] Generating Admin Key Pair.");

            this.constantStore.ADMIN_PUBLIC_KEY = this.cryptoKeyUtil.generateKeyPair().getPublic(true, "hex") as string;
            await this.saveAdminKeyInFile();

            resolve();
        });
    }

    private saveAdminKeyInFile(): Promise<void> {
        return this.fileUtils.appendStringInFileAsync(this.constantStore.KEYS_FILE_PATH,
                                               JSON.stringify(this.constantStore.ADMIN_PUBLIC_KEY));
    }
}
