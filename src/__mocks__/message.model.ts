/**
 * Message model.
 */

/**
 * This class is being used as a mock and will be replaced by the P2P library.
 */
export class Message {
    public type: string;
    public date: Date;
    public originalSenderId?: string;
    public body?: string;

    constructor(type: string, originalSenderId?: string, body?: string) {
        this.type = type;
        this.date = new Date();
        this.originalSenderId = originalSenderId;
        this.body = body;
    }
}
