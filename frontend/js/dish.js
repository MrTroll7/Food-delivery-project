const urlParams = new URLSearchParams(window.location.search);
const dishId = urlParams.get('id');
const ServerURL='/api';

if (!dishId) {
  window.location.href = 'catalog.html';
}

let currentDish = null;

async function loadDishDetails() {
  try {
    const response = await fetch(`${ServerURL}/dishes/${dishId}`);
    
    if (!response.ok) {
      throw new Error('Блюдо не найдено');
    }

    const data = await response.json();

    currentDish = {
      id: data.id,
      title: data.title,
      caloriesPerServing: data.caloriesPerServing,
      price: data.price,
      category: data.category,
      image: data.image,
      description: data.description || 'Описание отсутствует.',
    };

    renderDishPage(currentDish);
  } catch (error) {
    console.error(error);
    document.querySelector('main').innerHTML = `
      <div class="dish-detail">
        <h2>Блюдо не найдено</h2>
        <a href="catalog.html">Вернуться в каталог</a>
      </div>
    `;
  }
}

function renderDishPage(dish) {
  document.title = `${dish.title} - Ресторан "Военмех .ЕДА"`;

  document.querySelector('.dish-detail h1').textContent = dish.title;
  document.querySelector('.dish-detail .dish-price').textContent = `${dish.price} ₽`;
  const ingredientsElement = document.querySelectorAll('.dish-detail .ingredients p');
  ingredientsElement[0].textContent = `Кухня: ${dish.category}`;
  ingredientsElement[1].textContent = `${dish.description}`;
  ingredientsElement[2].textContent = `Калорийность: ${dish.caloriesPerServing} ккал на порцию.`;
  
  const imgElement = document.querySelector('.dish-detail img');
  imgElement.src = `${ServerURL}${dish.image}`;
  imgElement.alt = dish.title;

  const addBtn = document.querySelector('.dish-detail .dish-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(dish); 
    });
  }
}

document.addEventListener('DOMContentLoaded', loadDishDetails);