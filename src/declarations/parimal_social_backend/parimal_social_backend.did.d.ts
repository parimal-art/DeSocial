import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Comment {
  'content' : string,
  'created_at' : bigint,
  'author' : Principal,
  'comment_id' : bigint,
}
export interface Notification {
  'read' : boolean,
  'created_at' : bigint,
  'sender' : Principal,
  'notification_id' : bigint,
  'notification_type' : NotificationType,
  'message' : string,
  'receiver' : Principal,
}
export type NotificationType = { 'Follow' : null } |
  { 'Like' : null } |
  { 'Repost' : null } |
  { 'Comment' : null };
export interface Post {
  'post_id' : bigint,
  'content' : string,
  'original_post_id' : [] | [bigint],
  'video' : [] | [string],
  'created_at' : bigint,
  'author' : Principal,
  'likes' : Array<Principal>,
  'image' : [] | [string],
  'comments' : Array<Comment>,
  'reposted_by' : [] | [Principal],
}
export interface UserProfile {
  'bio' : string,
  'user_principal' : Principal,
  'profile_image' : string,
  'cover_image' : string,
  'name' : string,
  'created_at' : bigint,
  'followers' : Array<Principal>,
  'following' : Array<Principal>,
}
export interface _SERVICE {
  'comment_post' : ActorMethod<
    [bigint, string],
    { 'Ok' : Comment } |
      { 'Err' : string }
  >,
  'create_post' : ActorMethod<
    [string, [] | [string], [] | [string]],
    { 'Ok' : Post } |
      { 'Err' : string }
  >,
  'follow_user' : ActorMethod<
    [Principal],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'get_all_posts' : ActorMethod<[], Array<Post>>,
  'get_all_users' : ActorMethod<[], Array<UserProfile>>,
  'get_current_user' : ActorMethod<[], [] | [UserProfile]>,
  'get_feed' : ActorMethod<[], Array<Post>>,
  'get_followers' : ActorMethod<[Principal], Array<Principal>>,
  'get_following' : ActorMethod<[Principal], Array<Principal>>,
  'get_notifications' : ActorMethod<[], Array<Notification>>,
  'get_user' : ActorMethod<[Principal], [] | [UserProfile]>,
  'get_user_posts' : ActorMethod<[Principal], Array<Post>>,
  'is_following' : ActorMethod<[Principal], boolean>,
  'like_post' : ActorMethod<[bigint], { 'Ok' : Post } | { 'Err' : string }>,
  'mark_notification_read' : ActorMethod<
    [bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'register_user' : ActorMethod<
    [string, string, string, string],
    { 'Ok' : UserProfile } |
      { 'Err' : string }
  >,
  'repost_post' : ActorMethod<[bigint], { 'Ok' : Post } | { 'Err' : string }>,
  'search_users' : ActorMethod<[string], Array<UserProfile>>,
  'unfollow_user' : ActorMethod<
    [Principal],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'update_profile' : ActorMethod<
    [string, string, string, string],
    { 'Ok' : UserProfile } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
