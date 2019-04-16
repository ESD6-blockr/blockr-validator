import { DataAccessLayer, DataSource } from "@blockr/blockr-data-access";
import { BlockHeader, Transaction } from "@blockr/blockr-models";
import { Container } from "inversify";
import { ObjectHasher } from "../utils/objectHasher";
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

// Bind singletons
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);
DIContainer.bind<ObjectHasher>(ObjectHasher).toConstantValue(new ObjectHasher());

export default DIContainer;
