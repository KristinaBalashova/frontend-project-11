/* eslint-disable no-param-reassign */

const handleFeeds = (dataFeeds, i18nextInstance, elements) => {
  elements.feeds.innerHTML = '';
  const divBorder = document.createElement('div');
  divBorder.classList.add('card', 'border-0');
  const divBody = document.createElement('div');
  divBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.innerHTML = i18nextInstance.t('interface.feeds');
  divBorder.prepend(divBody);
  divBody.append(h2);
  elements.feeds.prepend(divBorder);
  const div = elements.feeds.querySelector('.card');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(ul);

  dataFeeds.forEach((feed) => {
    const list = elements.feeds.querySelector('.list-group');
    list.classList.add('list-group', 'border-0', 'rounded-0');
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

const handlePosts = (watchedState, postsData, i18nextInstance, elements) => {
  elements.posts.innerHTML = '';
  const divBorder = document.createElement('div');
  divBorder.classList.add('card', 'border-0');
  const divBody = document.createElement('div');
  divBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.innerHTML = i18nextInstance.t('interface.posts');
  divBorder.prepend(divBody);
  divBody.append(h2);
  elements.posts.prepend(divBorder);

  const div = elements.posts.querySelector('.card');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(ul);

  const postEl = postsData.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = post.id;
    a.textContent = post.title;
    if (watchedState.openedPosts.includes(post.id)) {
      a.classList.add('fw-normal');
    } else {
      a.classList.add('fw-bold');
    }
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.dataset.id = post.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = i18nextInstance.t('interface.previewButton');
    li.append(a);
    li.append(btn);
    return li;
  });
  ul.prepend(...postEl);
};

const handleModal = (watchedState) => {
  const active = watchedState.data.posts.find((post) => post.id === watchedState.modal.activePost);
  const modalHeadline = document.querySelector('h5');
  modalHeadline.textContent = active.title;
  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = active.description;
  const buttonRead = document.querySelector('.full-article');
  buttonRead.setAttribute('href', active.link);
  const a = document.querySelector(`a[data-id="${active.id}"]`);
  a.classList.add('fw-normal');
  a.classList.remove('fw-bold');
};
const renderValidationError = (errorMessage, elements, i18nextInstance) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  switch (errorMessage) {
    case 'alreadyExists':
      elements.feedback.textContent = i18nextInstance.t('error.alreadyExists');
      break;
    case 'empty':
      elements.feedback.textContent = i18nextInstance.t('error.empty');
      break;
    case 'notValid':
      elements.feedback.textContent = i18nextInstance.t('error.notValid');
      break;
    default:
      throw new Error('Unknown error');
  }
};
const renderLoadingError = (elements, watchedState, i18nextInstance) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  switch (watchedState.loading.error) {
    case 'axiosError':
      elements.feedback.textContent = i18nextInstance.t('error.network');
      break;
    case 'parserError':
      elements.feedback.textContent = i18nextInstance.t('error.notRss');
      break;
    default:
      throw new Error('Unknown error');
  }
};

const renderData = (watchedState, i18nextInstance, elements) => {
  if (watchedState.form.status === 'invalid') {
    renderValidationError(watchedState.form.validationError, elements, i18nextInstance);
  }
  if (watchedState.loading.status === 'failed') {
    renderLoadingError(elements, watchedState, i18nextInstance);
  }
  if (watchedState.loading.status === 'success') {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.innerHTML = i18nextInstance.t('success');
    const dataFeeds = watchedState.data.feeds;
    const dataPosts = watchedState.data.posts;
    handlePosts(watchedState, dataPosts, i18nextInstance, elements);
    handleFeeds(dataFeeds, i18nextInstance, elements);
    elements.form.reset();
    elements.input.focus();
    watchedState.loading.status = 'waitingForData';
  }

  if (watchedState.modal.activePost !== null) {
    handleModal(watchedState);
  }
};

export default renderData;
