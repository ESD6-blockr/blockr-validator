import "reflect-metadata";

import { Block, BlockHeader, Transaction } from "@blockr/blockr-models";
import * as Sentry from "@sentry/node";
import DIContainer from "./injection/container";
import logger from "./utils/logger";
import { ValidatorBus } from "./validators";

export class Main {
    private validatorBus: ValidatorBus;

    constructor() {
        this.validatorBus = DIContainer.resolve<ValidatorBus>(ValidatorBus);
        
        this.initSentry();
    }

    public async validateBlock(block: Block): Promise<boolean> {
        // TODO implement
        throw new Error("implement me");
    }

    private initSentry() {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
        });
    }
}

async function main() {
    const main2 = new Main();
    const value = await main2.validateBlock(new Block(new BlockHeader("", 1, "", 12, 12, "", ""),
    [new Transaction("", 12, 12, "", "", "", "")]));
    logger.info(`${value}`);
}

main();


