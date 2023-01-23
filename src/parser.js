import _ from 'lodash';

const parser = (state, contents) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(contents, 'text/xml');
  const title = doc.querySelector('channel > title');

  if (!doc.querySelector('rss')) {
    throw new Error('ParserError');
  }

  const description = doc.querySelector('channel > description');
  const feed = {
    id: _.uniqueId(),
    title: title.textContent,
    description: description.textContent,
  };
  const data = { feeds: feed, posts: [] };
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemUrl = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    const allTitles = state.data.posts.map((post) => post.title);
    if (!allTitles.includes(itemTitle)) {
      const post = {
        id: _.uniqueId(),
        title: itemTitle.textContent,
        description: itemDescription.textContent,
        link: itemUrl.textContent,
      };
      data.posts.push(post);
    }
  });
  return data;
};

export default parser;
