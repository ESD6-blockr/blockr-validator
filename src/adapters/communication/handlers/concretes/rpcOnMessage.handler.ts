import { UntypedServiceImplementation } from "grpc";
import { IOnMessageHandler } from "../interfaces/onMessage.handler";

/**
 * Rpcon message handler
 */
export class RPCOnMessageHandler implements IOnMessageHandler {
    public readonly implementation: UntypedServiceImplementation;

    /**
     * Creates an instance of rpcon message handler.
     * @param implementation 
     */
    constructor(implementation: UntypedServiceImplementation) {
        this.implementation = implementation;
    }
}
