import { Peer } from "@blockr/blockr-p2p-lib";
import { IBaseServiceAdapter } from "../interfaces/base.adapter";

export abstract class BaseAdapter<T extends IBaseServiceAdapter> {
    protected readonly peer: Peer;
    protected adapter?: T;

    public constructor(peer: Peer) {
        this.peer = peer;
    }

    public setAdapter(adapter: T): void {
        this.adapter = adapter;
    }
}
