const openModalButtons = document.querySelectorAll('[data-modal-open]');
const closeButtons = document.querySelectorAll('[btn-close-modal]');

// modal logic
openModalButtons.forEach((openModalButton) => {
  openModalButton.addEventListener('click', function (e) {
    const modalKey = e.currentTarget.getAttribute('data-modal-open');
    const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');
    if (modal) {
      openModal(modal);
    }
  });
});

function openModal(modal) {
  modal.classList.add('show');
  document.documentElement.classList.add('modal-open');
}

function closeModal(modal) {
  modal.classList.remove('show');
  document.documentElement.classList.remove('modal-open');
  setTimeout(() => {
    document.querySelector('.modal-content').innerHTML = '';
  }, 250);
}

closeButtons.forEach((closeButton) => {
  closeButton.addEventListener('click', function () {
    const modal = closeButton.closest('.modal');
    if (modal) {
      closeModal(modal);
    }
  });
});

window.addEventListener('click', function (event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Обработчик для ссылок с якорем
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const modalKey = this.getAttribute('href').substring(1);
    const modal = document.querySelector('[data-modal-id="' + modalKey + '"]');

    if (modal) {
      e.preventDefault();

      openModal(modal);

      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search
      );
    }
  });
});