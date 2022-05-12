import { jsx, Component } from '@antv/f-engine';
import { isEqualWith } from '@antv/util';
import { store } from '../../store';

export function connector(mapStatetoProps?, mapActionstoProps?) {
  return function (WrapperComponent) {
    return class Connector extends Component {
      willMount(): void {
        store.subscribe(this.updateProps);
        this.updateProps(true);
      }

      updateProps = (isFirst = false) => {
        // 传入state和props
        var stateProps = mapStatetoProps ? mapStatetoProps(store.getState(), this.props) : {};
        // 传入dispatch和props
        var actionProps = mapActionstoProps ? mapActionstoProps(store.dispatch, this.props) : {};

        isFirst &&
          (this.state = {
            allProps: {
              ...stateProps,
              ...actionProps,
              ...this.props,
            },
          });

        !isFirst &&
          this.setState({
            allProps: {
              ...stateProps,
              ...actionProps,
              ...this.props,
            },
          });
      };
      render() {
        const { forwardRef } = this.props;
        return <WrapperComponent {...this.state.allProps} ref={forwardRef} />;
      }
    };
  };
}
