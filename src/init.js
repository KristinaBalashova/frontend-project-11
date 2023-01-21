import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import parser from './parser.js';
import handleProcess from './view.js';

const app = () => {
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
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
      openedPosts: [],
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
    status: '',
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
        state.form.valid = true;
        state.errors = null;
        state.addedLinks.push(link);
        return fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.form.link)}`);
      })
      .then((response) => response.json())
      .then((data) => data.contents)
      .then((content) => parser(state, content))
      .then((data) => {
        const { feeds, posts } = data;
        state.data.posts.push(...posts);
        state.data.feeds.push(feeds);
        watchedState.status = 'ready';
      })
      .catch((error) => {
        watchedState.errors = error.message;
        watchedState.form.valid = false;
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId || e.target.tagName !== 'BUTTON') {
      return;
    }
    watchedState.modal.openedPosts.push(postId);
    watchedState.modal.activePost = postId;
  });
};
export default app;
