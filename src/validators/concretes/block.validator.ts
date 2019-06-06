import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, BlockHeader, BlockType, Transaction } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { BlockHeaderValidator, IValidator } from "..";
import { ConstantStore } from "../../stores";
import { BaseValidator } from "../abstractions/base.validator";
import { TransactionValidator } from "./transaction.validator";
import { ValidationCondition } from "./validation.condition";

@injectable()
export class BlockValidator extends BaseValidator<Block> {
    private readonly constantStore: ConstantStore;
    private readonly blockHeaderValidator: IValidator<BlockHeader>;
    private readonly transactionValidator: IValidator<Transaction>;
    
    constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
                @inject(ObjectHasher) objectHasher: ObjectHasher,
                @inject(ConstantStore) constantStore: ConstantStore,
                @inject(BlockHeaderValidator) blockHeaderValidator: IValidator<BlockHeader>,
                @inject(TransactionValidator) transactionValidator: IValidator<Transaction>) {
        super(dataAccessLayer, objectHasher);

        this.constantStore = constantStore;
        this.blockHeaderValidator = blockHeaderValidator;
        this.transactionValidator = transactionValidator;
    }

    public async validateObjectAsync(block: Block): Promise<[Block, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                await super.everyConditionIsValidAsync(block, this.validationConditions);
        
                await this.blockHeaderValidator.validateObjectAsync(block.blockHeader);
        
                for (const transaction of block.transactions) {
                   await this.transactionValidator.validateObjectAsync(transaction);
                }
            
                resolve([block, true]);
            } catch (error) {
                reject(error);
            }
        });
    }

    protected initConditions(): void {
        this.validationConditions.push.apply(this.validationConditions, this.getModelConditions());
        this.validationConditions.push.apply(this.validationConditions, this.getBlockConditions());
    }

    private getModelConditions(): Array<ValidationCondition<Block>> {
        return [
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block);
            }, "The block is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader);
            }, "The block header is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockType);
            }, "The block type is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.transactions);
            }, "The block transactions is null or undefined."),
        ];
    }

    private getBlockConditions(): Array<ValidationCondition<Block>> {
        return [
            new ValidationCondition((block: Block): boolean => {
                const isGenesisCondition = block.blockHeader.validator === this.constantStore.ADMIN_PUBLIC_KEY &&
                    block.blockType === BlockType.GENESIS;

                const isRegularCondition = block.blockHeader.validator !== this.constantStore.ADMIN_PUBLIC_KEY &&
                    block.blockType === BlockType.REGULAR;

                return isGenesisCondition || isRegularCondition;
            }, "The block type is incorrect."),
        ];
    }
}
