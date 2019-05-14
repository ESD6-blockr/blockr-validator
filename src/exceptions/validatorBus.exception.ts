export class ValidatorBusException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, ValidatorBusException.prototype);
    }
}
