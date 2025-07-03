import { userContactIds, GLOBAL_AUTHOR_ID } from "../config.js";
import { GLOBAL_PAGE_TAG } from "../config.js";
import { notificationStore } from "../config.js";

export const FETCH_CONTACTS_QUERY = `
query calcContacts {
  calcContacts(
    query: [
      {
        where: {
          TagsData: [
            {
              where: {
                Tag: [{ where: { name: "${GLOBAL_PAGE_TAG}_Admin" } }]
              }
            }
          ]
        }
      }
      {orWhere: {
          TagsData: [
            {
              where: {
                Tag: [{ where: { name: "${GLOBAL_PAGE_TAG}_Subscriber" } }]
              }
            }
          ]
        }
      }
    ]
  ) {
    Contact_ID: field(arg: ["id"])
    Display_Name: field(arg: ["display_name"])
    Profile_Image: field(arg: ["profile_image"])
  }
}

`;

export const CREATE_FEED_POST_MUTATION = `
  mutation createFeed($payload: FeedCreateInput = null) {
    createFeed(payload: $payload) {
      id
      unique_id
      author_id
      Author{
        display_name
      }
      published_date
      created_at
      disable_new_comments
      featured_feed: featured_feed
      file_content
      file_type
      file_name
      file_link
      file_size
      image_orientation
      feed_copy 
      feed_status
      depth
      feed_type: feed_type
      parent_feed_id: parent_feed_id
      Parent_Feed: Parent_Feed{
        author_id
      }
      feed_tag: feed_tag
      Mentioned_Contacts_Data{
        mentioned_contact_id
      }
    }
  }
`;

export const DELETE_FEED_POST_MUTATION = `
  mutation deleteFeed($id: EventmxFeedID) {
    deleteFeed(query: [{ where: { id: $id } }]) {
      id
    }
  }
`;

export const UPDATE_FEED_POST_MUTATION = `
mutation updateFeedPost($id: EventmxFeedID, $payload: FeedPostUpdateInput = null) {
  updateFeedPost(query: [{ where: { id: $id } }], payload: $payload) {
    featured_feed
    disable_new_comments
  }
}`;

const SUBSCRIBE_FEED_POSTS_FIELDS = `
      author_id
      Author {
        display_name
        profile_image
      }
      created_at
      published_date
      disable_new_comments
      featured_feed
      file_content
      file_type
      file_name
      file_link
      file_size
      image_orientation
      id
      copy: feed_copy
      feed_status
      unique_id
      depth
      Feeds {
          id
            Feeds {
              id
        }
      }
      feed_type
      parent_feed_id
      Bookmarking_Contacts_Data{
        id
        Bookmarking_Contact{
          id
          first_name
          last_name
        }
        bookmarked_feed_id
      }
      Feed_Reactors_Data{
        id
        Feed_Reactor{
          id
          first_name
          last_name
        }
        reacted_to_feed_id
      }
`;

export function SUBSCRIBE_FEED_POSTS(isAdmin = false) {
  const extraStatusFilter = isAdmin
    ? ""
    : `{ andWhere: { feed_status: \"Published - Not flagged\" } }`;
  const scheduledFilter = isAdmin
    ? '{ orWhere: { feed_status: "Scheduled" } }'
    : "";
  return `
  subscription subscribeToFeeds($feed_tag: TextScalar) {
    subscribeToFeeds(
      query: [
             {
        whereGroup: [
          {
            where: {
              feed_status: "Published - Not flagged"
            }
          }
          ${scheduledFilter}
        ]
      }
      ${extraStatusFilter}
        { andWhere: { feed_tag: $feed_tag } }
        { andWhere: { feed_type: "Post" } }
      ]
      orderBy: [{ path: ["published_date"], type: desc }]
    ) {
${SUBSCRIBE_FEED_POSTS_FIELDS}
    }
  }
`;
}

export const CREATE_BOOKMARK_MUTATION = `
mutation createOBookmarkingContactBookmarkedFeed($payload: OBookmarkingContactBookmarkedFeedCreateInput = null) {
  createOBookmarkingContactBookmarkedFeed(payload: $payload) {
    id
    bookmarked_feed_id
    bookmarking_contact_id
  }
}
`;

export const DELETE_BOOKMARK_MUTATION = `
mutation deleteOBookmarkingContactBookmarkedFeed(
  $id: EventmxOBookmarkingContactBookmarkedFeedID
) {
  deleteOBookmarkingContactBookmarkedFeed(
    query: [{ where: { id: $id } }]
  ) {
    id
  }
}

`;

