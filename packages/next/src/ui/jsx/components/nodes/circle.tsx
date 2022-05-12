import { jsx } from '@antv/f-engine';
import { Global } from '../../../../const';
import { BaseNode } from './base';
export class SimpleCircle extends BaseNode {
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
    const { node } = this.props;
    return (
      <group style={{ x: node?.x || 0, y: node?.y || 0 }}>
        <circle
          style={{
            r: 20,
            ...node.style,
          }}
          ref={this.keyShapeRef}
        />
        <text
          style={{
            text: node?.label,
            ...node.labelCfg?.style,
          }}
        ></text>
      </group>
    );
  }
}
