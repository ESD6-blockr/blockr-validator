import { IModel } from "@blockr/blockr-models";

/**
 * Generic validator interface
 * @type {IModel} type of object to be validated
 */
export interface IValidator<T extends IModel> {
    /**
     * Validate object of given type asynchronous
     * @param object object to validate
     */
    validateObjectAsync(object: T): Promise<[T, boolean]>;
}
