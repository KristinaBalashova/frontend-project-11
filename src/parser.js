const parser = (contents) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(contents, 'text/xml');
  console.log('doc', doc);
  const title = doc.querySelector('channel > title');
  const description = doc.querySelector('channel > description');
  console.log('title', title.textContent);
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
  console.log('items', items);
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
  console.log(data.posts);
  return data;
};

export default parser;
