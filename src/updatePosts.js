import axios from 'axios';
import parser from './parser.js';
/* eslint-disable no-param-reassign */

const updatePosts = (watchedState) => {
  console.log('launched');
  const promises = watchedState.data.feeds.map((element) => {
    console.log('el', element);
    const { url } = element;
    console.log(url);
    const promise = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => response.data.contents)
      .then((contents) => {
        console.log('parsed');
        const { posts } = parser(watchedState, contents);
        watchedState.data.posts.push(...posts);
        watchedState.feedback.type = 'success';
        watchedState.status = 'renderFeedback';
      })
      .catch((error) => {
        console.log(error.message);
        watchedState.feedback.message = error.message;
      });
    return promise;
  });
  Promise.all(promises).finally(() => setTimeout(() => updatePosts(watchedState), 5000));
};

export default updatePosts;
