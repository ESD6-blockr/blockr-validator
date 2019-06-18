import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader, BlockType, Transaction, TransactionHeader, TransactionType } from "@blockr/blockr-models";

const blockChain = [
    new Block(
        BlockType.REGULAR,
        new BlockHeader(
            "1.0.0",
            1,
            new Date(),
            10,
        ),
        [
            new Transaction(
                TransactionType.COIN,
                new TransactionHeader(
                    "RECIPIENT_KEY_TEST",
                    "SENDER_KEY_TEST",
                    10,
                    new Date(),
                ),
                "FAKE_SIGNATURE",
            ),
        ],
    ),
];

export const getDataAccessLayerWithoutBlockchain = () => {
    return {
        getBlockchainAsync() {
            return [];
        },
    } as unknown as DataAccessLayer;
};

export const getDataAccessLayerWithBlockchain = () => {
    return {
        getBlockchainAsync() {
            return blockChain;
        },
    } as unknown as DataAccessLayer;
};

export const delay = (ms: number) => {
    return new Promise( (resolve) => setTimeout(resolve, ms) );
};
