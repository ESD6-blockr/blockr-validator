import "reflect-metadata";

import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { GenesisBlockGenerator } from "../../generators";
import { ConstantStore } from "../../stores";
import { cryptoKeyUtilMock, objectHasherMock } from "../constants/model.constants";

jest.mock("@blockr/blockr-logger");

describe("Genesis block generator", () => {
    it("Should pass with a valid admin public key", async () => {
        const adminKey = "PUBLIC_KEY_TEST";

        const constantStore = new ConstantStore();
        constantStore.ADMIN_PUBLIC_KEY = adminKey;

        const generator = new GenesisBlockGenerator(constantStore, objectHasherMock, cryptoKeyUtilMock);

        const genesisBlock: Block = await generator.generateGenesisBlockAsync();

        expect(genesisBlock.blockHeader.blockNumber).toBe(1);
        expect(genesisBlock.blockHeader.blockReward).toBe(10);
        expect(genesisBlock.blockHeader.date.toDateString()).toBe(new Date().toDateString());
       
        expect(genesisBlock.transactions.length).toBe(2);
        
        const transactions: Transaction[] = genesisBlock.transactions;

        expect(transactions[0].type).toBe(TransactionType.COIN);
        expect(transactions[0].transactionHeader.senderKey).toBe(adminKey);
        expect(transactions[0].transactionHeader.amount).toBe(900_000_000);
        expect(transactions[0].transactionHeader.date.toDateString()).toBe(new Date().toDateString());

        expect(transactions[1].type).toBe(TransactionType.STAKE);
        expect(transactions[1].transactionHeader.senderKey).toBe(adminKey);
        expect(transactions[1].transactionHeader.amount).toBe(1);
        expect(transactions[1].transactionHeader.date.toDateString()).toBe(new Date().toDateString());
    });

    it("Should fail with an invalid admin public key", async () => {
        const generator = new GenesisBlockGenerator(new ConstantStore(), objectHasherMock, cryptoKeyUtilMock);

        try {
            await generator.generateGenesisBlockAsync();
        } catch (error) {
            expect(error.message).toContain("Block could not be initiated");
        }
    });

    // TODO: it should fail with an invalid signature
});
