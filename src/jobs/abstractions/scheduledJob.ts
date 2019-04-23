import { schedule } from "node-cron";

export abstract class ScheduledJob {
    private function: () => void;

    constructor(func: () => void) {
        this.function = func;
    }

    /**
     * Schedules the job for a given threshold in minutes
     */
    public schedule(thresholdInMinutes: number): void {
        schedule(`*/${thresholdInMinutes} * * * *`, this.function);
    }
}
