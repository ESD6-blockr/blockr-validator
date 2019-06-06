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
    /* The private key of the admin wallet */
    public ADMIN_PRIVATE_KEY: string;
    /* The currently configured public key that the validator should mine for */
    public VALIDATOR_PUBLIC_KEY: string;
    /* Block reward */
    public BLOCK_REWARD_AMOUNT: number;
    /* Gensis block number */
    public GENESIS_BLOCK_NUMBER: number;
    /* The file path of the .keys file */
    public KEYS_FILE_PATH: string;
    /* The file path of the .env file */
    public ENV_FILE_PATH: string;
    /* The current version of the validator */
    public VALIDATOR_VERSION: string;
    /* The Sentry DSN */
    public SENTRY_DSN: string;
    /* The Sentry Environment */
    public SENTRY_ENVIRONMENT: string;
    /* The database connection string */
    public DB_CONNECTION_STRING: string;
    /* The database name */
    public DB_NAME: string;
    /* The initial peer */
    public INITIAL_PEER: string;
    /* Default stake amount */
    public DEFAULT_STAKE_AMOUNT: number;
    /* The host for the RPC server */
    public RPC_SERVER_HOST: string;
    /* The port for the RPC server */
    public RPC_SERVER_PORT: string;
    /* The RPC protocol's file path */
    public RPC_PROTOCOL_FILE_PATH: string;
    
    public constructor() {
        this.GENESIS_COIN_AMOUNT = 900_000_000;
        this.GENESIS_STAKE_AMOUNT = 1;
        this.ADMIN_PUBLIC_KEY = "";
        this.ADMIN_PRIVATE_KEY = "";
        this.VALIDATOR_PUBLIC_KEY = process.env.VALIDATOR_PUBLIC_KEY || "";
        this.BLOCK_REWARD_AMOUNT = 10;
        this.GENESIS_BLOCK_NUMBER = 1;
        this.KEYS_FILE_PATH = `${join(__dirname, "../../")}.keys`;
        this.ENV_FILE_PATH = `${join(__dirname, "../../")}.env`;
        this.VALIDATOR_VERSION = process.env.VALIDATOR_VERSION || "";
        this.SENTRY_DSN = process.env.SENTRY_DSN || "";
        this.SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || "";
        this.DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || "";
        this.DB_NAME = process.env.DB_NAME || "";
        this.INITIAL_PEER = process.env.INITIAL_PEER || "";
        this.DEFAULT_STAKE_AMOUNT = 1;
        this.RPC_SERVER_HOST = process.env.RPC_SERVER_HOST || "";
        this.RPC_SERVER_PORT = process.env.RPC_SERVER_PORT || "";
        console.log(__dirname);
        this.RPC_PROTOCOL_FILE_PATH = `${join(__dirname, "../utils/")}transactions.proto`;
    }
}
