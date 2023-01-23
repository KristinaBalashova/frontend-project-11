import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import parser from './parser.js';
import handleProcess from './view.js';
import updatePosts from './updatePosts.js';

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
    feedback: {
      type: '',
      message: '',
    },
    addedLinks: [],
    data: {
      feeds: [],
      posts: [],
    },
    status: '',
  };

  const watchedState = onChange(state, () => handleProcess(state, i18nextInstance, elements));
  const handleError = (error) => {
    switch (error.name) {
      case 'ValidationError':
        state.form.valid = false;
        state.feedback.type = 'validationError';
        state.feedback.message = error.message;
        break;
      case 'AxiosError':
        state.feedback.type = 'axiosError';
        state.feedback.message = i18nextInstance.t('errors.network');
        break;
      case 'Error':
        if (error.message === 'ParserError') {
          state.feedback.type = 'parserError';
          state.feedback.message = i18nextInstance.t('errors.notRss');
        }
        break;
      default:
        state.feedback.type = 'unknownError';
        state.feedback.message = error.message;
        throw new Error('UnknownError');
    }
    watchedState.status = 'failed';
  };
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  elements.form.addEventListener('submit', (e) => {
    const schema = makeSchema(state.addedLinks);
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    state.form.link = value;
    schema.validate(watchedState.form.link)
      .then((link) => {
        state.status = 'validated';
        state.form.valid = true;
        state.errors = null;
        state.addedLinks.push(link);
        return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.form.link)}`);
      })
      .then((response) => response.data.contents)
      .then((content) => parser(state, content))
      .then((data) => {
        watchedState.status = 'validated';
        const { feeds, posts } = data;
        state.data.posts.push(...posts);
        state.data.feeds.push(feeds);
        state.feedback.message = i18nextInstance.t('success');
        state.feedback.type = 'success';
        watchedState.status = 'success';
      })
      .catch((error) => {
        handleError(error);
        console.log('error', error.message);
        // watchedState.errors = error.message;
        // watchedState.form.valid = false;
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

  // updatePosts(watchedState, state);
};
export default app;
