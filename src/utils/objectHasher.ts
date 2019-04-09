import * as Crypto from "crypto";
import Logger from "./logger";

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
