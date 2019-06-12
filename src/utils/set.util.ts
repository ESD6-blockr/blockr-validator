import { injectable } from "inversify";

@injectable()
export class SetUtils {
    /**
     * Clones a given set for the given type.
     * @param set The set that should be cloned.
     */
    public cloneSet<T>(set: Set<T>): Set<T> {
        const newQueue: Set<T> = new Set();
        
        for (const element of set.values()) {
            newQueue.add(element);
        }
        return newQueue;
    }
}
