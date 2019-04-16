import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "..";
import { ObjectHasher } from "../../utils/objectHasher";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class BlockValidator extends BaseValidator<Block> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
            
        super(dataAccessLayer, objectHasher);
    }
    
    protected initConditions(): void {
        throw new Error("Implement me");
    }
}
