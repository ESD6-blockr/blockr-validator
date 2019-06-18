import { DataAccessLayer } from "@blockr/blockr-data-access";
import { State, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";

/**
 * Injectable
 */
@injectable()
export class StateService {
    private readonly constantStore: ConstantStore;
    private readonly dataAccessLayer: DataAccessLayer;

    /**
     * Creates an instance of state service.
     * @param constantStore 
     * @param dataAccessLayer 
     */
    constructor(@inject(ConstantStore) constantStore: ConstantStore,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
        this.constantStore = constantStore;
        this.dataAccessLayer = dataAccessLayer;
    }

    /**
     * Initializes genesis state
     * @returns genesis state 
     */
    public async initializeGenesisState(): Promise<void> {
        await this.dataAccessLayer.setStatesAsync([new State(
            this.constantStore.ADMIN_PUBLIC_KEY,
            this.constantStore.GENESIS_COIN_AMOUNT,
            this.constantStore.GENESIS_STAKE_AMOUNT)],
        );
    }
    
    /**
     * Updates states for transactions async
     * @param transactions 
     * @returns states for transactions async 
     */
    public async updateStatesForTransactionsAsync(transactions: Transaction[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                for (const transaction of transactions) {
                    await this.updateStateByKey(
                        transaction.transactionHeader.senderKey,
                        transaction.transactionHeader.amount,
                        Operator.MINUS,
                    );

                    await this.updateStateByKey(
                        transaction.transactionHeader.recipientKey,
                        transaction.transactionHeader.amount,
                        Operator.PLUS,
                    );
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Updates state by key
     * @param key 
     * @param transactionAmount 
     * @param operator 
     * @returns state by key 
     */
    private async updateStateByKey(key: string, transactionAmount: number, operator: Operator): Promise<void> {
        let state: State | undefined = await this.dataAccessLayer.getStateAsync(key);

        if (state) {
            state.amount = this.calculateAmount(operator, state.amount, transactionAmount);

            await this.dataAccessLayer.updateStateAsync(key, state);

            return;
        }
        
        state = new State(key, 0, this.constantStore.DEFAULT_STAKE_AMOUNT);
        state.amount = this.calculateAmount(operator, state.amount, transactionAmount);

        await this.dataAccessLayer.setStatesAsync([state]);
    }
    
    /**
     * Calculates amount
     * @param operator 
     * @param currentAmount 
     * @param transactionAmount 
     * @returns amount 
     */
    private calculateAmount(operator: Operator, currentAmount: number, transactionAmount: number): number {
        return operator === Operator.PLUS
        ? currentAmount += transactionAmount
        : currentAmount -= transactionAmount;
    }
}

/**
 * Mathematical Operator
 */
enum Operator {
    PLUS = "+",
    MINUS = "-",
}
