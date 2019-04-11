import { injectable, multiInject } from "inversify";
import { IValidator } from "../interfaces/validator";

@injectable()
export class ValidatorBus {
    private validators: Array<IValidator<object>>;

    constructor(@multiInject("Validators") validators: Array<IValidator<object>>) {
        this.validators = validators;
    }

    public validateAsync(object: object): Promise<boolean> {
        
        throw new Error("implement me");
    }
 }
