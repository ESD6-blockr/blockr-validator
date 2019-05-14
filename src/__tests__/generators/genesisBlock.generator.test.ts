import "reflect-metadata";

import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { GenesisBlockGenerator } from "../../generators";
import { ConstantStore } from "../../stores";

jest.mock("@blockr/blockr-logger");

describe("Genesis block generator", () => {
    it("Should pass with a valid admin public key", async () => {
        const recipientKey = "PUBLIC_KEY_TEST";
        process.env.ADMIN_PUBLIC_KEY = recipientKey;

        const generator = new GenesisBlockGenerator(new ConstantStore());

        const genesisBlock: Block = await generator.generateGenesisBlockAsync();

        expect(genesisBlock.blockHeader.blockNumber).toBe(1);
        expect(genesisBlock.blockHeader.blockReward).toBe(10);
        expect(genesisBlock.blockHeader.date.toDateString()).toBe(new Date().toDateString());
       
        expect(genesisBlock.transactions.size).toBe(2);
        
        const transactions: Transaction[] = Array.from(genesisBlock.transactions);

        expect(transactions[0].type).toBe(TransactionType.COIN);
        expect(transactions[0].senderKey).toBe(recipientKey);
        expect(transactions[0].amount).toBe(900_000_000);
        expect(transactions[0].date.toDateString()).toBe(new Date().toDateString());

        expect(transactions[1].type).toBe(TransactionType.STAKE);
        expect(transactions[1].senderKey).toBe(recipientKey);
        expect(transactions[1].amount).toBe(1);
        expect(transactions[1].date.toDateString()).toBe(new Date().toDateString());
    });

    it("Should fail with an invalid admin public key", async () => {
        const generator = new GenesisBlockGenerator(new ConstantStore());

        try {
            await generator.generateGenesisBlockAsync();
        } catch (error) {
            expect(error.message).toContain("Block could not be initiated");
        }
    });

    // TODO: it should fail with an invalid signature
});
