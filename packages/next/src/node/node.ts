//@ts-nocheck
import { each, isNil, mod } from '@antv/util';
import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import { Item } from '../item/item';
import {
  distance,
  getCircleIntersectByPoint,
  getEllipseIntersectByPoint,
  getRectIntersectByPoint,
} from '../utils/math';

const getNearestPoint = (points: IPoint[], curPoint: IPoint): IPoint => {
  let index = 0;
  let nearestPoint = points[0];
  let minDistance = distance(points[0], curPoint);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const dis = distance(point, curPoint);
    if (dis < minDistance) {
      nearestPoint = point;
      minDistance = dis;
      index = i;
    }
  }
  nearestPoint.anchorIndex = index;
  return nearestPoint;
};

export class Node extends Item {
  rootId = null; // 兼容树图
  graph = null;
  parent = null;

  constructor(model, graph) {
    super();
    this.graph = graph;
    this.model = { ...model };
    this.model.type = model.type || 'circle';
    this.model.visible = true;
    makeObservable(this, {
      setPosition: action,
      translate: action,
    });
  }

  get type() {
    return 'node';
  }

  setPosition(position) {
    this.model = { ...this.model, ...position };
    // this.model.x = position.x;
    // this.model.y = position.y;
  }

  getParent() {
    return this.graph.getItem(this.model.parent);
  }

  setRootId(id) {
    if (isNil(id)) return;
    this.rootId = id;
  }

  calcAnchorPoints() {
    const id = this.model.id;
    const bbox = this.getBBox(id);
    const anchorPoints = [];
    const points = this.getAnchorPoints(id);
    each(points, (pointArr, index) => {
      const point = {
        x: bbox.minX + pointArr[0] * bbox.width,
        y: bbox.minY + pointArr[1] * bbox.height,
        anchorIndex: index,
      };
      anchorPoints.push(point);
    });

    return anchorPoints;
  }

  getLinkPointByAnchor(index: number) {
    const id = this.model.id;
    const anchorPoints = this.calcAnchorPoints(id);
    return anchorPoints[index];
  }

  getLinkPoint = (point: IPoint): IPoint | null => {
    const id = this.model.id;
    const nodeState = this.model;
    const type: string = nodeState['type'];
    const itemType: string = nodeState['type'];
    let centerX;
    let centerY;
    const bbox = this.getBBox(id);
    if (itemType === 'combo') {
      centerX = bbox.centerX || (bbox.maxX + bbox.minX) / 2;
      centerY = bbox.centerY || (bbox.maxY + bbox.minY) / 2;
    } else {
      centerX = bbox.centerX;
      centerY = bbox.centerY;
    }
    const anchorPoints = this.calcAnchorPoints(id);
    let intersectPoint: IPoint | null;
    switch (type) {
      case 'circle':
        intersectPoint = getCircleIntersectByPoint(
          {
            x: centerX!,
            y: centerY!,
            r: bbox.width / 2,
          },
          point,
        );
        break;
      case 'ellipse':
        intersectPoint = getEllipseIntersectByPoint(
          {
            x: centerX!,
            y: centerY!,
            rx: bbox.width / 2,
            ry: bbox.height / 2,
          },
          point,
        );
        break;
      default:
        intersectPoint = getRectIntersectByPoint(bbox, point);
    }
    let linkPoint = intersectPoint;
    // 如果存在锚点，则使用交点计算最近的锚点
    if (anchorPoints.length) {
      if (!linkPoint) {
        // 如果计算不出交点
        linkPoint = point;
      }
      linkPoint = getNearestPoint(anchorPoints, linkPoint);
    }
    if (!linkPoint) {
      // 如果最终依然没法找到锚点和连接点，直接返回中心点
      linkPoint = { x: centerX, y: centerY } as IPoint;
    }
    return linkPoint;
  };

  /**
   * 获取从节点关联的所有边
   */
  public getEdges() {
    return this.graph.edgeManager.getEdges(this.model.id);
  }

  /**
   * 获取所有的入边
   */
  public getInEdges() {
    return this.graph.edgeManager.getInEdges(this.model.id);
  }

  /**
   * 获取所有的出边
   */
  public getOutEdges() {
    return this.graph.edgeManager.getOutEdges(this.model.id);
  }

  /**
   * 获取节点的邻居节点
   *
   * @returns {INode[]}
   * @memberof Node
   */
  public getNeighbors(type?: 'target' | 'source' | undefined) {
    const edges = this.getEdges();

    if (type === 'target') {
      // 当前节点为 source，它所指向的目标节点
      const neighhborsConverter = (edge: IEdge) => {
        return edge.getSource() === this;
      };
      return edges.filter(neighhborsConverter).map((edge) => edge.getTarget());
    }
    if (type === 'source') {
      // 当前节点为 target，它所指向的源节点
      const neighhborsConverter = (edge: IEdge) => {
        return edge.getTarget() === this;
      };
      return edges.filter(neighhborsConverter).map((edge) => edge.getSource());
    }

    // 若未指定 type ，则返回所有邻居
    const neighhborsConverter = (edge: IEdge) => {
      return edge.getSource() === this ? edge.getTarget() : edge.getSource();
    };
    return edges.map(neighhborsConverter);
  }

  getBBox(id) {
    return {};
  }

  getAnchorPoints(id) {
    return [];
  }

  translate(pos) {
    const { x, y } = this.model;
    this.model = {
      ...this.model,
      ...{
        x: x + pos.x,
        y: y + pos.y,
      },
    };
  }

  inject(key, fn) {
    this[key] = fn;
  }
}