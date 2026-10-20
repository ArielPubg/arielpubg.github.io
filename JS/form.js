(() => {
  'use strict';

  const form = document.querySelector('.contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl  = form.querySelector('[data-form-status]');
  const successEl = form.querySelector('[data-form-success]');
  const resetBtn  = form.querySelector('[data-form-reset]');
  const btnLabel  = submitBtn.innerHTML;

  const setStatus = (message, type) => {
    statusEl.textContent = message || '';
    statusEl.className = 'form-status' + (type ? ' form-status--' + type : '');
  };

  form.addEventListener('submit', async (e) => {
    // Empêche la redirection vers la page Formspree
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Envoi en cours… <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>';
    setStatus('');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        form.classList.add('is-sent');
        successEl.hidden = false;
        successEl.focus();
      } else {
        let message = "Une erreur est survenue. Merci de réessayer dans un instant.";
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length) {
            message = data.errors.map((err) => err.message).join(' · ');
          }
        } catch (_) { /* réponse non JSON : on garde le message par défaut */ }
        setStatus(message, 'error');
      }
    } catch (err) {
      setStatus("Connexion impossible. Vérifiez votre réseau et réessayez.", 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = btnLabel;
    }
  });

  // « Envoyer un autre message » : on réaffiche le formulaire
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.classList.remove('is-sent');
      successEl.hidden = true;
      setStatus('');
      const first = form.querySelector('input[name="name"]');
      if (first) first.focus();
    });
  }
})();
