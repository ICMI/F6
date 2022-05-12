import { jsx } from '@antv/f-engine';
import { Global } from '../../../../const';
import { BaseNode } from './base';
export class SimpleCircle extends BaseNode {
  static getOptions() {
    return {
      size: [Global.defaultCombo.size[0], Global.defaultCombo.size[0]],
      padding: Global.defaultCombo.padding[0],
      animate: true,
      style: {
        stroke: Global.defaultCombo.style.stroke,
        fill: Global.defaultCombo.style.fill,
        lineWidth: Global.defaultCombo.style.lineWidth,
      },
      labelCfg: {
        style: {
          fill: Global.comboLabel.style.fill,
          fontSize: Global.comboLabel.style.fontSize,
        },
        refX: 0,
        refY: 0,
      },
      stateStyles: {
        ...Global.comboStateStyles,
      },
    };
  }

  render() {
    const { combo } = this.props;
    return (
      <group style={{ x: combo?.x || 0, y: combo?.y || 0 }}>
        <circle
          style={{
            r: 20,
            ...combo.style,
          }}
          ref={this.keyShapeRef}
        />
        <text
          style={{
            text: combo?.label,
            ...combo.labelCfg?.style,
          }}
        ></text>
      </group>
    );
  }
}
