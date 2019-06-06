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
    
    public async updateStatesForTransactionsAsync(transactions: Transaction[]): Promise<State[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const states: State[] = [];

                for (const transaction of transactions) {
                    let senderState = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.senderKey);
                    let recipientState = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.recipientKey);

                    senderState = this.updateStateAmount(
                        Operator.MINUS,
                        transaction.transactionHeader.amount,
                        transaction.transactionHeader.senderKey,
                        senderState,
                    );

                    recipientState = this.updateStateAmount(
                        Operator.PLUS,
                        transaction.transactionHeader.amount,
                        transaction.transactionHeader.recipientKey,
                        recipientState,
                    );

                    states.push(senderState);
                    states.push(recipientState);
                }

                resolve(states);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    private updateStateAmount(operator: Operator, amount: number, key: string, state?: State): State {
        if (state) {
            operator === "+"
                ? state.amount += amount
                : state.amount -= amount;

            return state;
        }

        return new State(
            key,
            operator === "+"
                ? 0 + amount
                : 0 - amount,
            this.constantStore.DEFAULT_STAKE_AMOUNT,
        );
    }
}

enum Operator {
    PLUS = "+",
    MINUS = "-",
}
