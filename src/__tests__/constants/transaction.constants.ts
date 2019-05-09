import { Transaction, TransactionType } from "@blockr/blockr-models";

export const getTransaction = (): Transaction => {
    const transaction = new Transaction(TransactionType.COIN, "TEST_RECIPIENT_KEY", "TEST_SENDER_KEY", 1, new Date());
    transaction.signature = "TEST_SIGNATURE";

    return transaction;
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
    12342342342323,
    87654323.2342367543,
];

export const INVALID_AMOUNTS = [
    0,
    -1,
    -67543,
];
