import { Block, State } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IBlockchainServiceAdapter extends IBaseServiceAdapter {
    getBlockchainAsync(): Promise<Block[]>;
    getStatesAsync(): Promise<State[]>;
}
