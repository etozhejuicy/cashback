// Подключение стилей
import "../scss/app.scss";

import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';

// Подключаем библиотеки
import "./modules/modal.module";
import "./modules/now.module";
import "./modules/wow.module";

// Подключаем компоненты
import "./components/details";

const addCategoryBtn = document.getElementById("addCategoryBtn");
const addBankBtn = document.getElementById("addBankBtn");
const saveCategoryBtn = document.getElementById("saveCategory");
const saveBankBtn = document.getElementById("saveBank");
const modal = document.getElementById("modal");
const modalContent = modal.querySelector(".modal-content");

// Структура данных
let state = {
  banks: JSON.parse(localStorage.getItem("banks")) || [],
  categories: JSON.parse(localStorage.getItem("categories")) || [],
  currentMonth: new Date().toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  }),
  currentDate: new Date(),
};

class appState {
  constructor() {
    this.saveState();
  }

  saveState() {
    localStorage.setItem("banks", JSON.stringify(state.banks));
    localStorage.setItem("categories", JSON.stringify(state.categories));
  }
}

class Banks {
  constructor() {
    this.availableBanks = {
      Альфа: "alpha-bank.svg",
      ВТБ: "vtb-bank.svg",
      Райффайзен: "raiffaizen-bank.svg",
      Сбер: "sber-bank.svg",
      Тинькофф: "tinkoff-bank.svg",
      "Яндекс Банк": "yandex-bank.svg",
    };
    this.renderBanks();
  }

  renderBanks() {
    const list = document.getElementById('banksList');

    list.innerHTML = state.banks.map(bank => `
      <div class="card card-bank" data-id="${bank.id}" ${bank.color ? `style="border-color: ${bank.color};"` : ""}>
        <div class="color" style="background: ${bank.color};"></div>
        <img src="/assets/banks/${bank.icon}" alt="${bank.name}" class="bank-icon" />
        ${bank.name}
        <details class="dropdown-menu">
          <summary class="btn dropdown-btn">
            <i class="fa-solid fa-ellipsis"></i>
          </summary>
          <div class="dropdown-content">
            <div class="card-bank--actions">
              <button class="edit-bank-btn" data-id="${bank.id}">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="delete-bank-btn" data-id="${bank.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </details>
      </div>
    `).join('');

    // Вешаем обработчики удаления/редактирования
    list.querySelectorAll('.delete-bank-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteBank(parseInt(e.target.dataset.id));
      });
    });

    list.querySelectorAll('.edit-bank-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editBank(parseInt(e.target.dataset.id));
      });
    });
  }

  editBank(id) {
    const bank = state.banks.find(b => b.id === id);

    modalContent.innerHTML = `
      <h2 class="text-center">Редактировать банк</h2>
      <div class="form">
        <div class="form-creating--inputs">
          <div class="form-group">
            <label>Название:</label>
            <input type="text" id="editBankName" value="${bank.name}" class="form-input" />
          </div>
          <div class="form-group">
            <label>Цвет:</label>
            <div class="color-picker">
              <input type="color" id="editBankColor" value="${bank.color}" />
              <span class="color-preview" style="background: ${bank.color}"></span>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button id="saveBankChanges" class="btn-primary">Сохранить</button>
          <button id="cancelBankEdit" class="btn-secondary">Отмена</button>
          <button id="deleteBankBtn" class="btn-danger">Удалить банк</button>
        </div>
      </div>
    `;

    modal.classList.add('show');

    // Реализуем превью цвета
    const colorInput = document.getElementById('editBankColor');
    const colorPreview = document.querySelector('.color-preview');

    colorInput.addEventListener('input', () => {
      colorPreview.style.background = colorInput.value;
    });

    // Сохранение изменений
    document.getElementById('saveBankChanges').addEventListener('click', () => {
      bank.name = document.getElementById('editBankName').value.trim();
      bank.color = colorInput.value;

      if (!bank.name) {
        alert('Название банка не может быть пустым!');
        return;
      }

      new appState().saveState();
      this.renderBanks();
      modal.classList.remove('show');
      modalContent.innerHTML = '';
    });

    // Удаление банка
    document.getElementById('deleteBankBtn').addEventListener('click', () => {
      if (confirm(`Удалить банк "${bank.name}"? Все связанные категории также будут удалены!`)) {
        this.deleteBank(id);
        modal.classList.remove('show');
        modalContent.innerHTML = '';
      }
    });

    // Отмена редактирования
    document.getElementById('cancelBankEdit').addEventListener('click', () => {
      modal.classList.remove('show');
      modalContent.innerHTML = '';
    });
  }

  getBankSelectOptions() {
    let options = "";
    for (const [name, icon] of Object.entries(this.availableBanks)) {
      const exists = state.banks.some((b) => b.name === name);
      if (!exists) {
        options += `<option value="${name}" data-icon="${icon}">${name}</option>`;
      }
    }
    return options;
  }

  addBank(bank) {
    const icon =
      this.availableBanks[bank.name] || bank.customIcon || "default-bank.svg";
    state.banks.push({
      ...bank,
      id: Date.now(),
      icon: icon,
    });
    new appState().saveState();
    this.renderBanks();
  }

  deleteBank(id) {
    state.banks = state.banks.filter((b) => b.id !== id);
    state.categories = state.categories.filter((cat) => cat.bankId !== id);
    new appState().saveState();
    this.renderBanks();
    new Categories().renderCategories();
  }
}

