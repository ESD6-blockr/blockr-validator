import "reflect-metadata";

import { logger } from "@blockr/blockr-logger";
import * as Sentry from "@sentry/node";
import DIContainer from "./injection/container.injection";
import { NodeService } from "./services";
import { ConstantStore } from "./stores/constant.store";

async function main() {
    try {
        initSentry();
        const service = DIContainer.resolve<NodeService>(NodeService);
        await service.start();
    } catch (error) {
        logger.error(error);
    }
}

function initSentry() {
    const constantStore = DIContainer.get<ConstantStore>(ConstantStore);
    
    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

main();
