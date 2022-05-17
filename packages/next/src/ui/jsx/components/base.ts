import { IGroup, IShape, IElement } from '@antv/g-base';
// import { ShapeOptions, ILabelConfig } from '../interface/shape';
// import { IPoint, Item, LabelStyle, ShapeStyle, ModelConfig, EdgeConfig } from '../types';
import Global from '../../../global';
import { deepMix, each, mix, isBoolean, isPlainObject, clone } from '@antv/util';
import { cloneBesidesImg } from '../../../utils/graphic';
import { Component } from '@antv/f-engine';
import { ext } from '@antv/matrix-util';

const transform = ext.transform;
export const CLS_LABEL_BG_SUFFIX = '-label-bg';

export class BaseShape extends Component {
  // 默认样式及配置
  options = {};
  itemType = ''; // node, edge, combo 等
  /**
   * 形状的类型，例如 circle，ellipse，polyline...
   */
  type = '';
  getCustomConfig(cfg: ModelConfig): ModelConfig {
    return {};
  }
  getOptions(cfg: ModelConfig): ModelConfig {
    return deepMix(
      {
        // 解决局部渲染导致的文字移动残影问题
        labelCfg: {
          style: {
            fontFamily:
              typeof window !== 'undefined' && window.getComputedStyle
                ? window.getComputedStyle(document.body, null).getPropertyValue('font-family') ||
                  'Arial, sans-serif'
                : 'Arial, sans-serif',
          },
        },
        descriptionCfg: {
          style: {
            fontFamily:
              typeof window !== 'undefined' && window.getComputedStyle
                ? window.getComputedStyle(document.body, null).getPropertyValue('font-family') ||
                  'Arial, sans-serif'
                : 'Arial, sans-serif',
          },
        },
      },
      this.options,
      this.getCustomConfig(cfg) || {},
      cfg,
    );
  }

  getLabelStyleByPosition(cfg: ModelConfig, labelCfg?: ILabelConfig, group?: IGroup): LabelStyle {
    return { text: cfg.label as string };
  }
  getLabelBgStyleByPosition(
    label: IElement,
    cfg: ModelConfig,
    labelCfg?: ILabelConfig,
    group?: IGroup,
  ): LabelStyle {
    return {};
  }

  /**
   * 获取文本的配置项
   * @param cfg 节点的配置项
   * @param labelCfg 文本的配置项
   * @param group 父容器，label 的定位可能与图形相关
   */
  getLabelStyle(cfg: ModelConfig, labelCfg: ILabelConfig, group: IGroup): LabelStyle {
    const calculateStyle = this.getLabelStyleByPosition!(cfg, labelCfg, group);
    const attrName = `${this.itemType}Label`; // 取 nodeLabel，edgeLabel 的配置项
    const defaultStyle = (Global as any)[attrName] ? (Global as any)[attrName].style : null;
    const labelStyle = { ...defaultStyle, ...calculateStyle, ...labelCfg.style };
    return labelStyle;
  }

  /**
   * 获取图形的配置项
   * @param cfg
   */
  getShapeStyle(cfg: ModelConfig): ShapeStyle {
    return cfg.style!;
  }

