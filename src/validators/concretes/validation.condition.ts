import { ValidationException } from "../../exceptions";

export class ValidationCondition<IModel> {
    public static isNotNullNorUndefined<K>(object: K): boolean {
        return !(object === null || object === undefined);
    }

    private readonly condition: (object: IModel) => boolean | Promise<boolean>;
    private readonly errorMessage: string;

    constructor(condition: (object: IModel) => boolean | Promise<boolean>, errorMessage: string) {
        this.condition = condition;
        this.errorMessage = errorMessage;
    }

    public async validateAsync(object: IModel): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (await this.condition(object)) {
                resolve(true);
            }
    
            reject(new ValidationException(this.errorMessage));
        });
    }
}
