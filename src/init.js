import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import parser from './parser.js';
import handleProcess from './view.js';
import updatePosts from './updatePosts.js';

const app = () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('errors.alreadyExist'),
    },
    string: {
      required: i18nInstance.t('errors.empty'),
      url: i18nInstance.t('errors.notValid'),
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
    status: 'initial',
  };

  const watchedState = onChange(state, () => handleProcess(watchedState, i18nInstance, elements));
  const handleError = (error) => {
    switch (error.name) {
      case 'ValidationError':
        watchedState.form.valid = false;
        watchedState.feedback.type = 'validationError';
        watchedState.feedback.message = error.message;
        break;
      case 'AxiosError':
        watchedState.feedback.type = 'axiosError';
        watchedState.feedback.message = i18nInstance.t('errors.network');
        break;
      case 'Error':
        if (error.message === 'ParserError') {
          watchedState.feedback.type = 'parserError';
          watchedState.feedback.message = i18nInstance.t('errors.notRss');
        }
        break;
      default:
        watchedState.feedback.type = 'unknownError';
        watchedState.feedback.message = error.message;
        throw new Error('UnknownError');
    }
    watchedState.status = 'renderFeedback';
  };
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  elements.form.addEventListener('submit', (e) => {
    const schema = makeSchema(watchedState.addedLinks);
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    watchedState.form.link = value;
    schema.validate(watchedState.form.link)
      .then((link) => {
        watchedState.status = 'validated';
        watchedState.form.valid = true;
        watchedState.errors = null;
        watchedState.addedLinks.push(link);
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);
      })
      .then((response) => response.data.contents)
      .then((content) => parser(watchedState, content))
      .then((data) => {
        const { feeds, posts } = data;
        feeds.url = elements.input.value;
        console.log(feeds.url);
        watchedState.data.posts.unshift(...posts);
        watchedState.data.feeds.push(feeds);
        watchedState.feedback.type = 'success';
        watchedState.status = 'renderFeedback';
      })
      .catch((error) => {
        handleError(error);
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

  updatePosts(watchedState);
};
export default app;
