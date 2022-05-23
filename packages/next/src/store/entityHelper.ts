export const createInitState = () => {
  return {
    ids: [],
    entities: {},
  };
};

export const updateOne = (payload, state) => {
  const { id, changes } = payload;
  if (state.entities[id]) {
    state.entities[id] = { ...state.entities[id], ...changes };
  } else {
    state.ids.push(id);
    state.entities[id] = changes;
  }
};

export const updateMany = (payload, state) => {
  payload?.forEach((data) => {
    const { id, changes } = data;
    if (state.entities[id]) {
      state.entities[id] = { ...state.entities[id], ...changes };
    } else {
      state.ids.push(id);
      state.entities[id] = changes;
    }
  });
};
