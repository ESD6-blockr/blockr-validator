import { logger } from "@blockr/blockr-logger";
import { inject, injectable } from "inversify";
import { BlockJob } from "../../jobs/concretes/block.job";
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
        return new Promise(async (resolve) => {
            logger.info(`${this.constructor.name} is starting.`);

            await this.blockchainInitializationService.initiateBlockchainIfInexistentAsync();
            await this.scheduleBlockJobAsync();

            resolve();
        });
    }

    private async scheduleBlockJobAsync(): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[NodeService] Scheduling Block Job.");
        
            await this.blockJob.scheduleAsync(1);
            
            resolve();
        });
    }
}
