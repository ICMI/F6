import React, { useEffect } from 'react';
import { CanvasAdapter } from '@antv/f-engine';
import { Canvas } from '@antv/g-mobile';
import { CanvasRender, WebglRender, SvgRender } from '@antv/f-engine';
import F6 from '@antv/f6';

function createCanvas(container, width, height) {
  const canvasEl = document.createElement('canvas');
  canvasEl.style.display = 'block';
  canvasEl.style.width = width;
  canvasEl.style.height = height;
  container.appendChild(canvasEl);
  return canvasEl;
}

// todo：待验证这几个判定函数是否生效
function isCanvas2DContext(context) {
  return context instanceof CanvasRenderingContext2D;
}

function isWebglContext(context) {
  return context instanceof WebGLRenderingContext;
}
function isWebgl2Context(context) {
  return context instanceof WebGL2RenderingContext;
}

function genRendererByContext(context) {
  if (isCanvas2DContext(context)) {
    return new CanvasRender();
  }

  if (isWebglContext(context) || isWebgl2Context(context)) {
    return new WebglRender();
  }
}

/**
 *  配置生成，支持dom的时候，container + render 模式
 *  非dom环境，context 模式
 */
export function genCanvasCfg(cfg) {
  const { container, width, height, context, pixelRatio, renderer } = cfg || {};
  const canvasCfg = { width, height, context, pixelRatio };

  if (window && document) {
    let containerEl = container;
    if (container !== null && typeof container === 'string') {
      containerEl = document.getElementById(container);
    }

    if (!containerEl || !(container instanceof HTMLDivElement)) {
      throw new Error('invalid container');
    }
    const canvas = createCanvas(container, width, height);

    let renderInstance;
    let context;
    switch (renderer) {
      case 'svg':
        renderInstance = new SvgRender();
        break;
      case 'webgl':
        renderInstance = new WebglRender();
        context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        break;
      case 'webgl2':
        renderInstance = new WebglRender();
        context = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2');
        break;
      default:
        renderInstance = new CanvasRender();
        context = canvas.getContext('2d');
    }
    return {
      ...canvasCfg,
      context,
      renderer: renderInstance,
    };
  }

  if (!context) {
    throw new Error('invalid context');
  }

  return {
    ...canvasCfg,
    renderer: genRendererByContext(context),
  };
}

function addMarker(group) {
  group.addShape('marker', {
    attrs: {
      x: -20,
      y: 0,
      r: 6,
      symbol: F6.Marker.expand,
      stroke: '#666',
      fill: '#fff',
      lineWidth: 1,
    },
    name: 'collapse-icon',
  });
}

function testResetLocalTransform(group) {
  const label = group.addShape('text', {
    fill: 'rgb(0, 0, 0)',
    fontSize: 12,
    text: '1->2:edge-type1',
    textAlign: 'center',
    textBaseline: 'middle',
    x: 0,
    y: 0,
  });
  const newAttrs = {
    anchor: [0, 0, 0],
    origin: {
      '0': 0,
      '1': 0,
      '2': 0,
    },
    opacity: 1,
    fillOpacity: 1,
    strokeOpacity: 1,
    fill: 'rgb(0, 0, 0)',
    stroke: '',
    zIndex: 0,
    visibility: 'visible',
    text: '1->2:edge-type1',
    fontSize: 12,
    fontFamily: 'inherit',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontVariant: 'normal',
    textAlign: 'center',
    textBaseline: 'middle',
    dropShadow: false,
    dropShadowDistance: 5,
    letterSpacing: 0,
    lineHeight: 0,
    lineJoin: 'miter',
    lineCap: 'butt',
    lineWidth: 0,
    miterLimit: 10,
    whiteSpace: 'pre',
    wordWrap: false,
    wordWrapWidth: 0,
    leading: 0,
    dx: 0,
    dy: 0,
    lineAppendWidth: 0,
    x: 262.5,
    y: 30.450000762939453,
  };
  label.resetMatrix();
  label.attr(newAttrs);
  label.resetMatrix();
  label.attr(newAttrs);
}
function testTranslateAndXY(group) {
  // create a circle
  const circle = group.addShape('text', {
    style: {
      x: 100,
      y: 100,
      text: 'jshhaha',
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      shadowColor: 'black',
      shadowBlur: 20,
    },
  });

  circle.resetMatrix();
  circle.translate(100);
}

