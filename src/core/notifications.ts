const TOAST_CONTAINER_ID = 'roam-export-block-toast-container';
const TOAST_CLASS = 'roam-export-block-toast';
const TOAST_LIFETIME = 3200;

type ToastVariant = 'success' | 'error';

let stylesInjected = false;

export function showToast(message: string, variant: ToastVariant = 'success'): void {
  if (typeof document === 'undefined') {
    console.log(`[${variant.toUpperCase()}] ${message}`);
    return;
  }

  ensureStyles();

  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `${TOAST_CLASS} ${TOAST_CLASS}--${variant}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add(`${TOAST_CLASS}--visible`);
  });

  setTimeout(() => {
    toast.classList.remove(`${TOAST_CLASS}--visible`);
    setTimeout(() => {
      container.removeChild(toast);
    }, 200);
  }, TOAST_LIFETIME);
}

function ensureContainer(): HTMLElement {
  const existing = document.getElementById(TOAST_CONTAINER_ID);
  if (existing) {
    return existing;
  }

  const container = document.createElement('div');
  container.id = TOAST_CONTAINER_ID;
  container.className = `${TOAST_CLASS}__container`;
  document.body.appendChild(container);
  return container;
}

function ensureStyles(): void {
  if (stylesInjected || typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.id = `${TOAST_CONTAINER_ID}-styles`;
  style.textContent = `
    .${TOAST_CLASS}__container {
      position: fixed;
      top: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }

    .${TOAST_CLASS} {
      min-width: 200px;
      padding: 12px 16px;
      border-radius: 6px;
      background-color: #1f2933;
      color: #ffffff;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      font-size: 14px;
      line-height: 1.4;
    }

    .${TOAST_CLASS}--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .${TOAST_CLASS}--success {
      border-left: 4px solid #10b981;
    }

    .${TOAST_CLASS}--error {
      border-left: 4px solid #ef4444;
    }
  `;

  document.head.appendChild(style);
  stylesInjected = true;
}


