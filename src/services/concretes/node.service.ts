import { logger } from "@blockr/blockr-logger";
import { inject, injectable } from "inversify";
import { BlockJob } from "../../jobs";
import { BlockchainInitializationService } from "./blockchainInitialization.service";

/**
 * Injectable
 */
@injectable()
export class NodeService {
    private readonly blockchainInitializationService: BlockchainInitializationService;
    private readonly blockJob: BlockJob;

    /**
     * Creates an instance of node service.
     * @param blockchainInitializationService 
     * @param blockJob 
     */
    constructor(@inject(BlockchainInitializationService)
                    blockchainInitializationService: BlockchainInitializationService,
                @inject(BlockJob) blockJob: BlockJob) {
        this.blockchainInitializationService = blockchainInitializationService;
        this.blockJob = blockJob;
    }

    /**
     * Starts node service
     * @returns start 
     */
    public async start(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.blockchainInitializationService.initiateBlockchainIfInexistentAsync();
                await this.scheduleBlockJobAsync();
    
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Schedules block job async
     * @returns block job async 
     */
    private async scheduleBlockJobAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[NodeService] Scheduling Block Job.");
            
            await this.blockJob.scheduleAsync(1);
            
            resolve();
        });
    }
}
