import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import * as seedRandom from "seedrandom";
import { QueueStore } from "../../stores/queue.store";

@injectable()
export class LotteryService {
  private readonly dataAccessLayer: DataAccessLayer;
  private readonly queueStore: QueueStore;
  private ticketCount: number;

  constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
              @inject(QueueStore) queueStore: QueueStore) {
    this.dataAccessLayer = dataAccessLayer;
    this.queueStore = queueStore;
    this.ticketCount = 0;
  }

  public async drawWinningBlock(parentBlockHash: string,
                                walletStates: State[]): Promise<Block | undefined> {
      return new Promise(async (resolve, reject) => {
        // TODO: Important: queue should be cloned, no pointer should be used to ensure that
        // no blocks will be added to the queue while executing the lottery.
        const pendingProposedBlocks: Set<Block> = this.queueStore.pendingProposedBlockQueue;
        const stakeMap = await this.convertStatesToStakeMap(walletStates);

        try {
          const candidatesMap = await this.calculateCandidates(stakeMap, pendingProposedBlocks);

          resolve(await this.chooseWinningBlock(parentBlockHash, candidatesMap, pendingProposedBlocks));
        } catch (error) {
          reject(error);
        }
      });
  }

  private async chooseWinningBlock(parentBlockHash: string, candidatesMap: Map<string, number>,
                                   pendingProposedBlocks: Set<Block>): Promise<Block | undefined> {
    return new Promise((resolve) => {
        // TODO: Perhaps the random stake choosing should be overhauled.
        const randomNumber = seedRandom(parentBlockHash)() * this.ticketCount;
        let bottomMargin = 0;
        let upperMargin = 0;
        let candidateIndex = 0;

        while (upperMargin < randomNumber) {
          const publicKey = Array.from(candidatesMap.keys())[candidateIndex];
          // The stake can never be undefined in this part of the code as candidates are only inserted into the map
          // whenever they have an actual stake, thus the exclamation mark.
          const stake = candidatesMap.get(publicKey) as number;
          upperMargin += stake;

          if ((bottomMargin <= randomNumber) && (upperMargin >= randomNumber)) {
            resolve(Array.from(pendingProposedBlocks).find((block) => block.blockHeader.validator === publicKey));
          }
          bottomMargin += stake;
          candidateIndex += 1;
        }

        logger.warn("[LotteryService] The lottery does not yield any winner for the given proposed blocks.");
        resolve(undefined);
    });
  }

  private async calculateCandidates(stakeMap: Map<string, number>,
                                    pendingProposedBlocks: Set<Block>): Promise<Map<string, number>> {
    return new Promise((resolve) => {
      const candidatesMap = new Map<string, number>();

      for (const pendingProposedBlock of pendingProposedBlocks) {
        const validatorPublicKey = pendingProposedBlock.blockHeader.validator;

        if (!stakeMap.get(validatorPublicKey)) {
          logger.info(`[LotteryService] Inexistent state for validator ${validatorPublicKey}`);
          // TODO: Should we actually insert this empty state?
          const state = new State(validatorPublicKey, 0, 0);
          this.dataAccessLayer.updateStateAsync(validatorPublicKey, state);
          continue;
        }

        const validatorStake = stakeMap.get(validatorPublicKey) as number;

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
