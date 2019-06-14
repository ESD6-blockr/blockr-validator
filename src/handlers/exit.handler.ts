import { logger } from "@blockr/blockr-logger";
import { Peer } from "@blockr/blockr-p2p-lib";
import DI_CONTAINER from "../injection/container.injection";

let disposing: boolean = false;

export function exitHandler() {
    if (!disposing) {
        disposing = true;

        logger.info("[ExitHandler] perform graceful shutdown");
        
        logger.info("[ExitHandler] leaving peer network");
        const peer = DI_CONTAINER.get<Peer>(Peer);
        peer.leave();
        logger.info("[ExitHandler] left peer network");

        process.exit();
    }
}
