import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BaseValidator } from "../abstractions/base.validator";
import { ValidationCondition } from "./validation.condition";

/**
 * Injectable
 */
@injectable()
export class BlockHeaderValidator extends BaseValidator<BlockHeader> {
    /**
     * Creates an instance of block header validator.
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
        this.validationConditions.push.apply(this.validationConditions, this.getValidatorVersionConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getBlockNumberConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getDateConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getBlockRewardConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getHashConditions());
    }

    /**
     * Gets model conditions
     * @returns model conditions 
     */
    private getModelConditions(): Array<ValidationCondition<BlockHeader>> {
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

    /**
     * Gets validator version conditions
     * @returns  
     */
    private getValidatorVersionConditions() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return blockHeader.validatorVersion !== "";
            }, "The validator version cannot be a empty string."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                const regexExpresion = new RegExp(/[a-z]/i);
                return !regexExpresion.test(blockHeader.validatorVersion);
            }, "The validator version cannot contain alphabetical letters."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                const regexExpresion = new RegExp(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
                return regexExpresion.test(blockHeader.validatorVersion);
            }, "The validator version must be a valid version number."),
        ];
    }

    /**
     * Gets block number conditions
     * @returns  
     */
    private getBlockNumberConditions() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockNumber > 0);
            }, "The blocknumber cannot be negative value."),
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockNumber % 1 === 0);
            }, "The blocknumber cannot be a decimal value."),
        ];
    }

    /**
     * Gets date conditions
     * @returns  
     */
    private getDateConditions() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return !(new Date(blockHeader.date.toDateString()) < new Date(new Date().toDateString()));
            }, "The date cannot be before today."),
        ];
    }

    /**
     * Gets block reward conditions
     * @returns  
     */
    private getBlockRewardConditions() {
        return [
            new ValidationCondition((blockHeader: BlockHeader): boolean => {
                return (blockHeader.blockReward > 0);
            }, "The block reward cannot be negative value."),
        ];
    }

    /**
     * Gets hash conditions
     * @returns  
     */
    private getHashConditions() {
        return [
            new ValidationCondition(async (blockHeader: BlockHeader): Promise<boolean> => {
                return new Promise(async (resolve) => {
                    const previousBlock = (await this.dataAccessLayer
                        .getBlocksByQueryAsync({ "blockHeader.blockNumber": blockHeader.blockNumber - 1 }))[0];
                    
                    const parentHash: string = await this.objectHasher.hashAsync(this.getHashableBlock(previousBlock));

                    resolve(blockHeader.parentHash === parentHash);
                });
            }, "The parenthash of the block is invalid."),
        ];
    }

    /**
     * Gets hashable block
     * @param block 
     * @returns hashable block 
     */
    private getHashableBlock(block: Block): object {
        return {
            header: block.blockHeader,
            transactions: block.transactions,
        };
    }
}
