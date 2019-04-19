import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockGeneratorException } from "../../exceptions/blockGeneratorException";
import { ObjectSigner } from "../../utils";
import { BlockGenerator } from "../abstractions/blockGenerator";

/* The maximum amount of coins within the blockchain */
const GENESIS_COIN_AMOUNT: number = 900_000_000;
/* The maximum amount of coins within the blockchain */
const GENESIS_STAKE_AMOUNT: number = 1;
/* The public key of the admin wallet */
const RECIPIENT_PUBLIC_KEY: string = process.env.PUBLIC_KEY ? process.env.PUBLIC_KEY : "";
/* Genesis block reward */
const BLOCK_REWARD: number = 10;
/* Gensis block number */
const BLOCK_NUMBER: number = 1;

@injectable()
export class GenesisBlockGenerator extends BlockGenerator {
    constructor(@inject(ObjectSigner) objectSigner: ObjectSigner) {
        super(objectSigner);
    }

    public async generateGenesisBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            if (RECIPIENT_PUBLIC_KEY === "") {
                reject(new BlockGeneratorException("Block" +
                " could not be initiated due to a missing public key."));
            }
    
            resolve(await this.generateBlockAsync(
                await this.generateTransactionsAsync(), "", BLOCK_NUMBER, new Date(), BLOCK_REWARD, ""));
        });
    }

    private generateTransactionsAsync(): Promise<Transaction[]> {
        return new Promise((resolve) => {
            const currentDate = new Date();

            resolve(
                [
                    new Transaction(TransactionType.COIN, "", RECIPIENT_PUBLIC_KEY, GENESIS_COIN_AMOUNT, currentDate),
                    new Transaction(TransactionType.STAKE, "", RECIPIENT_PUBLIC_KEY, GENESIS_STAKE_AMOUNT, currentDate),
                ],
            );
        });
    }
}
