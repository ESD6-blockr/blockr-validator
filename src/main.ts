import "reflect-metadata";

import { logger } from "@blockr/blockr-logger";
import { Peer, Message } from "@blockr/blockr-p2p-lib";
import * as Sentry from "@sentry/node";
import DI_CONTAINER from "./injection/container.injection";
import { NodeService, ProposedBlockService, VictoriousBlockService } from "./services";
import { ConstantStore } from "./stores/constant.store";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";

async function main() {
    try {
        const constantStore = DI_CONTAINER.get<ConstantStore>(ConstantStore);

        initSentry(constantStore);
        await initPeer(constantStore);
        await initStandaloneServices();
        await initNodeService();
    } catch (error) {
        logger.error(`[Main] ${error}`);
    }
}

async function initPeer(constantStore: ConstantStore) {
    try {
        logger.info("[Main] Initializing Peer.");
        
        const peer = DI_CONTAINER.get<Peer>(Peer);
        await peer.init(constantStore.PEER_TO_PEER_NETWORK_PORT, [constantStore.INITIAL_PEER_IP]);
    } catch (error) {
        logger.error(`[Main] ${error}`);
    }
}

/**
 * This function initializes all the services that are not called from any 
 * class particularly but should be initialized to start their respective adapters.
 */
async function initStandaloneServices() {
    DI_CONTAINER.get<ProposedBlockService>(ProposedBlockService);
    DI_CONTAINER.get<VictoriousBlockService>(VictoriousBlockService);
}

async function initNodeService() {
    try {
        logger.info("[Main] Initializing NodeService.");

        const service = DI_CONTAINER.get<NodeService>(NodeService);
        await service.start();
    } catch (error) {
        logger.error(`[Main] ${error}`);
    }
}

function initSentry(constantStore: ConstantStore) {
    logger.info("[Main] Initializing Sentry.");
    
    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

main();
