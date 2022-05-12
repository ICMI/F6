import { isString, isPlainObject, isNil, mix } from '@antv/util';
import { EdgeConfig, IPoint, NodeConfig, SourceTarget, Indexable } from '../types';
import { getLinkPointByAnchor, getLinkPoint as getNodeLinkPoint } from './node';

const END_MAP: Indexable<string> = { source: 'start', target: 'end' };
const ITEM_NAME_SUFFIX = 'Node'; // 端点的后缀，如 sourceNode, targetNode
const POINT_NAME_SUFFIX = 'Point'; // 起点或者结束点的后缀，如 startPoint, endPoint
const ANCHOR_NAME_SUFFIX = 'Anchor';

/**
 * 获取连接点的坐标
 * @param name source | target
 * @param model 边的数据模型
 * @param controlPoints 控制点
 */
export const getLinkPoint = (
  name: SourceTarget,
  nodesState,
  model: EdgeConfig,
  controlPoints: IPoint[],
): IPoint => {
  // const pointName = END_MAP[name] + POINT_NAME_SUFFIX;
  const nodeState = nodesState[name];
  let point;
  const anchorName = name + ANCHOR_NAME_SUFFIX;
  const prePoint = getPrePoint(name, controlPoints, nodesState);
  const anchorIndex = model[anchorName];
  if (!isNil(anchorIndex)) {
    // 如果有锚点，则使用锚点索引获取连接点
    point = getLinkPointByAnchor(nodeState, anchorIndex);
  }
  // 如果锚点没有对应的点或者没有锚点，则直接计算连接点
  point = point || getNodeLinkPoint(nodeState, prePoint);
  // if (!isNil(point.index)) {
  //   this.set(`${name}AnchorIndex`, point.index);
  // }
  return point;
};

/**
 * 获取同端点进行连接的点，计算交汇点
 * @param name
 * @param controlPoints
 */
export const getPrePoint = (
  name: SourceTarget,
  controlPoints: IPoint[],
  nodesState,
): NodeConfig | IPoint => {
  if (controlPoints && controlPoints.length) {
    const index = name === 'source' ? 0 : controlPoints.length - 1;
    return controlPoints[index];
  }
  const oppositeName = name === 'source' ? 'target' : 'source'; // 取另一个节点的位置
  return getEndPoint(oppositeName, nodesState);
};

/**
 * 获取端点的位置
 * @param name
 */
export const getEndPoint = (name: SourceTarget, nodesState): NodeConfig | IPoint => {
  const itemName = name + ITEM_NAME_SUFFIX;
  const pointName = END_MAP[name] + POINT_NAME_SUFFIX;
  const nodeState = nodesState[name];
  // 如果有端点，直接使用 model
  if (nodeState) {
    return nodeState;
  } // 否则直接使用点
  return null;
  // return this.get(pointName);
};

/**
 * 通过端点的中心获取控制点
 * @param model
 */
export const getControlPointsByCenter = (model: EdgeConfig) => {
  const sourcePoint = getEndPoint('source', model);
  const targetPoint = getEndPoint('target', model);
  const type = model.type;
  return undefined;
};

export const getEndCenter = (name: SourceTarget, edgeState, nodeState): IPoint => {
  const pointName = END_MAP[name] + POINT_NAME_SUFFIX;
  // 如果有端点，直接使用 model
  if (nodeState) {
    const bbox = nodeState.keyShapeBBox;
    return {
      x: bbox.centerX,
      y: bbox.centerY,
    };
  } // 否则直接使用点
  return edgeState[pointName];
};
