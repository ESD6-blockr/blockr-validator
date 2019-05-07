import { ValidationException } from "../../exceptions";

export class ValidationCondition<IModel> {
    public static isNotNullNorUndefined<K>(object: K): boolean {
        const result = (object !== null && object !== undefined);
        return result;
    }

    private condition: (object: IModel) => boolean | Promise<boolean>;
    private errorMessage: string;

    constructor(condition: (object: IModel) => boolean | Promise<boolean>, errorMessage: string) {
        this.condition = condition;
        this.errorMessage = errorMessage;
    }

    public validate(object: IModel) {
        if (this.condition(object)) {
            return true;
        }

        throw new ValidationException(this.errorMessage);
    }
}
