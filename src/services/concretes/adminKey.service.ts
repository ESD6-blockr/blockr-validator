import { CryptoKeyUtil } from "@blockr/blockr-crypto";
import { logger } from "@blockr/blockr-logger";
import { inject, injectable } from "inversify";
import { KeyAdapter } from "../../adapters/concretes/key.adapter";
import { IKeyServiceAdapter } from "../../adapters/interfaces/keyService.adapter";
import { ConstantStore } from "../../stores";
import { FileUtils } from "../../utils";

@injectable()
export class AdminKeyService implements IKeyServiceAdapter {
    private readonly cryptoKeyUtil: CryptoKeyUtil;
    private readonly fileUtils: FileUtils;
    private readonly constantStore: ConstantStore;
    private readonly keyAdapter: KeyAdapter;

    constructor(@inject(CryptoKeyUtil) cryptoKeyUtil: CryptoKeyUtil,
                @inject(FileUtils) fileUtils: FileUtils,
                @inject(ConstantStore) constantStore: ConstantStore,
                @inject(KeyAdapter) keyAdapter: KeyAdapter) {

        this.cryptoKeyUtil = cryptoKeyUtil;
        this.fileUtils = fileUtils;
        this.constantStore = constantStore;
        this.keyAdapter = keyAdapter;

        this.keyAdapter.setServiceAdapter(this);
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

            logger.info("[AdminKeyService] Requesting admin key from a random validator.");
            this.constantStore.ADMIN_PUBLIC_KEY = await this.keyAdapter.requestAdminKeyAsync();
            await this.saveAdminKeyInFile();
            
            resolve();
        });
    }

    public getAdminKey(): string {
        return this.constantStore.ADMIN_PUBLIC_KEY;
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
        // TODO: TSDocs toevoegen
    }

    private saveAdminKeyInFile(): Promise<void> {
        return this.fileUtils.appendStringInFileAsync(this.constantStore.KEYS_FILE_PATH,
            JSON.stringify({
                privateKey: this.constantStore.ADMIN_PRIVATE_KEY,
                publicKey: this.constantStore.ADMIN_PUBLIC_KEY,
            }));
    }
}
