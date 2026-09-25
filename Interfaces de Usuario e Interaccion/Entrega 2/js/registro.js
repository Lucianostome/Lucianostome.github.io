document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  if (!registerForm) {
    return;
  }

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const age = document.getElementById('age');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const recaptchaCheck = document.getElementById('recaptchaCheck');
    const registerCard = document.getElementById('registerCard');
    let formIsValid = true;

    clearFieldError(fullName);
    clearFieldError(email);
    clearFieldError(age);
    clearFieldError(password);
    clearFieldError(confirmPassword);
    clearContainerError(recaptchaCheck.closest('.recaptcha-box'));

    if (!fullName.value.trim()) {
      showFieldError(fullName, 'El nombre es obligatorio.');
      formIsValid = false;
    }

    if (!email.value.trim()) {
      showFieldError(email, 'El email es obligatorio.');
      formIsValid = false;
    } else if (!email.validity.valid) {
      showFieldError(email, 'Ingresa un email válido.');
      formIsValid = false;
    }

    if (!age.value) {
      showFieldError(age, 'Selecciona tu edad.');
      formIsValid = false;
    }

    if (!password.value) {
      showFieldError(password, 'La contraseña es obligatoria.');
      formIsValid = false;
    } else if (password.value.length < 8) {
      showFieldError(password, 'La contraseña debe tener al menos 8 caracteres.');
      formIsValid = false;
    }

    if (!confirmPassword.value) {
      showFieldError(confirmPassword, 'Confirma tu contraseña.');
      formIsValid = false;
    } else if (password.value !== confirmPassword.value) {
      showFieldError(confirmPassword, 'Las contraseñas no coinciden.');
      formIsValid = false;
    }

    if (!recaptchaCheck.checked) {
      showContainerError(recaptchaCheck.closest('.recaptcha-box'), 'Debes confirmar que no eres un robot.');
      formIsValid = false;
    }

    if (formIsValid) {
      registerCard.classList.add('animated-success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    }
  });
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

function showContainerError(container, message) {
  const error = document.createElement('span');

  container.classList.add('has-error');
  error.className = 'field-error';
  error.textContent = message;
  container.insertAdjacentElement('afterend', error);
}

function clearContainerError(container) {
  container.classList.remove('has-error');
  const currentError = container.nextElementSibling;
  if (currentError) {
    if (currentError.classList.contains('field-error')) {
      currentError.remove();
    }
  }
}