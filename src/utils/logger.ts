import * as Winston from "winston";

const path = "logs/";

const alignedWithColorsAndTime = Winston.format.combine(
    Winston.format.colorize(),
    Winston.format.timestamp(),
    Winston.format.align(),
    Winston.format.printf((info) => {
        const {
            timestamp,
            level,
            message,
            ...args
        } = info;

        const ts = timestamp.slice(0, 19).replace("T", " ");
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
    }),
);

const logger = Winston.createLogger({
    format: alignedWithColorsAndTime,
    transports: [
        new Winston.transports.Console({}),
        new Winston.transports.File({
            filename: `${path}/info.log`,
            level: "info",
        }),
        new Winston.transports.File({
            filename: `${path}/error.log`,
            level: "error",
        }),
    ],
});

export default logger;
