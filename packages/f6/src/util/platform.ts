import { CanvasRender, WebglRender, SvgRender } from '@antv/f-engine';

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

    if (!containerEl || !(containerEl instanceof HTMLDivElement)) {
      throw new Error('invalid container');
    }
    const canvas = createCanvas(containerEl, width, height);

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
