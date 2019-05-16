import { CryptoKeyUtil, IKeyPair } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject } from "inversify";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs/concretes/block.job";
import { ConstantStore } from "../../stores";
import { FileUtils } from "../../utils/file.util";
import { ValidatorBus } from "../../validators";

export class NodeService {
    private readonly validatorBus: ValidatorBus;
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly genesisBlockGenerator: GenesisBlockGenerator;
    private readonly blockJob: BlockJob;
    private readonly cryptoKeyUtil: CryptoKeyUtil;
    private readonly fileUtils: FileUtils;
    private readonly constantStore: ConstantStore;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(BlockJob) blockJob: BlockJob,
                @inject(CryptoKeyUtil) cryptoKeyUtil: CryptoKeyUtil,
                @inject(FileUtils) fileUtils: FileUtils,
                @inject(ConstantStore) constantStore: ConstantStore) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.blockJob = blockJob;
        this.cryptoKeyUtil = cryptoKeyUtil;
        this.fileUtils = fileUtils;
        this.constantStore = constantStore;
    }

    public async start(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info(`${this.constructor.name} is starting.`);

            // TODO: init P2P client?
            // TODO: BlockJob P2P implementations
            // TODO: validator#start#initiateHandleRequests --> peer message bindings inits
            // TODO: Where do we use the validatorBus?


            // If should create genesis block
                // generate key pair
                // save in file
                // save in constant

                // generate genesis block
            // If should not create genesis block
                // if .keys pair exists
                    // grab key pair from file and put in constant
                // if .keys pair does not exists
                    // send broadcast request for admin pubkey
                    // create .keys file and fill with pair
                    // save in constant

                // Request blockchain from random peer

    
            await this.initiateBlockchainIfInexistentAsync();
            await this.scheduleBlockJobAsync();

            resolve();
        });
    }

    private async scheduleBlockJobAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("Scheduling Block Job.");
        
            await this.blockJob.scheduleAsync(1);
            
            resolve();
        });
    }

    private async initiateBlockchainIfInexistentAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("Checking the state of the blockchain.");
    
                const blockchain: Block[] = await this.dataAccessLayer.getBlockchainAsync();
    
                if (blockchain.length === 0) {
                    // TODO: kijken of hier blockchain gerequest moet worden of genesis block gemaakt moet worden
                    this.initiateOrRequestAdminKeyIfInexistentAsync(true);
                    await this.initiateBlockchainAsync();
                    return;
                }

                // TODO: Blockchain should be requested from random peer
                this.initiateOrRequestAdminKeyIfInexistentAsync(false);
    
                logger.info("Blockchain received.");
                resolve();
            } catch (error) {
                reject(new NodeStartupException(error.message));
            }
        });
    }

    private async initiateOrRequestAdminKeyIfInexistentAsync(shouldGenerateKey: boolean): Promise<void> {
        return new Promise(async (resolve) => {
            if (shouldGenerateKey) {
                this.generateAndSaveAdminKeyAsync();
                return;
            }
    
            if (await this.fileUtils.fileExistsAsync(this.constantStore.KEYS_FILE_PATH)) {
                logger.info("[NodeService] Grabbing Admin Key Pair From Keys File.");
                this.constantStore.ADMIN_PUBLIC_KEY = await this.fileUtils
                                                                    .readFileAsync(this.constantStore.KEYS_FILE_PATH);
                return;
            }
            
            logger.info("[NodeService] Grabbing Admin Key Pair From Keys File.");
            // send broadcast request for admin pubkey
            // TODO: the value should be received from the broadcast reply
            this.constantStore.ADMIN_PUBLIC_KEY = "";
            await this.saveAdminKeyInFile();
            
            resolve();
        });
    }

    private async generateAndSaveAdminKeyAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[NodeService] Generating Admin Key Pair.");

            this.constantStore.ADMIN_PUBLIC_KEY = this.cryptoKeyUtil.generateKeyPair().getPublic(true, "hex") as string;
            await this.saveAdminKeyInFile();

            resolve();
        });
    }

    private saveAdminKeyInFile(): Promise<void> {
        return this.fileUtils.appendStringInFileAsync(this.constantStore.KEYS_FILE_PATH,
                                               JSON.stringify(this.constantStore.ADMIN_PUBLIC_KEY));
    }

    private async initiateBlockchainAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("Initiating blockchain.");

                const genesisBlock = await this.genesisBlockGenerator.generateGenesisBlockAsync();
                
                await this.dataAccessLayer.addBlockAsync(genesisBlock);
                await this.dataAccessLayer.updateStatesAsync(Array.from(genesisBlock.transactions));

                resolve();
            } catch (error) {
                logger.error(error.message);

                reject(error);
            }
        });
    }
}
