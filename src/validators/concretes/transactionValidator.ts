import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "..";
import { ObjectHasher } from "../../utils/objectHasher";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class TransactionValidator extends BaseValidator<Transaction> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
            
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.concat(
            this.getModelConditions(),
        );
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
                return ValidationCondition.isNotNullNorUndefined(transaction.recipient);
            }, "The transaction recipient is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.sender);
            }, "The transaction sender is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.signature);
            }, "The transaction signature is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.timestamp);
            }, "The transaction timestamp is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.type);
            }, "The transaction type is null or undefined."),
        ];
    }
}
