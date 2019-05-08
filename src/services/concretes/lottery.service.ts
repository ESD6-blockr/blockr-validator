import { DataAccessLayer } from "@blockr/blockr-data-access";
import { Block, State } from "@blockr/blockr-models";
import { inject } from "inversify";
import { seedRandom } from "seedrandom";
import { LotteryException } from "../../exceptions/lotteryException.exception";
import { logger } from "../../utils/logger.util";

export class LotteryService {
  private dataAccessLayer: DataAccessLayer;
  private ticketCount: number = 0;

  constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
    this.dataAccessLayer = dataAccessLayer;
  }

  public async drawWinningBlock(pendingProposedBlocks: Block[], parentBlockHash: string,
                                walletStates: State[]): Promise<Block> {
      return new Promise(async (resolve, reject) => {
        const stakeMap = await this.convertStatesToStakeMap(walletStates);

        try {
          const candidatesMap = await this.calculateCandidates(stakeMap, pendingProposedBlocks);

          resolve(await this.chooseWinningBlock(parentBlockHash, candidatesMap, pendingProposedBlocks));
        } catch (error) {
          logger.error(error);
          
          reject();
        }
      });
  }

  private async chooseWinningBlock(parentBlockHash: string, candidatesMap: Map<string, number>,
                                   pendingProposedBlocks: Block[]): Promise<Block> {
    return new Promise((resolve, reject) => {
        // TODO: Perhaps the random stake choosing should be overhauled.
        const randomNumber = seedRandom(parentBlockHash)() * this.ticketCount;
        let bottomMargin = 0;
        let upperMargin = 0;
        let candidateIndex = 0;

        while (upperMargin < randomNumber) {
          const publicKey = Array.from(candidatesMap.keys())[candidateIndex];
          // The stake can never be undefined in this part of the code as candidates are only inserted into the map
          // whenever they have an actual stake, thus the exclamation mark.
          const stake = candidatesMap.get(publicKey)!;
          upperMargin += stake;

          if ((bottomMargin <= randomNumber) && (upperMargin >= randomNumber)) {
            resolve(pendingProposedBlocks.find((block) => block.blockHeader.validator === publicKey));
          }
          bottomMargin += stake;
          candidateIndex += 1;
        }
        reject(new LotteryException("The lottery does not yield any winner for the given proposedblocks."));
    });
  }

  private async calculateCandidates(stakeMap: Map<string, number>,
                                    pendingProposedBlocks: Block[]): Promise<Map<string, number>> {
    return new Promise((resolve, reject) => {
      const candidatesMap = new Map<string, number>();

      for (const pendingProposedBlock of pendingProposedBlocks) {
        const validatorPublicKey = pendingProposedBlock.blockHeader.validator;

        if (!Object.keys(stakeMap).find((publicKey) => publicKey === validatorPublicKey)) {
          logger.info(`[LotteryService] Inexistent state for validator ${validatorPublicKey}`);
          // TODO: Should we actually insert this empty state?
          const state = new State(validatorPublicKey, 0, 0);
          this.dataAccessLayer.updateStateAsync(validatorPublicKey, state);
          continue;
        }

        const validatorStake = stakeMap.get(validatorPublicKey);
        
        if (!validatorStake) {
          reject(new LotteryException(`[LotteryService] Undefined stake for validator ${validatorPublicKey}`));
          return;
        }

        this.ticketCount += validatorStake;
        candidatesMap.set(validatorPublicKey, validatorStake);
      }
      resolve(candidatesMap);
    });
  }

  private async convertStatesToStakeMap(states: State[]): Promise<Map<string, number>> {
    return new Promise((resolve) => {
      const stakeMap = new Map<string, number>();

      for (const state of states) {
        stakeMap.set(state.publicKey, state.stake);
      }

      resolve(stakeMap);
    });
  }
}