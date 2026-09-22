const cartItemsContainer = document.querySelector('.cart-items');
const orderForm = document.getElementById('order-form');
const token = localStorage.getItem("token");

function renderCheckout() {
  const cart = getCart();
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
    <div class="form-group">
        <label>Ваша корзина пуста</label>
    </div>
    `;
    document.querySelector('.checkout-summary p').textContent = `Подытог: 0 ₽`;
    document.querySelector('.total').textContent = `Итого: 0 ₽`;

    return;
  }

  let total = 0;
  checkheader = document.createElement('div');
  checkheader.className = 'form-group';
  checkheader.innerHTML = `
    <span>Название</span>
    <span>Количество</span>
    <span>Цена</span>
    <span>Удалить</span>
  `;
  cartItemsContainer.appendChild(checkheader);
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const row = document.createElement('div');
    row.className = 'form-group';
    row.innerHTML = `
      <span>${item.title}</span>
      <span>${item.price} ₽ × ${item.quantity} </span>
      <span>${itemTotal} ₽</span>
      <button class="btn-remove" data-id="${item.id}">✕</button>
    `;

    row.querySelector('.btn-remove').addEventListener('click', () => {
      removeItemFromCart(item.id);
    });
    
    cartItemsContainer.appendChild(row);
});


document.querySelector('.checkout-summary p').textContent = `Подытог: ${total} ₽`;
document.querySelector('.total').textContent = `Итого: ${total} ₽`;
}

function removeItemFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCheckout();
}

async function sendcheckout() {
  const url = '/api/orders'; 
  const cart = getCart();
  const addressInput = document.getElementById('address-input').value;

  const orderData = {
    address: addressInput,
    items: cart.map(item => ({
      dish_id: item.id,
      quantity: item.quantity
        }))
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Ошибка при отправке заказа');
    }
    else {
      saveCart([]); 
      renderCheckout();
    }

    const result = await response.json();
    console.log('Заказ успешно отправлен:', result);
  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
  }
}


if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const cart = getCart();
    if (cart.length === 0) {
      alert('Корзина пуста! Добавьте блюда перед оформлением.');
      return;
    }
    if (!token) {
    alert("Для оформления заказа необходимо войти в аккаунт");
    window.location.href = "login.html";
    return;
    }

    alert('Заказ успешно создан!');
    sendcheckout(); 
    renderCheckout();
  });
}

document.addEventListener('DOMContentLoaded', renderCheckout);