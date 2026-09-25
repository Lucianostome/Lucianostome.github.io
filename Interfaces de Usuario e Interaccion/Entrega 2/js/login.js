document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginCard = document.getElementById('loginCard');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email');
      const password = document.getElementById('password');
      let formIsValid = true;

      clearFieldError(email);
      clearFieldError(password);

      if (!email.value.trim()) {
        showFieldError(email, 'El email es obligatorio.');
        formIsValid = false;
      } else if (!email.validity.valid) {
        showFieldError(email, 'Ingresa un email válido.');
        formIsValid = false;
      }

      if (!password.value) {
        showFieldError(password, 'La contraseña es obligatoria.');
        formIsValid = false;
      }

      if (!formIsValid) {
        return;
      }

      loginCard.classList.add('animated-success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });
  }
});

function showFieldError(field, message) {
  const fieldGroup = field.closest('.form-group');
  const error = document.createElement('span');

  fieldGroup.classList.add('has-error');
  field.setAttribute('aria-invalid', 'true');
  error.className = 'field-error';
  error.textContent = message;
  field.insertAdjacentElement('afterend', error);
}

function clearFieldError(field) {
  const fieldGroup = field.closest('.form-group');
  const currentError = fieldGroup.querySelector('.field-error');

  fieldGroup.classList.remove('has-error');
  field.removeAttribute('aria-invalid');
  if (currentError) {
    currentError.remove();
  }
}