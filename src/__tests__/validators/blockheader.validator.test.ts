import "reflect-metadata";

import { DataAccessLayer } from "@blockr/blockr-data-access";
import { BlockHeader } from "@blockr/blockr-models";
import { ObjectHasher } from "../../utils/security/objectHasher.util";
import {  BlockHeaderValidator, IValidator } from "../../validators";
import { getBlockHeader } from "../constants/blockheader.constants";
import { INVALID_VALIDATOR_VERSIONS, VALID_VALIDATOR_VERSIONS } from "../constants/blockheader.constants";
import { INVALID_BLOCK_NUMBRS, VALID_BLOCK_NUMBERS } from "../constants/blockheader.constants";
import { INVALID_DATES, VALID_DATES } from "../constants/blockheader.constants";
import { INVALID_BLOCK_REWARDS, VALID_BLOCK_REWARDS } from "../constants/blockheader.constants";

jest.mock("@blockr/blockr-logger");
jest.mock("../../utils/security/objectHasher.util");

let validator: IValidator<BlockHeader>;

beforeEach(() => {
    const dataAccessLayerMock = {} as DataAccessLayer;
    const objectHasherMock = {} as ObjectHasher;

    validator = new BlockHeaderValidator(dataAccessLayerMock, objectHasherMock);
});

describe("BlockHeader validation", () => {
    it.each(VALID_VALIDATOR_VERSIONS)("Should succeed with a valid validator version", async (validatorVersion) => {
        const blockHeader = getBlockHeader();
        blockHeader.validatorVersion = validatorVersion;

        expect((await validator.validateObjectAsync(blockHeader))[1]).toBe(true);
    });

    it.each(INVALID_VALIDATOR_VERSIONS)("Should fail with an invalid validator version", async (validatorVersion) => {
        const blockHeader = getBlockHeader();
        blockHeader.validatorVersion = validatorVersion;

        try {
            await validator.validateObjectAsync(blockHeader);
        } catch (error) {
            expect(error.message).toContain("validator version");
        }
    });

    it.each(VALID_BLOCK_NUMBERS)("Should succeed with a valid block number", async (blockNumber) => {
        const blockHeader = getBlockHeader();
        blockHeader.blockNumber = blockNumber;

        expect((await validator.validateObjectAsync(blockHeader))[1]).toBe(true);
    });

    it.each(INVALID_BLOCK_NUMBRS)("Should fail with an invalid block number", async (blockNumber) => {
        const blockHeader = getBlockHeader();
        blockHeader.blockNumber = blockNumber;
        
        try {
            await validator.validateObjectAsync(blockHeader);
        } catch (error) {
            expect(error.message).toContain("blocknumber");
        }
    });

    it.each(VALID_DATES)("Should succeed with a valid date", async (date) => {
        const blockHeader = getBlockHeader();
        blockHeader.date = date;

        expect((await validator.validateObjectAsync(blockHeader))[1]).toBe(true);
    });

    it.each(INVALID_DATES)("Should fail with an invalid date", async (date) => {
        const blockHeader = getBlockHeader();
        blockHeader.date = date;

        try {
            await validator.validateObjectAsync(blockHeader);
        } catch (error) {
            expect(error.message).toContain("date");
        }
    });

    it.each(VALID_BLOCK_REWARDS)("Should succeed with a valid block reward", async (blockReward) => {
        const blockHeader = getBlockHeader();
        blockHeader.blockReward = blockReward;

        expect((await validator.validateObjectAsync(blockHeader))[1]).toBe(true);
    });

    it.each(INVALID_BLOCK_REWARDS)("Should fail with an invalid block reward", async (blockReward) => {
        const blockHeader = getBlockHeader();
        blockHeader.blockReward = blockReward;

        try {
            await validator.validateObjectAsync(blockHeader);
        } catch (error) {
            expect(error.message).toContain("block reward");
        }
    });
});
