import { BlockHeader } from "@blockr/blockr-models";
import DIContainer from "./injection/container";
import logger from "./utils/logger";
import { ValidatorBus } from "./validators";

/**
 * THIS IS MAIN IS USED FOR DEBUGGING ONLY AND SHOULD BE REMOVED
 */
async function main() {
    const validatorBus = DIContainer.resolve<ValidatorBus>(ValidatorBus);

    const blockheaders = [
        new BlockHeader("1", 1, "", 1, 1, "", ""),
        new BlockHeader("1", 2, "", 1, 1, "", ""),
        new BlockHeader("1", 3, "", 1, 1, "", ""),
    ];

    const result = await validatorBus.validateAsync([blockheaders[0], blockheaders[1], blockheaders[2]]);
    logger.info(JSON.stringify(result));
}

main();
