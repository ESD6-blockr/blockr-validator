import { DataAccessLayer, DataSource } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { Container } from "inversify";
import { GenesisBlockGenerator } from "../generators/concretes/genesisBlockGenerator";
import { ObjectHasher } from "../utils/objectHasher";
import { ObjectSigner } from "../utils/objectSigner";
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

DIContainer.bind<ObjectHasher>(ObjectHasher).toSelf().inRequestScope();
DIContainer.bind<ObjectSigner>(ObjectSigner).toSelf().inRequestScope();

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);

export default DIContainer;
