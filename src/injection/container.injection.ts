import { DataAccessLayer, DataSource, IClientConfiguration, MongoDBConfiguration } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { GenesisBlockGenerator, ProposedBlockGenerator } from "app/generators";
import { BlockJob } from "app/jobs";
import { KeyPairGenerator, ObjectHasher } from "app/utils";
import { ObjectSigner } from "app/utils";
import { FileUtils } from "app/utils/file.util";
import { BlockHeaderValidator, IValidator, TransactionValidator, ValidatorBus } from "app/validators";
import { Container } from "inversify";

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

// Bind request scopes
DIContainer.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DIContainer.bind<ObjectSigner>(ObjectSigner).toSelf().inRequestScope();
DIContainer.bind<KeyPairGenerator>(KeyPairGenerator).toSelf().inRequestScope();
DIContainer.bind<FileUtils>(FileUtils).toSelf().inRequestScope();

// Bind constants
DIContainer.bind<IClientConfiguration>("MongoDBConfiguration")
                    .toConstantValue(new MongoDBConfiguration("conn string", "database"));

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);

export default DIContainer;
