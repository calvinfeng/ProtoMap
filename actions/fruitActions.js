export const addOrange = {
  type: 'ADD_FRUIT',
  fruit: 'orange'
};

export const addApple = {
  type: 'ADD_FRUIT',
  fruit: 'apple'
};

export const addBanana = {
  type: 'ADD_FRUIT',
  fruit: 'banana'
};

export const addFruit = (fruit) => {
  return {
    type: "ADD_FRUIT",
    fruit: fruit
  };
}
