import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "../abstractions/baseValidator";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class BlockValidator extends BaseValidator<Block> {

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
        super(dataAccessLayer);

        this.initConditions();
    }

    private initConditions() {
        this.validationConditions.push(
            new ValidationCondition((block: Block): boolean => {
                return block !== null && block.blockHeader !== null;
            }, "The block or blockHeader is null."),
        );
    }
}
