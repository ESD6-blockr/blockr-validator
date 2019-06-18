import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import * as seedRandom from "seedrandom";
import { QueueStore } from "../../stores/queue.store";
import { cloneSet } from "../../utils/set.util";

/**
 * Injectable
 */
@injectable()
export class LotteryService {
  private readonly dataAccessLayer: DataAccessLayer;
  private readonly queueStore: QueueStore;
  private ticketCount: number;

  /**
   * Creates an instance of lottery service.
   * @param dataAccessLayer 
   * @param queueStore 
   */
  constructor(@inject(DataAccessLayer) dataAccessLayer: DataAccessLayer,
              @inject(QueueStore) queueStore: QueueStore) {
    this.dataAccessLayer = dataAccessLayer;
    this.queueStore = queueStore;
    this.ticketCount = 0;
  }

  /**
   * Draws winning block
   * @param parentBlockHash 
   * @param walletStates 
   * @returns winning block 
   */
  public async drawWinningBlock(parentBlockHash: string,
                                walletStates: State[]): Promise<Block | undefined> {
      return new Promise(async (resolve, reject) => {
        // A copy of the queue is used to ensure that the queue will not be modified by 
        // asynchronous adapter implementations while drawing the winning block.
        const pendingProposedBlocks: Set<Block> = cloneSet(this.queueStore.pendingProposedBlockQueue);
        const stakeMap = await this.convertStatesToStakeMap(walletStates);
        this.ticketCount = 0;

        try {
          const candidatesMap = await this.calculateCandidates(stakeMap, pendingProposedBlocks);

          resolve(await this.chooseWinningBlock(parentBlockHash, candidatesMap, pendingProposedBlocks));
        } catch (error) {
          reject(error);
        }
      });
  }

  /**
   * Chooses winning block
   * @param parentBlockHash 
   * @param candidatesMap 
   * @param pendingProposedBlocks 
   * @returns winning block 
   */
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
            return;
          }
          bottomMargin += stake;
          candidateIndex += 1;
        }

        logger.warn("[LotteryService] The lottery does not yield any winner for the given proposed blocks.");
        resolve(undefined);
    });
  }

  /**
   * Calculates candidates
   * @param stakeMap 
   * @param pendingProposedBlocks 
   * @returns candidates 
   */
  private async calculateCandidates(stakeMap: Map<string, number>,
                                    pendingProposedBlocks: Set<Block>): Promise<Map<string, number>> {
    return new Promise((resolve) => {
      const candidatesMap = new Map<string, number>();

      if (!pendingProposedBlocks.size) {
        resolve();
      }

      for (const pendingProposedBlock of pendingProposedBlocks) {
        const validatorPublicKey = pendingProposedBlock.blockHeader.validator;

        if (!stakeMap.get(validatorPublicKey)) {
          logger.info(`[LotteryService] Inexistent state for validator ${validatorPublicKey}`);
          // TODO: Should we actually insert this empty state?
          const state = new State(validatorPublicKey, 0, 1);
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

  /**
   * Converts states to stake map
   * @param states 
   * @returns states to stake map 
   */
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
