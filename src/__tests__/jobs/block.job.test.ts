import "reflect-metadata";

import { PeerMockConcrete } from "../../__mocks__/peermockconcrete";
import { ProposedBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { ConstantStore, QueueStore } from "../../stores";
import { getDataAccessLayerWithoutBlockchain, getFileUtilWithKeyFile } from "../constants/block.job.constants";

describe("Block job", () => {
    it("Should skip the cycle if there is no blockchain", async () => {
        const proposedBlockGeneratorMock = {} as ProposedBlockGenerator;
        const lotteryServiceMock = {} as LotteryService;
        const transactionServiceMock = {} as TransactionService;
        const constantStoreMock = {} as ConstantStore;
        const queueStoreMock = {} as QueueStore;
        const peerMock = {} as PeerMockConcrete;

        const blockJob = new BlockJob(getFileUtilWithKeyFile(), getDataAccessLayerWithoutBlockchain(),
            proposedBlockGeneratorMock, lotteryServiceMock, transactionServiceMock, constantStoreMock,
            queueStoreMock, peerMock);
    
            // TODO: This test is not finished
    });
});
