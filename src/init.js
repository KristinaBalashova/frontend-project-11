import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';

export default () => {
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'en',
    debug: true,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nextInstance.t('errors.alreadyExist'),
    },
    string: {
      required: i18nextInstance.t('errors.empty'),
      url: i18nextInstance.t('errors.notValid'),
    },
  });

  const state = {
    form: {
      valid: null,
      link: '',
    },
    errors: [],
    addedLinks: [],
  };

  const watchedState = onChange(state, async (route, value, previousValue) => {
    console.log(state.form.valid);
    const form = document.querySelector('.rss-form');
    const input = document.querySelector('input');
    const feedback = document.querySelector('.feedback');
    if (value === false) {
      input.classList.add('is-invalid');
      feedback.innerHTML = state.errors;
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
    state.form.link = value;
    schema.validate(watchedState.form.link)
      .then((link) => {
        console.log('validated');
        watchedState.form.valid = true;
        state.errors = null;
        state.addedLinks.push(link);
      })
      .catch((error) => {
        state.errors = error
        watchedState.form.valid = false;
      });
  });
};
