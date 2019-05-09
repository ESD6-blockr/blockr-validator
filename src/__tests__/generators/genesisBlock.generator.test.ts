import "reflect-metadata";

import { TransactionType } from "@blockr/blockr-models";
import { GenesisBlockGenerator } from "../../generators";
import { ObjectSigner } from "../../utils";

describe("Genesis block generator", () => {
    it("Should pass with a valid admin public key", async () => {
        const recipientKey = "PUBLIC_KEY_TEST";
        process.env.ADMIN_PUBLIC_KEY = recipientKey;

        const objectSignerMock = {} as ObjectSigner;

        const generator = new GenesisBlockGenerator(objectSignerMock);

        const genesisBlock = await generator.generateGenesisBlockAsync();

        expect(genesisBlock.blockHeader.blockNumber).toBe(1);
        expect(genesisBlock.blockHeader.blockReward).toBe(10);
        expect(genesisBlock.blockHeader.date.toDateString()).toBe(new Date().toDateString());
       
        expect(genesisBlock.transactions.length).toBe(2);
        
        expect(genesisBlock.transactions[0].type).toBe(TransactionType.COIN);
        expect(genesisBlock.transactions[0].senderKey).toBe(recipientKey);
        expect(genesisBlock.transactions[0].amount).toBe(900_000_000);
        expect(genesisBlock.transactions[0].date.toDateString()).toBe(new Date().toDateString());

        expect(genesisBlock.transactions[1].type).toBe(TransactionType.STAKE);
        expect(genesisBlock.transactions[1].senderKey).toBe(recipientKey);
        expect(genesisBlock.transactions[1].amount).toBe(1);
        expect(genesisBlock.transactions[1].date.toDateString()).toBe(new Date().toDateString());
    });

    it("Should fail with an invalid admin public key", async () => {
        const objectSignerMock = {} as ObjectSigner;

        const generator = new GenesisBlockGenerator(objectSignerMock);

        try {
            await generator.generateGenesisBlockAsync();
        } catch (error) {
            expect(error.message).toContain("Block could not be initiated");
        }
    });

    // TODO: it should fail with an invalid signature
});
