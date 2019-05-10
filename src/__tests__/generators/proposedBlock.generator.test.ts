import "reflect-metadata";

import { Block, BlockHeader, BlockType, Transaction, TransactionType } from "@blockr/blockr-models";
import { ProposedBlockGenerator } from "../../generators";
import { ConstantStore } from "../../stores";
import { ObjectHasher } from "../../utils/security/objectHasher.util";

jest.mock("@blockr/blockr-logger");
jest.mock("../../utils/security/objectHasher.util");

let generator: ProposedBlockGenerator;

beforeEach(() => {
    const objectHasherMock = {
        hashAsync() {
            return "HASH_TEST";
        },
    } as unknown as ObjectHasher;

    generator = new ProposedBlockGenerator(objectHasherMock, new ConstantStore());
});

describe("Proposed block generator", () => {
    it("Should pass with a valid parent block", async () => {
        const parentBlock = new Block(
            new BlockHeader(
                "1.0.0",
                1,
                new Date(),
                10,
            ),
            new Set(),
            BlockType.GENESIS,
        );

        const pendingTransactions = new Set().add(
            new Transaction(
                TransactionType.COIN,
                "RECIPIENT_KEY_TEST",
                "SENDER_KEY_TEST",
                10,
                new Date(),
            ),
        );

        const validatorPublicKey = "PUBLIC_KEY_TEST";

        const proposedBlock: Block = await generator.generateProposedBlockAsync(
            parentBlock, pendingTransactions, "1.0.0", validatorPublicKey);

        expect(proposedBlock.blockHeader.blockNumber).toBe(2);
        expect(proposedBlock.blockHeader.blockReward).toBe(10);
        expect(proposedBlock.blockHeader.date.toDateString()).toBe(new Date().toDateString());
       
        expect(proposedBlock.transactions.size).toBe(1);
        
        const transactions: Transaction[] = Array.from(proposedBlock.transactions);

        expect(transactions[0].type).toBe(TransactionType.COIN);
        expect(transactions[0].amount).toBe(10);
        expect(transactions[0].date.toDateString()).toBe(new Date().toDateString());
    });
});
