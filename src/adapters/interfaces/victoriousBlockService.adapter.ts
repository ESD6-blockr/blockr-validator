import { Block } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IVictoriousBlockServiceAdapter extends IBaseServiceAdapter {
    addVictoriousBlockAsync(victoriousBlock: Block): Promise<void>;
}
