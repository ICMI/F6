import { registerUINode, createUINode } from './factory';
import UIDivNode from './div';
import UITextNode from './text';
import UIShapeNode from './shape';
import UIImageNode from './image';
import UIStyleNode from './style';
import UIRootNode from './root';
import UIDocument from './document';

registerUINode('div', UIDivNode);
registerUINode('text', UITextNode);
registerUINode('shape', UIShapeNode);
registerUINode('image', UIImageNode);
registerUINode('root', UIRootNode);
registerUINode('style', UIStyleNode);

export { createUINode, registerUINode, UIDocument };
