import { injectable, multiInject } from "inversify";
import logger from "../../utils/logger";
import { IValidator } from "../interfaces/validator";

@injectable()
export class ValidatorBus {
    private validators: Array<IValidator<any>>;

    constructor(@multiInject("Validators") validators: Array<IValidator<any>>) {
        this.validators = validators;
    }

    public validateAsync<T>(object: T): Promise<boolean> {
        this.validators.forEach(async (validator: IValidator<any>) => {
            await validator.validateObjectAsync(object);
        });
        throw new Error("asdas");
    }
 }
