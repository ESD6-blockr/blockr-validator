import { Block } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IBlockServiceAdapter extends IBaseServiceAdapter {
    addProposedBlockAsync(proposedBlock: Block): Promise<void>;
    addVictoriousBlockAsync(victoriousBlock: Block): Promise<void>;
}
