const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
  updateHeader();
  initLoginForm();
  initRegisterForm();
});

async function updateHeader() {
  const dropdownContent = document.querySelector(".profile-dropdown-content");
  const profileBtn = document.querySelector(".profile-btn");

  if (!dropdownContent) return;

  renderGuestMenu(dropdownContent, profileBtn);

  const token = localStorage.getItem("token");

  if (token) {
    try {
      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const user = await res.json();
        renderUserMenu(dropdownContent, profileBtn, user);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.warn("Бэкенд недоступен, остаётся гостевой режим:", err);
    }
  }
}

function renderGuestMenu(container, btn) {
  if (btn) btn.textContent = "Профиль";
  container.innerHTML = `
    <a href="login.html">Войти</a>
    <a href="register.html">Зарегистрироваться</a>
  `;
}

function renderUserMenu(container, btn, user) {
  if (btn) btn.textContent = user.name || "Профиль";
  container.innerHTML = `
    <a href="orders.html">Мои заказы</a>
    <a href="#" id="logout-btn">Выйти</a>
  `;

  const logoutBtn = container.querySelector("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function initLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("form-error");
    if (errorBox) errorBox.style.display = "none";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Неверный логин или пароль");
      }

      localStorage.setItem("token", data.access_token);
      window.location.href = "index.html";
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message;
        errorBox.style.display = "block";
      }
    }
  });
}

function initRegisterForm() {
  const regForm = document.getElementById("register-form");
  if (!regForm) return;

  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("form-error");
    if (errorBox) errorBox.style.display = "none";

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Ошибка регистрации");
      }

      const loginRes = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.access_token);
      window.location.href = "index.html";

    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message;
        errorBox.style.display = "block";
      }
    }
  });
}