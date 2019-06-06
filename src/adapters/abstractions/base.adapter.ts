import { AdapterException } from "../../exceptions/adapter.exception";
import { ValidatorBus } from "../../validators";
import { ICommunicationRepository } from "../communication/repositories/interfaces/communication.repository";
import { IBaseServiceAdapter } from "../interfaces/baseService.adapter";

export abstract class BaseAdapter<T extends IBaseServiceAdapter> {
    protected readonly communicationRepository: ICommunicationRepository;
    private serviceAdapter?: T;
    private validatorBus?: ValidatorBus;

    public constructor(communicationRepository: ICommunicationRepository) {
        this.communicationRepository = communicationRepository;

        this.initOnMessageHandlers();
    }

    /**
     * This function should be called before executing any functions within the adapter itself
     * whenever functions of a service should be executed.
     */
    public setServiceAdapter(serviceAdapter: T): void {
        this.serviceAdapter = serviceAdapter;
    }

    protected setValidatorBus(validatorBus: ValidatorBus): void {
        this.validatorBus = validatorBus;
    }

    protected getServiceAdapter(): T {
        if (this.serviceAdapter) {
            return this.serviceAdapter;
        }

        throw new AdapterException("The service adapter is undefined.");
    }

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
