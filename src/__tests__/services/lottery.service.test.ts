import "reflect-metadata";

import { Block, State } from "@blockr/blockr-models";
import { LotteryService } from "../../services/concretes/lottery.service";
import { QueueStore } from "../../stores";
import { SetUtils } from "../../utils/set.util";
import { dataAccessLayerMock, getBlock } from "../constants/model.constants";

jest.mock("@blockr/blockr-logger");

let queueStore: QueueStore;
const setUtils: SetUtils = new SetUtils();

beforeEach(() => {
    queueStore = new QueueStore();
});

describe("Lottery service", () => {
    it("Should initialize", () => {
        const lotteryService = new LotteryService(dataAccessLayerMock, queueStore, setUtils);

        expect(lotteryService).not.toBeNull();
        expect(lotteryService).toBeInstanceOf(LotteryService);
    });
});

describe("Drawing winning block", () => {
    it("Should fail with an empty queue", async () => {
        const lotteryService = new LotteryService(dataAccessLayerMock, queueStore, setUtils);

        const parentBlockHash = "EMPTY_TEST_HASH";
        const states = new Array<State>();

        try {
            await lotteryService.drawWinningBlock(parentBlockHash, states);
        } catch (error) {
            expect(error).not.toBeNull();
            expect(error.message).toContain("The lottery does not yield any winner");
        }
    });

    it("Should succeed with a pre filled queue and valid states", async () => {
        const block: Block = getBlock();
        block.blockHeader.validator = "TEST_PUBLIC_KEY";

        queueStore.pendingProposedBlockQueue.add(block);

        const lotteryService = new LotteryService(dataAccessLayerMock, queueStore, setUtils);

        const parentBlockHash = "6363fe744f74ee8f280958ab2f185dde";
        const states = [new State("TEST_PUBLIC_KEY", 10, 10)];

        const winningBlock = await lotteryService.drawWinningBlock(parentBlockHash, states);
        expect(winningBlock).not.toBeNull();
    });

    it("Should fail with a pre filled queue and invalid states", async () => {
        const block = getBlock();
        block.blockHeader.validator = "TEST_PUBLIC_KEY";

        queueStore.pendingProposedBlockQueue.add(block);

        const lotteryService = new LotteryService(dataAccessLayerMock, queueStore, setUtils);

        const parentBlockHash = "6363fe744f74ee8f280958ab2f185dde";
        const states = [new State("TEST_RANDOM_PUBLIC_KEY", 10, 10)];

        try {
            await lotteryService.drawWinningBlock(parentBlockHash, states);
        } catch (error) {
            expect(error.message).toContain("The lottery does not yield any winner");
        }
    });
});
