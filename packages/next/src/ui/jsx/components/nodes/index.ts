import { SimpleCircle } from './circle';

const nodes = {};

export const registerNode = (name, componentConstructor) => {
  nodes[name] = componentConstructor;
};

export const getNode = (name) => {
  return nodes[name];
};

registerNode('circle', SimpleCircle);
