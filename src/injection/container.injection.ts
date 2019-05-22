import { CryptoKeyUtil, ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer, DataSource, IClientConfiguration, MongoDBConfiguration } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { Container } from "inversify";
import { GenesisBlockGenerator, ProposedBlockGenerator } from "../generators";
import { BlockJob } from "../jobs";
import { NodeService } from "../services";
import { AdminKeyService } from "../services/concretes/adminKey.service";
import { BlockchainInitializationService } from "../services/concretes/blockchainInitialization.service";
import { LotteryService } from "../services/concretes/lottery.service";
import { TransactionService } from "../services/concretes/transaction.service";
import { ConstantStore, QueueStore } from "../stores";
import { FileUtils } from "../utils/file.util";
import { BlockHeaderValidator, IValidator, TransactionValidator, ValidatorBus } from "../validators";

/**
 * Composition root
 */

/**
 * Dependency container
 */
const DIContainer = new Container({skipBaseClassChecks: true});

DIContainer.bind<ConstantStore>(ConstantStore).toDynamicValue(() => new ConstantStore()).inSingletonScope();

DIContainer.load();

const constantStore = DIContainer.resolve<ConstantStore>(ConstantStore);

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
DIContainer.bind<AdminKeyService>(AdminKeyService).toSelf().inTransientScope();
DIContainer.bind<BlockchainInitializationService>(BlockchainInitializationService).toSelf().inTransientScope();
DIContainer.bind<NodeService>(NodeService).toSelf().inTransientScope();

// Bind request scopes
DIContainer.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DIContainer.bind<CryptoKeyUtil>(CryptoKeyUtil).toSelf().inRequestScope();
DIContainer.bind<FileUtils>(FileUtils).toSelf().inRequestScope();

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);
DIContainer.bind<IClientConfiguration>("Configuration")
                    .toConstantValue(new MongoDBConfiguration(constantStore.DB_CONNECTION_STRING,
                                                              constantStore.DB_NAME));
DIContainer.bind<QueueStore>(QueueStore).to(QueueStore).inSingletonScope();

export default DIContainer;
