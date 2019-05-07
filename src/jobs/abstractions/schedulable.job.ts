import { schedule } from "node-cron";

export abstract class SchedulableJob {
    private function: () => void;
    private onInit?: () => void;

    constructor(func: () => void) {
        this.function = func;
    }

    /**
     * Schedules the job for a given threshold in minutes.
     * Before the job is scheduled, the onInit function will be executed if it has been set.
     */
    public schedule(thresholdInMinutes: number): void {
        if (this.onInit) {
            this.onInit();
        }

        schedule(`*/${thresholdInMinutes} * * * *`, this.function);
    }

    protected setOnInit(func: () => void): SchedulableJob {
        this.onInit = func;

        return this;
    }
}
