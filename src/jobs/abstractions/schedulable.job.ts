import { schedule } from "node-cron";

export abstract class SchedulableJob {
    private onCycle: () => void;
    private onInit?: () => void;

    constructor(onCycleFunction: () => void) {
        this.onCycle = onCycleFunction;
    }

    /**
     * Schedules the job for a given threshold in minutes.
     * Before the job is scheduled, the onInit function will be executed if it has been set.
     */
    public schedule(thresholdInMinutes: number): void {
        if (this.onInit) {
            this.onInit();
        }

        schedule(`*/${thresholdInMinutes} * * * *`, this.onCycle);
    }

    protected setOnInit(func: () => void): SchedulableJob {
        this.onInit = func;

        return this;
    }
}
