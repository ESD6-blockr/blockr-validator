import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader, BlockType, State, Transaction, TransactionType } from "@blockr/blockr-models";

export const getBlock = () => {
    return new Block(
        new BlockHeader(
            "1.0.0",
            1,
            new Date(),
            10,
        ),
        [],
        BlockType.GENESIS,
    );
};

export const getTransactions = () => {
    return [
                new Transaction(
                    TransactionType.COIN,
                    "RECIPIENT_KEY_TEST",
                    "SENDER_KEY_TEST",
                    10,
                    new Date(),
                ),
                new Transaction(
                    TransactionType.STAKE,
                    "RECIPIENT_KEY_TEST",
                    "SENDER_KEY_TEST",
                    123,
                    new Date(),
                ),
                new Transaction(
                    TransactionType.COIN,
                    "RECIPIENT_KEY_TEST",
                    "SENDER_KEY_TEST",
                    7654,
                    new Date(),
                ),
    ];
};

export const getState = () => {
    return new State(
            "SENDER_KEY_TEST",
        999_999_999,
        10,
    );
};

export const dataAccessLayerMock = {
    async getBlocksByQueryAsync() {
        return getBlock();
    },
    async updateStateAsync() {
        return;
    },
    async getStateAsync() {
        return getState();
    },
} as unknown as DataAccessLayer;

export const objectHasherMock = {
    async hashAsync() {
        return "TEST_PARENT_HASH";
    },
} as unknown as ObjectHasher;
