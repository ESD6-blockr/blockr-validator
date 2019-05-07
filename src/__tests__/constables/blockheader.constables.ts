import { BlockHeader } from "@blockr/blockr-models";

export const getBlockHeader = (): BlockHeader => {
    const blockHeader = new BlockHeader("", 1, new Date(), 1);
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
