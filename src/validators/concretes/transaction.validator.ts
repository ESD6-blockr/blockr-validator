import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Transaction, TransactionHeader, TransactionType } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator, IValidator } from "..";
import { ConstantStore } from "../../stores";
import { TransactionHeaderValidator } from "./transactionHeader.validator";
import { ValidationCondition } from "./validation.condition";

@injectable()
export class TransactionValidator extends BaseValidator<Transaction> {
    private readonly constantStore: ConstantStore;
    private readonly transactionHeaderValidator: IValidator<TransactionHeader>;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher,
                @inject(ConstantStore) constantStore: ConstantStore,
                @inject(TransactionHeaderValidator) transactionHeaderValidator: IValidator<TransactionHeader>) {
            
        super(dataAccessLayer, objectHasher);

        this.constantStore = constantStore;
        this.transactionHeaderValidator = transactionHeaderValidator;
    }

    public async validateObjectAsync(transaction: Transaction): Promise<[Transaction, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                await super.everyConditionIsValidAsync(transaction, this.validationConditions);
                
                await this.transactionHeaderValidator.validateObjectAsync(transaction.transactionHeader);
            
                resolve([transaction, true]);
            } catch (error) {
                reject(error);
            }
        });
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getMiscellaneousConditions());
    }

    private getModelConditions(): Array<ValidationCondition<Transaction>> {
        return [
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.type);
            }, "The transaction type is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction);
            }, "The transaction is null or undefined."),
            new ValidationCondition((transaction: Transaction): boolean => {
                return ValidationCondition.isNotNullNorUndefined(transaction.signature);
            }, "The transaction signature is null or undefined."),
        ];
    }

    private getMiscellaneousConditions(): Array<ValidationCondition<Transaction>> {
        return [
            new ValidationCondition((transaction: Transaction): boolean => {
                if (transaction.type === TransactionType.STAKE) {
                    return transaction.transactionHeader.senderKey === this.constantStore.ADMIN_PUBLIC_KEY;
                }
                return true;
            }, `The sender of the transaction is not an admin, which is required for this type of transaction.`),
        ];
    }
}
