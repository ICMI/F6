import { jsx } from '@antv/f-engine';
import { Global } from '../../../../const';
import { BaseEdge } from './base';
export class Line extends BaseEdge {
  static getOptions() {
    return {
      size: Global.defaultNode.size,
      style: {
        x: 0,
        y: 0,
        stroke: Global.defaultNode.style.stroke,
        fill: Global.defaultNode.style.fill,
        lineWidth: Global.defaultNode.style.lineWidth,
      },
      labelCfg: {
        style: {
          fill: Global.nodeLabel.style.fill,
          fontSize: Global.nodeLabel.style.fontSize,
        },
      },
      stateStyles: {
        ...Global.nodeStateStyles,
      },
    };
  }
  render() {
    const { edge } = this.props;
    const { startPoint, endPoint } = edge;
    return (
      <group>
        <line
          style={{
            r: 20,
            fill: '#000',
            stroke: '#000',
            x1: startPoint?.x,
            y1: startPoint?.y,
            x2: endPoint?.x,
            y2: endPoint?.y,
            points: [
              {
                x: 0,
                y: 0,
              },
              {
                x: 100,
                y: 100,
              },
            ],
          }}
        ></line>
      </group>
    );
  }
}
