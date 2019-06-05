import { IMessageSendingHandler } from "../../handlers/interfaces/messageSending.handler";
import { IOnMessageHandler } from "../../handlers/interfaces/onMessage.handler";

export interface ICommunicationRepository {

    /**
     * Adds an onMessage handler.
     * @param onMessageHandler The implementation of the onMessage handler.
     */
    addOnMessageHandler(onMessageHandler: IOnMessageHandler): void;

    /**
     * Asynchronously sends a message to a random Node for the given message sending handler implementation.
     * @param messageSendingHandler The implementation of the messageSending handler.
     */
    sendMessageToRandomNodeAsync?(messageSendingHandler: IMessageSendingHandler): Promise<void>;
}
