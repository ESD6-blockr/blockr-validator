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
                const statesToUpdate: State[] = [];
                const newStatesToSet: State[] = [];

                for (const transaction of transactions) {
                    let senderState: State | undefined = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.senderKey);
                    let recipientState: State | undefined = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.recipientKey);

                    if (senderState) {
                        senderState = this.calculateUpdatedState(
                            Operator.MINUS,
                            transaction.transactionHeader.amount,
                            transaction.transactionHeader.senderKey,
                            senderState,
                        );

                        statesToUpdate.push(senderState);
                    }

                    const newEmptySenderState = new State(transaction.transactionHeader.senderKey, 0, 0);
                    newStatesToSet.push(newEmptySenderState);

                    if (recipientState) {
                        recipientState = this.calculateUpdatedState(
                            Operator.PLUS,
                            transaction.transactionHeader.amount,
                            transaction.transactionHeader.recipientKey,
                            recipientState,
                        );

                        statesToUpdate.push(recipientState);
                    }

                    const newEmptyRecipientState = new State(transaction.transactionHeader.recipientKey, 0, 0);
                    newStatesToSet.push(newEmptyRecipientState);
                }

                await this.dataAccessLayer.setStatesAsync(newStatesToSet);
                await this.dataAccessLayer.updateStatesAsync(statesToUpdate);

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    private calculateUpdatedState(operator: Operator, amount: number, key: string, state?: State): State {
        if (state) {
            operator === Operator.PLUS
                ? state.amount += amount
                : state.amount -= amount;

            return state;
        }

        return new State(
            key,
            operator === Operator.PLUS
                ? (0 + amount)
                : (0 - amount),
            this.constantStore.DEFAULT_STAKE_AMOUNT,
        );
    }
}

enum Operator {
    PLUS = "+",
    MINUS = "-",
}
