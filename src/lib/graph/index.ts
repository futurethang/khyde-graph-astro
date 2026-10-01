import config from '../../content/graph.config';
import { loadGraph } from './validate';

export * from './schema';
export * from './layout';
export { validateGraph, loadGraph, type GraphIssue } from './validate';

/** The validated site graph. Importing this fails the build if the config is broken. */
export const graph = loadGraph(config);
