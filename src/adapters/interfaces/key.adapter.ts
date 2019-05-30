import { IBaseServiceAdapter } from "./base.adapter";

export interface IKeyServiceAdapter extends IBaseServiceAdapter {
    getAdminKeyFromFileAsync(): Promise<string>;
}
