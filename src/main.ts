import "reflect-metadata";

import { logger } from "@blockr/blockr-logger";
import { Peer } from "@blockr/blockr-p2p-lib";
import * as Sentry from "@sentry/node";
import { exitHandler } from "./handlers";
import DI_CONTAINER from "./injection/container.injection";
import { NodeService, ProposedBlockService, VictoriousBlockService } from "./services";
import { ConstantStore } from "./stores/constant.store";

async function main() {
    try {
        const constantStore = DI_CONTAINER.get<ConstantStore>(ConstantStore);

        initSentry(constantStore);
        await initPeer(constantStore);
        await initStandaloneServices();
        await initNodeService();
    } catch (error) {
        logger.error(`[Main] ${error}`);
        // TODO: Fix SonarQube smells
    }
}

/**
 * Inits peer
 * @param constantStore 
 */
async function initPeer(constantStore: ConstantStore) {
    try {
        logger.info("[Main] Initializing Peer.");
        
        const peer = DI_CONTAINER.get<Peer>(Peer);
        await peer.init([constantStore.INITIAL_PEER_IP], constantStore.PEER_TO_PEER_NETWORK_PORT);
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

/**
 * Inits node service
 */
async function initNodeService() {
    try {
        logger.info("[Main] Initializing NodeService.");

        const service = DI_CONTAINER.get<NodeService>(NodeService);
        await service.start();
    } catch (error) {
        logger.error(`[Main] ${error}`);
    }
}

/**
 * Inits sentry
 * @param constantStore 
 */
function initSentry(constantStore: ConstantStore) {
    logger.info("[Main] Initializing Sentry.");
    
    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

/**
 * This function binds the needed process events e.g. when ctrl+c is used.
 * These bindings are needed to leave the p2p network on exit of the application for example.
 */
function bindProcessEvents() {
    process.stdin.resume();

    process.on("exit", exitHandler.bind(null));
    // Catch ctrl+c
    process.on("SIGINT", exitHandler.bind(null));
    
    // Catch kill pid
    process.on("SIGUSR1", exitHandler.bind(null));
    process.on("SIGUSR2", exitHandler.bind(null));
    
    // Catch uncaught exceptions
    process.on("uncaughtException", exitHandler.bind(null));
}

bindProcessEvents();
main();
