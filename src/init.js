import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import parser from './parser.js';
import launchWatcher from './view.js';
/* eslint-disable no-param-reassign */

const proxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const updatePosts = (watchedState) => {
  const promises = watchedState.data.feeds.map((element) => {
    const { url } = element;
    const promise = axios.get(proxy(url))
      .then((response) => {
        const { contents } = response.data;
        const { posts } = parser(contents);
        const postsFromState = watchedState.data.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === element.id);
        const addedTitles = postsWithCurrentId.map((el) => el.title);
        const newPosts = [];
        posts.forEach((newPost) => {
          if (!addedTitles.includes(newPost.title)) {
            newPost.feedId = element.id;
            newPost.id = _.uniqueId();
            newPosts.push(newPost);
          }
        });
        if (newPosts.length !== 0) {
          watchedState.data.posts.push(newPosts);
        }
      })
      .catch(() => {
      });
    return promise;
  });
  Promise.all(promises).finally(() => setTimeout(() => updatePosts(watchedState), 5000));
};

const loadData = (url, watchedState) => {
  watchedState.loading.status = 'loading';
  const promise = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { contents } = response.data;
      const data = parser(contents);
      const { feed, posts } = data;
      feed.url = url;
      feed.id = _.uniqueId();
      posts.forEach((post) => {
        post.id = _.uniqueId();
        post.feedId = feed.id;
      });
      watchedState.data.posts.unshift(...posts);
      watchedState.data.feeds.push(feed);
      watchedState.loading.status = 'success';
      watchedState.form.status = 'filling';
    });
  return promise;
};

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

  const watchedState = launchWatcher(state, i18nInstance, elements);
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
    }
  };
  const makeSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';
    const addedLinks = watchedState.data.feeds.map((feed) => feed.url);
    const schema = makeSchema(addedLinks);
    const formData = new FormData(e.target);
    const value = formData.get('url');
    schema.validate(value)
      .then((link) => {
        watchedState.form.status = 'valid';
        return loadData(link, watchedState);
      })
      .catch((error) => {
        console.log('error', error);
        handleError(error);
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (!postId) {
      return;
    }
    watchedState.modal.activePost = postId;
  });

  updatePosts(watchedState);
};
export default app;
