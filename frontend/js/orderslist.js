const ServerURL = '/api';
const token = localStorage.getItem("token");

async function fetchOrders() {
  const response = await fetch(`${ServerURL}/orders`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });
  if (!response.ok) 
    throw new Error('Failed to fetch orders');
  return response.json();
}

async function fetchDish(id) {
  const response = await fetch(`${ServerURL}/dishes/${id}`);
  if (!response.ok) 
    throw new Error('Dish not found');
  return response.json();
}

function renderOrder(order, dishesMap) {
  const itemsHTML = order.items.map(item => {
    const dish = dishesMap.get(item.dish_id);
    if (!dish) return '';

    const total = dish.price * item.quantity;

    return `
      <div class="order-item">
        <span>${dish.title}</span>
        <span>× ${item.quantity}</span>
        <span>${total.toLocaleString()} ₽</span>
      </div>
    `;
  }).join('');



  return `
    <div class="order-block">
      <div>
        <h3>Заказ №${order.id}</h3>
        <div class="order-info">
          <span>${order.created_at}</span>
          <span>Статус: <span class="order-status">${order.status}</span></span>
        </div>
      </div>
      <div class="positions-list">
        ${itemsHTML}
      </div>
      <div class="order-summ">${order.items.reduce((sum, item) => {
        const dish = dishesMap.get(item.dish_id);
        return sum + (dish ? dish.price * item.quantity : 0);
      }, 0).toLocaleString()} ₽
      <button class="btn-delete-order" data-order-id="${order.id}">Удалить заказ</button>
      </div>
    </div>
  `;
}

function renderOrders(orders, dishesMap) {
  const container = document.querySelector('.orders-list');
  if (!container) return;

  container.innerHTML = orders.map(order => renderOrder(order, dishesMap)).join('');

  document.querySelectorAll('.btn-delete-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        fetch(`${ServerURL}/orders/${orderId}`, {
          method: 'DELETE'
        }).then(res => {
          if (res.ok) {
            init();
          }
        });
      }
    });
  });
}

async function init() {
  try {
    const orders = await fetchOrders();

    const allItemIds = orders.flatMap(order => order.items.map(item => item.dish_id));
    const uniqueIds = [...new Set(allItemIds)];

    const dishes = await Promise.all(uniqueIds.map(id => fetchDish(id)));
    const dishesMap = new Map(dishes.map(d => [d.id, d]));

    renderOrders(orders, dishesMap);
  } catch (error) {
    console.error(error);
    document.querySelector('.orders-list').innerHTML = '<p>Ошибка загрузки заказов</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);