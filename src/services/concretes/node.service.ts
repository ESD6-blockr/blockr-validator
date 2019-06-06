import { logger } from "@blockr/blockr-logger";
import { inject, injectable } from "inversify";
import { BlockJob } from "../../jobs";
import { BlockchainInitializationService } from "./blockchainInitialization.service";

@injectable()
export class NodeService {
    private readonly blockchainInitializationService: BlockchainInitializationService;
    private readonly blockJob: BlockJob;

    constructor(@inject(BlockchainInitializationService)
                    blockchainInitializationService: BlockchainInitializationService,
                @inject(BlockJob) blockJob: BlockJob) {
        this.blockchainInitializationService = blockchainInitializationService;
        this.blockJob = blockJob;
    }

    public async start(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            logger.info(`${this.constructor.name} is starting.`);

            try {
                // get validator --> als undefined ben ik de eerste
                // TODO: Somehow grab validator's public key and save in ConstantStore
                await this.blockchainInitializationService.initiateBlockchainIfInexistentAsync();
                await this.scheduleBlockJobAsync();
    
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private async scheduleBlockJobAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[NodeService] Scheduling Block Job.");
        
            // TODO: Make sure the jobs on all nodes are exactly synced. Using UTC time could be a viable solution.
            
            await this.blockJob.scheduleAsync(1);
            
            resolve();
        });
    }
}
