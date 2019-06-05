import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IKeyServiceAdapter extends IBaseServiceAdapter {
    getAdminKeyFromFileAsync(): Promise<string>;
}
