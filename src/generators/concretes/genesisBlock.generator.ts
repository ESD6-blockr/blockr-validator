import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockGeneratorException } from "../../exceptions";
import { ConstantStore } from "../../stores";
import { BlockGenerator } from "../abstractions/block.generator";

@injectable()
export class GenesisBlockGenerator extends BlockGenerator {
    private constantStore: ConstantStore;

    constructor(@inject(ConstantStore) constantStore: ConstantStore) {
        super();

        this.constantStore = constantStore;
    }

    public async generateGenesisBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            if (this.constantStore.ADMIN_PUBLIC_KEY === "") {
                reject(new BlockGeneratorException("Block" +
                " could not be initiated due to a missing public key."));
            }
    
            resolve(await this.generateBlockAsync(
                await this.generateTransactionsAsync(), "",
                this.constantStore.GENESIS_BLOCK_NUMBER, new Date(), this.constantStore.BLOCK_REWARD,
                "", this.constantStore.ADMIN_PUBLIC_KEY));
        });
    }

    private generateTransactionsAsync(): Promise<Set<Transaction>> {
        return new Promise((resolve) => {
            const currentDate = new Date();

            resolve(
                new Set(
                    [
                        new Transaction(TransactionType.COIN, "",
                            this.constantStore.ADMIN_PUBLIC_KEY, this.constantStore.GENESIS_COIN_AMOUNT, currentDate),
                        new Transaction(TransactionType.STAKE, "",
                            this.constantStore.ADMIN_PUBLIC_KEY, this.constantStore.GENESIS_STAKE_AMOUNT, currentDate),
                    ],
                ),
            );
        });
    }
}
