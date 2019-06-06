import "reflect-metadata";

import { Transaction } from "@blockr/blockr-models";
import { ConstantStore } from "../../stores";
import { IValidator, TransactionValidator } from "../../validators";
import { dataAccessLayerMock, objectHasherMock } from "../constants/model.constants";
import { getTransaction } from "../constants/transaction.constants";
import { VALID_TYPES } from "../constants/transaction.constants";
import { VALID_RECIPIENT_KEYS } from "../constants/transaction.constants";
import { INVALID_AMOUNTS, VALID_AMOUNTS } from "../constants/transaction.constants";

jest.mock("@blockr/blockr-logger");

let validator: IValidator<Transaction>;

beforeEach(() => {
    validator = new TransactionValidator(dataAccessLayerMock, objectHasherMock, new ConstantStore());
});

describe("Transaction validator", () => {
    it.each(VALID_TYPES)("Should succeed with a valid transaction type", async (type) => {
        const transaction = getTransaction();
        transaction.type = type;

    });

    it.each(VALID_RECIPIENT_KEYS)("Should succeed with a valid recipient key", async (recipientKey) => {
        const transaction = getTransaction();
        transaction.transactionHeader.recipientKey = recipientKey;

        expect((await validator.validateObjectAsync(transaction))[1]).toBe(true);
    });

    it.each(VALID_AMOUNTS)("Should succeed with a valid transaction amount", async (amount) => {
        const transaction = getTransaction();
        transaction.transactionHeader.amount = amount;

        expect((await validator.validateObjectAsync(transaction))[1]).toBe(true);
    });

    it.each(INVALID_AMOUNTS)("Should fail with an invalid transaction amount", async (amount) => {
        const transaction = getTransaction();
        transaction.transactionHeader.amount = amount;

        try {
            await validator.validateObjectAsync(transaction);
        } catch (error) {
            expect(error.message).toContain("transaction amount");
        }
    });
});
