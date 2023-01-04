import onChange from 'on-change';
import * as yup from 'yup';

export default () => {
  const state = {
    form: {
      valid: false,
    },
    errors: [],
    addedLinks: [],
  };

  const watchedState = onChange(state, async (route, value, previousValue) => {
    console.log('OnChange');
    const form = document.querySelector('.rss-form');
    const input = document.querySelector('input');
    console.log('added links: ', state.addedLinks);
    //console.log('value', value);
    if (value === false) {
      input.classList.add('is-invalid');
    } else if (value === true) {
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
    }
  });

  const schema = yup.string().required().url().notOneOf(state.addedLinks, 'Err!');

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    console.log('SubmitEvent');
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    console.log('input url: ', value);
    schema.validate(value)
      .then(() => {
        console.log('validated');
        watchedState.form.valid = true;
        state.errors = null;
        state.addedLinks.push(value);
      })
      .catch((error) => {
        console.log('error');
      	state.errors = error.name;
        watchedState.form.valid = false;
      });
  });
};
