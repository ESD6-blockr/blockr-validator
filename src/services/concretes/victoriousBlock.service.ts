import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { VictoriousBlockAdapter } from "../../adapters/concretes/victoriousBlock.adapter";
import { IVictoriousBlockServiceAdapter } from "../../adapters/interfaces/victoriousBlockService.adapter";
import { StateService } from "./state.service";

@injectable()
export class VictoriousBlockService implements IVictoriousBlockServiceAdapter {
    private readonly dataAccessLayer: DataAccessLayer;
    private readonly stateService: StateService;
    private readonly victoriousBlockAdapter: VictoriousBlockAdapter;
    private isActive: boolean = false;
    private lastProccesedBlockNummer: number = -1;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(StateService) stateService: StateService,
                @inject(VictoriousBlockAdapter) victoriousBlockAdapter: VictoriousBlockAdapter) {
        this.dataAccessLayer = dataAccessLayer;
        this.stateService = stateService;
        this.victoriousBlockAdapter = victoriousBlockAdapter;

        this.victoriousBlockAdapter.setServiceAdapter(this);
    }
    
    public async addVictoriousBlockAsync(victoriousBlock: Block): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Since the BlockJob's cycle execution is synced for every Node, all victorious blocks that will 
            // be received while this service is already processing a victorious block, are identical to the one that is
            // currently being processed. Hence the if-statement and the early resolve.
            if (this.isActive || victoriousBlock.blockHeader.blockNumber <= this.lastProccesedBlockNummer) {
                logger.info("[VictoriousBlockService] Skipping received victorious block " +
                            "because the service is already active.");

                resolve();
                return;
            }
            this.lastProccesedBlockNummer = victoriousBlock.blockHeader.blockNumber;
            this.isActive = true;

            try {
                await this.dataAccessLayer.addBlockAsync(victoriousBlock);
                await this.stateService.updateStatesForTransactionsAsync(victoriousBlock.transactions);
                

                resolve();
            } catch (error) {

                reject(error);
            } finally {
                this.isActive = false;
            }
        });
    }
}
