export class AdapterException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, AdapterException.prototype);
    }
}
