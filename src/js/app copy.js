// Подключение стилей
import "../scss/app.scss";

import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';

// Структура данных
let state = {
  banks: JSON.parse(localStorage.getItem("banks")) || [],
  categories: JSON.parse(localStorage.getItem("categories")) || [],
  currentMonth: new Date().toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  }),
  currentDate: new Date(), // Для навигации
};

// Сохранение в LocalStorage
function saveState() {
  localStorage.setItem("banks", JSON.stringify(state.banks));
  localStorage.setItem("categories", JSON.stringify(state.categories));
}

// Навигация по месяцам
document.getElementById("prevMonth").addEventListener("click", () => {
  state.currentDate.setMonth(state.currentDate.getMonth() - 1);
  updateMonthDisplay();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  state.currentDate.setMonth(state.currentDate.getMonth() + 1);
  updateMonthDisplay();
});

function updateMonthDisplay() {
  state.currentMonth = state.currentDate.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  document.getElementById("currentMonth").textContent = state.currentMonth;
  // Здесь можно добавить фильтрацию данных по месяцу
  renderCategories();
}

// Пример функций для работы с данными
function addBank(bank) {
  state.banks.push({ 
    ...bank, 
    id: Date.now(),
    icon: document.getElementById('bankIcon').value
  });
  saveState();
  renderBanks();
}

function addCategory(category) {
  state.categories.push({ ...category, id: Date.now() });
  saveState();
  renderCategories();
}

function renderCategories() {
  const list = document.getElementById("categoriesList");
  list.innerHTML = state.categories
    .map((cat) => {
      const bank = state.banks.find((b) => b.id === cat.bankId);
      return `
      <div class="category-card">
        <i class="fa-solid ${getCategoryIcon(cat.name)}"></i>
        <span style="color: ${cat.color}">${cat.name}</span>
        <span class="discount-badge">${cat.discount}</span>
        <span class="bank-badge" style="background: ${bank?.color || "#ccc"}">
          ${bank?.name || "Нет банка"}
        </span>
        <button class="delete-btn" data-id="${cat.id}">×</button>
      </div>
    `;
    })
    .join("");
}

// Помощник для иконок категорий
function getCategoryIcon(name) {
  const icons = {
    АЗС: "fa-gas-pump",
    Рестораны: "fa-utensils",
    Аптеки: "fa-prescription-bottle",
    // Добавь другие категории по желанию
  };
  return icons[name] || "fa-tag";
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  renderBanks();
  renderCategories();
});

// Модальное окно
const modal = document.getElementById("modal");
const modalContent = modal.querySelector(".modal-content");

// Форма добавления банка
document.getElementById("addBankBtn").addEventListener("click", () => {
  modalContent.innerHTML = `
  <h2>Добавить банк</h2>
  <input type="text" id="bankName" placeholder="Название" />
  <input type="color" id="bankColor" value="#6200ee" />
  <select id="bankIcon">
    <option value="tinkoff.svg">Тинькофф</option>
    <option value="sber.svg">Сбербанк</option>
    <option value="alfa.svg">Альфа-Банк</option>
  </select>
  <button id="saveBank">Сохранить</button>
`;
  modal.classList.remove("hidden");

  document.getElementById("saveBank").addEventListener("click", () => {
    addBank({
      name: document.getElementById("bankName").value,
      color: document.getElementById("bankColor").value,
    });
    modal.classList.add("hidden");
  });
});

// Форма добавления категории
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  modalContent.innerHTML = `
    <h2>Добавить категорию</h2>
    <input type="text" id="categoryName" placeholder="Название" />
    <input type="text" id="categoryDiscount" placeholder="Кешбек (например, 5%)" />
    <input type="color" id="categoryColor" value="#33FF57" />
    <select id="categoryBank">
      ${state.banks
        .map((bank) => `<option value="${bank.id}">${bank.name}</option>`)
        .join("")}
    </select>
    <button id="saveCategory">Сохранить</button>
  `;
  modal.classList.remove("hidden");

  document.getElementById("saveCategory").addEventListener("click", () => {
    addCategory({
      name: document.getElementById("categoryName").value,
      discount: document.getElementById("categoryDiscount").value,
      color: document.getElementById("categoryColor").value,
      bankId: parseInt(document.getElementById("categoryBank").value),
    });
    modal.classList.add("hidden");
  });
});

// Добавляем кнопки удаления в рендер
function renderBanks() {
  const list = document.getElementById("banksList");
  list.innerHTML = state.banks.map(bank => `
    <div class="bank-card" style="background: ${bank.color}">
      <img src="/assets/banks/${bank.icon}" alt="${bank.name}" class="bank-icon" />
      ${bank.name}
    </div>
  `).join('');

  // Вешаем обработчик удаления
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.banks = state.banks.filter(
        (b) => b.id !== parseInt(e.target.dataset.id)
      );
      saveState();
      renderBanks();
    });
  });
}

function deleteBank(id) {
  const element = document.querySelector(`[data-id="${id}"]`).parentElement;
  element.classList.add('removing');
  
  setTimeout(() => {
    state.banks = state.banks.filter(b => b.id !== id);
    saveState();
    renderBanks();
  }, 200);
}

document.getElementById('shareBtn').addEventListener('click', async () => {
  const list = document.getElementById('categoriesList');
  
  // Создаем временный контейнер для красивого скриншота
  const tempContainer = document.createElement('div');
  tempContainer.style.background = 'white';
  tempContainer.style.padding = '20px';
  tempContainer.style.borderRadius = '10px';
  tempContainer.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 15px;">
      Мой кешбек-лист (${state.currentMonth})
    </h2>
    ${list.innerHTML}
  `;
  document.body.appendChild(tempContainer);

  try {
    // Генерируем изображение
    const dataUrl = await htmlToImage.toPng(tempContainer);
    
    // Вариант 1: Нативное меню шаринга (работает на мобилах)
    if (navigator.share) {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cashback-list.png', { type: 'image/png' });
      
      await navigator.share({
        title: `Мой кешбек-лист (${state.currentMonth})`,
        text: 'Смотри какие кешбек-категории я использую!',
        files: [file]
      });
    } 
    // Вариант 2: Скачивание (для десктопа)
    else {
      saveAs(dataUrl, `cashback-list-${new Date().toISOString()}.png`);
      alert('Скриншот сохранён! Теперь можете отправить его вручную.');
    }
  } catch (e) {
    console.error('Ошибка шаринга:', e);
  } finally {
    tempContainer.remove();
  }
});