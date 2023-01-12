const watchedState = onChange(state, (route, value, previousValue) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('input');
  const feedback = document.querySelector('.feedback');
  if (value === false) {
    input.classList.add('is-invalid');
    feedback.innerHTML = state.errors;
  } else if (value === true) {
    input.classList.remove('is-invalid');
    fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.form.link)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => {
        const parser = new DOMParser();
        const domTree = parser.parseFromString(data, 'text/html');
      });

    feedback.innerHTML = i18nextInstance.t('success');
    form.reset();
    input.focus();
  }
});
