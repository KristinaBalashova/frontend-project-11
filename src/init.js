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
      notOneOf: 'alreadyExists',
    },
    string: {
      required: 'empty',
      url: 'notValid',
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
      validationError: null,
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
        watchedState.form.validationError = error.message;
        watchedState.form.status = 'invalid';
        break;
      case 'AxiosError':
        watchedState.loading.error = 'axiosError';
        watchedState.loading.status = 'failed';
        break;
      case 'Error':
        if (error.message === 'ParserError') {
          watchedState.loading.error = 'parserError';
          watchedState.loading.status = 'failed';
        }
        break;
      default:
        watchedState.loading.error = 'unknownError';
        watchedState.loading.status = 'failed';
        throw new Error('UnknownError');
    }
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
        watchedState.form.status = 'valid';
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
        watchedState.data.feeds.push(feed);
        watchedState.loading.status = 'success';
        watchedState.form.status = 'filling';
      })
      .catch((error) => {
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
