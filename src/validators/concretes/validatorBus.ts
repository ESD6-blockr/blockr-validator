import { IModel } from "@blockr/blockr-models/dist/model";
import { injectable, multiInject } from "inversify";
import { IValidator } from "../interfaces/validator";

@injectable()
export class ValidatorBus {
    private validators: Array<IValidator<IModel>>;

    constructor(@multiInject("Validators") validators: Array<IValidator<IModel>>) {
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
