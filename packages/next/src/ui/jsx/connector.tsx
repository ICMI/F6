import { jsx, Component } from '@antv/f-engine';
import { isEqualWith } from '@antv/util';
import { store } from '../../store';

export function connector(mapStatetoProps?, mapActionstoProps?) {
  return function (WrapperComponent) {
    return class Connector extends Component {
      isFirst = true;

      prevProps = {};

      willMount(): void {
        store.subscribe(this.updateProps);
        this.updateProps();
        this.isFirst = false;
      }

      updateProps = () => {
        // 传入state和props
        var stateProps = mapStatetoProps ? mapStatetoProps(store.getState(), this.props) : {};
        let isEqual = true;
        for (const [key, value] of Object.entries(stateProps || {})) {
          if (this.prevProps[key] !== value) {
            isEqual = false;
          }
        }
        if (isEqual) return;

        this.prevProps = stateProps;
        // 传入dispatch和props
        var actionProps = mapActionstoProps ? mapActionstoProps(store.dispatch, this.props) : {};

        this.isFirst &&
          (this.state = {
            allProps: {
              ...stateProps,
              ...actionProps,
              ...this.props,
            },
          });

        if (!this.isFirst) {
          this.setState({
            allProps: {
              ...stateProps,
              ...actionProps,
              ...this.props,
            },
          });
        }
      };

      render() {
        const { forwardRef } = this.props;
        return <WrapperComponent {...this.state.allProps} ref={forwardRef} />;
      }
    };
  };
}
