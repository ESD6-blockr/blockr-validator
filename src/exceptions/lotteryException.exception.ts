export class LotteryException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, LotteryException.prototype);
    }
}
