import { registerUINode, createUINode } from './factory';
import UIDivNode from './UIDivNode';
import UITextNode from './UITextNode';
import UIShapeNode from './UIShapeNode';
import UIImageNode from './UIImageNode';
import UIStyleNode from './UIStyleNode';
import UIRootNode from './UIRootNode';
import UIDocument from './UIDocument';

registerUINode('div', UIDivNode);
registerUINode('text', UITextNode);
registerUINode('shape', UIShapeNode);
registerUINode('image', UIImageNode);
registerUINode('root', UIRootNode);
registerUINode('style', UIStyleNode);

export { createUINode, registerUINode, UIDocument };
