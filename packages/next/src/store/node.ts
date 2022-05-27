import { computed, injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { Entity } from './entity';
import { each } from '@antv/util';
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

export class Node extends Entity {
  state = {
    entities: {},
    ids: [],
  };
  rootId = null;

  setRootId(id) {
    this.rootId = id;
  }

  @computed((self) => [self.state.ids])
  getTree() {
    return this.state.entities[this.rootId];
  }

  createOne(item: any) {
    item.type = item.type || 'circle';
    item.visible = true;
    return item;
  }

  @computed((self, id) => [self.state.entities[id]])
  calcAnchorPoints(id) {
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

  getLinkPointByAnchor(id, index: number) {
    const anchorPoints = this.calcAnchorPoints(id);
    return anchorPoints[index];
  }

  getLinkPoint = (id, point: IPoint): IPoint | null => {
    const nodeState = this.state.entities[id];

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
    if (Number.isNaN(linkPoint.x)) debugger;
    return linkPoint;
  };

  getBBox(id) {
    return {};
  }

  getAnchorPoints(id) {
    return [];
  }

  @injectTrigger
  translate(data, state?) {
    const { id, x, y } = data;
    const entity = state.entities[id];
    entity.x += x;
    entity.y += y;
  }

  inject(key, fn) {
    this[key] = fn;
  }
}

export const node = new Node();
