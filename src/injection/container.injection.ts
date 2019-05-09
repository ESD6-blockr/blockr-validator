import { DataAccessLayer, DataSource, IClientConfiguration, MongoDBConfiguration } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { Container } from "inversify";
import { GenesisBlockGenerator, ProposedBlockGenerator } from "../generators";
import { BlockJob } from "../jobs";
import { LotteryService } from "../services/concretes/lottery.service";
import { TransactionService } from "../services/concretes/transaction.service";
import { KeyPairGenerator, ObjectHasher } from "../utils";
import { ObjectSigner } from "../utils";
import { FileUtils } from "../utils/file.util";
import { BlockHeaderValidator, IValidator, TransactionValidator, ValidatorBus } from "../validators";

/**
 * Composition root
 */

/**
 * Dependency container
 */
const DIContainer = new Container({skipBaseClassChecks: true});

// Bind transients
DIContainer.bind<DataAccessLayer>(DataAccessLayer).toSelf().inTransientScope();

DIContainer.bind<IValidator<BlockHeader>>("Validators").to(BlockHeaderValidator).inTransientScope();
DIContainer.bind<IValidator<Transaction>>("Validators").to(TransactionValidator).inTransientScope();
DIContainer.bind<ValidatorBus>(ValidatorBus).toSelf().inTransientScope();

DIContainer.bind<GenesisBlockGenerator>(GenesisBlockGenerator).toSelf().inTransientScope();
DIContainer.bind<ProposedBlockGenerator>(ProposedBlockGenerator).toSelf().inTransientScope();

DIContainer.bind<BlockJob>(BlockJob).toSelf().inTransientScope();

DIContainer.bind<LotteryService>(LotteryService).toSelf().inTransientScope();
DIContainer.bind<TransactionService>(TransactionService).toSelf().inTransientScope();

// Bind request scopes
DIContainer.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DIContainer.bind<ObjectSigner>(ObjectSigner).toSelf().inRequestScope();
DIContainer.bind<KeyPairGenerator>(KeyPairGenerator).toSelf().inRequestScope();
DIContainer.bind<FileUtils>(FileUtils).toSelf().inRequestScope();

// Bind constants
DIContainer.bind<IClientConfiguration>("Configuration")
                    .toConstantValue(new MongoDBConfiguration("conn string", "database"));

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);

export default DIContainer;
