import { UntypedServiceImplementation } from "grpc";
import { IOnMessageHandler } from "../interfaces/onMessage.handler";

export class RPCOnMessageHandler implements IOnMessageHandler {
    public readonly implementation: UntypedServiceImplementation;

    constructor(implementation: UntypedServiceImplementation) {
        this.implementation = implementation;
    }
}