export const CREATE_REACTION_MUTATION = `
mutation createOFeedReactorReactedtoFeed($payload: OFeedReactorReactedtoFeedCreateInput = null) {
  createOFeedReactorReactedtoFeed(payload: $payload) {
    id
    feed_reactor_id
    reacted_to_feed_id
  }
}
`;

export const DELETE_REACTION_MUTATION = `
mutation deleteOFeedReactorReactedtoFeed(
  $id: EventmxOFeedReactorReactedtoFeedID
) {
  deleteOFeedReactorReactedtoFeed(query: [{ where: { id: $id } }]) {
    id
  }
}
`;

export const GET_CONTACTS_BY_TAGS = `
query calcContacts($id: EventmxContactID, $name: TextScalar) {
  calcContacts(
    query: [
      { where: { id: $id } }
      {
        andWhere: {
          TagsData: [
            { where: { Tag: [{ where: { name: $name } }] } }
          ]
        }
      }
    ]
  ) {
    Contact_ID: field(arg: ["id"])
  }
}
`;

export const GET_CONTACTS_FOR_MODAL = `
query calcContacts {
  calcContacts(
    query: [
      { whereIn: { id: [${userContactIds}], _OPERATOR_: in } }
    ]
  ) {
    Display_Name: field(arg: ["display_name"])
    Profile_Image: field(arg: ["profile_image"])
    TagName: field(arg: ["TagsData", "Tag", "name"])
    Contact_ID: field(arg: ["id"])
  }
}`;

export const UPDATE_SCHEDULED_TO_POST = `
mutation updateFeedPost(
  $unique_id: StringScalar_0_8
  $payload: FeedPostUpdateInput = null
) {
  updateFeedPost(
    query: [{ where: { unique_id: $unique_id } }]
    payload: $payload
  ) {
    feed_status
  }
}
`;

export const CREATE_NOTIFICATION = `
mutation createAnnouncements(
  $payload: [AnnouncementCreateInput] = null
) {
  createAnnouncements(payload: $payload) {
    parent_feed_id
    notified_contact_id
    parent_feed_if_not_a_post
    notification_type 
    title 
  }
}
`;
export function GET_NOTIFICATIONS() {
  let preferences = notificationStore.preferences;
  let filterForNotifications = '';

  if (preferences?.Notify_me_of_comments_replies_on_my_posts_only) {
    filterForNotifications = `
    {
      andWhere: {
        Notified_Contact: [
          {
            where: {
              notify_me_of_comments_replies_on_my_posts_only: true
            }
          }
        ]
      }
    }
    {
        andWhere: {
          Parent_Feed: [
            {
              whereGroup: [
                { where: { feed_type: "Comment" } }
                { orWhere: { feed_type: "Reply" } }
              ]
            }
          ]
        }
      }
      {
        andWhere: {
          Parent_Feed: [
            {
              where: {
                Parent_Feed: [{ where: { author_id: ${GLOBAL_AUTHOR_ID} } }]
              }
            }
          ]
        }
      }
    `;
  }

  if (preferences?.Notify_me_when_I_am_Mentioned) {
    filterForNotifications = `
    {
      andWhere: {
        Notified_Contact: [
          {
            where: { notify_me_when_i_am_mentioned: true }
          }
        ]
      }
    }
    {
      andWhere: {
        Parent_Feed: [
          {
            where: {
              Mentioned_Contacts_Data: [{ where: { mentioned_contact_id: ${GLOBAL_AUTHOR_ID} } }]
            }
          }
        ]
      }
    }
    `;
  }

  return `
  subscription subscribeToNotifications(
    $author_id: EventmxContactID 
    $notified_contact_id: EventmxContactID 
  ) {
    subscribeToNotifications(
      query: [
        {
          where: {
            Parent_Feed: [
              {
                where: {
                  author_id: $author_id
                  _OPERATOR_: neq
                }
              }
             {
              andWhere: {
                feed_status: "Published - Not flagged"
              }
            }
            ]
          }
        }
        ${filterForNotifications}
        {
          andWhere: {
            notified_contact_id: $notified_contact_id
          }
        }
        {
        andWhere: {
          Notified_Contact: [
            {
              whereGroup: [
                {
                  where: {
                    turn_off_all_notifications: false
                  }
                }
                {
                  andWhereGroup: [
                    {
                      where: {
                        notify_me_of_all_posts: true
                      }
                    }
                    {
                      orWhere: {
                        notify_me_of_all_comments_replies_on_posts: true
                      }
                    }
                    {
                      orWhere: {
                        notify_me_when_i_am_mentioned: true
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      ]
      orderBy: [
        {
          path: ["Parent_Feed", "published_date"]
          type: desc
        }
      ]
    ) {
      ID: id
      Is_Read: is_read
      Title: title
      Parent_Feed_If_Not_A_Post: parent_feed_if_not_a_post
      Notification_Type: notification_type
      Parent_Feed_ID: parent_feed_id
      Notified_Contact_ID: notified_contact_id
      Parent_Feed {
        copy: feed_copy 
        published_date
      }
    }
  }
  `;
}

