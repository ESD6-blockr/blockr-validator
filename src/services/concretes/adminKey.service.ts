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

    public async initiateOrRequestAdminKeyIfInexistentAsync(shouldGenerateKeyIfFileInexistent: boolean): Promise<void> {
        return new Promise(async (resolve) => {
            if (await this.fileUtils.fileExistsAsync(this.constantStore.KEYS_FILE_PATH)) {
                logger.info("[AdminKeyService] Grabbing admin key pair from keys file.");

                this.constantStore.ADMIN_PUBLIC_KEY = await this.fileUtils
                    .readFileAsync(this.constantStore.KEYS_FILE_PATH);

                resolve();
                return;
            }
            
            if (shouldGenerateKeyIfFileInexistent) {
                this.generateAndSaveAdminKeyAsync();
                
                resolve();
                return;
            }

            // send broadcast request for admin pubkey
            // TODO: p2p lib ask for admin public key to verify signature
            this.constantStore.ADMIN_PUBLIC_KEY = ""; // save public key;
            await this.saveAdminKeyInFile();
            
            resolve();
        });
    }

    private async generateAndSaveAdminKeyAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[AdminKeyService] Generating admin key pair.");

            const keyPair = this.cryptoKeyUtil.generateKeyPair();
            this.constantStore.ADMIN_PUBLIC_KEY = keyPair.getPublic(true, "hex") as string;
            this.constantStore.ADMIN_PRIVATE_KEY = keyPair.getPrivate("hex") as string;

            await this.saveAdminKeyInFile();

            resolve();
        });
    }

    private saveAdminKeyInFile(): Promise<void> {
        return this.fileUtils.appendStringInFileAsync(this.constantStore.KEYS_FILE_PATH,
            JSON.stringify({
                privateKey: this.constantStore.ADMIN_PRIVATE_KEY,
                publicKey: this.constantStore.ADMIN_PUBLIC_KEY,
            }));
    }
}
