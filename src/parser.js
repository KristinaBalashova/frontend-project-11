const parser = (contents) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(contents, 'text/xml');
  const title = doc.querySelector('channel > title');
  const description = doc.querySelector('channel > description');
  const feed = {
    title: title.textContent,
    description: description.textContent,
  };

  const data = {
    feeds: [],
    posts: [],
  };

  data.feeds.push(feed);

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

    data.posts.push(post);
  });

  console.log('data', data);
  return data;
};

export default parser;
