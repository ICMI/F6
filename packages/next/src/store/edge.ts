import { injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { Entity } from './entity';
import { node } from './node';
import { isNil } from '@antv/util';
import { combo } from './combo';

const END_MAP = { source: 'start', target: 'end' };
const ITEM_NAME_SUFFIX = 'Node'; // 端点的后缀，如 sourceNode, targetNode
const POINT_NAME_SUFFIX = 'Point'; // 起点或者结束点的后缀，如 startPoint, endPoint
const ANCHOR_NAME_SUFFIX = 'Anchor';

export class Edge extends Entity {
  node = node;
  combo = combo;

  createOne(item: any) {
    item.visible = true;
    item.type = 'line';
    item.__type = 'edge';
    return item;
  }

  getNodeEntity(id) {
    return this.node.state.entities[id] || this.combo.state.entities[id];
  }

  getNodeInstance(id) {
    if (this.node.state.entities[id]) {
      return this.node;
    }
    if (this.combo.state.entities[id]) {
      return this.combo;
    }
  }

  getLinkPoint = (name: SourceTarget, model: EdgeConfig, controlPoints: IPoint[]): IPoint => {
    const sourceId = model[name];
    let point;
    const anchorName = name + ANCHOR_NAME_SUFFIX;
    const prePoint = this.getPrePoint(name, controlPoints, model.id);
    const anchorIndex = model[anchorName];

    if (!isNil(anchorIndex)) {
      // 如果有锚点，则使用锚点索引获取连接点
      point = this.getNodeInstance(sourceId).getLinkPointByAnchor(sourceId, anchorIndex);
    }
    // 如果锚点没有对应的点或者没有锚点，则直接计算连接点
    point = point || this.getNodeInstance(sourceId).getLinkPoint(sourceId, prePoint);

    return point;
  };

  getPrePoint = (name: SourceTarget, controlPoints: IPoint[], edgeId): NodeConfig | IPoint => {
    if (controlPoints && controlPoints.length) {
      const index = name === 'source' ? 0 : controlPoints.length - 1;
      return controlPoints[index];
    }
    const oppositeName = name === 'source' ? 'target' : 'source'; // 取另一个节点的位置
    return this.getEndPoint(oppositeName, edgeId);
  };

  getControlPointsByCenter = (edgeId) => {
    const startPoint = this.getEndPoint('source', edgeId);
    const endPoint = this.getEndPoint('target', edgeId);
    return this.getControlPoints(edgeId, { startPoint, endPoint });
  };

  getEndPoint = (name: SourceTarget, edgeId): NodeConfig | IPoint => {
    const pointName = END_MAP[name] + POINT_NAME_SUFFIX;
    const edgeState = this.state.entities[edgeId];
    const sourceId = edgeState[name];
    const nodeState = this.getNodeEntity(sourceId);
    // 如果有端点，直接使用 model
    if (nodeState) {
      return { x: nodeState.x, y: nodeState.y };
    } // 否则直接使用点
    return null;
    // return this.get(pointName);
  };

  getEndCenter = (name, edgeId): IPoint => {
    const itemName = name + ITEM_NAME_SUFFIX;
    const edgeState = this.state.entities[edgeId];
    const sourceId = edgeState[itemName];
    const nodeState = this.getNodeEntity(sourceId);

    const pointName = END_MAP[name] + POINT_NAME_SUFFIX;
    // 如果有端点，直接使用 model
    if (nodeState) {
      const bbox = this.getNodeInstance(sourceId).getBBox(sourceId);
      return {
        x: bbox.centerX,
        y: bbox.centerY,
      };
    } // 否则直接使用点
    return edgeState[pointName];
  };

  getControlPoints() {}
  inject(key, fn) {
    this[key] = fn;
  }
}

export const edge = new Edge();
