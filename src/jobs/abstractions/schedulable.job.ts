import { logger } from "@blockr/blockr-logger";
import { schedule } from "node-cron";

/**
 * A Job which is schedulable for a given threshold in minutes.
 * Each time the scheduled threshold has been met, the implemented cycle of this job will be executed.
 */
export abstract class SchedulableJob {
    /**
     * Schedules the job, and thus onCycleAsync method, for a given threshold in minutes.
     * Prior to scheduling the onCycleAsync method, the onInitAsync method will be executed once.
     */
    public scheduleAsync(thresholdInMinutes: number): Promise<void> {
        return new Promise(async (resolve) => {
            schedule(
                `*/${thresholdInMinutes} * * * *`,
                async () => this.onCycleAsync().catch((error) => logger.error(error, "H")),
                {
                    timezone: "Europe/Amsterdam",
                },
            );

            resolve();
        });
    }
    /**
     * This method handles all repetitive logic of the job and is executed every scheduled cycle. 
     */
    protected abstract async onCycleAsync(): Promise<void>;
}
