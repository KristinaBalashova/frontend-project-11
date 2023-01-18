const parser = (state, contents) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(contents, 'text/xml');
  const title = doc.querySelector('channel > title');
console.log('contents', contents);
  const description = doc.querySelector('channel > description');
  const feed = {
    title: title.textContent,
    description: description.textContent,
  };

  state.data.feeds.push(feed);

  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemUrl = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    const post = {
      title: itemTitle.textContent,
      description: itemDescription.textContent,
      link: itemUrl.textContent,
    };

    state.data.posts.push(post);
  });
};

export default parser;
