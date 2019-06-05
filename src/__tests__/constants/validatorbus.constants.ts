import { ObjectHasher } from "@blockr/blockr-crypto";
import { TransactionType } from "@blockr/blockr-models";
import { getBlockHeader, getTransaction } from "./model.constants";

export const VALID_OBJECTS = [
    {
        objects: [
            getBlockHeader("1.0.0", 1, 10),
            getBlockHeader("1.3.0", 6, 234),
        ],
    },
    {
        objects: [
            getBlockHeader("2.0.1", 567, 1),
            getBlockHeader("1.1.0", 32, 87654),
            getTransaction(TransactionType.COIN, 43),
        ],
    },
    {
        objects: [
            getTransaction(TransactionType.COIN, 1),
            getTransaction(TransactionType.COIN, 3423),
            getTransaction(TransactionType.COIN, 98765),
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
            [],
        ],
    },
];

