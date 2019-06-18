import "reflect-metadata";

import { VictoriousBlockAdapter } from "../../adapters";
import { ProposedBlockAdapter } from "../../adapters/concretes/proposedBlock.adapter";
import { ProposedBlockGenerator } from "../../generators";
import { BlockJob } from "../../jobs";
import { LotteryService } from "../../services/concretes/lottery.service";
import { TransactionService } from "../../services/concretes/transaction.service";
import { ConstantStore, QueueStore } from "../../stores";
import { getDataAccessLayerWithBlockchain } from "../constants/block.job.constants";
import { getDataAccessLayerWithoutBlockchain } from "../constants/block.job.constants";

jest.mock("@blockr/blockr-logger");

let proposedBlockGeneratorMock: ProposedBlockGenerator;
let lotteryServiceMock: LotteryService;
let transactionServiceMock: TransactionService;
let constantStoreMock: ConstantStore;
let queueStoreMock: QueueStore;
let proposedBlockAdapterMock: ProposedBlockAdapter;
let victoriousBlockAdapterMock: VictoriousBlockAdapter;

beforeEach(() => {
    proposedBlockGeneratorMock = {} as ProposedBlockGenerator;
    lotteryServiceMock = {} as LotteryService;
    transactionServiceMock = {} as TransactionService;
    constantStoreMock = {} as ConstantStore;
    queueStoreMock = {} as QueueStore;
    proposedBlockAdapterMock = {} as ProposedBlockAdapter;
    victoriousBlockAdapterMock = {} as VictoriousBlockAdapter;
});

describe("Block job initialization", () => {
    it("Should succeed with an empty blockchain", async () => {
        const blockJob = new BlockJob(getDataAccessLayerWithoutBlockchain(),
            proposedBlockGeneratorMock, lotteryServiceMock, transactionServiceMock, constantStoreMock,
            queueStoreMock, proposedBlockAdapterMock, victoriousBlockAdapterMock);
        
        expect(blockJob).not.toBeNull();
        expect(blockJob).toBeInstanceOf(BlockJob);
    });

    it("Should succeed with a pre filled blockchain", async () => {
        const blockJob = new BlockJob(getDataAccessLayerWithBlockchain(),
            proposedBlockGeneratorMock, lotteryServiceMock, transactionServiceMock, constantStoreMock,
            queueStoreMock, proposedBlockAdapterMock, victoriousBlockAdapterMock);
                
        expect(blockJob).not.toBeNull();
        expect(blockJob).toBeInstanceOf(BlockJob);
    });
});
