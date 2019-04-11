import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ObjectHasher } from "../../utils/objectHasher";
import { BaseValidator } from "../abstractions/baseValidator";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class BlockValidator extends BaseValidator<Block> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.push(
            new ValidationCondition((block: Block): boolean => {
                return block !== null && block.blockHeader !== null;
            }, "The block or blockHeader is null."),
            new ValidationCondition((block: Block): boolean => {
                return block.blockHeader.blockHash === this.objectHasher.hash(block);
            }, "The hash of the block is incorect."),
        );
    }
}
