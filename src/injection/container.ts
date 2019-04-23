import { DataAccessLayer, DataSource, IClientConfiguraton, MongoDBConfiguration } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { GenesisBlockGenerator } from "app/generators";
import { ObjectHasher } from "app/utils";
import { ObjectSigner } from "app/utils";
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

DIContainer.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DIContainer.bind<ObjectSigner>(ObjectSigner).toSelf().inRequestScope();

// Bind constants
DIContainer.bind<IClientConfiguraton>("MongoDBConfiguration")
                    .toConstantValue(new MongoDBConfiguration("conn string", "database"));

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);

export default DIContainer;
