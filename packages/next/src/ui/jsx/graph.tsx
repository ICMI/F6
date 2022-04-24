import { Canvas, Component } from '@antv/f-engine';
import { createF6 } from '../../f6';
import { genCanvasCfg } from '../../utils';
export class Graph extends Component {
  f6 = null;
  state = {
    canvas: {
      width: 100,
      height: 200,
      renderer: 'canvas',
      devicePixelRatio: 2,
    },
    context: null,
    renderer: null,
  };
  constructor(props) {
    super(props);
    // 初始化service
    this.f6 = createF6();

    // this.f6.store.subscribe('canvas', () => {
    //   this.setState({
    //     canvas: this.f6.sotre.canvas,
    //   });
    // });
  }

  didMount() {
    const { width, height, container, renderer } = this.props;

    // 通知更新全局state

    const cfg = genCanvasCfg({
      width,
      height,
      renderer: 'canvas',
      devicePixelRatio: 2,
      container,
    });

    this.setState({
      renderer: cfg.renderer,
      context: cfg.context,
    });
  }

  render() {
    const { context, renderer } = this.state;
    const { width, height } = this.props;
    return <Canvas context={context} renderer={renderer} width={width} height={height}></Canvas>;
  }
}
