import { Container } from "inversify";
import * as Mongo from "mongodb";
import { IClient, LevelDB, MongoDB } from "../clients";
import { IClientConfiguraton, MongoDBConfiguration } from "../configurations";
import { loadApplicationSettings } from "../utils/configLoader";

/**
 * Composition root
 */

/**
 * Dependency container
 */
const DIContainer = new Container();
/**
 * Appsettings file that holds application configurations
 */
const appsettings = loadApplicationSettings();

// Bind configurations
DIContainer.bind<IClientConfiguraton>(MongoDBConfiguration)
.toConstantValue(new MongoDBConfiguration(appsettings.mongodb.connectionString, appsettings.mongodb.database));

// Bind clients
DIContainer.bind<IClient<Mongo.Db>>(MongoDB).toSelf().inTransientScope();
DIContainer.bind<IClient<void>>(LevelDB).toSelf().inTransientScope();

export default DIContainer;