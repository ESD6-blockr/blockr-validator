import "reflect-metadata";

import * as Sentry from "@sentry/node";
import DIContainer from "./injection/container.injection";
import { NodeService } from "./services";
import { ConstantStore } from "./stores/constant.store";

async function main() {
    initSentry();

    const service = DIContainer.resolve<NodeService>(NodeService);
    await service.start();
}

function initSentry() {
    const constantStore = ConstantStore.getInstance();

    Sentry.init({
        dsn: constantStore.SENTRY_DSN,
        environment: constantStore.SENTRY_ENVIRONMENT,
    });
}

main();
