import "reflect-metadata";

import { logger } from "@blockr/blockr-logger";
import { Peer } from "@blockr/blockr-p2p-lib";
import * as Sentry from "@sentry/node";
import DIContainer from "./injection/container.injection";
import { NodeService } from "./services";
import { ConstantStore } from "./stores/constant.store";

async function main() {
    try {
        initSentry();
        initPeer();
        initNodeService();
    } catch (error) {
        logger.error(error);
    }
}

async function initPeer() {
    logger.info("[Main] Initializing Peer");
    const peer = DIContainer.get<Peer>(Peer);
    await peer.init();
}

async function initNodeService() {
    logger.info("[Main] Initializing NodeService");
    const service = DIContainer.get<NodeService>(NodeService);
    await service.start();
}

function initSentry() {
    logger.info("[Main] Initializing Sentry");
    const constantStore = DIContainer.get<ConstantStore>(ConstantStore);
    
    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

main();
