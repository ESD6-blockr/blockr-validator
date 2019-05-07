import "reflect-metadata";

import { DataAccessLayer } from "@blockr/blockr-data-access";
import { BlockHeader } from "@blockr/blockr-models";
import { ObjectHasher } from "../utils";
import {  BlockHeaderValidator, IValidator } from "../validators";
import { getBlockHeader, VALID_VALIDATOR_VERSIONS } from "./constables/blockheader.constables";

let validator: IValidator<BlockHeader>;

beforeEach(() => {
    const dataAccessLayerMock = {} as DataAccessLayer;
    const objectHasherMock = {} as ObjectHasher;

    validator = new BlockHeaderValidator(dataAccessLayerMock, objectHasherMock);
});

describe("BlockHeader validation", () => {
    it.each(VALID_VALIDATOR_VERSIONS)("Should pass with a valid validator version", async (validatorVersion) => {
        const blockHeader = getBlockHeader();
        blockHeader.validatorVersion = validatorVersion;

        expect((await validator.validateObjectAsync(blockHeader))[1]).toBe(true);
    });
});