class Categories {
  constructor() {
    this.renderCategories();
  }

  addCategory(category) {
    state.categories.push({
      ...category,
      id: Date.now(),
      month: state.currentMonth,
    });
    new appState().saveState();
    this.renderCategories();
  }

  renderCategories() {
    const list = document.getElementById("categoriesList");
    const currentMonthCategories = state.categories.filter(
      (cat) => cat.month === state.currentMonth
    );

    list.innerHTML = currentMonthCategories
      .map((cat) => {
        const bank = state.banks.find((b) => b.id === cat.bankId);
        return `
      <div class="category-card" data-id="${cat.id}">
        <div class="category-content">
          <i class="fa-solid ${this.getCategoryIcon(cat.name)}"></i>
          <span style="color: ${cat.color}">${cat.name}</span>
          <span class="discount-badge">${cat.discount}</span>
          <span class="bank-badge" style="background: ${bank?.color || "#ccc"}">
            ${bank?.name || "Нет банка"}
          </span>
        </div>
        <div class="category-actions">
          <button class="edit-btn" data-id="${cat.id}">✏️</button>
          <button class="delete-btn" data-id="${cat.id}">🗑️</button>
        </div>
      </div>
    `;
      })
      .join("");

    // Вешаем обработчики
    list.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.deleteCategory(parseInt(e.target.dataset.id));
      });
    });

    list.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.editCategory(parseInt(e.target.dataset.id));
      });
    });
  }

  deleteCategory(id) {
    state.categories = state.categories.filter((c) => c.id !== id);
    new appState().saveState();
    this.renderCategories();
  }

  editCategory(id) {
    const category = state.categories.find((c) => c.id === id);

    modalContent.innerHTML = `
      <h2 class="text-center">Редактировать категорию</h2>
      <div class="form">
        <input type="text" id="editCategoryName" value="${category.name}" />
        <input type="text" id="editCategoryDiscount" value="${category.discount
      }" />
        <input type="color" id="editCategoryColor" value="${category.color}" />
        <select id="editCategoryBank">
          ${state.banks
        .map(
          (b) => `
            <option value="${b.id}" ${b.id === category.bankId ? "selected" : ""
            }>
              ${b.name}
            </option>
          `
        )
        .join("")}
        </select>
        <div class="form-actions">
          <button id="saveEditBtn">Сохранить</button>
          <button id="cancelEditBtn">Отмена</button>
        </div>
      </div>
    `;

    document.getElementById("saveEditBtn").addEventListener("click", () => {
      category.name = document.getElementById("editCategoryName").value;
      category.discount = document.getElementById("editCategoryDiscount").value;
      category.color = document.getElementById("editCategoryColor").value;
      category.bankId = parseInt(
        document.getElementById("editCategoryBank").value
      );
      new appState().saveState();
      this.renderCategories();
      modal.classList.remove("show");
    });

    document.getElementById("cancelEditBtn").addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }
}

