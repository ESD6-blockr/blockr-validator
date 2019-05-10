import { injectable } from "inversify";
import { join } from "path";

/* The store for all constant values within this application.
   This class should be used as a Singleton. */
@injectable()
export class ConstantStore {
    /* The maximum amount of coins within the blockchain */
    public GENESIS_COIN_AMOUNT: number;
    /* The maximum amount of coins within the blockchain */
    public GENESIS_STAKE_AMOUNT: number;
    /* The public key of the admin wallet */
    public ADMIN_PUBLIC_KEY: string;
    /* Block reward */
    public BLOCK_REWARD_AMOUNT: number;
    /* Gensis block number */
    public GENESIS_BLOCK_NUMBER: number;
    /* The file path of the .keys file */
    public KEYS_FILE_PATH: string;
    /* The current version of the validator */
    public VALIDATOR_VERSION: string;
    /* The Sentry DSN */
    public SENTRY_DSN: string;
    /* The Sentry Environment */
    public SENTRY_ENVIRONMENT: string;
    
    public constructor() {
        this.GENESIS_COIN_AMOUNT = 900_000_000;
        this.GENESIS_STAKE_AMOUNT = 1;
        this.ADMIN_PUBLIC_KEY = process.env.ADMIN_PUBLIC_KEY || "";
        this.BLOCK_REWARD_AMOUNT = 10;
        this.GENESIS_BLOCK_NUMBER = 1;
        this.KEYS_FILE_PATH = `${join(__dirname, "../../")}.keys`;
        this.VALIDATOR_VERSION = process.env.VALIDATOR_VERSION || "";
        this.SENTRY_DSN = process.env.SENTRY_DSN || "";
        this.SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || "";
    }
}
