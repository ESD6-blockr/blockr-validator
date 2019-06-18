export class KeyPairGenerationException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, KeyPairGenerationException.prototype);
    }
}