class monthSelector {
  constructor() {
    this.currentMonth = document.getElementById("currentMonth");
    this.prev = document.getElementById("prevMonth");
    this.next = document.getElementById("nextMonth");
    this.events();
  }

  events() {
    this.prev.addEventListener("click", () => {
      state.currentDate.setMonth(state.currentDate.getMonth() - 1);
      this.updateMonthDisplay();
    });

    this.next.addEventListener("click", () => {
      state.currentDate.setMonth(state.currentDate.getMonth() + 1);
      this.updateMonthDisplay();
    });
  }

  updateMonthDisplay() {
    state.currentMonth = state.currentDate.toLocaleString("ru-RU", {
      month: "long",
      year: "numeric",
    });
    this.currentMonth.textContent = state.currentMonth;
    new Categories().renderCategories();
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  new appState();
  new monthSelector();
  const banks = new Banks();
  const categories = new Categories();
});

// events
addBankBtn?.addEventListener("click", () => {
  const banks = new Banks();
  modalContent.innerHTML = `
    <h2 class="text-center">Добавить банк</h2>
    <div class="form form-creating">
      <div class="form-creating--inputs">
        <div class="form-row">
          <select id="bankSelect" class="bank-select">
            <option value="">Выберите банк</option>
            ${banks.getBankSelectOptions()}
          </select>
          <span>или</span>
          <input type="text" id="customBankName" placeholder="Другой банк" />
        </div>
        <div class="form-row">
          <label>Цвет: <input type="color" id="bankColor" value="#6200ee" /></label>
        </div>
      </div>
      <div class="form-actions">
        <button id="saveBank">Сохранить</button>
        <button id="cancelBtn">Отмена</button>
      </div>
    </div>
  `;

  modal.classList.add("show");

  document.getElementById("bankSelect").addEventListener("change", function () {
    document.getElementById("customBankName").value = this.value;
  });

  document.getElementById("saveBank").addEventListener("click", () => {
    const nameInput = document.getElementById("customBankName");
    const name = nameInput.value.trim();
    if (!name) return alert("Введите название банка");

    banks.addBank({
      name: name,
      color: document.getElementById("bankColor").value,
    });
    modal.classList.remove("show");
    modalContent.innerHTML = '';
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    modal.classList.remove("show");
    modalContent.innerHTML = '';
  });
});

modal?.querySelector('.btn-close').addEventListener('click', () => {
  modal.classList.remove("show");
  setTimeout(() => {
    modalContent.innerHTML = '';
  }, 250);
});

addCategoryBtn?.addEventListener("click", () => {
  modalContent.innerHTML = `
    <h2 class="text-center">Добавить категорию</h2>
    <div class="form form-creating">
      <div class="form-creating--inputs">
        <div class="form-creating--inputs form-creating--row">
          <input type="text" id="categoryName" placeholder="Название" />
          <input type="text" id="categoryDiscount" placeholder="Кешбек (например, 5%)" />
        </div>
        <input type="color" id="categoryColor" value="#33FF57" />
        <select id="categoryBank">
          ${state.banks
      .map((bank) => `<option value="${bank.id}">${bank.name}</option>`)
      .join("")}
        </select>
      </div>
      <button id="saveCategory">Сохранить</button>
    </div>
  `;
  modal.classList.add("show");
});

document.getElementById('saveCategory')?.addEventListener("click", () => {
  new Categories().addCategory({
    name: document.getElementById("categoryName").value,
    discount: document.getElementById("categoryDiscount").value,
    color: document.getElementById("categoryColor").value,
    bankId: parseInt(document.getElementById("categoryBank").value),
  });
  modal.classList.remove("show");
  modalContent.innerHTML = '';
});

document.getElementById('shareBtn').addEventListener('click', async () => {
  const list = document.getElementById('categoriesList');

  // Создаем временный контейнер для красивого скриншота
  const tempContainer = document.createElement('div');
  tempContainer.style.background = 'white';
  tempContainer.style.padding = '20px';
  tempContainer.style.borderRadius = '10px';
  tempContainer.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 15px;">
      Мой кешбек на (${state.currentMonth})
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