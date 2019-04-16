import { BlockHeader } from "@blockr/blockr-models";
import DIContainer from "./injection/container";
import logger from "./utils/logger";
import { ValidatorBus } from "./validators";

async function main() {
    const validatorBus = DIContainer.resolve<ValidatorBus>(ValidatorBus);

    const blockheaders = [
        new BlockHeader("1", 1, "", 1, 1, "", ""),
        new BlockHeader("1", 2, "", 1, 1, "", ""),
        new BlockHeader("1", 3, "", 1, 1, "", ""),
    ];

    const result1 = await validatorBus.validateAsync([blockheaders[0], blockheaders[1], blockheaders[2]]);
    logger.info(JSON.stringify(result1));
  //  const result2 = await validatorBus.validateAsync(blockheaders[0], blockheaders[1]);
    //logger.info(JSON.stringify(result2));
}

main();
