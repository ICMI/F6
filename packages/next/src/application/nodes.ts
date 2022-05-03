import { createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { mix } from '@antv/util';
import { injectGlobalContext } from '../utils';

export const nodesAdapter = createEntityAdapter();

export function getInitState() {
  return nodesAdapter.getInitialState();
}

export function getInitNodeState() {
  return {
    id: '',
    groupId: '',
    comboId: '',
    children: [],
    description: '',
    descriptionCfg: {
      style: {},
    },
    img: '',
    innerR: 0,
    direction: '',
    preRect: {
      show: false,
    },
    logoIcon: {
      show: false,
    },
    stateIcon: {
      show: false,
    },
    linkPoints: {
      top: false,
      right: false,
      bottom: false,
      left: false,
      size: 0,
      lineWidth: 0,
      fill: '',
      stroke: '',
      r: 0,
    },
    icon: {
      show: false,
      // icon的地址，字符串类型
      img: '',
      text: '',
      width: 0,
      height: 0,
      offset: 0,
    },
    clipCfg: {
      show: false,
      type: '',
      // circle
      r: 0,
      // ellipse
      rx: 0,
      ry: 0,
      // rect
      width: 0,
      height: 0,
      // polygon
      points: [],
      // path
      path: [],
      // 坐标
      x: 0,
      y: 0,
      // clip 的属性样式
      // style: ShapeStyle
    },
  };
}

export class Node {
  @injectGlobalContext
  globalContext;

  initNodes = (state, action) => {
    const data = action.payload;
    data?.forEach((node) => {
      node.id = node.id || uuid();
      node.visible = true;
    });
    nodesAdapter.setAll(state, action);
  };

  updateNode = (state, action) => {
    nodesAdapter.updateOne(state, action);
  };

  updateManyNode = (state, action) => {
    nodesAdapter.updateMany(state, action);
  };
}

export const { initNodes, updateNode, updateManyNode } = new Node();
