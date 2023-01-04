import onChange from 'on-change';
import * as yup from 'yup';

const addedLinks = [];
export default () => {
  const state = {
    form: {
      valid: true,
    },
    errors: [],
  };

  const watchedState = onChange(state, (route, previousValue, value) => {
    const form = document.querySelector('.form');
    const input = document.querySelector('input');
    if (value === false) {
      input.classList.add('is-invalid');
    } else if (state.form.valide === true) {
      form.reset();
      input.focus();
    }
  });

  const schema = yup.object({
    url: yup.string()
      .url()
      .nullable()
      .notOneOf(addedLinks, 'Err!'),
  });

  const button = document.querySelector('button[type="submit"]');
  button.addEventListener('submit', (e) => {
    e.preventDefault();
    // const value = e.target.value;
    const formData = new FormData(e.target);
    const value = formData.get('url');
    console.log('value', value);
    schema.validate(value)
      .then(() => {
        watchedState.form.valid = true;
        state.errors = null;
        addedLinks.push(value);
      })
      .catch((error) => {
      // save erorrs
        watchedState.form.valid = false;
      });
  });
};
