// La Canasta UI Interactivity Helper

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initQuantitySelectors();
  initCollapsibles();
  initCategoryChips();
  initModals();
});

// Shopping Cart Drawer Controls
function initCartDrawer() {
  const cartTriggers = document.querySelectorAll('.js-cart-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartClose = document.getElementById('cart-close');

  if (!cartDrawer || !cartOverlay) return;

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }

  cartOverlay.addEventListener('click', closeCart);
}

// Quantity Selector (- / +) Controls
function initQuantitySelectors() {
  const selectors = document.querySelectorAll('.quantity-selector');

  selectors.forEach(selector => {
    const btnMinus = selector.querySelector('.js-qty-minus');
    const btnPlus = selector.querySelector('.js-qty-plus');
    const valueSpan = selector.querySelector('.js-qty-value');

    if (!btnMinus || !btnPlus || !valueSpan) return;

    btnMinus.addEventListener('click', () => {
      let currentVal = parseInt(valueSpan.textContent, 10);
      if (currentVal > 1) {
        currentVal--;
        valueSpan.textContent = currentVal;
      }
    });

    btnPlus.addEventListener('click', () => {
      let currentVal = parseInt(valueSpan.textContent, 10);
      currentVal++;
      valueSpan.textContent = currentVal;
    });
  });
}

// Collapsible Information Blocks (Product detail page)
function initCollapsibles() {
  const headers = document.querySelectorAll('.collapsible-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      if (!content) return;

      header.classList.toggle('open');
      content.classList.toggle('open');
    });
  });
}

// Category Chips Active States
function initCategoryChips() {
  const chips = document.querySelectorAll('.js-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle state or select single
      const parent = chip.parentElement;
      if (parent.classList.contains('js-single-select')) {
        parent.querySelectorAll('.js-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      } else {
        chip.classList.toggle('active');
      }
    });
  });
}

// Modal handling for "Crear Nueva Categoría" or "Nuevo Producto"
function initModals() {
  const openButtons = document.querySelectorAll('.js-open-modal');
  const closeButtons = document.querySelectorAll('.js-close-modal');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('open'), 10);
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-container');
      if (modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.style.display = 'none', 300);
      }
    });
  });
}
