import axios from 'axios';
import parser from './parser.js';
/* eslint-disable no-param-reassign */
const updatePosts = (watchedState, state) => {
  console.log('updating');
  console.log(state.addedLinks);
  if (state.addedLinks.length !== 0) {
    console.log(state.addedLinks);
    state.addedLinks.forEach((link) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`)
      .then((response) => response.json())
      .then((data) => {
        const doc = new DOMParser();
        const dom = doc.parseFromString(data.contents, 'text/xml');
        const dataParse = parser(dom);
        return dataParse;
      })
      .then((parsedData) => {
        const fetchedPostNames = watchedState.posts.map((post) => post.name);

        parsedData.posts.forEach((post) => {
          if (!fetchedPostNames.includes(post.name)) {
            watchedState.posts.push(post);
          }
        });
        console.log('dataLodaed');
        // watchedState.updatePostsStatus = "ready";
      })
      .catch((error) => {
        watchedState.error = error.message;
      }));
  }
  setTimeout(updatePosts, 5000);
};

export default updatePosts;
