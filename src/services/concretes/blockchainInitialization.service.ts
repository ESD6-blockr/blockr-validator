import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State, Transaction, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockchainAdapter } from "../../adapters/concretes/blockchain.adapter";
import { IBlockchainServiceAdapter } from "../../adapters/interfaces/blockchain.adapter";
import { NodeStartupException } from "../../exceptions";
import { GenesisBlockGenerator } from "../../generators";
import { AdminKeyService } from "./adminKey.service";

@injectable()
export class BlockchainInitializationService implements IBlockchainServiceAdapter {
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly genesisBlockGenerator: GenesisBlockGenerator;
    private readonly adminKeyService: AdminKeyService;
    private readonly blockchainAdapter: BlockchainAdapter;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(GenesisBlockGenerator) genesisBlockGenerator: GenesisBlockGenerator,
                @inject(AdminKeyService) adminKeyService: AdminKeyService,
                @inject(BlockchainAdapter) blockchainAdapter: BlockchainAdapter) {
        this.dataAccessLayer = dataAccessLayer;
        this.genesisBlockGenerator = genesisBlockGenerator;
        this.adminKeyService = adminKeyService;
        this.blockchainAdapter = blockchainAdapter;

        this.blockchainAdapter.setAdapter(this);
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
                const blockchain: Block[] = await this.blockchainAdapter.requestBlockchainAsync();
                await this.dataAccessLayer.pruneBlockchainAsync();
                await this.saveBlockchainAsync(blockchain);

                logger.info("[BlockchainInitializationService] Successfully synced blockchain.");
                resolve();
            } catch (error) {
                reject(new NodeStartupException(error.message));
            }
        });
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
                const genesisState: State = this.generateGenesisState(genesisBlock.transactions);

                await this.dataAccessLayer.addBlockAsync(genesisBlock);
                await this.dataAccessLayer.setStatesAsync([genesisState]);

                logger.info("[BlockchainInitializationService] Initiated blockchain.");

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private generateGenesisState(transactions: Transaction[]): State {
        const stakeTransaction: Transaction = transactions
            .find((t) => t.type === TransactionType.STAKE) as Transaction;
        const coinTransaction: Transaction = transactions
            .find((t) => t.type === TransactionType.COIN) as Transaction;

        return new State(stakeTransaction.senderKey, coinTransaction.amount, stakeTransaction.amount);
    }
}
