import { ValidationException } from "../../exceptions";

export class ValidationCondition<T> {

    private condition: (object: T) => boolean;
    private errorMessage: string;

    constructor(condition: (object: T) => boolean, errorMessage: string) {
        this.condition = condition;
        this.errorMessage = errorMessage;
    }

    public validate(object: T) {
        if (this.condition(object)) {
            return true;
        }

        throw new ValidationException(this.errorMessage);
    }
}
