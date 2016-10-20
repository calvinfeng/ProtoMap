const fruitsReducer = (state = [], action) => {
  Object.freeze(state);
  switch (action.type) {
    case 'ADD_FRUIT':
      return [...state, action.fruit];

    case "ADD_FRUITS":
      return [...state, ...action.fruits];

    case "SELL_FRUIT":
      const idx = state.indexOf(action.fruit);
      if (idx !== -1) {
        return [...state.slice(0, idx), ...state.slice(idx + 1)];
      } else {
        return state;
      }

    case "SELL_OUT":
      return [];

    default:
      return state;
  }
};
export default fruitsReducer;
