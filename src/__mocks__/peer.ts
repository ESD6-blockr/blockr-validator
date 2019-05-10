import { Message } from "./message.model";

/**
 * This class is being used as a mock and will be replaced by the P2P library.
 */
export interface IPeerMock {
    registerReceiveHandlerImpl(messageType: string, implementation: (message: Message, senderIp: string) => void): void;

    sendMessage(messageType: string, destinationIp: string, body?: string): void;
    
    broadcastMessage(messageType: string, body?: string): void;
}
