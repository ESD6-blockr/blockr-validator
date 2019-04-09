import { DataAccessLayer, DataSource } from "@blockr/blockr-data-access";
import { Container } from "inversify";
import { ObjectHasher } from "../utils/objectHasher";

/**
 * Composition root
 */

/**
 * Dependency container
 */
const DIContainer = new Container({skipBaseClassChecks: true});

// Bind data access layer
// DIContainer.bind<DataAccessLayer>(DataAccessLayer).toSelf().inTransientScope();

// Bind singletons
DIContainer.bind<ObjectHasher>(ObjectHasher).toConstantValue(new ObjectHasher());
DIContainer.bind<DataAccessLayer>(DataAccessLayer).toConstantValue(new DataAccessLayer(DataSource.MONGO_DB));

export default DIContainer;
