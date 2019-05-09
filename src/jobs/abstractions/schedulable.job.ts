import { schedule } from "node-cron";

/**
 * A Job which is schedulable for a given threshold in minutes.
 * Each time the scheduled threshold has been met, the implemented cycle of this job will be executed.
 */
export abstract class SchedulableJob {
    /**
     * Schedules the job, and thus onCycle method, for a given threshold in minutes.
     * Prior to scheduling the onCycle method, the onInit method will be executed once.
     */
    public scheduleAsync(thresholdInMinutes: number): Promise<void> {
        return new Promise(async (resolve) => {
            await this.onInitAsync();

            schedule(`*/${thresholdInMinutes} * * * *`, async () => await this.onCycleAsync());

            resolve();
        });
    }

    /**
     * This method handles all required initialization logic and is executed only once.
     */
    protected abstract async onInitAsync(): Promise<void>;
    /**
     * This method handles all repetitive logic of the job and is executed every scheduled cycle. 
     */
    protected abstract async onCycleAsync(): Promise<void>;
}
