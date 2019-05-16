import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject } from "inversify";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs/concretes/block.job";
import { ValidatorBus } from "../../validators";
import { AdminKeyService } from "./adminKey.service";

export class NodeService {
    private readonly validatorBus: ValidatorBus;
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly genesisBlockGenerator: GenesisBlockGenerator;
    private readonly blockJob: BlockJob;
    private readonly adminKeyService: AdminKeyService;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(BlockJob) blockJob: BlockJob,
                @inject(AdminKeyService) adminKeyService: AdminKeyService) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.blockJob = blockJob;
        this.adminKeyService = adminKeyService;
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
                    this.adminKeyService.initiateOrRequestAdminKeyIfInexistentAsync(true);
                    await this.initiateBlockchainAsync();
                    return;
                }

                // TODO: Blockchain should be requested from random peer
                this.adminKeyService.initiateOrRequestAdminKeyIfInexistentAsync(false);
    
                logger.info("Blockchain received.");
                resolve();
            } catch (error) {
                reject(new NodeStartupException(error.message));
            }
        });
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
