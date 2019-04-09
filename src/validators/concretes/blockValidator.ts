import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import Logger from "../../utils/logger";
import { ObjectHasher } from "../../utils/objectHasher";
import { BaseValidator } from "../abstractions/baseValidator";


@injectable()
export class BlockValidator extends BaseValidator<Block> {
    private block: Block | undefined = undefined;

    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
        super(dataAccessLayer);
        
        this.validateIf((block) => block.blockHeader).isNotNull().withFailureMessage("Blockheader is null.");
        this.validateIf((block) => block.blockHeader.blockHash).isEqualTo(
            objectHasher.hash<Block>(this.block)).withFailureMessage("The hash of the block is invalid.");
    }

    public async validateObjectAsync(object: Block): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                Logger.info(`Validating ${object}`);
                this.block = object;
                const result = await this.validateAsync(object);

                result.isValid ? resolve(true) : resolve(false);
            } catch (error) {
                Logger.error(error);

                reject(error);
            }
        });
    }
}
