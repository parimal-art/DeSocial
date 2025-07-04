export const idlFactory = ({ IDL }) => {
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'created_at' : IDL.Nat64,
    'author' : IDL.Principal,
    'comment_id' : IDL.Nat64,
  });
  const Post = IDL.Record({
    'post_id' : IDL.Nat64,
    'content' : IDL.Text,
    'original_post_id' : IDL.Opt(IDL.Nat64),
    'video' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'author' : IDL.Principal,
    'likes' : IDL.Vec(IDL.Principal),
    'image' : IDL.Opt(IDL.Text),
    'comments' : IDL.Vec(Comment),
    'reposted_by' : IDL.Opt(IDL.Principal),
  });
  const UserProfile = IDL.Record({
    'bio' : IDL.Text,
    'user_principal' : IDL.Principal,
    'profile_image' : IDL.Text,
    'cover_image' : IDL.Text,
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'followers' : IDL.Vec(IDL.Principal),
    'following' : IDL.Vec(IDL.Principal),
  });
  const NotificationType = IDL.Variant({
    'Follow' : IDL.Null,
    'Like' : IDL.Null,
    'Repost' : IDL.Null,
    'Comment' : IDL.Null,
  });
  const Notification = IDL.Record({
    'read' : IDL.Bool,
    'created_at' : IDL.Nat64,
    'sender' : IDL.Principal,
    'notification_id' : IDL.Nat64,
    'notification_type' : NotificationType,
    'message' : IDL.Text,
    'receiver' : IDL.Principal,
  });
  return IDL.Service({
    'comment_post' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [IDL.Variant({ 'Ok' : Comment, 'Err' : IDL.Text })],
        [],
      ),
    'create_post' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Variant({ 'Ok' : Post, 'Err' : IDL.Text })],
        [],
      ),
    'follow_user' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_all_posts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'get_all_users' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'get_current_user' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'get_feed' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'get_followers' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_following' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_notifications' : IDL.Func([], [IDL.Vec(Notification)], ['query']),
    'get_user' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'get_user_posts' : IDL.Func([IDL.Principal], [IDL.Vec(Post)], ['query']),
    'is_following' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'like_post' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Post, 'Err' : IDL.Text })],
        [],
      ),
    'mark_notification_read' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'register_user' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text })],
        [],
      ),
    'repost_post' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Post, 'Err' : IDL.Text })],
        [],
      ),
    'search_users' : IDL.Func([IDL.Text], [IDL.Vec(UserProfile)], ['query']),
    'unfollow_user' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'update_profile' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
