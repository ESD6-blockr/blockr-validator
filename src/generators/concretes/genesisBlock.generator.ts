import { CryptoKeyUtil, ObjectHasher } from "@blockr/blockr-crypto";
import { Block, Transaction, TransactionHeader, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockGeneratorException } from "../../exceptions";
import { ConstantStore } from "../../stores";
import { BlockGenerator } from "../abstractions/block.generator";

@injectable()
export class GenesisBlockGenerator extends BlockGenerator {
    private readonly constantStore: ConstantStore;
    private readonly objectHasher: ObjectHasher;
    private readonly cryptoKeyUtil: CryptoKeyUtil;

    constructor(@inject(ConstantStore) constantStore: ConstantStore,
                @inject(ObjectHasher) objectHasher: ObjectHasher,
                @inject(CryptoKeyUtil) cryptoKeyUtil: CryptoKeyUtil) {
        super();

        this.constantStore = constantStore;
        this.objectHasher = objectHasher;
        this.cryptoKeyUtil = cryptoKeyUtil;
    }

    public async generateGenesisBlockAsync(): Promise<Block> {
        return new Promise(async (resolve, reject) => {
            if (this.constantStore.ADMIN_PUBLIC_KEY === "") {
                reject(new BlockGeneratorException("Block" +
                " could not be initiated due to a missing public key."));
            }
    
            resolve(await this.generateBlockAsync(
                await this.generateTransactionsAsync(), "",
                this.constantStore.GENESIS_BLOCK_NUMBER, new Date(), this.constantStore.BLOCK_REWARD_AMOUNT,
                "", this.constantStore.ADMIN_PUBLIC_KEY));
        });
    }

    private async generateTransactionsAsync(): Promise<Transaction[]> {
        return new Promise(async (resolve) => {
            const currentDate = new Date();
           
            const transactions = [
                await this.createAndSignTransactionAsync(
                    TransactionType.COIN,
                    this.constantStore.GENESIS_COIN_AMOUNT,
                    currentDate),
                await this.createAndSignTransactionAsync(
                    TransactionType.STAKE,
                    this.constantStore.GENESIS_STAKE_AMOUNT,
                    currentDate),
            ];

            resolve(transactions);
        });
    }

    private async createAndSignTransactionAsync(type: TransactionType,
                                                amount: number, date: Date): Promise<Transaction> {
        const transactionHeader = new TransactionHeader(
            this.constantStore.ADMIN_PUBLIC_KEY,
            this.constantStore.ADMIN_PUBLIC_KEY,
            amount,
            date,
        );

        const keyPair = await this.cryptoKeyUtil.verifyKeyPair(
            this.constantStore.ADMIN_PUBLIC_KEY,
            this.constantStore.ADMIN_PRIVATE_KEY,
        );

        const signature = this.cryptoKeyUtil.createSignatureWithKeyPair(
            await this.objectHasher.hashAsync(transactionHeader),
            keyPair,
        );

        return new Transaction(type, transactionHeader, signature);
    }
}
