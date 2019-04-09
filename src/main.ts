import "reflect-metadata";

import { Block, Transaction } from "@blockr/blockr-models";
import DIContainer from "./injection/container";
import Logger from "./utils/logger";
import { BlockValidator } from "./validators/concretes/blockValidator";
import { IValidator } from "./validators/interfaces/validator";

export class Main {
    private blockValidator: IValidator<Block>;

    constructor() {
        this.blockValidator = DIContainer.resolve<IValidator<Block>>(BlockValidator);
    }

    public async validateBlock(block: Block): Promise<boolean> {
        throw new Error(`${block}`);
    }
}

async function main() {
    const main = new Main();
    const value = await main.validateBlock(new Block(null, null));
    console.log(value);
}

main();


