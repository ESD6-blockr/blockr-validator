import { ObjectHasher } from "@blockr/blockr-crypto";
import { BlockHeader, Transaction, TransactionType } from "@blockr/blockr-models";

const createBlockHeader = (version: string, blockNumber: number, reward: number) => {
    const blockHeader = new BlockHeader(version, blockNumber, new Date(), reward);
    blockHeader.validator = "TEST_VALIDATOR";
    blockHeader.parentHash = "TEST_PARENT_HASH";

    return blockHeader;
};

const createTransaction = (type: TransactionType, amount: number) => {
    const transaction = new Transaction(type, "RECIPIENT_TEST_KEY", "SENDER_TEST_KEY", amount, new Date());
    transaction.signature = "TEST_SIGNATURE";

    return transaction;
};

export const VALID_OBJECTS = [
    {
        objects: [
            createBlockHeader("1.0.0", 1, 10),
            createBlockHeader("1.3.0", 6, 234),
        ],
    },
    {
        objects: [
            createBlockHeader("2.0.1", 567, 1),
            createBlockHeader("1.1.0", 32, 87654),
            createTransaction(TransactionType.COIN, 43),
        ],
    },
    {
        objects: [
            createTransaction(TransactionType.COIN, 1),
            createTransaction(TransactionType.COIN, 3423),
            createTransaction(TransactionType.COIN, 98765),
        ],
    },
];

export const UNSUPORTED_OBJECTS = [
    {
        objects: [
            {},
            {},
        ],
    },
    {
        objects: [
            new Date(),
            new Array(),
            new Map(),
        ],
    },
    {
        objects: [
            new ObjectHasher(),
            new Set(),
        ],
    },
];

