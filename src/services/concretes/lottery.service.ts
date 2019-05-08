import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, State } from "@blockr/blockr-models";
import { LotteryException } from "app/exceptions";
import { logger } from "app/utils";
import { inject } from "inversify";
import { seedRandom } from "seedrandom";


export class LotteryService {
  
  private dataAccessLayer: DataAccessLayer;

  constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
    this.dataAccessLayer = dataAccessLayer;
  }

  public async pickWinner(receivedBlocks: Block[] , previousBlockHash: string,
                          globalStateUsers: State[]): Promise<Block> {
      return new Promise(async (resolve, reject) => {
          const stakeHashMap = new Map<string, number>();

          globalStateUsers.forEach(({ publicKey, stake }) => {
              stakeHashMap.set(publicKey, stake);
          });
          
          const candidatesHashMap = new Map<string, number>();
          const candidateBlocksHashMap = new Map<string, Block>();

          let tickets = 0;

          receivedBlocks.forEach((block) => {
            const validator = block.blockHeader.validator;
            if (Object.keys(stakeHashMap).find((publicKey) => publicKey === validator)) {
              const stake = stakeHashMap.get(validator);
              if (!stake) {
                reject(new LotteryException("Stake is undifined"));
                return;
              }
              tickets += stake;
              candidatesHashMap.set(validator, stake);
              candidateBlocksHashMap.set(validator, block);
            } else {
              logger.info("Validator in else: ${validator}.");
              const state = new State(validator, 0, 0);
              this.dataAccessLayer.updateStateAsync(validator, state);
            }
          });

          const randomNumber = seedRandom(previousBlockHash)() * tickets;
          let bottomMargin = 0;
          let upperMargin = 0;
          let candidatePointer = 0;
          while (upperMargin < randomNumber) {
            const publicKey = Array.from(candidatesHashMap.keys())[candidatePointer];
            const stake = candidatesHashMap.get(publicKey);
            if (!stake) {
              reject(new LotteryException("Stake is undifined"));
              return;
            }
            upperMargin += stake;
            if (bottomMargin <= randomNumber && upperMargin >= randomNumber) {
              resolve(candidateBlocksHashMap.get(publicKey));
            }
            bottomMargin += stake;
            candidatePointer += 1;
          }
          resolve();
      });
  }
}
