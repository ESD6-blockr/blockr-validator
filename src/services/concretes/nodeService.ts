import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject } from "inversify";
import { NodeStartupException } from "../../exceptions/nodeStartupException";
import logger from "../../utils/logger";
import { ValidatorBus } from "../../validators";
import { GenesisBlockGenerator } from "../../generators/concretes/genesisBlockGenerator";

export class NodeService {
    private validatorBus: ValidatorBus;
    private dataAccessLayer: DataAccessLayer;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
    }

    public async start() {
        logger.info(`${this.constructor.name} is starting`);

        // TODO init P2P client?

        await this.checkBlockchainAsync();
    }

    private async checkBlockchainAsync() {
        try {
            logger.info("Checking the state of the blockchain");

            const blockchain: Block[] = await this.dataAccessLayer.getBlockchainAsync();

            if (blockchain.length === 0) {
                await this.initiateBlockchainAsync();
                return;
            }

            logger.info("Blockhain received");
        } catch (error) {
            throw new NodeStartupException(error.message);
        }
    }

    private async initiateBlockchainAsync() {
        logger.info("Initiating blockchain");
        GenesisBlockGenerator.buildGenesisBlock();
    }
}
