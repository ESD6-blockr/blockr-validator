import * as Crypto from "crypto";
import { injectable } from "inversify";
import Logger from "./logger";

@injectable()
export class ObjectHasher {

    public hash<T>(object: T | undefined): string {
        try {
            Logger.info(`Hashing object: ${object}`);

            return Crypto.createHash("md5").update(JSON.stringify(object)).digest("hex");
        } catch (error) {
            Logger.error(error);

            throw error;
        }
    }
}
