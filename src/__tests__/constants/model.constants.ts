import { CryptoKeyUtil, ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader, BlockType, State } from "@blockr/blockr-models";
import { Transaction, TransactionHeader, TransactionType } from "@blockr/blockr-models";

export const getBlock = () => {
    return new Block(
        BlockType.GENESIS,
        new BlockHeader(
            "1.0.0",
            1,
            new Date(),
            10,
        ),
        [],
    );
};

export const getBlockHeader = (version: string, blockNumber: number, reward: number) => {
    const blockHeader = new BlockHeader(version, blockNumber, new Date(), reward);
    blockHeader.validator = "TEST_VALIDATOR";
    blockHeader.parentHash = "TEST_PARENT_HASH";

    return blockHeader;
};

export const getTransaction = (type: TransactionType, amount: number) => {
    return new Transaction(
        type,
        new TransactionHeader(
            "RECIPIENT_KEY_TEST",
            "SENDER_KEY_TEST",
            amount,
            new Date(),
        ),
        "FAKE_SIGNATURE",
    );
};


export const getTransactions = () => {
    return [
        getTransaction(TransactionType.COIN, 10),
        getTransaction(TransactionType.COIN, 32131),
        getTransaction(TransactionType.COIN, 56432),
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

export const cryptoKeyUtilMock = {
    async verifyKeyPair() {
        return "PUBLIC_KEY_TEST";
    },
    createSignatureWithKeyPair() {
        return "SIGNATURE";
    },
} as unknown as CryptoKeyUtil;
