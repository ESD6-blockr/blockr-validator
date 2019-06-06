import { Transaction, TransactionHeader, TransactionType } from "@blockr/blockr-models";

export const getTransaction = (): Transaction => {
    return new Transaction(
        TransactionType.COIN,
        new TransactionHeader(
            "TEST_RECIPIENT_KEY",
            "TEST_SENDER_KEY",
            1,
            new Date(),
        ),
        "TEST_SIGNATURE",
    );
};

export const VALID_TYPES = [
    TransactionType.COIN,
    TransactionType.STAKE,
];

export const VALID_RECIPIENT_KEYS = [
    "VALID_KEY",
];

export const VALID_AMOUNTS = [
    1,
    10,
    123423422,
    876.23423,
];

export const INVALID_AMOUNTS = [
    0,
    -1,
    -67543,
];
