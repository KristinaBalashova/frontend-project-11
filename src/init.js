import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import parser from './parser.js';
import renderData from './view.js';
import updatePosts from './updatePosts.js';
/* eslint-disable no-param-reassign */

const app = async () => {
  const i18nInstance = i18next.createInstance();

  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('alreadyExists'),
    },
    string: {
      required: i18nInstance.t('empty'),
      url: i18nInstance.t('notValid'),
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
      activePost: null,
    },
    openedPosts: [],
    form: {
      status: 'filling',
      validationError: false,
    },
    loading: {
      error: null,
      status: 'waitingForData',
    },
    data: {
      feeds: [],
      posts: [],
    },
  };

  const watchedState = onChange(state, () => renderData(watchedState, i18nInstance, elements));
  const handleError = (error) => {
    switch (error.name) {
      case 'ValidationError':
        watchedState.loading.error = 'validationError';
        watchedState.form.validationError = error.message;
        break;
      case 'AxiosError':
        watchedState.loading.error = 'axiosError';
        break;
      case 'Error':
        if (error.message === 'ParserError') {
          watchedState.loading.error = 'parserError';
        }
        break;
      default:
        watchedState.loading.error = 'unknownError';
        throw new Error('UnknownError');
    }
    watchedState.form.status = 'renderFeedback';
    watchedState.loading.status = 'failed';
  };
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  elements.form.addEventListener('submit', (e) => {
    watchedState.form.status = 'sending';
    const addedLinks = watchedState.data.feeds.map((feed) => feed.url);
    const schema = makeSchema(addedLinks);
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    schema.validate(value)
      .then((link) => {
        watchedState.form.status = 'validated';
        watchedState.loading.status = 'loading';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);
      })
      .then((response) => response.data.contents)
      .then((content) => parser(content))
      .then((data) => {
        const { feed, posts } = data;
        feed.url = elements.input.value;
        feed.id = _.uniqueId();
        posts.forEach((post) => {
          post.id = _.uniqueId();
          posts.feedId = feed.id;
        });
        watchedState.data.posts.unshift(...posts);
        watchedState.data.feeds.push(feeds);
        watchedState.loading.status = 'success';
        watchedState.form.status = 'renderFeedback';
      })
      .catch((error) => {
        watchedState.loading.status = 'failed';
        handleError(error);
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId) {
      return;
    }
    watchedState.openedPosts.push(postId);
    watchedState.modal.activePost = postId;
  });

  updatePosts(watchedState);
};
export default app;
