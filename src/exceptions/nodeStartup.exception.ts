export class NodeStartupException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, NodeStartupException.prototype);
    }
}
