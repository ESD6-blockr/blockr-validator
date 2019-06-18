import { ITransactionServiceAdapter, TransactionAdapter } from "..";
import { AdapterException } from "../../exceptions/adapter.exception";
import { ValidatorBus } from "../../validators";
import { ICommunicationRepository } from "../communication/repositories/interfaces/communication.repository";
import { IBaseServiceAdapter } from "../interfaces/baseService.adapter";

/**
 * Base adapter
 * @template T 
 */
export abstract class BaseAdapter<T extends IBaseServiceAdapter> {
    protected readonly communicationRepository: ICommunicationRepository;
    private serviceAdapter?: T;
    private validatorBus?: ValidatorBus;

    /**
     * Creates an instance of base adapter.
     * @param communicationRepository 
     * @param [validatorBus] 
     */
    public constructor(communicationRepository: ICommunicationRepository, validatorBus?: ValidatorBus) {
        this.communicationRepository = communicationRepository;
        this.validatorBus = validatorBus;

        this.initOnMessageHandlers();
    }

    /**
     * This function should be called before executing any functions within the adapter itself
     * whenever functions of a service should be executed.
     */
    public setServiceAdapter(serviceAdapter: T): void {
        this.serviceAdapter = serviceAdapter;
    }

    /**
     * Gets service adapter
     * @returns service adapter 
     */
    protected getServiceAdapter(): T {
        if (this.serviceAdapter) {
            return this.serviceAdapter;
        }

        throw new AdapterException("The service adapter is undefined.");
    }

    /**
     * Gets validator bus
     * @returns validator bus 
     */
    protected getValidatorBus(): ValidatorBus {
        if (this.validatorBus) {
            return this.validatorBus;
        }

        throw new AdapterException("The validator bus is undefined.");
    }

    /**
     * This function should initialize all the adapter's receive handlers.
     */
    protected abstract initOnMessageHandlers(): void;
}
