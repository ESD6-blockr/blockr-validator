import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { State, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "..";
import { ValidationCondition } from "./validation.condition";

@injectable()
export class TransactionValidator extends BaseValidator<Transaction> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
            
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getAmountConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getMiscellaneousConditions());
    }

    private getModelConditions(): Array<ValidationCondition<Transaction>> {
        return [
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction);
            }, "The transaction is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.amount);
            }, "The transaction amount is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.recipientKey);
            }, "The transaction recipientKey is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.senderKey);
            }, "The transaction senderKey is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.signature);
            }, "The transaction signature is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction);
            }, "The transaction date is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.type);
            }, "The transaction type is null or undefined."),
        ];
    }

    private getAmountConditions(): Array<ValidationCondition<Transaction>> {
        return [
            new ValidationCondition((transaction: Transaction): boolean => {
                return (transaction.amount > 0);
            }, "The transaction amount cannot be a negative value."),
        ];
    }

    private getMiscellaneousConditions(): Array<ValidationCondition<Transaction>> {
        return [
            new ValidationCondition(async (transaction: Transaction): Promise<boolean> => {
                return new Promise(async (resolve) => {
                    const senderCurrentState: State = await this.dataAccessLayer
                                                                            .getStateAsync(transaction.senderKey);
                    const senderCurrentCoinAmount = senderCurrentState.coin;

                    resolve(senderCurrentCoinAmount >= transaction.amount);
                });
            }, "The sender does not have sufficient funds."),
        ];
    }
}
