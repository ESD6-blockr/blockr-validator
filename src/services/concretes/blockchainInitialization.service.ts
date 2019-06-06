import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockchainAdapter } from "../../adapters/concretes/blockchain.adapter";
import { IBlockchainServiceAdapter } from "../../adapters/interfaces/blockchainService.adapter";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { AdminKeyService } from "./adminKey.service";
import { StateService } from "./state.service";

@injectable()
export class BlockchainInitializationService implements IBlockchainServiceAdapter {
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly genesisBlockGenerator: GenesisBlockGenerator;
    private readonly adminKeyService: AdminKeyService;
    private readonly blockchainAdapter: BlockchainAdapter;
    private readonly stateService: StateService;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(AdminKeyService) adminKeyService: AdminKeyService,
                @inject(BlockchainAdapter) blockchainAdapter: BlockchainAdapter,
                @inject(StateService) stateService: StateService) {
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.adminKeyService = adminKeyService;
        this.blockchainAdapter = blockchainAdapter;
        this.stateService = stateService;

        this.blockchainAdapter.setServiceAdapter(this);
    }

    public async initiateBlockchainIfInexistentAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("[BlockchainInitializationService] Checking the state of the blockchain.");

                const shouldGenerateGenesisBlock: boolean = this.blockchainAdapter.shouldGenerateGenesisBlock();
                await this.adminKeyService.initiateOrRequestAdminKeyIfInexistentAsync(shouldGenerateGenesisBlock);

                if (shouldGenerateGenesisBlock) {
                    await this.initiateBlockchainAsync();
                    resolve();

                    return;
                }

                logger.info("[BlockchainInitializationService] Syncing blockchain.");
                const blockchainAndStates: [Block[], State[]] =
                    await this.blockchainAdapter.requestBlockchainAndStatesAsync();
                const blockchain: Block[] = blockchainAndStates[0];
                const states: State[] = blockchainAndStates[1];
                
                await this.dataAccessLayer.pruneBlockchainAsync();
                await this.saveBlockchainAsync(blockchain);

                await this.dataAccessLayer.pruneStatesAsync();
                await this.dataAccessLayer.setStatesAsync(states);

                logger.info("[BlockchainInitializationService] Successfully synced blockchain.");
                resolve();
            } catch (error) {
                reject(new NodeStartupException(error.message));
            }
        });
    }

    public async getStatesAsync(): Promise<State[]> {
        return this.dataAccessLayer.getStatesAsync();
    }

    public async getBlockchainAsync(): Promise<Block[]> {
        return this.dataAccessLayer.getBlocksByQueryAsync();
    }

    private async saveBlockchainAsync(blockchain: Block[]): Promise<void> {
        return this.dataAccessLayer.addBlocksAsync(blockchain);
    }

    private async initiateBlockchainAsync(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("[BlockchainInitializationService] Initiating blockchain.");

                const genesisBlock: Block = await this.genesisBlockGenerator.generateGenesisBlockAsync();
                
                await this.dataAccessLayer.addBlockAsync(genesisBlock);
                await this.stateService.updateStatesForTransactionsAsync(Array.from(genesisBlock.transactions));

                logger.info("[BlockchainInitializationService] Successfully initiated blockchain.");

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

}
