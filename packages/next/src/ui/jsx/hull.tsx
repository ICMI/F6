import { jsx, Component, renderShape } from '@antv/f-engine';
import { getNode } from './components/nodes';
import { connect, connector } from './connector';

import { IGroup } from '@antv/g-base';
import { deepMix, isString } from '@antv/util';
import { parsePathString } from '@antv/path-util';
import { pathToPoints, getClosedSpline, roundedHull, paddedHull } from '../../utils/path';

import { isPolygonsIntersect } from '../../utils/math';

import { genConvexHull } from '../hull/convexHull';
import { genBubbleSet } from '../hull/bubbleset';

@connect((graph, props) => {
  const hull = graph.hullManager.byId(props.id);

  return {
    hull: hull.model,
    members: graph.nodeManager.models.filter((node) => {
      return hull.model.members?.includes(node.id);
    }),
    nonMembers: graph.nodeManager.models.filter((node) => {
      return hull.model.nonMembers?.includes(node.id);
    }),
    getItem: graph.getItem.bind(graph),
  };
})
export class Hull extends Component {
  nodeRef = { current: null };
  padding = 0;
  type = '';

  cfg = {
    type: 'round-convex', // 'round-convex' /'smooth-convex' / 'bubble'
    members: [],
    nonMembers: [],
    style: {
      fill: 'lightblue',
      stroke: 'blue',
      opacity: 0.2,
    },
    padding: 10,
  };

  getShapeNode() {
    return this.nodeRef.current;
  }

  getKeyShape() {
    return this.nodeRef.current?.getKeyShape();
  }

  getNodeRoot() {
    return this.nodeRef.current?.getRootShape();
  }

  setPadding() {
    const { getNodeBBox, members } = this.props;
    const nodeSize = members.length && getNodeBBox(members[0].id).width / 2;
    this.padding = this.cfg.padding > 0 ? this.cfg.padding + nodeSize : 10 + nodeSize;
    this.cfg.bubbleCfg = {
      nodeR0: this.padding - nodeSize,
      nodeR1: this.padding - nodeSize,
      morphBuffer: this.padding - nodeSize,
    };
  }

  setType() {
    const { members } = this.props;
    this.type = this.cfg.type;
    if (members.length < 3) {
      this.type = 'round-convex';
    }
    if (this.type !== 'round-convex' && this.type !== 'smooth-convex' && this.type !== 'bubble') {
      console.warn(
        'The hull type should be either round-convex, smooth-convex or bubble, round-convex is used by default.',
      );
      this.type = 'round-convex';
    }
  }

  calcPath(members: Item[], nonMembers: Item[]) {
    const { getNodeBBox } = this.props;
    let contour, path, hull;
    const functionalMembers = members.map((node) => {
      return {
        x: node.x,
        y: node.y,
        getBBox: () => {
          return getNodeBBox(node.id);
        },
      };
    });
    const functionalNoneMembers = nonMembers.map((node) => {
      return {
        x: node.x,
        y: node.y,
        getBBox: () => {
          return getNodeBBox(node.id);
        },
      };
    });
    switch (this.type) {
      case 'round-convex':
        contour = genConvexHull(functionalMembers);
        hull = roundedHull(
          contour.map((p) => [p.x, p.y]),
          this.padding,
        );
        path = parsePathString(hull);
        break;
      case 'smooth-convex':
        contour = genConvexHull(functionalMembers);
        if (contour.length === 2) {
          hull = roundedHull(
            contour.map((p) => [p.x, p.y]),
            this.padding,
          );
          path = parsePathString(hull);
        } else if (contour.length > 2) {
          hull = paddedHull(
            contour.map((p) => [p.x, p.y]),
            this.padding,
          );
          path = getClosedSpline(hull);
        }
        break;
      case 'bubble':
        contour = genBubbleSet(functionalMembers, functionalNoneMembers, this.cfg.bubbleCfg);
        path = contour.length >= 2 && getClosedSpline(contour);
        break;
      default:
    }
    return path;
  }

  willMount(): void {}

  didMount(): void {
    // console.log('renderShpae: ', this, render(this, this.render(), false));
  }
  render() {
    const { hull, members, nonMembers } = this.props;
    this.setType();
    this.setPadding();
    const path = this.calcPath(members, nonMembers);
    return (
      <Path2
        style={{
          ...{ ...this.cfg.style, ...(hull.style || {}) },
          path,
        }}
      ></Path2>
    );
  }
}

function Path2(props) {
  const { style, onClick } = props;
  return <path style={style} onClick={onClick}></path>;
}
