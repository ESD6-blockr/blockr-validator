import { Block } from "@blockr/blockr-models";
import { Main } from "../main";
import logger from "../utils/logger";

test("debug test", async () => {
    const main = new Main();
    const result = await main.validateBlock(new Block(null, null));
    logger.info(`${result}`);
});
