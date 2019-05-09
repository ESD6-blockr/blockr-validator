import { BlockHeader } from "@blockr/blockr-models";

export const getBlockHeader = (): BlockHeader => {
    const blockHeader = new BlockHeader("1.0.0", 1, new Date(), 1);
    blockHeader.validator = "test_validator";
    blockHeader.parentHash = "test_parent_hash";

    return blockHeader;
};

export const VALID_VALIDATOR_VERSIONS = [
    "1.0.0",
    "1.1.0",
    "0.0.0",
    "4.5.7",
];

export const INVALID_VALIDATOR_VERSIONS = [
    "-10",
    "",
    "sdhufhsd",
    "VERSION",
    "1.0.0.0",
];

export const VALID_BLOCK_NUMBERS = [
    1,
    2,
    10,
    123123123,
    765432543343,
];

export const INVALID_BLOCK_NUMBRS = [
    -1,
    -2,
    -12312312312,
    1.1,
    2312321313.12312313123,
];

export const VALID_DATES = [
    new Date(),
];

export const INVALID_DATES = [
    new Date("01 Jan 1970 00:00:00 GMT"),
];

export const VALID_BLOCK_REWARDS = [
    1,
    10,
    56432,
];

export const INVALID_BLOCK_REWARDS = [
    -1,
    -57849320,
];
