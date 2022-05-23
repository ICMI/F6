import { jsx, Canvas as FCanvas, Component, AdapterHammer } from '@antv/f-engine';
import { createGlobalContext } from '../../service';

import { genCanvasCfg } from '../../utils';

export class Canvas extends FCanvas {
  hammer = null;
  constructor(props) {
    const { width, height, container, renderer, devicePixelRatio, layout } = props;

    const cfg = genCanvasCfg({
      width: width,
      height: height,
      renderer,
      devicePixelRatio,
      container,
    });

    super({
      ...props,
      ...cfg,
    });
  }
}
