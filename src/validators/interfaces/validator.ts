/**
 * Generic validator interface
 * @type {T} type of object to be validated
 */
export interface IValidator<T> {
    /**
     * Validate object of given type asynchronous
     * @param object object to validate
     */
    validateObjectAsync(object: T): Promise<boolean>;
}
