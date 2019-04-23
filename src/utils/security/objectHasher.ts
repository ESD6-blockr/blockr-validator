import { logger } from "app/utils";
import * as Crypto from "crypto";
import { injectable } from "inversify";

@injectable()
export class ObjectHasher {
    public hash<T>(object: T | undefined): string {
        try {
            logger.info(`Hashing object: ${object}`);

            return Crypto.createHash("md5").update(JSON.stringify(object)).digest("hex");
        } catch (error) {
            logger.error(error);

            throw error;
        }
    }
}
