import merge from 'lodash/merge';
const farmersReducer = (state = {}, action) => {
  let nextState = merge({}, state);
  let farmer;
  switch (action.type) {
    case 'HIRE_FARMER':
      farmer = {
        id: action.id,
        name: action.name,
        paid: false
      }
      nextState[action.id] = farmer;
      return nextState;

    case 'PAY_FARMER':
      farmer = nextState[action.id];
      farmer.bank += action.cash;
      farmer.paid = !farmer.paid;
      return nextState;

    default:
      return state;
  }
};

export default farmersReducer;
