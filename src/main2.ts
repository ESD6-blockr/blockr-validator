import { BlockHeader } from "@blockr/blockr-models";
import DIContainer from "./injection/container.injection";
import { logger } from "./utils";
import { ValidatorBus } from "./validators";

/**
 * THIS IS MAIN IS USED FOR DEBUGGING ONLY AND SHOULD BE REMOVED
 */
async function main() {
    const validatorBus = DIContainer.resolve<ValidatorBus>(ValidatorBus);

    const blockheaders = [
        new BlockHeader("", 1, new Date(), 1),
        new BlockHeader("", 2, new Date(), 2),
        new BlockHeader("", 3, new Date(), 3),
    ];

    const result = await validatorBus.validateAsync([blockheaders[0], blockheaders[1], blockheaders[2]]);
    logger.info(JSON.stringify(result));
}

main();
