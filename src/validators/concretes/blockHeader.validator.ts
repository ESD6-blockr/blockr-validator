import { DataAccessLayer } from "@blockr/blockr-data-access";
import { BlockHeader } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { ObjectHasher } from "../../utils/security/objectHasher.util";
import { BaseValidator } from "../abstractions/base.validator";
import { ValidationCondition } from "./validation.condition";

@injectable()
export class BlockHeaderValidator extends BaseValidator<BlockHeader> {
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher) {
                        
        super(dataAccessLayer, objectHasher);
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getValidatorVersionValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getBlockNumberValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getDateValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getBlockRewardValidations());
        this.validationConditions.push.apply(this.validationConditions, this.getHashValidations());
    }

    private getModelValidations(): Array<ValidationCondition<BlockHeader>> {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader);
            }, "The blockHeader is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.validatorVersion);
            }, "The blockHeader validator version is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.blockNumber);
            }, "The blockHeader blocknumber is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.validator);
            }, "The blockHeader validator is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.date);
            }, "The blockHeader date is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.blockReward);
            }, "The blockHeader blockreward is null or undefined."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return ValidationCondition.isNotNullNorUndefined(blockHeader.parentHash);
            }, "The blockHeader parenthash is null or undefined."),
        ];
    }

    private getValidatorVersionValidations() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return blockHeader.validatorVersion === "" ? false : true;
            }, "The validator version cannot be a empty string."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return blockHeader.validatorVersion.match(/[a-z]/i) ? false : true;
            }, "The validator version cannot contain alphabetical letters."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return blockHeader.validatorVersion.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/) ? true : false;
            }, "The validator version must be a valid version number."),
        ];
    }

    private getBlockNumberValidations() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockNumber > 0);
            }, "The blocknumber cannot be negative value."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockNumber % 1 === 0);
            }, "The blocknumber cannot be a decimal value."),
        ];
    }

    private getDateValidations() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return new Date(blockHeader.date.toDateString()) < new Date(new Date().toDateString()) ? false : true;
            }, "The date cannot be before today."),
        ];
    }

    private getBlockRewardValidations() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockReward > 0);
            }, "The block reward cannot be negative value."),
        ];
    }

    private getHashValidations() {
        return [
            new ValidationCondition(async (blockHeader: BlockHeader): Promise<boolean> => {
                const previousBlock = await this.dataAccessLayer.getBlockAsync(blockHeader.blockNumber - 1);
                return blockHeader.parentHash === previousBlock.blockHeader.parentHash;
            }, "The parenthash of the block is invalid."),
        ];
    }
}
