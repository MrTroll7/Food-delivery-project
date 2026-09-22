const catalogGrid = document.querySelector('.catalog-grid');
const cuisineFilter = document.getElementById('cuisine-filter');
const ServerURL='/api';


let allDishes = []; // Массив для хранения всех загруженных блюд

// 1. Загрузка позиций из БД / API
async function loadDishes() {
  try {
    const response = await fetch(`${ServerURL}/dishes`); // Укажите ваш URL эндпоинта
    allDishes = await response.json();

    populateCuisineFilter(allDishes);

    renderDishes(allDishes);
  } catch (error) {
    console.error('Ошибка при загрузке блюд:', error);
  }
}

function populateCuisineFilter(dishes) {
  if (!cuisineFilter) return;

  const cuisines = [...new Set(
    dishes
      .map(dish => dish.category) // Поле кухни из БД
      .filter(Boolean) // Исключаем пустые значения/null
  )];

  cuisineFilter.innerHTML = '<option value="all">Все кухни</option>';

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
}

function renderDishes(dishes) {
  if (!catalogGrid) return;
  catalogGrid.innerHTML = '';

  if (dishes.length === 0) {
    catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Блюда не найдены</p>';
    return;
  }

  dishes.forEach(dish => {
  const card = document.createElement('article');
  card.className = 'dish-card';
  card.innerHTML =`
      <a href="dish.html?id=${dish.id}" class="dish-link">
      <img src="${ServerURL}${dish.image}" alt="${dish.title}" loading="lazy">
      <div class="dish-info">
          <h3>${dish.title}</h3>
          <p>Кухня: ${dish.category}</p>
      </div>
      </a>
      <div class="dish-footer">
          <span class="dish-price">${dish.price} ₽</span>
          <button class="dish-btn" data-id="${dish.id}">В корзину</button>
      </div>   
  `

  ;

  card.querySelector('.dish-btn').addEventListener('click', () => {
    addToCart(dish);
  });

  catalogGrid.appendChild(card);
  });
}

// 4. Обработчик события изменения выбранной кухни
if (cuisineFilter) {
  cuisineFilter.addEventListener('change', (e) => {
    const selectedCuisine = e.target.value;

    if (selectedCuisine === 'all') {
      renderDishes(allDishes);
    } else {
      const filteredDishes = allDishes.filter(dish => 
        dish.category === selectedCuisine
      );
      renderDishes(filteredDishes);
    }
  });
}
loadDishes();
document.addEventListener('DOMContentLoaded', loadDishes);
