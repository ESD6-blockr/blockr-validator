import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { State, TransactionHeader } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "../abstractions/base.validator";
import { ValidationCondition } from "./validation.condition";

/**
 * Injectable
 */
@injectable()
export class TransactionHeaderValidator extends BaseValidator<TransactionHeader> {
    /**
     * Creates an instance of transaction header validator.
     * @param dataAccessLayer 
     * @param objectHasher 
     */
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
        super(dataAccessLayer, objectHasher);
    }

    /**
     * Inits conditions
     */
    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getAmountConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getMiscellaneousConditions());
    }

    /**
     * Gets model conditions
     * @returns model conditions 
     */
    private getModelConditions(): Array<ValidationCondition<TransactionHeader>> {
        return [
            new ValidationCondition((transactionHeader: TransactionHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transactionHeader.amount);
            }, "The transaction amount is null or undefined."),
            new ValidationCondition((transactionHeader: TransactionHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transactionHeader.recipientKey);
            }, "The transaction recipientKey is null or undefined."),
            new ValidationCondition((transactionHeader: TransactionHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transactionHeader.senderKey);
            }, "The transaction senderKey is null or undefined."),
            new ValidationCondition((transactionHeader: TransactionHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transactionHeader.date);
            }, "The transaction date is null or undefined."),
        ];
    }

    /**
     * Gets amount conditions
     * @returns amount conditions 
     */
    private getAmountConditions(): Array<ValidationCondition<TransactionHeader>> {
        return [
            new ValidationCondition((transactionHeader: TransactionHeader): boolean => {
                return (transactionHeader.amount > 0);
            }, "The transaction amount cannot be a negative value."),
        ];
    }

    /**
     * Gets miscellaneous conditions
     * @returns miscellaneous conditions 
     */
    private getMiscellaneousConditions(): Array<ValidationCondition<TransactionHeader>> {
        return [
            new ValidationCondition(async (transactionHeader: TransactionHeader): Promise<boolean> => {
                return new Promise(async (resolve) => {
                    const senderCurrentState: State = (await this.dataAccessLayer
                        .getStateAsync(transactionHeader.senderKey) as State);

                    const senderCurrentCoinAmount = senderCurrentState.amount;

                    resolve(senderCurrentCoinAmount >= transactionHeader.amount);
                });
            }, "The sender does not have sufficient funds."),
        ];
    }
}
