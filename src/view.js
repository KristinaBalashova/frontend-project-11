import onChange from 'on-change';
import parser from './parser.js';
/* eslint-disable no-param-reassign */

const handleFeeds = (state, feeds, dataFeeds, i18nextInstance) => {
  if (state.addedLinks.length === 1) {
    const divBorder = document.createElement('div');
    divBorder.classList.add('card', 'border-0');

    const divBody = document.createElement('div');
    divBody.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.innerHTML = i18nextInstance.t('interface.feeds');

    divBorder.prepend(divBody);
    divBody.append(h2);

    feeds.prepend(divBorder);
  }
  const div = feeds.querySelector('.card');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(ul);
  dataFeeds.forEach((feed) => {
    const list = feeds.querySelector('.list-group');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    list.prepend(li);

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;

    li.prepend(h3);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
  });
};

const createModal = (state) => {
  state.data.posts.forEach((post) => {
    if (post.id === state.modal.activePost) {
      const modalHeadline = document.querySelector('h5');
      modalHeadline.textContent = post.title;
      const modalBody = document.querySelector('.modal-body');
      modalBody.textContent = post.description;

      const buttonRead = document.querySelector('.full-article');
      buttonRead.setAttribute('href', post.link);
    }
  });
};

const handlePosts = (state, posts, postsData, i18nextInstance) => {
/*  if (state.addedLinks.length === 1) {
    const divBorder = document.createElement('div');
    divBorder.classList.add('card', 'border-0');
    const divBody = document.createElement('div');
    divBody.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.innerHTML = i18nextInstance.t('interface.posts');
    divBorder.prepend(divBody);
    divBody.append(h2);
    posts.prepend(divBorder);
  }
*/

 const divBorder = document.createElement('div');
    divBorder.classList.add('card', 'border-0');
    const divBody = document.createElement('div');
    divBody.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.innerHTML = i18nextInstance.t('interface.posts');
    divBorder.prepend(divBody);
    divBody.append(h2);
    posts.prepend(divBorder);
  const div = posts.querySelector('.card');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(ul);

  postsData.forEach((post) => {
    const list = posts.querySelector('.list-group');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    list.prepend(li);

    const a = document.createElement('a');
    a.classList.add('fw-bold');

    a.setAttribute('href', post.link);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = post.id;
    a.textContent = post.title;

    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.dataset.id = post.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = i18nextInstance.t('interface.postButton');

    li.append(a);
    li.append(btn);

    btn.addEventListener('click', () => {
      state.modal.activePost = post.id;
      createModal(state);
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
    });
  });
};
const handleParsedData = (state, i18nextInstance) => {
  const posts = document.querySelector('.posts');
  const feeds = document.querySelector('.feeds');

  const dataFeeds = state.data.feeds;
  const dataPosts = state.data.posts;

  handlePosts(state, posts, dataPosts, i18nextInstance);
  handleFeeds(state, feeds, dataFeeds, i18nextInstance);
};

const handleProcess = (state, i18nextInstance) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    const form = document.querySelector('.rss-form');
    const input = document.querySelector('input');
    const feedback = document.querySelector('.feedback');
    if (value === false) {
      input.classList.add('is-invalid');
      feedback.innerHTML = state.errors;
    } else if (value === true) {
      input.classList.remove('is-invalid');
      fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.form.link)}`)
        .then((response) => response.json())
        .then((data) => {
          //const content = data.contents;
          return data.contents;

        })
        .then((content) => parser(state, content))
        .then(() => handleParsedData(state, i18nextInstance))
        .catch((error) => {
          feedback.innerHTML = i18nextInstance.t('errors.notRss');
          console.log('error', error);
        });

      feedback.innerHTML = i18nextInstance.t('success');
      form.reset();
      input.focus();
      state.form.valid = null;
    }
  });

  return watchedState;
};

export default handleProcess;
