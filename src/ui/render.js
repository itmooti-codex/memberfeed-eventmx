import { safeArray, timeAgo, parseDate } from '../utils/formatter.js';
import { GLOBAL_AUTHOR_ID, DEFAULT_AVATAR, state } from '../config.js';

export function buildTree(existingPosts, rawItems) {
  const byId = new Map();

  const collapsedMap = new Map();
  (function gather(arr) {
    for (const item of arr) {
      collapsedMap.set(item.uid, item.isCollapsed);
      gather(item.children || []);
    }
  })(existingPosts);

  function cloneState(uid) {
    if (state.collapsedState.hasOwnProperty(uid)) {
      return { isCollapsed: state.collapsedState[uid] };
    }
    state.collapsedState[uid] = true;
    return { isCollapsed: true };
  }

  const nodes = rawItems.map((raw) => {
    const node = mapItem(raw, raw.depth || 0);
    Object.assign(node, cloneState(node.uid));
    state.collapsedState[node.uid] = node.isCollapsed;
    byId.set(node.id, node);
    return node;
  });

  const roots = [];

  nodes.forEach((node) => {
    if (node.depth === 0 || !node.parentId) {
      roots.push(node);
    } else {
      const parent = byId.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}

export function mapItem(raw, depth = 0) {
  const createdAt = parseDate(raw.published_date || raw.created_at);

  const reactors = safeArray(raw.Forum_Reactors_Data);
  const userReaction = reactors.find(
    (r) => r.Forum_Reactor?.id === GLOBAL_AUTHOR_ID
  );

  const bookmarks = safeArray(raw.Bookmarking_Contacts_Data);
  const userBookmark = bookmarks.find(
    (b) => b.Bookmarking_Contact?.id === GLOBAL_AUTHOR_ID
  );

  const fileContentRaw = raw.file_content;
  const fileContent =
    typeof fileContentRaw === 'string'
      ? fileContentRaw
      : fileContentRaw?.link || '';
  const fileName =
    typeof fileContentRaw === 'string'
      ? fileContentRaw
      : fileContentRaw?.name || '';

  return {
    id: raw.id,
    uid: raw.unique_id,
    authorId: raw.author_id,
    canDelete: raw.author_id === GLOBAL_AUTHOR_ID,
    depth,
    authorName: raw.Author?.display_name || 'Anonymous',
    authorImage: raw.Author?.profile_image || DEFAULT_AVATAR,
    createdAt,
    timeAgo: createdAt ? timeAgo(createdAt) : '',
    content: raw.copy || '',
    upvotes: reactors.length,
    hasUpvoted: Boolean(userReaction),
    voteRecordId: userReaction?.id || null,
    hasBookmarked: Boolean(userBookmark),
    bookmarkRecordId: userBookmark?.id || null,
    children: [],
    isCollapsed: true,
    parentId: raw.parent_forum_id,
    isFeatured: raw.featured_forum === true,
    fileType: raw.file_type || 'None',
    fileContent: depth === 0 ? fileContent : '',
    fileContentName: depth === 0 ? fileName : '',
    fileContentComment: depth > 0 ? fileContent : null,
    fileContentCommentName: depth > 0 ? fileName : '',
  };
}

export function findNode(arr, uid) {
  for (const x of arr) {
    if (x.uid === uid) return x;
    const found = findNode(x.children, uid);
    if (found) return found;
  }
  return null;
}

export const tmpl = $.templates('#tmpl-item');
