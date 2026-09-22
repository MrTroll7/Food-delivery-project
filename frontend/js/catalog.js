let allDishes = []; 
const ServerURL='/api';
const catalogContainer = document.querySelector('.catalog-grid');

async function loadDishes() {
  try {
    const response = await fetch(`${ServerURL}/dishes`);
    const data = await response.json();
    
    allDishes = data.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price, 
      category: item.category,
      image: item.image
    }));

    renderCatalog(allDishes);
  } catch (error) {
    catalogContainer.innerHTML = '<p class="error">Ошибка загрузки меню. Попробуйте позже.</p>';
  }
}

function renderCatalog(dishes) {
  catalogContainer.innerHTML = '';

  if (dishes.length === 0) {
    catalogContainer.innerHTML = '<p>Ничего не найдено</p>';
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

    catalogContainer.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', loadDishes);