function testShape(group) {
  group.attr({
    x: 0,
    y: 0,
  });

  const width = 20;
  const height = 20;

  group.addShape('circle', {
    attrs: {
      x: width / 2,
      y: height,
      r: height / 2,
      fill: 'red',
    },
  });

  group.addShape('rect', {
    attrs: {
      x: width / 2,
      y: height * 2,
      width: width,
      height: height,
      fill: 'red',
    },
  });

  group.addShape('ellipse', {
    attrs: {
      x: width / 2,
      y: height * 3,
      rx: width / 2,
      ry: height / 2,
      fill: 'red',
    },
  });

  group.addShape('image', {
    attrs: {
      x: width / 2,
      y: height * 4,
      img: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
      width,
      height,
    },
  });

  group.addShape('line', {
    attrs: {
      x1: width / 2,
      y1: height * 5.5,
      x2: 100,
      y2: height * 5,
      stroke: '#000',
    },
  });

  group.addShape('path', {
    attrs: {
      // x: 0,
      // y: 0,  path的 x, y 两个版本不一致，
      path: [
        ['M', 100, 100],
        ['L', 200, 200],
      ],
      stroke: '#F04864',
      fill: 'red',
    },
  });

  group.addShape('text', {
    attrs: {
      x: 100,
      y: 100,
      fontFamily: 'PingFang SC',
      text: '这是测试文本This is text',
      fontSize: 20,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 5,
      textBaseline: 'bottom',
    },
  });

  group.addShape('polygon', {
    attrs: {
      points: [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 100],
      ],
      stroke: '#1890FF',
      lineWidth: 2,
    },
  });

  group.addShape('polyline', {
    attrs: {
      points: [
        [50, 50],
        [100, 50],
        [100, 100],
        [150, 100],
        [150, 150],
        [200, 150],
        [200, 200],
        [250, 200],
        [250, 250],
        [300, 250],
        [300, 300],
        [350, 300],
        [350, 350],
        [400, 350],
        [400, 400],
        [450, 400],
      ],
      stroke: '#1890FF',
      lineWidth: 2,
    },
  });
}

function testPath(group) {
  group.translate(100, 100);
  const path = group.addShape('path', {
    attrs: {
      fill: '#aaa',
      stroke: '#000',
      visibility: 'visible',
      lineWidth: 1,
      type: 'path',
      path: [
        ['M', 0, -8],
        ['L', 8, 0],
        ['L', 0, 8],
        ['Z', 0, -8],
        ['M', 0, 0],
        ['L', -8, -8],
        ['L', -8, 8],
        ['Z'],
      ],
    },
  });
  setTimeout(() => {
    path.translate(1);
  }, 1000);
}

function createGmobile(width, height, container) {
  const cfg = {
    width,
    height,
    container,
  };
  return new Canvas(cfg);
}

function createFegine(width, height, container) {
  const cfg = genCanvasCfg({
    width,
    height,
    rendderer: 'canvas',
    container,
  });

  return new CanvasAdapter(cfg);
}

export default () => {
  const GMobileref = React.useRef(null);
  const FEngineref = React.useRef(null);
  const height = window.innerHeight - 32; // demos padding
  const width = window.innerWidth - 32;
  useEffect(() => {
    const canvas4 = createGmobile(width / 2, height, GMobileref.current);
    const canvas5 = createFegine(width / 2, height, FEngineref.current);

    const group4 = canvas4.addGroup();
    const group5 = canvas5.addGroup();
    testPath(group4);
    testPath(group5);
  });

  return (
    <div style={{ width, height, display: 'flex' }}>
      <div ref={GMobileref} style={{ flexGrow: 1 }}></div>
      <div ref={FEngineref} style={{ flexGrow: 1 }}></div>
    </div>
  );
};
