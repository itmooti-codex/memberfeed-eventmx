import { fetchGraphQL } from "../../api/fetch.js";
import { GET_SINGLE_POST_SUBSCRIPTION } from "../../api/queries.js";
import { buildTree } from "../../ui/render.js";
import { tmpl } from "../../ui/render.js";
import { setupPlyr } from "../../utils/plyr.js";

function normalize(node, list) {
  const {
    Author_ID,
    Formatted_Json,
    Date_Added,
    Published_Date,
    Disable_New_Comments,
    Featured_Forum,
    File_Content,
    File_Type,
    ID,
    Copy,
    Forum_Status,
    Unique_ID,
    Depth,
    Forum_Type,
    Parent_Forum_ID,
    Author,
    Bookmarking_Contacts_Data,
    Forum_Reactors_Data,
    ForumPosts,
  } = node;
  list.push({
    author_id: Author_ID,
    formatted_json: Formatted_Json,
    created_at: Date_Added,
    published_date: Published_Date,
    disable_new_comments: Disable_New_Comments,
    featured_forum: Featured_Forum,
    file_content: File_Content,
    file_type: File_Type,
    id: ID,
    copy: Copy,
    forum_status: Forum_Status,
    unique_id: Unique_ID,
    depth: Depth,
    forum_type: Forum_Type,
    parent_forum_id: Parent_Forum_ID,
    Author,
    Bookmarking_Contacts_Data,
    Forum_Reactors_Data,
  });
  if (Array.isArray(ForumPosts)) {
    ForumPosts.forEach((child) => normalize(child, list));
  }
}

export function initPostModalHandlers() {
  $(document).on("click", ".openPostModal", async function () {
    const postId = $(this).data("id");
    if (!postId) return;
    const container = document.getElementById("modalForumRoot");
    if (container) {
      container.innerHTML = "";
    }
    try {
      const res = await fetchGraphQL(GET_SINGLE_POST_SUBSCRIPTION, { id: postId });
      const data = res?.data?.subscribeToForumPost;
      if (!data) return;
      const list = [];
      normalize(data, list);
      const tree = buildTree([], list);
      if (container) {
        container.innerHTML = tmpl.render(tree);
        requestAnimationFrame(setupPlyr);
      }
    } catch (err) {
      console.error("Failed to load post", err);
    }
  });
}
