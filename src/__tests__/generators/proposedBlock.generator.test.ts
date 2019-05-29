import "reflect-metadata";

import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { ProposedBlockGenerator } from "../../generators";
import { ConstantStore } from "../../stores";
import { getBlock, getTransactions, objectHasherMock } from "../constants/model.constants";

jest.mock("@blockr/blockr-logger");

let generator: ProposedBlockGenerator;

beforeEach(() => {
    generator = new ProposedBlockGenerator(objectHasherMock, new ConstantStore());
});

describe("Proposed block generator", () => {
    it("Should pass with a valid parent block", async () => {
        const parentBlock = getBlock();
        const pendingTransactions = getTransactions();
        const validatorPublicKey = "PUBLIC_KEY_TEST";

        const proposedBlock: Block = await generator.generateProposedBlockAsync(
            parentBlock, pendingTransactions, "1.0.0", validatorPublicKey);

        expect(proposedBlock.blockHeader.blockNumber).toBe(2);
        expect(proposedBlock.blockHeader.blockReward).toBe(10);
        expect(proposedBlock.blockHeader.date.toDateString()).toBe(new Date().toDateString());
       
        expect(proposedBlock.transactions.length).toBe(3);
        
        const transactions: Transaction[] = proposedBlock.transactions;

        expect(transactions[0].type).toBe(TransactionType.COIN);
        expect(transactions[0].amount).toBe(10);
        expect(transactions[0].date.toDateString()).toBe(new Date().toDateString());
    });
});
