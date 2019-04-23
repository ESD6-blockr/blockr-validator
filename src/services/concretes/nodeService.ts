import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { NodeStartupException } from "app/exceptions";
import { GenesisBlockGenerator } from "app/generators";
import { logger } from "app/utils";
import { ValidatorBus } from "app/validators";
import { inject } from "inversify";

export class NodeService {
    private validatorBus: ValidatorBus;
    private dataAccessLayer: DataAccessLayer;
    private genesisBlockGenerator: GenesisBlockGenerator;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
    }

    public async start(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info(`${this.constructor.name} is starting.`);

            // TODO init P2P client?
    
            await this.initiateBlockchainIfInexistentAsync();
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
                await this.dataAccessLayer.updateStatesAsync(genesisBlock.transactions);

                resolve();
            } catch (error) {
                logger.error(error.message);

                reject(error);
            }
        });
    }
}
