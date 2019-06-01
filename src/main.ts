import "reflect-metadata";

import { logger } from "@blockr/blockr-logger";
import { Peer, PeerType } from "@blockr/blockr-p2p-lib";
import * as Sentry from "@sentry/node";
import DI_CONTAINER from "./injection/container.injection";
import { NodeService } from "./services";
import { ConstantStore } from "./stores/constant.store";

async function main() {
    try {
        await initSentry();
        await initPeer();
        await initNodeService();
    } catch (error) {
        logger.error(error);
    }
}

async function initPeer() {
    try {
        logger.info("[Main] Initializing Peer.");

        const peer = new Peer(PeerType.VALIDATOR);
        console.log("GUID BEFORE INIT", peer.connectionService.GUID);

        await peer.init("8081", ["192.168.178.73"]);
        
        console.log("GUID", peer.connectionService.GUID);
        console.log("peerOfType", peer.getPeerOfType(PeerType.VALIDATOR));
    } catch (error) {
        logger.error(error);
    }
}

async function initNodeService() {
    try {
        logger.info("[Main] Initializing NodeService.");

        const service = DI_CONTAINER.get<NodeService>(NodeService);
        await service.start();
    } catch (error) {
        logger.error(error);
    }
}

function initSentry() {
    logger.info("[Main] Initializing Sentry.");
    const constantStore = DI_CONTAINER.get<ConstantStore>(ConstantStore);
    
    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

main();
