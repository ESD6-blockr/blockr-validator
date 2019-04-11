import { DataAccessLayer, DataSource } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { Container } from "inversify";
import { ObjectHasher } from "../utils/objectHasher";
import { BlockHeaderValidator, IValidator, TransactionValidator } from "../validators";

/**
 * Composition root
 */

/**
 * Dependency container
 */
const DIContainer = new Container({skipBaseClassChecks: true});

// Bind transients
DIContainer.bind<DataAccessLayer>(DataAccessLayer).toSelf().inTransientScope();
DIContainer.bind<IValidator<BlockHeader>>(BlockHeaderValidator).toSelf().inTransientScope();
DIContainer.bind<IValidator<Transaction>>(TransactionValidator).toSelf().inTransientScope();

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);
DIContainer.bind<ObjectHasher>(ObjectHasher).toConstantValue(new ObjectHasher());

export default DIContainer;
