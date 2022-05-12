import { each } from '@antv/util';
import { getBBox } from '../utils/graphic';
import {
  distance,
  getCircleIntersectByPoint,
  getEllipseIntersectByPoint,
  getRectIntersectByPoint,
} from '../utils/math';

export const calcBBox = (ele) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const stack = [ele];
  while (stack.length) {
    const ele = stack.pop();
    if (ele.config.type !== 'g') {
      const gBBox = ele.getLocalBounds();
      let { lineWidth = 0 } = ele.style;

      if (!ele.attr('stroke')) {
        lineWidth = 0;
      }
      const halfLineWidth = lineWidth / 2;
      const [gMinX, gMinY] = gBBox.getMin();
      const [gMaxX, gMaxY] = gBBox.getMax();

      minX = Math.min(minX, gMinX - halfLineWidth);
      maxX = Math.max(maxX, gMaxX + halfLineWidth);
      minY = Math.min(minY, gMinY - halfLineWidth);
      maxY = Math.max(maxY, gMaxY + halfLineWidth);
    }
    stack.push(...ele.getChildren());
  }
  return {
    x: minX,
    y: minY,
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const calculateBBox = (keyShape, matrix) => {
  // 因为 group 可能会移动，所以必须通过父元素计算才能计算出正确的包围盒
  const bbox = getBBox(keyShape, matrix);
  bbox.x = bbox.minX;
  bbox.y = bbox.minY;
  bbox.width = bbox.maxX - bbox.minX;
  bbox.height = bbox.maxY - bbox.minY;
  bbox.centerX = (bbox.minX + bbox.maxX) / 2;
  bbox.centerY = (bbox.minY + bbox.maxY) / 2;
  return bbox;
};

export const calcMatrix = (adapteredEle): number[] => {
  const rotation = (adapteredEle.getLocalEulerAngles() * Math.PI) / 180;
  const [sx, sy] = adapteredEle.getLocalScale();
  const [tx, ty] = adapteredEle.getLocalPosition();

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return [sx * cos, sy * sin, 0, -sx * sin, sy * cos, 0, tx, ty, 1];
};

/**
 * 根据锚点的索引获取连接点
 * @param  {Number} index 索引
 */
export const getLinkPointByAnchor = (nodeState, index: number): IPoint => {
  const anchorPoints = getAnchorPoints(nodeState);
  return anchorPoints[index];
};

export const getAnchorPoints = (state): IPoint[] => {
  // let anchorPoints: IPoint[] = this.get(CACHE_ANCHOR_POINTS);
  // if (!anchorPoints) {
  const anchorPoints = [];
  // const shapeFactory = this.get('shapeFactory');
  const bbox = state.keyShapeBBox;
  const points = state.anchorPoints;
  // const points = shapeFactory.getAnchorPoints(type, state) || [];

  each(points, (pointArr, index) => {
    const point = {
      x: bbox.minX + pointArr[0] * bbox.width,
      y: bbox.minY + pointArr[1] * bbox.height,
      anchorIndex: index,
    };
    anchorPoints.push(point);
  });
  // this.set(CACHE_ANCHOR_POINTS, anchorPoints);
  // }
  return anchorPoints;
};

/**
 * 获取连接点
 * @param point
 */
export const getLinkPoint = (nodeState, point: IPoint): IPoint | null => {
  const type: string = nodeState['type'];
  const itemType: string = nodeState['type'];
  let centerX;
  let centerY;
  const bbox = nodeState.keyShapeBBox;
  if (itemType === 'combo') {
    centerX = bbox.centerX || (bbox.maxX + bbox.minX) / 2;
    centerY = bbox.centerY || (bbox.maxY + bbox.minY) / 2;
  } else {
    centerX = bbox.centerX;
    centerY = bbox.centerY;
  }
  const anchorPoints = getAnchorPoints(nodeState);
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

export const getNearestPoint = (points: IPoint[], curPoint: IPoint): IPoint => {
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
