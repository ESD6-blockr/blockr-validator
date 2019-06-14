import { DataAccessLayer } from "@blockr/blockr-data-access";
import { State, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";

@injectable()
export class StateService {
    private readonly constantStore: ConstantStore;
    private readonly dataAccessLayer: DataAccessLayer;

    constructor(@inject(ConstantStore) constantStore: ConstantStore,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
        this.constantStore = constantStore;
        this.dataAccessLayer = dataAccessLayer;
    }
    
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
    
    private calculateAmount(operator: Operator, currentAmount: number, transactionAmount: number): number {
        return operator === Operator.PLUS
        ? currentAmount += transactionAmount
        : currentAmount -= transactionAmount;
    }
}

enum Operator {
    PLUS = "+",
    MINUS = "-",
}
