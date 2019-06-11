import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IKeyServiceAdapter extends IBaseServiceAdapter {
    getAdminKey(): string;
}
