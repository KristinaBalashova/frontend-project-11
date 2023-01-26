import axios from 'axios';
import parser from './parser.js';
/* eslint-disable no-param-reassign */

const updatePosts = (watchedState) => {
  const promises = watchedState.data.feeds.map((element) => {
    const { url } = element;
    const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const promise = axios.get(proxy)
      .then((response) => response.data.contents)
      .then((contents) => {
        const { posts } = parser(watchedState, contents);
        const postsFromState = watchedState.data.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === element.id);
        const addedTitles = postsWithCurrentId.map((el) => el.title);
        posts.forEach((newPost) => {
          if (!addedTitles.includes(newPost.title)) {
            watchedState.data.posts.push(newPost);
          }
        });
      })
      .catch((error) => {
        watchedState.feedback.message = error.message;
      });
    watchedState.status = 'readyToLoad';
    return promise;
  });
  Promise.all(promises).finally(() => setTimeout(() => updatePosts(watchedState), 5000));
};

export default updatePosts;