export const GET__CONTACTS_NOTIFICATION_PREFERENCEE = `
query getContact($id: EventmxContactID) {
  getContact(query: [{ where: { id: $id } }]) {
    Turn_Off_All_Notifications: turn_off_all_notifications
    Notify_me_of_all_Posts: notify_me_of_all_posts
    Notify_me_of_comments_replies_on_my_posts_only: notify_me_of_comments_replies_on_my_posts_only
    Notify_me_when_I_am_Mentioned: notify_me_when_i_am_mentioned
  }
}
`;
export const UPDATE_CONTACT_NOTIFICATION_PREFERENCE = `
mutation updateContact(
  $id: EventmxContactID
  $payload: ContactUpdateInput = null
) {
  updateContact(
    query: [{ where: { id: $id } }]
    payload: $payload
  ) {
    Turn_Off_All_Notifications: turn_off_all_notifications
    Notify_me_of_all_Posts: notify_me_of_all_posts
    Notify_me_of_comments_replies_on_my_posts_only: notify_me_of_comments_replies_on_my_posts_only
    Notify_me_when_I_am_Mentioned: notify_me_when_i_am_mentioned
  }
}
`;
export const GET_SINGLE_POST_SUBSCRIPTION = `
subscription subscribeToFeed(
  $id: EventmxFeedID
) {
  subscribeToFeed(
    query: [{ where: { id: $id } }]
    orderBy: [{ path: ["published_date"], type: desc }]
  ) {
    Author_ID: author_id
    Date_Added: created_at
    Published_Date: published_date
    Disable_New_Comments: disable_new_comments
    Featured_Feed: featured_feed
    File_Content: file_content
    File_Type: file_type
    file_name
    file_link
    file_size
    image_orientation
    ID: id
    Copy: feed_copy
    Feed_Status: feed_status
    Unique_ID: unique_id
    Depth: depth
    Feed_Type: feed_type
    Parent_Feed_ID: parent_feed_id
    Author {
      display_name
      profile_image
    }
    Bookmarking_Contacts_Data {
      id
      bookmarked_feed_id
      Bookmarking_Contact {
        id
        first_name
        last_name
      }
    }
    Feed_Reactors_Data {
      id
      reacted_to_feed_id
      Feed_Reactor {
        id
        first_name
        last_name
      }
    }
    Feeds {
      Author_ID: author_id
      Date_Added: created_at
      Published_Date: published_date
      Disable_New_Comments: disable_new_comments
      Featured_Feed: featured_feed
      File_Content: file_content
      File_Type: file_type
      file_name
      file_link
      file_size
      image_orientation
      ID: id
      Copy: feed_copy
      Feed_Status: feed_status
      Unique_ID: unique_id
      Depth: depth
      Feed_Type: feed_type
      Parent_Feed_ID: parent_feed_id
      Author {
        display_name
        profile_image
      }
      Bookmarking_Contacts_Data {
        id
        bookmarked_feed_id
        Bookmarking_Contact {
          id
          first_name
          last_name
        }
      }
      Feed_Reactors_Data {
        id
        reacted_to_feed_id
        Feed_Reactor {
          id
          first_name
          last_name
        }
      }
      Feeds {
        Author_ID: author_id
        Date_Added: created_at
        Published_Date: published_date
        Disable_New_Comments: disable_new_comments
        Featured_Feed: featured_feed
        File_Content: file_content
        File_Type: file_type
        file_name
        file_link
        file_size
        image_orientation
        ID: id
        Copy: feed_copy
        Feed_Status: feed_status
        Unique_ID: unique_id
        Depth: depth
        Feed_Type: feed_type
        Parent_Feed_ID: parent_feed_id
        Author {
          display_name
          profile_image
        }
        Bookmarking_Contacts_Data {
          id
          bookmarked_feed_id
          Bookmarking_Contact {
            id
            first_name
            last_name
          }
        }
        Feed_Reactors_Data {
          id
          reacted_to_feed_id
          Feed_Reactor {
            id
            first_name
            last_name
          }
        }
      }
    }
  }
}

`;