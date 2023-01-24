import axios from 'axios';
import parser from './parser.js';
/* eslint-disable no-param-reassign */

const updatePosts = (watchedState) => {
  console.log('launched');
  console.log(watchedState.feeds);
  const promises = watchedState.data.feeds.map((element) => {
    console.log(element);
    const { url } = element;
    const promise = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => response.data.contents)
      .then((contents) => {
        console.log('parsed');
        parser(watchedState, contents);
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