  // update(cfg, item) // 默认不定义
  // afterUpdate(cfg?: ModelConfig, item?: Item) {},
  /**
   * 设置节点的状态，主要是交互状态，业务状态请在 draw 方法中实现
   * 单图形的节点仅考虑 selected、active 状态，有其他状态需求的用户自己复写这个方法
   * @override
   * @param  {String} name 状态名称
   * @param  {String | Boolean} value 状态值
   * @param  {G6.Item} item 节点
   */
  setState(name: string, value: string | boolean, item: Item) {
    const shape: IShape = item.get('keyShape');
    if (!shape || shape.destroyed) return;

    const type = item.getType();

    const stateName = isBoolean(value) ? name : `${name}:${value}`;
    const shapeStateStyle = this.getStateStyle(stateName, item);
    const itemStateStyle = item.getStateStyle(stateName);
    // const originStyle = item.getOriginStyle();

    // 不允许设置一个不存在的状态
    if (!itemStateStyle && !shapeStateStyle) {
      return;
    }

    // 要设置或取消的状态的样式
    // 当没有 state 状态时，默认使用 model.stateStyles 中的样式
    const styles = mix({}, itemStateStyle || shapeStateStyle);

    const group = item.getContainer();

    // 从图元素现有的样式中删除本次要取消的 states 中存在的属性值。使用对象检索更快
    const keptAttrs: any = { x: 1, y: 1, cx: 1, cy: 1 };
    if (type === 'combo') {
      keptAttrs.r = 1;
      keptAttrs.width = 1;
      keptAttrs.height = 1;
    }

    if (value) {
      // style 为要设置的状态的样式
      for (const key in styles) {
        const style = styles[key];
        if (isPlainObject(style) && !ARROWS.includes(key)) {
          const subShape = group.find((element) => element.get('name') === key);
          if (subShape) {
            subShape.attr(style);
          }
        } else {
          // 非纯对象，则认为是设置到 keyShape 上面的
          shape.attr({
            [key]: style,
          });
        }
      }
    } else {
      // 所有生效的 state 的样式
      const enableStatesStyle = cloneBesidesImg(item.getCurrentStatesStyle());

      const model = item.getModel();
      // 原始样式
      const originStyle = mix({}, model.style, cloneBesidesImg(item.getOriginStyle()));

      const keyShapeName = shape.get('name');

      // cloning  shape.attr(), keys.forEach to avoid cloning the img attr, which leads to maximum clone heap #2383
      // const keyShapeStyles = clone(shape.attr())
      const shapeAttrs = shape.attr();
      const keyShapeStyles = {};
      Object.keys(shapeAttrs).forEach((key) => {
        if (key === 'img') return;
        const attr = shapeAttrs[key];
        if (attr && typeof attr === 'object') {
          keyShapeStyles[key] = clone(attr);
        } else {
          keyShapeStyles[key] = attr;
        }
      });

      // 已有样式 - 要取消的状态的样式
      const filtetDisableStatesStyle: any = {};

      // styles 为要取消的状态的样式
      for (const p in styles) {
        const style = styles[p];
        if (isPlainObject(style) && !ARROWS.includes(p)) {
          const subShape = group.find((element) => element.get('name') === p);
          if (subShape) {
            const subShapeStyles = clone(subShape.attr());
            each(style, (v, key) => {
              if (p === keyShapeName && keyShapeStyles[key] && !keptAttrs[key]) {
                delete keyShapeStyles[key];
                const value = originStyle[p][key] || SHAPES_DEFAULT_ATTRS[type][key];
                shape.attr(key, value);
              } else if (subShapeStyles[key] || subShapeStyles[key] === 0) {
                delete subShapeStyles[key];
                const value = originStyle[p][key] || SHAPES_DEFAULT_ATTRS[type][key];
                subShape.attr(key, value);
              }
            });
            filtetDisableStatesStyle[p] = subShapeStyles;
          }
        } else {
          if (keyShapeStyles[p] && !keptAttrs[p]) {
            delete keyShapeStyles[p];
            const value =
              originStyle[p] ||
              (originStyle[keyShapeName] ? originStyle[keyShapeName][p] : undefined) ||
              SHAPES_DEFAULT_ATTRS[type][p];
            shape.attr(p, value);
          }
        }
      }

      // 从图元素现有的样式中删除本次要取消的 states 中存在的属性值后，
      // 如果 keyShape 有 name 属性，则 filtetDisableStatesStyle 的格式为 { keyShapeName: {} }
      // 否则为普通对象
      if (!keyShapeName) {
        mix(filtetDisableStatesStyle, keyShapeStyles);
      } else {
        filtetDisableStatesStyle[keyShapeName] = keyShapeStyles;
      }
      for (const key in enableStatesStyle) {
        if (keptAttrs[key]) continue;
        const enableStyle = enableStatesStyle[key];
        if (!isPlainObject(enableStyle) || ARROWS.includes(key)) {
          // 把样式属性merge到keyShape中
          if (!keyShapeName) {
            mix(originStyle, {
              [key]: enableStyle,
            });
          } else {
            mix(originStyle[keyShapeName], {
              [key]: enableStyle,
            });
            delete originStyle[key];
          }
          delete enableStatesStyle[key];
        }
      }

      const originstyles = {};
      deepMix(originstyles, originStyle, filtetDisableStatesStyle, enableStatesStyle);
      let keyShapeSetted = false;

      for (const originKey in originstyles) {
        const style = originstyles[originKey];
        if (isPlainObject(style) && !ARROWS.includes(originKey)) {
          const subShape = group.find((element) => element.get('name') === originKey);
          if (subShape) {
            if (originKey === keyShapeName) {
              if (type === 'combo') {
                delete (style as any).r;
                delete (style as any).width;
                delete (style as any).height;
              }
              keyShapeSetted = true;
            }
            subShape.attr(style);
          }
        } else if (!keyShapeSetted) {
          const value = style || SHAPES_DEFAULT_ATTRS[type][originKey];
          // 当更新 combo 状态时，当不存在 keyShapeName 时候，则认为是设置到 keyShape 上面的
          if (type === 'combo') {
            if (!keyShapeName) {
              shape.attr({
                [originKey]: value,
              });
            }
          } else {
            shape.attr({
              [originKey]: value,
            });
          }
        }
      }
    }
  }

  /**
   * 获取不同状态下的样式
   *
   * @param {string} name 状态名称
   * @param {Item} item Node或Edge的实例
   * @return {object} 样式
   */
  getStateStyle(name: string, item: Item): ShapeStyle {
    const model = item.getModel();
    const type = item.getType();
    const { stateStyles, style = {} } = this.getOptions(model);

    const modelStateStyle = model.stateStyles
      ? model.stateStyles[name]
      : stateStyles && stateStyles[name];

    if (type === 'combo') {
      return clone(modelStateStyle);
    }
    return mix({}, style, modelStateStyle);
  }
  /**
   * 获取控制点
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 控制点的数组,如果为 null，则没有控制点
   */
  getControlPoints(cfg: EdgeConfig): IPoint[] | undefined {
    return cfg.controlPoints;
  }
  /**
   * 获取控制点
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 锚点的数组,如果为 null，则没有锚点
   */
  getAnchorPoints(cfg: ModelConfig): number[][] | undefined {
    const { anchorPoints } = this.getOptions(cfg) as ModelConfig;
    return anchorPoints;
  }
}
