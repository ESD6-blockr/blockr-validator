import { Block, BlockHeader, BlockType, Transaction, TransactionType } from "@blockr/blockr-models";

export const getBlock = () => {
    return new Block(
        new BlockHeader(
            "1.0.0",
            1,
            new Date(),
            10,
        ),
        new Set(),
        BlockType.GENESIS,
    );
};

export const getTransactions = () => {
    return new Set().add(
        new Transaction(
            TransactionType.COIN,
            "RECIPIENT_KEY_TEST",
            "SENDER_KEY_TEST",
            10,
            new Date(),
        ),
    );
};
