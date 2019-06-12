import { DataAccessLayer } from "@blockr/blockr-data-access";
import { State, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ConstantStore } from "../../stores";
import { stat } from "fs";

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
                    const statesToUpdate: Set<State> = new Set();
                    const newStatesToSet: Set<State> = new Set();

                    const senderState: State | undefined = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.senderKey);
                    const recipientState: State | undefined = await this.dataAccessLayer
                        .getStateAsync(transaction.transactionHeader.recipientKey);

                    senderState !== undefined
                        ? statesToUpdate.add(this.calculateUpdatedState(
                            Operator.MINUS,
                            transaction.transactionHeader.amount,
                            transaction.transactionHeader.senderKey,
                            senderState,
                        ))
                        : newStatesToSet.add(new State(transaction.transactionHeader.senderKey, 0, 0));

                    recipientState !== undefined
                        ? statesToUpdate.add(this.calculateUpdatedState(
                            Operator.PLUS,
                            transaction.transactionHeader.amount,
                            transaction.transactionHeader.recipientKey,
                            recipientState,
                        ))
                        : newStatesToSet.add(new State(transaction.transactionHeader.recipientKey, 0, 0));

                    if (newStatesToSet.size > 0) {
                        await this.dataAccessLayer.setStatesAsync(Array.from(newStatesToSet));
                    }

                    if (statesToUpdate.size > 0) {
                        await this.dataAccessLayer.updateStatesAsync(Array.from(statesToUpdate));
                    }

                    newStatesToSet.clear();
                    statesToUpdate.clear();
                }

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
