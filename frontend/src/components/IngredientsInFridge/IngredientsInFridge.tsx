import IngredientsInFridgeBg from '../../assets/ingredientsInFridgeBg.svg';

export default function IngredientsInFridge() {
  const categories = [
    { name: 'Meat', emoji: '🍖' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Vegetables', emoji: '🥦' },
    { name: 'Fruits', emoji: '🍎' },
    { name: 'Dairy', emoji: '🧀' },
    { name: 'Grains', emoji: '🌾' },
    { name: 'Spices', emoji: '🧂' },
    { name: 'Beverages', emoji: '🥤' },
  ];

  return (
    <div
      className="ingredients-in-fridge bg-cover portrait:h-164 sm:portrait:h-[36rem] md:portrait:h-[48rem] p-6 sm:p-12 sm:px-24 md:landscape:p-6 flex md:landscape:justify-end bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${IngredientsInFridgeBg})` }}
    >
      {/* Main Container */}
      <div className="flex flex-col p-4 sm:p-8 gap-4 bg-white h-full w-full md:landscape:w-1/2 xl:landscape:w-2/5 rounded-2xl overflow-y-auto overflow-x-hidden">
        {/* Header Container */}
        <div className="flex flex-col mb-4">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-semibold select-none lg:mb-2">What's in your fridge</h2>
          <p className="text-[0.8rem] sm:text-base lg:text-xl mb-2 text-gray-600 select-none">
            Can’t think of anything to cook? Leave the decision to us and we’ll make sure to not disappoint!
          </p>
          <hr />
        </div>

        {/* Categories Grid */}
       <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              draggable='false'
              key={category.name}
              className="flex select-none cursor-pointer flex-col items-center gap-3 p-6 sm:p-4 md:p-8 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
            >
              <span draggable='false' className="text-xl sm:text-3xl select-none">{category.emoji}</span>
              <span draggable='false' className="text-sm sm:text-lg select-none font-medium">{category.name}</span>
            </div>
          ))}
        </div>

        {/* Footer Container */}
        <div className='flex flex-col items-center mt-8 gap-4'>

          {/* Dynamically updating selected items counter */}
          <p draggable='false' className='text-[0.8rem] sm:text-lg lg:text-xl mb-2 text-gray-600 select-none'>Items Selected:</p>

          {/* Suggest Button */}
          <button draggable='false' className='px-4 py-2 sm:px-5 sm:py-3 lg:px-8 lg:py-5 main-background text-white sm:text-xl lg:text-2xl font-semibold rounded-lg lg:rounded-xl select-none cursor-pointer'>Suggest</button>
        </div>
      </div>
    </div>
  );
}
