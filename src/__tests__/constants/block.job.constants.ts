import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader, Transaction, TransactionType } from "@blockr/blockr-models";
import { FileUtils } from "../../utils/file.util";

export const getFileUtilWithKeyFile = () => {
    return {
        fileExistsAsync(path: string) {
            if (!path) {
                return true;
            }
            return false;
        },
        readFileAsync() {
            return "FILE";
        },
    } as unknown as FileUtils;
};

export const getFileUtilWithoutKeyFile = () => {
    return {
        appendStringInFileAsync() {
            return;
        },
    } as unknown as FileUtils;
};

const blockChain = [
    new Block(
        new BlockHeader(
            "1.0.0",
            1,
            new Date(),
            10,
        ),
        new Set().add(
            new Transaction(
                TransactionType.COIN,
                "RECIPIENT_KEY_TEST",
                "SENDER_KEY_TEST",
                10,
                new Date(),
            ),
        ),
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
