export class ConstantStore {
    public static getInstance(): ConstantStore {
        if (!this.instance) {
            this.instance = new ConstantStore();
        }
        
        return this.instance;
    }

    private static instance: ConstantStore;

    /* The maximum amount of coins within the blockchain */
    public GENESIS_COIN_AMOUNT: number;
    /* The maximum amount of coins within the blockchain */
    public GENESIS_STAKE_AMOUNT: number;
    /* The public key of the admin wallet */
    public ADMIN_PUBLIC_KEY: string;
    /* Genesis block reward */
    public BLOCK_REWARD: number;
    /* Gensis block number */
    public BLOCK_NUMBER: number;

    private constructor() {
        this.GENESIS_COIN_AMOUNT = 900_000_000;
        this.GENESIS_STAKE_AMOUNT = 1;
        this.ADMIN_PUBLIC_KEY = process.env.ADMIN_PUBLIC_KEY || "";
        this.BLOCK_REWARD = 10;
        this.BLOCK_NUMBER = 1;
    }
}
