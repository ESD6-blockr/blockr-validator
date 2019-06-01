import { Peer } from "@blockr/blockr-p2p-lib";
import { AdapterException } from "../../exceptions/adapter.exception";
import { IBaseServiceAdapter } from "../interfaces/base.adapter";

export abstract class BaseAdapter<T extends IBaseServiceAdapter> {
    protected readonly peer: Peer;
    private serviceAdapter?: T;

    public constructor(peer: Peer) {
        this.peer = peer;

        this.initReceiveHandlers();
    }

    /**
     * This function should be called before executing any functions within the adapter itself.
     */
    public setServiceAdapter(serviceAdapter: T): void {
        this.serviceAdapter = serviceAdapter;
    }

    protected getServiceAdapter(): T {
        if (this.serviceAdapter) {
            return this.serviceAdapter;
        }

        throw new AdapterException("The service adapter is undefined.");
    }

    /**
     * This function should initialize all the adapter's receive handlers.
     */
    protected abstract initReceiveHandlers(): void;
}
