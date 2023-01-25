import axios from 'axios';
import parser from './parser.js';
/* eslint-disable no-param-reassign */

const updatePosts = (watchedState) => {
  console.log('launched');
  const promises = watchedState.data.feeds.map((element) => {
    console.log('el', element);
    const { url } = element;
    console.log(url);
    const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const promise = axios.get(proxy)
      .then((response) => response.data.contents)
      .then((contents) => {
        console.log('parsed');
        const { posts } = parser(watchedState, contents);
        const postsFromState = watchedState.data.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === element.id);
        const addedTitles = postsWithCurrentId.map((el) => el.title);
        console.log(postsFromState, 'fromState');
        console.log('elId', element.id);
        console.log('postsWithCurrent', postsWithCurrentId);
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
  Promise.all(promises).finally(() => setTimeout(() => updatePosts(watchedState), 15000));
};

export default updatePosts;
