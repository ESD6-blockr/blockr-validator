import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { AdminKeyService } from "./adminKey.service";

@injectable()
export class BlockchainInitializationService {
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly genesisBlockGenerator: GenesisBlockGenerator;
    private readonly adminKeyService: AdminKeyService;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(AdminKeyService) adminKeyService: AdminKeyService) {
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.adminKeyService = adminKeyService;
    }

    public async initiateBlockchainIfInexistentAsync(): Promise<void> {
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


        return new Promise(async (resolve, reject) => {
            try {
                logger.info("[BlockchainInitializationService] Checking the state of the blockchain.");
    
                const blockchain: Block[] = await this.dataAccessLayer.getBlockchainAsync();
    
                if (blockchain.length === 0) {
                    // TODO: kijken of hier blockchain gerequest moet worden of genesis block gemaakt moet worden
                    this.adminKeyService.initiateOrRequestAdminKeyIfInexistentAsync(true);
                    await this.initiateBlockchainAsync();
                    return;
                }

                // TODO: Blockchain should be requested from random peer
                this.adminKeyService.initiateOrRequestAdminKeyIfInexistentAsync(false);
    
                logger.info("[BlockchainInitializationService] Blockchain received.");
                resolve();
            } catch (error) {
                reject(new NodeStartupException(error.message));
            }
        });
    }

    private async initiateBlockchainAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("[BlockchainInitializationService] Initiating blockchain.");

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
