import { contactForLoginModal } from "../config.js";
export const FETCH_CONTACTS_QUERY = `
  query calcContacts {
    calcContacts {
      Contact_ID: field(arg: ["id"])
      Display_Name: field(arg: ["display_name"])
      Profile_Image: field(arg: ["profile_image"])
    }
  }
`;

export const CREATE_POST_MUTATION = `
mutation createForumPost(
  $payload: ForumPostCreateInput = null
) {
  createForumPost(payload: $payload) {
    author_id
    published_date
    disable_new_comments
    featured_forum
    file_content
    file_type
    copy
    forum_status
    depth
    forum_type
    parent_forum_id
    forum_tag
    Mentioned_Contacts_Data{
      mentioned_contact_id
    }
  }
}

`;

export const CREATE_COMMENT_MUTATION = `
  mutation createForumComment($payload: ForumCommentCreateInput = null) {
    createForumComment(payload: $payload) {
      id
      unique_id
      author_id
      Author {
        display_name
        profile_image
      }
      comment
      created_at
      reply_to_comment_id
      forum_post_id
      file
      file_type
      Member_Comment_Upvotes_Data {
        id
        forum_comment_upvote_id
        member_comment_upvote_id
      }
      Comment_or_Reply_Mentions_Data {
        comment_or_reply_mention_id
      }
    }
  }
`;

export const DELETE_FORUM_POST_MUTATION = `
  mutation deleteForumPost($id: EduflowproForumPostID) {
    deleteForumPost(query: [{ where: { id: $id } }]) {
      id
    }
  }
`;

export const DELETE_FORUM_COMMENT_MUTATION = `
  mutation deleteForumComment($id: EduflowproForumCommentID) {
    deleteForumComment(query: [{ where: { id: $id } }]) {
      id
    }
  }
`;
export const GQL_QUERY = `
  subscription subscribeToForumPosts(
    $forum_tag: TextScalar
  ) {
    subscribeToForumPosts(
      query: [
      { where: { forum_status: "Published - Not flagged" } } 
       { andWhere: { forum_tag: $forum_tag } }
         { andWhereIn: { forum_type: ["Post", "Comment", "Replies"] } }
      ]
      orderBy: [{ path: ["post_published_date"], type: desc }]
    ) {
      author_id
      Author {
        display_name
        profile_image
      }
      created_at
      post_published_date:published_date
      disable_new_comments
      featured_post:featured_forum
      file_content
      file_type
      id
      post_copy:copy
      post_status:forum_status
      unique_id
      Contacts_Data:Bookmarking_Contacts_Data {
        id
        contact_id:bookmarking_contact_id
        saved_post_id:bookmarked_forum_id
      }
      Member_Post_Upvotes_Data:Forum_Reactors_Data {
        id
        post_upvote_id:reacted_to_forum_id
        member_post_upvote_id:forum_reactor_id
      }
    }
  }
`;

export const CREATE_POST_VOTE_MUTATION = `
  mutation createMemberPostUpvotesPostUpvotes(
    $payload: MemberPostUpvotesPostUpvotesCreateInput = null
  ) {
    createMemberPostUpvotesPostUpvotes(payload: $payload) {
      id
      member_post_upvote_id
      post_upvote_id
    }
  }
`;

export const DELETE_POST_VOTE_MUTATION = `
  mutation deleteMemberPostUpvotesPostUpvotes(
    $id: EduflowproMemberPostUpvotesPostUpvotesID
  ) {
    deleteMemberPostUpvotesPostUpvotes(
      query: [{ where: { id: $id } }]
    ) {
      id
    }
  }
`;

export const CREATE_POST_BOOKMARK_MUTATION = `
  mutation createOSavedPostContact(
    $payload: OSavedPostContactCreateInput = null
  ) {
    createOSavedPostContact(payload: $payload) {
      id
      saved_post_id
      contact_id
    }
  }
`;

export const DELETE_POST_BOOKMARK_MUTATION = `
  mutation deleteOSavedPostContact(
    $id: EduflowproOSavedPostContactID
  ) {
    deleteOSavedPostContact(query: [{ where: { id: $id } }]) {
      id
    }
  }
`;

export const CREATE_COMMENT_VOTE_MUTATION = `
  mutation createMemberCommentUpvotesForumCommentUpvotes(
    $payload: MemberCommentUpvotesForumCommentUpvotesCreateInput = null
  ) {
    createMemberCommentUpvotesForumCommentUpvotes(
      payload: $payload
    ) {
      id
      forum_comment_upvote_id
      member_comment_upvote_id
    }
  }
`;

export const DELETE_COMMENT_VOTE_MUTATION = `
  mutation deleteMemberCommentUpvotesForumCommentUpvotes(
    $id: EduflowproMemberCommentUpvotesForumCommentUpvotesID
  ) {
    deleteMemberCommentUpvotesForumCommentUpvotes(
      query: [{ where: { id: $id } }]
    ) {
      id
    }
  }
`;

export const NOTIFICATIONS_QUERY = `
  subscription subscribeToAnnouncements($author_id: EduflowproContactID) {
    subscribeToAnnouncements(
      query: [
        {
          whereGroup: [
            { where: { type: "Post" } }
            {
              andWhere: {
                Post: [{ where: { author_id: $author_id _OPERATOR_: neq } }]
              }
            }
          ]
        }
        {
          orWhereGroup: [
            { where: { type: "Comment" } }
            {
              andWhere: {
                Comment: [
                  {
                    where: {
                      author_id: $author_id
                      _OPERATOR_: neq
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    ) {
      ID: id
      Date_Added: created_at
      Title: title
      Content: content
      Type: type
      Comment_ID: comment_id
      Post_ID: post_id
      Read_Contacts {
        id
      }
    }
  }
`;

export const MARK_NOTIFICATION_READ = `
  mutation createOReadContactReadAnnouncement(
    $payload: OReadContactReadAnnouncementCreateInput = null
  ) {
    createOReadContactReadAnnouncement(payload: $payload) {
      read_announcement_id 
      read_contact_id 
    }
  }
`;

export const GET_CONTACTS_BY_TAGS = `
query calcContacts(
  $id: EduflowproContactID
  $name: TextScalar
) {
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
      { whereIn: { id: [${contactForLoginModal}], _OPERATOR_: in } }
    ]
  ) {
    Display_Name: field(arg: ["display_name"])
    Profile_Image: field(arg: ["profile_image"])
    TagName: field(arg: ["TagsData", "Tag", "name"]) 
    Contact_ID: field(arg: ["id"])
  }
}`;