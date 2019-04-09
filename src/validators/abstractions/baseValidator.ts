import { DataAccessLayer } from "@blockr/blockr-data-access";
import { AbstractValidator } from "fluent-ts-validator";
import { IValidator } from "../interfaces/validator";

export abstract class BaseValidator<T> extends AbstractValidator<T> implements IValidator<T> {
    protected dataAccessLayer: DataAccessLayer;

    constructor(dataAccessLayer: DataAccessLayer) {
        super();
        this.dataAccessLayer = dataAccessLayer;
    }

    public abstract validateObjectAsync(object: T): Promise<boolean>;
}
