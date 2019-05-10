import "reflect-metadata";

import { ProposedBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { getDataAccessLayerWithoutBlockchain, getFileUtilWithKeyFile } from "../constants/block.job.constants";

describe("Block job", () => {
    it("Should skip the cycle if there is no blockchain", async () => {
        const proposedBlockGeneratorMock = {} as ProposedBlockGenerator;
        const lotteryServiceMock = {} as LotteryService;
        const transactionServiceMock = {} as TransactionService;

        const blockJob = new BlockJob(getFileUtilWithKeyFile(), getDataAccessLayerWithoutBlockchain(),
            proposedBlockGeneratorMock, lotteryServiceMock, transactionServiceMock);
    
            // TODO: This test is not finished
    });
});
