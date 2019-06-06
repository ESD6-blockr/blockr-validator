import { Block } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IBlockServiceAdapter extends IBaseServiceAdapter {
    addPendingProposedBlockAsync(proposedBlock: Block): Promise<void>;
}
