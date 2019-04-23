import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "..";
import { ObjectHasher } from "../../utils/security/objectHasher";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class TransactionValidator extends BaseValidator<Transaction> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
            
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelConditions());
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
                return ValidationCondition.isNotNullNorUndefined(transaction.blockHash);
            }, "The transaction blockhash is null or undefined."),
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
}
