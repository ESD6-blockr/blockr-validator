import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject } from "inversify";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs/concretes/block.job";
import { ValidatorBus } from "../../validators";

export class NodeService {
    private validatorBus: ValidatorBus;
    private dataAccessLayer: DataAccessLayer;
    private genesisBlockGenerator: GenesisBlockGenerator;
    private blockJob: BlockJob;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(BlockJob) blockJob: BlockJob) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.blockJob = blockJob;
    }

    public async start(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info(`${this.constructor.name} is starting.`);

            // TODO: init P2P client?
            // TODO: BlockJob P2P implementations
            // TODO: validator#start#initiateHandleRequests --> peer message bindings inits
            // TODO: Where do we use the validatorBus?
    
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
                    await this.initiateBlockchainAsync();
                    return;
                }
    
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
