import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { IValidator } from "../interfaces/validator";
import { BlockHeaderValidator } from "./blockHeaderValidator";
import { TransactionValidator } from "./transactionValidator";

@injectable()
export class ValidatorBus {

    constructor(@inject(BlockHeaderValidator) blockHeaderValidator: IValidator<BlockHeader>,
                @inject(TransactionValidator) transactionValidator: IValidator<Transaction>) {
        // TODO assign validators
    }

    public validateAsync(): Promise<boolean> {
        // TODO execute validators
        throw new Error("implement me");
    }
 }
