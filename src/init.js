import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
// import parser from './parser.js';
import handleProcess from './view.js';

export default async () => {
  const i18nextInstance = i18next.createInstance();

  await i18nextInstance.init({
    lng: 'ru',
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

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    input: document.querySelector('input'),
  };

  const state = {
    modal: {
      activePost: '',
    },
    form: {
      valid: null,
      link: '',
    },
    errors: [],
    addedLinks: [],
    data: {
      feeds: [],
      posts: [],
    },
  };

  const watchedState = onChange(state, () => handleProcess(state, i18nextInstance, elements));
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  elements.form.addEventListener('submit', (e) => {
    const schema = makeSchema(state.addedLinks);
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    state.form.link = value;
    schema.validate(watchedState.form.link)
      .then((link) => {
        watchedState.form.valid = true;
        state.errors = null;
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        state.addedLinks.push(link);
      })
      .catch((error) => {
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        state.errors = error.message;
        watchedState.form.valid = false;
      });
  });
};
