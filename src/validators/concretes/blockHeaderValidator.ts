import { DataAccessLayer } from "@blockr/blockr-data-access";
import { BlockHeader } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ObjectHasher } from "../../utils/security/objectHasher";
import { BaseValidator } from "../abstractions/baseValidator";
import { ValidationCondition } from "./validationCondition";

@injectable()
export class BlockHeaderValidator extends BaseValidator<BlockHeader> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
                        
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getHashValidations());
    }

    private getModelValidations(): Array<ValidationCondition<BlockHeader>> {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader);
            }, "The blockHeader is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.blockHash);
            }, "The blockHeader blockhash is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.blockNumber);
            }, "The blockHeader blocknumber is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.blockReward);
            }, "The blockHeader blockreward is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.parentHash);
            }, "The blockHeader parenthash is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader);
            }, "The blockHeader date is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.validator);
            }, "The blockHeader validator is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader);
            }, "The blockHeader version is null or undefined."),
        ];
    }

    private getHashValidations() {
        return [
            new ValidationCondition(async (blockHeader: BlockHeader): Promise<boolean> => {
                const previousBlock = await this.dataAccessLayer.getBlockAsync(blockHeader.blockNumber - 1);
                return blockHeader.parentHash === previousBlock.blockHeader.blockHash;
            }, "The parenthash of the block is invalid."),
        ];
    }
}
