import { Line } from './line';

const nodes = {};

export const registerEdge = (name, componentConstructor) => {
  nodes[name] = componentConstructor;
};

export const getEdge = (name) => {
  return nodes[name];
};

registerEdge('line', Line);
