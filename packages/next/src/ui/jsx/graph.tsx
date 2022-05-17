import { jsx, Component, AdapterHammer } from '@antv/f-engine';
import { createGlobalContext, getGlobalContext, GlobalContext } from '../../service';
import { GraphRoot } from './graphRoot';

export class Graph extends Component {
  hammer = null;
  constructor(props) {
    super(props);
    createGlobalContext();
  }

  willMount(): void {
    const { layout } = this.props;
    const { width, height } = this.context.root.props;

    this.hammer = new AdapterHammer(this.context.canvas);

    this.hammer.on('*', getGlobalContext().eventService.canvasHandler);

    getGlobalContext().layoutService.setLayoutConfig(layout, width, height);
  }

  didMount(): void {
    const { modes } = this.props;
    getGlobalContext().modeService.setModes(modes);
  }

  render() {
    return (
      <GraphRoot
        onTouchStart={() => {
          console.log('afsdjkfdjs');
        }}
        {...this.props}
      ></GraphRoot>
    );
  }
}
