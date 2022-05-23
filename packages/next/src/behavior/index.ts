import { BehaviorService } from './behaviorService';
import { DragCanvas } from './drag-canvas';
import { DragCombo } from './drag-combo';
import { DragNode } from './drag-node';

BehaviorService.registerBehavior('drag-canvas', DragCanvas);
BehaviorService.registerBehavior('drag-node', DragNode);
BehaviorService.registerBehavior('drag-combo', DragCombo);

export * from './base';
export * from './behaviorService';
