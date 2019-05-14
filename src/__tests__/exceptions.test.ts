import { BlockGeneratorException, BlockJobException, KeyPairGenerationException } from "../exceptions";
import { LotteryException, NodeStartupException, ValidationException, ValidatorBusException } from "../exceptions";

describe("Exception: {name} should instantiate with a message", () => {
    it("{Block generation}", () => {
        const exception = new BlockGeneratorException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(BlockGeneratorException);
        expect(exception.message).toBe("Exception");
    });

    it("{Block job}", () => {
        const exception = new BlockJobException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(BlockJobException);
        expect(exception.message).toBe("Exception");
    });

    it("{Key pair generator}", () => {
        const exception = new KeyPairGenerationException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(KeyPairGenerationException);
        expect(exception.message).toBe("Exception");
    });

    it("{Lottery exception}", () => {
        const exception = new LotteryException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(LotteryException);
        expect(exception.message).toBe("Exception");
    });

    it("{Node startup}", () => {
        const exception = new NodeStartupException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(NodeStartupException);
        expect(exception.message).toBe("Exception");
    });

    it("{Validation}", () => {
        const exception = new ValidationException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(ValidationException);
        expect(exception.message).toBe("Exception");
    });

    it("{Validator bus}", () => {
        const exception = new ValidatorBusException("Exception");

        expect(exception).not.toBeNull();
        expect(exception).toBeInstanceOf(ValidatorBusException);
        expect(exception.message).toBe("Exception");
    });
});
