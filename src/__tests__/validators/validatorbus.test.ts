import "reflect-metadata";

import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { BlockHeaderValidator, TransactionValidator, ValidatorBus } from "../../validators";
import { getBlock } from "../constants/model.constants";
import { UNSUPORTED_OBJECTS, VALID_OBJECTS } from "../constants/validatorbus.constants";

jest.mock("@blockr/blockr-logger");

let validatorBus: ValidatorBus;

beforeEach(() => {
    const dataAccessLayerMock = {
        getBlockAsync() {
            return getBlock();
        },
    } as unknown as DataAccessLayer;

    const objectHasherMock = {
        async hashAsync() {
            return "TEST_PARENT_HASH";
        },
    } as unknown as ObjectHasher;

    
    const validators = [
        new BlockHeaderValidator(dataAccessLayerMock, objectHasherMock),
        new TransactionValidator(dataAccessLayerMock, objectHasherMock),
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
