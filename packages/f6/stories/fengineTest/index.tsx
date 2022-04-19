import React, { useEffect, useState } from 'react';
import { CanvasAdapter, Canvas, Component } from '@antv/f-engine';
import { Canvas as Canvas4 } from '@antv/g-mobile';
import { CanvasRenderer, WebglRenderer, SvgRenderer } from '@antv/f-engine';
import F6 from '@antv/f6';

function createCanvas(container, width, height) {
  const canvasEl = document.createElement('canvas');
  canvasEl.style.display = 'block';
  canvasEl.style.width = width;
  canvasEl.style.height = height;
  canvasEl.width = width;
  canvasEl.height = height;
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
    return new CanvasRenderer();
  }

  if (isWebglContext(context) || isWebgl2Context(context)) {
    return new WebglRenderer();
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
    let canvas;
    if (renderer !== 'svg') {
      canvas = createCanvas(container, width, height);
    }

    let renderInstance;
    let context;
    switch (renderer) {
      case 'svg':
        renderInstance = new SvgRenderer();
        break;
      case 'webgl':
        renderInstance = new WebglRenderer();
        context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        break;
      case 'webgl2':
        renderInstance = new WebglRenderer();
        context = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2');
        break;
      default:
        renderInstance = new CanvasRenderer();
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
  return new Canvas4(cfg);
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

function testRotate(group) {
  group = group.addGroup({
    id: 'testGroup',
    attrs: {
      x: 100,
      y: 100,
    },
  });

  group.addShape('rect', {
    className: 'circle-keyShape',
    attrs: {
      opacity: 1,
      width: 161,
      height: 42,
      stroke: '#096dd9',
      radius: 4,
      key: 'root -0 ',
      x: 0,
      y: 0,
      lineWidth: 10,
    },
  });
  group.rotate(Math.PI / 4);
}

function testPan(group) {
  group = group.addGroup({
    id: 'testGroup',
    attrs: {
      x: 100,
      y: 100,
    },
  });

  group.addShape('rect', {
    className: 'circle-keyShape',
    attrs: {
      opacity: 1,
      width: 161,
      height: 42,
      stroke: '#096dd9',
      radius: 4,
      key: 'root -0 ',
      x: 0,
      y: 0,
      lineWidth: 10,
    },
  });
  group.on('panstart', () => {
    console.log('panstart');
  });
  group.on('panmove', () => {
    console.log('panmove');
  });
  group.on('panend', () => {
    console.log('panend');
  });
}

function testTextWidth(group) {
  const shape = group.addShape('text', {
    attrs: {
      fontFamily: 'PingFang SC',
      text: '0.123',
      fill: '#1890FF',
      textBaseline: 'top',
      lineWidth: 1,
      fontSize: 12,
    },
  });
  console.log(shape.getBBox());
}

function testMassG5(container, width, height, count = 500) {
  const canvas5 = createFegine(width, height, container);
  const group = canvas5.addGroup();
  const groups = Array(count)
    .fill(1)
    .map(() => {
      const gg = group.addGroup();
      gg.addShape('text', {
        attrs: {
          x: 100,
          y: 100,
          fontFamily: 'PingFang SC',
          text: '这是测试文本This is text',
          fontSize: 15,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 5,
        },
      });
      gg.addShape('circle', {
        attrs: {
          r: 20,
          fill: '#000',
        },
      });
      return gg;
    });

  const loop = () => {
    groups.forEach((group) =>
      group.adapteredEle.attr({
        x: Math.random() * width,
        y: Math.random() * height,
      }),
    );
    setTimeout(loop, 100);
  };
  loop();
}

function testJSX(container, width, height, count = 500) {
  class View1 extends Component {
    state = {
      x: 0,
      y: 0,
    };

    didMount() {
      const loop = () => {
        this.setState({
          x: Math.random() * width,
          y: Math.random() * height,
        });
        setTimeout(loop, 100);
      };
      loop();
    }

    render() {
      const { x, y } = this.state;
      return (
        <group style={{ x, y }}>
          <circle
            style={{
              r: 20,
              fill: '#000',
            }}
            // animation={{
            //   appear: {
            //     // easing: 'linear',
            //     duration: 400,
            //     // delay: 0,
            //     // property: ['fillOpacity'],
            //     start: {
            //       r: 0,
            //     },
            //     end: {
            //       r: 20,
            //     },
            //   },
            // }}
          />
          <text
            style={{
              x: 100,
              y: 100,
              fontFamily: 'PingFang SC',
              text: '这是测试文本This is text',
              fontSize: 15,
              fill: '#1890FF',
              stroke: '#F04864',
              lineWidth: 5,
            }}
            onClick={() => {
              console.log('click text');
            }}
          />
        </group>
      );
    }
  }

  const cfg = genCanvasCfg({
    width: width * 2,
    height: height * 2,
    renderer: 'canvas',
    devicePixelRatio: 2,
    container,
  });

  const { props } = (
    <Canvas renderer={cfg.renderer} context={cfg.context} devicePixelRatio={2}>
      {Array(count)
        .fill(1)
        .map(() => (
          <View1 />
        ))}
    </Canvas>
  );
  const canvas = new Canvas(props);
  canvas.render();
}

export default () => {
  const GMobileref = React.useRef(null);
  const FEngineref = React.useRef(null);
  const height = window.innerHeight - 32; // demos padding
  const width = window.innerWidth - 32;
  useEffect(() => {
    // const canvas4 = createGmobile(width / 2, height, GMobileref.current);
    // const canvas5 = createFegine(width/2, height/2, FEngineref.current);
    // const group5 = canvas5.addGroup();
    // const group4 = canvas4.addGroup();
    // testTextWidth(group4);
    // testTextWidth(group5);
    // testMassG5(FEngineref.current, width, height, 100);
    testJSX(FEngineref.current, width, height, 100);
  });

  return (
    <div style={{ width, height, display: 'flex' }}>
      <div ref={GMobileref} style={{ flexGrow: 1 }}></div>
      <div ref={FEngineref} style={{ flexGrow: 1 }}></div>
    </div>
  );
};
