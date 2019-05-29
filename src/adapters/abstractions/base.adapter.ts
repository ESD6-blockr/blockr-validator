import { Peer } from "@blockr/blockr-p2p-lib";
import { AdapterException } from "../../exceptions/adapter.exception";
import { IBaseServiceAdapter } from "../interfaces/base.adapter";

export abstract class BaseAdapter<T extends IBaseServiceAdapter> {
    protected readonly peer: Peer;
    private adapter?: T;

    public constructor(peer: Peer) {
        this.peer = peer;
    }

    /**
     * This function should be called before executing any functions within the adapter itself.
     */
    public setAdapter(adapter: T): void {
        this.adapter = adapter;
    }

    protected getAdapter(): T {
        if (this.adapter) {
            return this.adapter;
        }

        throw new AdapterException("The adapter is undefined.");
    }
}
