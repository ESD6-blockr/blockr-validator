import { injectable, multiInject } from "inversify";
import logger from "../../utils/logger";
import { IValidator } from "../interfaces/validator";

@injectable()
export class ValidatorBus {
    private validators: Array<IValidator<any>>;

    constructor(@multiInject("Validators") validators: Array<IValidator<any>>) {
        this.validators = validators;
    }

    public async validateAsync<T>(object: T): Promise<void> {
        for (const validator of this.validators) {
            if (validator.constructor.name.includes(object.constructor.name)) {
                await validator.validateObjectAsync(object);
            }
        }
    }
 }
