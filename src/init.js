import onChange from 'on-change';
import * as yup from 'yup';

export default () => {
  const state = {
    form: {
      valid: false,
      link: '',
    },
    errors: [],
    addedLinks: [],
  };

  const watchedState = onChange(state, async (route, value, previousValue) => {
    console.log('OnChange');
    const form = document.querySelector('.rss-form');
    const input = document.querySelector('input');
    console.log('added links: ', state.addedLinks);
    // console.log('value', value);
    if (value === false) {
      input.classList.add('is-invalid');
    } else if (value === true) {
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
    }
  });
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    const schema = makeSchema(state.addedLinks);
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    watchedState.form.link = value;
    schema.validate(watchedState.form.link)
      .then((link) => {
        console.log('validated');
        watchedState.form.valid = true;
        state.errors = null;
        watchedState.addedLinks.push(link);
      })
      .catch((error) => {
        state.errors = error.name;
        watchedState.form.valid = false;
      });
  });
};