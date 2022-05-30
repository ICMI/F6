import { uniqueId } from '@antv/util';
import { computed, injectTrigger } from './store';

class Animate {
  state = {
    entities: {},
    appear: {},
    update: {},
    end: {},
    relationIds: {},
  };

  @injectTrigger()
  addOne(data, state?) {
    const { type = 'update', relationNodeId } = data;
    const id = uniqueId();
    state.entities[id] = data;
    state[type][id] = 1;
    state.relationIds[relationNodeId] = state.relationIds[relationNodeId] || {};
    state.relationIds[relationNodeId][id] = 1;
  }

  @injectTrigger()
  addMany(data, state?) {
    data?.forEach((data) => {
      const { type = 'update', relationNodeId } = data;
      const id = uniqueId();
      state.entities[id] = data;
      state[type][id] = 1;
      state.relationIds[relationNodeId] = state.relationIds[relationNodeId] || {};
      state.relationIds[relationNodeId][id] = 1;
    });
  }

  @injectTrigger()
  removeOne(data, state?) {
    const id = data.id;
    const entity = state.entities[id];
    const { relationNodeId, type } = entity;
    delete state.entities[id];
    delete state[type][id];
    delete state.relationIds[relationNodeId];
  }

  @computed((self) => [self.state.appear])
  getAppear(id) {
    const animationIds = Object.keys(this.state.relationIds[id] || []);
    if (!animationIds) return;
    const appearIds = this.state.appear;
    const appears = [];
    animationIds.forEach((id) => {
      appearIds[id] && appears.push(id);
    });
    return this.state.entities[appears[0]];
  }

  @computed((self) => [self.state.update])
  getUpdate(id) {
    const animationIds = Object.keys(this.state.relationIds[id] || []);
    if (!animationIds) return;
    const updateIds = this.state.update;
    const appears = [];
    animationIds.forEach((id) => {
      updateIds[id] && appears.push();
    });
    return this.state.entities[updateIds[0]];
  }

  @computed((self) => [self.state.end])
  getEnd(id) {
    const animationIds = Object.keys(this.state.relationIds[id] || []);
    if (!animationIds) return;
    const endIds = this.state.end;
    const appears = [];
    animationIds.forEach((id) => {
      endIds[id] && appears.push();
    });
    return this.state.entities[endIds[0]];
  }
}

export const animate = new Animate();
