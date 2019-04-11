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

// Bind datasource
DIContainer.bind<DataSource>("DataSource").toConstantValue(DataSource.MONGO_DB);

// Bind data access layer
DIContainer.bind<DataAccessLayer>(DataAccessLayer).toSelf().inTransientScope();

// Bind singletons
DIContainer.bind<ObjectHasher>(ObjectHasher).toConstantValue(new ObjectHasher());

export default DIContainer;
