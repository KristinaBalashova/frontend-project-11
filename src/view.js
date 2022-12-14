import onChange from 'on-change';
import parser from './parser.js';

const handleFeeds = (feeds, dataFeeds, i18nextInstance) => {
  const divBorder = document.createElement('div');
  divBorder.classList.add('card', 'border-0');

  const divBody = document.createElement('div');
  divBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.innerHTML = i18nextInstance.t('interface.feeds');

  divBorder.append(divBody);
  divBody.append(h2);

  feeds.append(divBorder);

  dataFeeds.forEach((feed) => {
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    ul.append(li);
    divBorder.append(ul);

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
const handlePosts = (posts, postsData, i18nextInstance) => {
  const divBorder = document.createElement('div');
  divBorder.classList.add('card', 'border-0');

  const divBody = document.createElement('div');
  divBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.innerHTML = i18nextInstance.t('interface.posts');

  divBorder.append(divBody);
  divBody.append(h2);

  posts.append(divBorder);
  postsData.forEach((post) => {
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    ul.prepend(li);
    divBorder.append(ul);

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

    li.prepend(a);
    li.append(btn);
  });
};
const handleParsedData = (parsedContent, i18nextInstance) => {
  const posts = document.querySelector('.posts');
  const feeds = document.querySelector('.feeds');

  const dataFeeds = parsedContent.feeds;
  const dataPosts = parsedContent.posts;

  handlePosts(posts, dataPosts, i18nextInstance);
  handleFeeds(feeds, dataFeeds, i18nextInstance);
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
      console.log('value', value);
      input.classList.remove('is-invalid');
      fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(state.form.link)}`)
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error('Network response was not ok.');
        })
        .then((data) => {
          console.log(data.contents);
          handleParsedData(parser(data.contents), i18nextInstance);
        })
        .catch((error) => {
          console.log(error);
          feedback.innerHTML = i18nextInstance.t('errors.notRss');
        });

      feedback.innerHTML = i18nextInstance.t('success');
      form.reset();
      input.focus();
    }
  });
  return watchedState;
};

export default handleProcess;
