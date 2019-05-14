export class BlockGeneratorException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, BlockGeneratorException.prototype);
    }
}
