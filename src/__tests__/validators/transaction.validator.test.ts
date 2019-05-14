import "reflect-metadata";

import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Transaction } from "@blockr/blockr-models";
import { IValidator, TransactionValidator } from "../../validators";
import { getBlock } from "../constants/model.constants";
import { getTransaction } from "../constants/transaction.constants";
import { VALID_TYPES } from "../constants/transaction.constants";
import { VALID_RECIPIENT_KEYS } from "../constants/transaction.constants";
import { INVALID_AMOUNTS, VALID_AMOUNTS } from "../constants/transaction.constants";

jest.mock("@blockr/blockr-logger");

let validator: IValidator<Transaction>;

beforeEach(() => {
    const dataAccessLayerMock = {
        getBlockAsync() {
            return getBlock();
        },
    } as unknown as DataAccessLayer;
    // TODO: Move these shared mocks the the mock folder
    const objectHasherMock = {
        async hashAsync() {
            return "TEST_PARENT_HASH";
        },
    } as unknown as ObjectHasher;

    validator = new TransactionValidator(dataAccessLayerMock, objectHasherMock);
});

describe("Transaction validator", () => {
    it.each(VALID_TYPES)("Should succeed with a valid transaction type", async (type) => {
        const transaction = getTransaction();
        transaction.type = type;

    });

    it.each(VALID_RECIPIENT_KEYS)("Should succeed with a valid recipient key", async (recipientKey) => {
        const transaction = getTransaction();
        transaction.recipientKey = recipientKey;

        expect((await validator.validateObjectAsync(transaction))[1]).toBe(true);
    });

    it.each(VALID_AMOUNTS)("Should succeed with a valid transaction amount", async (amount) => {
        const transaction = getTransaction();
        transaction.amount = amount;

        expect((await validator.validateObjectAsync(transaction))[1]).toBe(true);
    });

    it.each(INVALID_AMOUNTS)("Should fail with an invalid transaction amount", async (amount) => {
        const transaction = getTransaction();
        transaction.amount = amount;

        try {
            await validator.validateObjectAsync(transaction);
        } catch (error) {
            expect(error.message).toContain("transaction amount");
        }
    });
});
