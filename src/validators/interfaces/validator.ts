/**
 * Generic validator interface
 * @type {T} type of object to be validated
 */
export interface IValidator<IModel> {
    /**
     * Validate object of given type asynchronous
     * @param object object to validate
     */
    validateObjectAsync(object: IModel): Promise<[IModel, boolean]>;
}
