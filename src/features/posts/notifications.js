import { fetchGraphQL } from "../../api/fetch.js";
import { CREATE_NOTIFICATION } from "../../api/queries.js";
import { state } from "../../config.js";

// export async function sendNotificationsAfterPost(feedData) {
export async function sendNotificationsAfterPost(feedData, rootFeedId = null) {


  if (!feedData || !feedData.id || !Array.isArray(state.allContacts)) {
    return
  };
  const {
    id,
    parent_feed_id,
    feed_type,
    feed_copy,
    Author,
    Parent_Feed,
  } = feedData;

  const type = feed_type || "Post";
  const isPost = type === "Post";
  const mentionedIds = Array.from(feed_copy.matchAll(/data-mention-id=['"](\d+)['"]/g)).map(m => Number(m[1])) || [];
  const postAuthorName = Author?.display_name || "Someone";
  const parentFeedAuthorId = Parent_Feed?.author_id || null;

  const payload = state.allContacts.map(contactId => {
    const isMentioned = mentionedIds.includes(contactId);
    const isParentOwner = contactId === parentFeedAuthorId;
    const isSelfMention = isMentioned && isParentOwner;

    let title = `${postAuthorName} created a ${type.toLowerCase()}.`;
    let notification_type = type;

    if (isMentioned) {
      if (isPost) {
        title = `${postAuthorName} mentioned you in a post.`;
      } else if (isSelfMention) {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()} in your post.`;
      } else if (isParentOwner) {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()} in your comment.`;
      } else {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()}.`;
      }
      notification_type = `${type} Mention`;
    } else if (!isPost && isParentOwner) {
      title = type === "Comment"
        ? `${postAuthorName} commented on your post.`
        : `${postAuthorName} replied to your comment.`;
    }
    const parentFeedForNotification = rootFeedId ?? parent_feed_id;
    return {
      notified_contact_id: contactId,
      parent_feed_id: id,
      // ...(isPost ? {} : { parent_feed_if_not_a_post: parent_feed_id }),
      ...(isPost ? {} : { parent_feed_if_not_a_post: parentFeedForNotification }),
      notification_type,
      title,
    };
  });

  try {
    await fetchGraphQL(CREATE_NOTIFICATION, { payload });
  } catch (err) {
   
  }
}
