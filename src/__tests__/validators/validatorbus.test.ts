import "reflect-metadata";

import { ConstantStore } from "../../stores";
import { BlockHeaderValidator, TransactionValidator, ValidatorBus } from "../../validators";
import { dataAccessLayerMock, objectHasherMock, transactionHeaderValidatorMock } from "../constants/model.constants";
import { UNSUPORTED_OBJECTS, VALID_OBJECTS } from "../constants/validatorbus.constants";

jest.mock("@blockr/blockr-logger");

let validatorBus: ValidatorBus;

beforeEach(() => {
    const validators = [
        new BlockHeaderValidator(dataAccessLayerMock, objectHasherMock),
        new TransactionValidator(dataAccessLayerMock, objectHasherMock,
            new ConstantStore(), transactionHeaderValidatorMock),
    ];

    validatorBus = new ValidatorBus(validators);
});

describe("Validatorbus validation", () => {
    it.each(VALID_OBJECTS)("Should succeed with valid objects", async (array) => {
        const results = await validatorBus.validateAsync(array.objects);
        
        for (const result of results) {
            expect(result[1]).toBe(true);
        }
    });

    it.each(UNSUPORTED_OBJECTS)("Should fail with unsupported objects", async (array) => {
        try {
            await validatorBus.validateAsync(array.objects);
        } catch (error) {
            expect(error.message).toContain("does not have a validator");
        }
    });
});
