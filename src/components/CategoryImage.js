export function defineImageCategory(categoryName) {
  switch (categoryName) {
    case 'Fried Chicken':
      return require('../assets/fried-chicken.png');
    case 'Rice':
      return require('../assets/rice.png');
    case 'Seafood':
      return require('../assets/seafood.png');
    case 'Noodle':
      return require('../assets/noodle.png');
    default:
      return require('../assets/food.png');
  }
}
