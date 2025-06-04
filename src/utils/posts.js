export function flattenComments(posts) {
  const result = [];
  function gather(list) {
    for (const c of Array.isArray(list) ? list : []) {
      result.push(c);
      if (c.ForumComments) gather(c.ForumComments);
    }
  }
  posts.forEach((p) => gather(p.ForumComments));
  return result;
}

export function removeRawById(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.id === id) {
      arr.splice(i, 1);
      return true;
    }
    if (item.ForumComments && removeRawById(item.ForumComments, id)) {
      return true;
    }
  }
  return false;
}

export function findRawById(arr, id) {
  for (const item of arr) {
    if (item.id === id) return item;
    if (item.ForumComments) {
      const found = findRawById(item.ForumComments, id);
      if (found) return found;
    }
  }
  return null;
}
