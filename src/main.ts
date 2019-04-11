import "reflect-metadata";

import { Block, BlockHeader, Transaction } from "@blockr/blockr-models";
import DIContainer from "./injection/container";
import logger from "./utils/logger";
import { BlockValidator } from "./validators/concretes/blockValidator";
import { IValidator } from "./validators/interfaces/validator";

export class Main {
    private blockValidator: IValidator<Block>;

    constructor() {
        this.blockValidator = DIContainer.resolve<IValidator<Block>>(BlockValidator);
    }

    public async validateBlock(block: Block): Promise<boolean> {
        return this.blockValidator.validateObjectAsync(block);
    }
}

async function main() {
    const main2 = new Main();
    const value = await main2.validateBlock(new Block(new BlockHeader("", 1, "", 12, 12, "", ""),
    [new Transaction("", 12, 12, "", "", "", "")]));
    logger.info(`${value}`);
}

main();


