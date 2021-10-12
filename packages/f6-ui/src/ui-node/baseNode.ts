import EE from '@antv/event-emitter';
import Element from '@antv/g-base/lib/abstract/element';
import { UIDocument } from '.';

export default class BaseNode extends EE {
  isMounted: boolean;
  gNode: Element;
  ownerDocument: UIDocument;
  updateStyleAndLayout() {}
}
