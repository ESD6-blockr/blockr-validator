/**
 * Composition root
 */
import { CryptoKeyUtil, ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer, DataSource, IClientConfiguration, MongoDBConfiguration } from "@blockr/blockr-data-access";
import { Block, BlockHeader, Transaction, TransactionHeader } from "@blockr/blockr-models";
import { Peer } from "@blockr/blockr-p2p-lib";
import { PeerType } from "@blockr/blockr-p2p-lib/dist/enums";
import { Container } from "inversify";
import { P2PCommunicationRepository, RPCCommunicationRepository, VictoriousBlockAdapter } from "../adapters";
import { BlockchainAdapter, KeyAdapter, ProposedBlockAdapter, TransactionAdapter } from "../adapters";
import { GenesisBlockGenerator, ProposedBlockGenerator } from "../generators";
import { BlockJob } from "../jobs";
import { AdminKeyService, BlockchainInitializationService, ProposedBlockService } from "../services";
import { LotteryService, NodeService, StateService, TransactionService, VictoriousBlockService } from "../services";
import { ConstantStore, QueueStore } from "../stores";
import { FileUtils } from "../utils";
import { BlockHeaderValidator, IValidator, TransactionValidator, ValidatorBus } from "../validators";
import { BlockValidator } from "../validators/concretes/block.validator";
import { TransactionHeaderValidator } from "../validators/concretes/transactionHeader.validator";

/**
 * Dependency container
 */
const DI_CONTAINER = new Container({skipBaseClassChecks: true});

/**
 * Application configuration
 */
DI_CONTAINER.bind<ConstantStore>(ConstantStore).toSelf().inSingletonScope();
const constantStore = DI_CONTAINER.get<ConstantStore>(ConstantStore);

/**
 * Injections
 */

 // Singletons
DI_CONTAINER.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);
DI_CONTAINER.bind<IClientConfiguration>("Configuration")
                    .toConstantValue(new MongoDBConfiguration(constantStore.DB_CONNECTION_STRING,
                                                              constantStore.DB_NAME));
DI_CONTAINER.bind<QueueStore>(QueueStore).toSelf().inSingletonScope();
DI_CONTAINER.bind<P2PCommunicationRepository>(P2PCommunicationRepository).toSelf().inSingletonScope();
DI_CONTAINER.bind<RPCCommunicationRepository>(RPCCommunicationRepository).toSelf().inSingletonScope();
DI_CONTAINER.bind<Peer>(Peer).toConstantValue(new Peer(PeerType.VALIDATOR));

// Requests
DI_CONTAINER.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DI_CONTAINER.bind<CryptoKeyUtil>(CryptoKeyUtil).toSelf().inRequestScope();
DI_CONTAINER.bind<FileUtils>(FileUtils).toSelf().inRequestScope();

// Transients
DI_CONTAINER.bind<DataAccessLayer>(DataAccessLayer).toSelf().inTransientScope();

DI_CONTAINER.bind<IValidator<Block>>("Validators").to(BlockValidator).inTransientScope();
DI_CONTAINER.bind<IValidator<BlockHeader>>("Validators").to(BlockHeaderValidator).inTransientScope();
DI_CONTAINER.bind<IValidator<Transaction>>("Validators").to(TransactionValidator).inTransientScope();
DI_CONTAINER.bind<IValidator<TransactionHeader>>("Validators").to(TransactionHeaderValidator).inTransientScope();
DI_CONTAINER.bind<ValidatorBus>(ValidatorBus).toSelf().inTransientScope();

DI_CONTAINER.bind<GenesisBlockGenerator>(GenesisBlockGenerator).toSelf().inTransientScope();
DI_CONTAINER.bind<ProposedBlockGenerator>(ProposedBlockGenerator).toSelf().inTransientScope();

DI_CONTAINER.bind<BlockJob>(BlockJob).toSelf().inTransientScope();

DI_CONTAINER.bind<LotteryService>(LotteryService).toSelf().inTransientScope();
DI_CONTAINER.bind<TransactionService>(TransactionService).toSelf().inTransientScope();
DI_CONTAINER.bind<AdminKeyService>(AdminKeyService).toSelf().inTransientScope();
DI_CONTAINER.bind<BlockchainInitializationService>(BlockchainInitializationService).toSelf().inTransientScope();
DI_CONTAINER.bind<NodeService>(NodeService).toSelf().inTransientScope();
DI_CONTAINER.bind<StateService>(StateService).toSelf().inTransientScope();
DI_CONTAINER.bind<ProposedBlockService>(ProposedBlockService).toSelf().inTransientScope();
DI_CONTAINER.bind<VictoriousBlockService>(VictoriousBlockService).toSelf().inTransientScope();

DI_CONTAINER.bind<BlockchainAdapter>(BlockchainAdapter).toSelf().inTransientScope();
DI_CONTAINER.bind<KeyAdapter>(KeyAdapter).toSelf().inTransientScope();
DI_CONTAINER.bind<TransactionAdapter>(TransactionAdapter).toSelf().inTransientScope();
DI_CONTAINER.bind<ProposedBlockAdapter>(ProposedBlockAdapter).toSelf().inTransientScope();
DI_CONTAINER.bind<VictoriousBlockAdapter>(VictoriousBlockAdapter).toSelf().inTransientScope();

export default DI_CONTAINER;
