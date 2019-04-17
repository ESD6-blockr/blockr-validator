import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject } from "inversify";
import { NodeStartupException } from "../../exceptions/nodeStartupException";
import { GenesisBlockGenerator } from "../../generators/concretes/genesisBlockGenerator";
import logger from "../../utils/logger";
import { ValidatorBus } from "../../validators";

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

    public async start() {
        logger.info(`${this.constructor.name} is starting.`);

        // TODO init P2P client?

        await this.initiateBlockchainIfInexistent();
    }

    private async initiateBlockchainIfInexistent() {
        try {
            logger.info("Checking the state of the blockchain.");

            const blockchain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockchain.length === 0) {
                await this.initiateBlockchainAsync();
                return;
            }

            logger.info("Blockchain received.");
        } catch (error) {
            throw new NodeStartupException(error.message);
        }
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
