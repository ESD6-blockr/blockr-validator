import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, Transaction } from "@blockr/blockr-models";
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
        this.validationConditions.concat(
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block);
            }, "The block is null or undefined."),

            this.getBlockHeaderConditions(),
            this.getBlockTransactionConditions(),
            this.getHashConditions(),
        );
    }

    private getBlockHeaderConditions(): Array<ValidationCondition<Block>> {
        return [
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader);
            }, "The blockHeader is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.blockHash);
            }, "The blockHeader blockhash is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.blockNumber);
            }, "The blockHeader blocknumber is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.blockReward);
            }, "The blockHeader blockreward is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.parentHash);
            }, "The blockHeader parenthash is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.timestamp);
            }, "The blockHeader timestamp is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.validator);
            }, "The blockHeader validator is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.blockHeader.version);
            }, "The blockHeader version is null or undefined."),
        ];
    }

    private getBlockTransactionConditions(): Array<ValidationCondition<Block>> {
        return [
            new ValidationCondition((block: Block): boolean => {
                return ValidationCondition.isNotNullNorUndefined(block.transactions);
            }, "The block transaction is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.amount);
                });
            }, "The block transaction amount is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.blockHash);
                });
            }, "The block transaction blockhash is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.recipient);
                });
            }, "The block transaction recipient is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.sender);
                });
            }, "The block transaction sender is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.signature);
                });
            }, "The block transaction signature is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.timestamp);
                });
            }, "The block transaction timestamp is null or undefined."),
            new ValidationCondition((block: Block): boolean => {
                return block.transactions.every((transaction: Transaction): boolean => {
                    return ValidationCondition.isNotNullNorUndefined(transaction.type);
                });
            }, "The block transaction type is null or undefined."),
        ];
    }

    private getHashConditions(): Array<ValidationCondition<Block>> {
        return [
            new ValidationCondition((block: Block): boolean => {
                return block.blockHeader.blockHash === this.objectHasher.hash(block);
            }, "The hash of the block is incorect."),
            new ValidationCondition(async (block: Block): Promise<boolean> => {
                const previousBlock = await this.dataAccessLayer.getBlockAsync(block.blockHeader.blockNumber - 1);
                return block.blockHeader.parentHash === previousBlock.blockHeader.blockHash;
            }, "The parenthash of the block is invalid."),
        ];
    }
}
