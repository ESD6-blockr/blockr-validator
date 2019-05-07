import "reflect-metadata";

import * as Sentry from "@sentry/node";
import DIContainer from "./injection/container.injection";
import { NodeService } from "./services";

async function main() {
    initSentry();

    const service = DIContainer.resolve<NodeService>(NodeService);
    await service.start();
}

function initSentry() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT,
    });
}

main();
