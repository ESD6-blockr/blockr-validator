import { Block } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IProposedBlockServiceAdapter extends IBaseServiceAdapter {
    addProposedBlockAsync(proposedBlock: Block): Promise<void>;
}
