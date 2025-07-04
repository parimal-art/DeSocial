use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{
    api::{caller, time},
    query, update,
};
candid::export_service!();
use std::collections::BTreeMap;
use std::cell::RefCell;

// Data Structures 
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub user_principal: Principal,
    pub name: String,
    pub bio: String,
    pub profile_image: String,
    pub cover_image: String,
    pub followers: Vec<Principal>,
    pub following: Vec<Principal>,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Post {
    pub post_id: u64,
    pub author: Principal,
    pub content: String,
    pub image: Option<String>,
    pub video: Option<String>,
    pub created_at: u64,
    pub likes: Vec<Principal>,
    pub comments: Vec<Comment>,
    pub reposted_by: Option<Principal>,
    pub original_post_id: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Comment {
    pub comment_id: u64,
    pub author: Principal,
    pub content: String,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Notification {
    pub notification_id: u64,
    pub sender: Principal,
    pub receiver: Principal,
    pub notification_type: NotificationType,
    pub message: String,
    pub created_at: u64,
    pub read: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum NotificationType {
    Like,
    Comment,
    Follow,
    Repost,
}

// Storage
thread_local! {
    static USERS: RefCell<BTreeMap<Principal, UserProfile>> = RefCell::new(BTreeMap::new());
    static POSTS: RefCell<BTreeMap<u64, Post>> = RefCell::new(BTreeMap::new());
    static NOTIFICATIONS: RefCell<BTreeMap<u64, Notification>> = RefCell::new(BTreeMap::new());
    static POST_COUNTER: RefCell<u64> = RefCell::new(0);
    static COMMENT_COUNTER: RefCell<u64> = RefCell::new(0);
    static NOTIFICATION_COUNTER: RefCell<u64> = RefCell::new(0);
}

// Helper functions
fn get_next_post_id() -> u64 {
    POST_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        *count
    })
}

fn get_next_comment_id() -> u64 {
    COMMENT_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        *count
    })
}

fn get_next_notification_id() -> u64 {
    NOTIFICATION_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        *count
    })
}

// User Management Functions
#[update]
pub fn register_user(name: String, bio: String, profile_image: String, cover_image: String) -> Result<UserProfile, String> {
    let principal = caller();

    if name.trim().is_empty() {
        return Err("Name cannot be empty".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        if users.contains_key(&principal) {
            return Err("User already registered".to_string());
        }

        let user_profile = UserProfile {
            user_principal: principal,
            name,
            bio,
            profile_image,
            cover_image,
            followers: Vec::new(),
            following: Vec::new(),
            created_at: time(),
        };

        users.insert(principal, user_profile.clone());
        Ok(user_profile)
    })
}

#[query]
pub fn get_user(user_principal: Principal) -> Option<UserProfile> {
    USERS.with(|users| {
        users.borrow().get(&user_principal).cloned()
    })
}

#[query]
pub fn get_current_user() -> Option<UserProfile> {
    let principal = caller();
    get_user(principal)
}

#[update]
pub fn update_profile(name: String, bio: String, profile_image: String, cover_image: String) -> Result<UserProfile, String> {
    let principal = caller();

    USERS.with(|users| {
        let mut users = users.borrow_mut();

        match users.get_mut(&principal) {
            Some(user) => {
                user.name = name;
                user.bio = bio;
                user.profile_image = profile_image;
                user.cover_image = cover_image;
                Ok(user.clone())
            }
            None => Err("User not found".to_string()),
        }
    })
}

// Post Management Functions
#[update]
pub fn create_post(content: String, image: Option<String>, video: Option<String>) -> Result<Post, String> {
    let principal = caller();
    
    if content.trim().is_empty() && image.is_none() && video.is_none() {
        return Err("Post must have content, image, or video".to_string());
    }

    // Check if user exists
    USERS.with(|users| {
        if !users.borrow().contains_key(&principal) {
            return Err("User not registered".to_string());
        }
        Ok(())
    })?;

    let post_id = get_next_post_id();
    let post = Post {
        post_id,
        author: principal,
        content,
        image,
        video,
        created_at: time(),
        likes: Vec::new(),
        comments: Vec::new(),
        reposted_by: None,
        original_post_id: None,
    };

    POSTS.with(|posts| {
        posts.borrow_mut().insert(post_id, post.clone());
    });

    Ok(post)
}

#[query]
pub fn get_all_posts() -> Vec<Post> {
    POSTS.with(|posts| {
        let mut all_posts: Vec<Post> = posts.borrow().values().cloned().collect();
        // Sort by creation time (newest first)
        all_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        all_posts
    })
}

#[query]
pub fn get_user_posts(user_principal: Principal) -> Vec<Post> {
    POSTS.with(|posts| {
        let mut user_posts: Vec<Post> = posts
            .borrow()
            .values()
            .filter(|post| post.author == user_principal)
            .cloned()
            .collect();
        user_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        user_posts
    })
}

#[update]
pub fn like_post(post_id: u64) -> Result<Post, String> {
    let principal = caller();
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get_mut(&post_id) {
            Some(post) => {
                if post.likes.contains(&principal) {
                    post.likes.retain(|p| *p != principal);
                } else {
                    post.likes.push(principal);
                    
                    // Send notification to post author if not self-like
                    if post.author != principal {
                        let _ = add_notification_internal(
                            principal,
                            post.author,
                            NotificationType::Like,
                            "liked your post".to_string(),
                        );
                    }
                }
                Ok(post.clone())
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[update]
pub fn comment_post(post_id: u64, content: String) -> Result<Comment, String> {
    let principal = caller();
    
    if content.trim().is_empty() {
        return Err("Comment cannot be empty".to_string());
    }

    let comment_id = get_next_comment_id();
    let comment = Comment {
        comment_id,
        author: principal,
        content,
        created_at: time(),
    };

    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get_mut(&post_id) {
            Some(post) => {
                post.comments.push(comment.clone());
                
                // Send notification to post author if not self-comment
                if post.author != principal {
                    let _ = add_notification_internal(
                        principal,
                        post.author,
                        NotificationType::Comment,
                        "commented on your post".to_string(),
                    );
                }
                
                Ok(comment)
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[update]
pub fn repost_post(post_id: u64) -> Result<Post, String> {
    let principal = caller();
    
    // Get original post
    let original_post = POSTS.with(|posts| {
        posts.borrow().get(&post_id).cloned()
    }).ok_or("Original post not found")?;

    // Check if user already reposted this post
    let existing_repost = POSTS.with(|posts| {
        posts.borrow().values().any(|post| {
            post.author == principal && 
            post.original_post_id == Some(post_id)
        })
    });

    if existing_repost {
        return Err("Post already reposted".to_string());
    }

    let new_post_id = get_next_post_id();
    let repost = Post {
        post_id: new_post_id,
        author: principal,
        content: original_post.content.clone(),
        image: original_post.image.clone(),
        video: original_post.video.clone(),
        created_at: time(),
        likes: Vec::new(),
        comments: Vec::new(),
        reposted_by: Some(principal),
        original_post_id: Some(post_id),
    };

    POSTS.with(|posts| {
        posts.borrow_mut().insert(new_post_id, repost.clone());
    });

    // Send notification to original post author
    if original_post.author != principal {
        let _ = add_notification_internal(
            principal,
            original_post.author,
            NotificationType::Repost,
            "reposted your post".to_string(),
        );
    }

    Ok(repost)
}

// Follow System Functions
#[update]
pub fn follow_user(target_principal: Principal) -> Result<String, String> {
    let principal = caller();
    
    if principal == target_principal {
        return Err("Cannot follow yourself".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        // Check if target user exists
        if !users.contains_key(&target_principal) {
            return Err("Target user not found".to_string());
        }

        // Check if current user exists
        if !users.contains_key(&principal) {
            return Err("Current user not registered".to_string());
        }

        // Add to following list of current user
        if let Some(current_user) = users.get_mut(&principal) {
            if !current_user.following.contains(&target_principal) {
                current_user.following.push(target_principal);
            }
        }

        // Add to followers list of target user
        if let Some(target_user) = users.get_mut(&target_principal) {
            if !target_user.followers.contains(&principal) {
                target_user.followers.push(principal);
                
                // Send notification
                let _ = add_notification_internal(
                    principal,
                    target_principal,
                    NotificationType::Follow,
                    "started following you".to_string(),
                );
            }
        }

        Ok("Successfully followed user".to_string())
    })
}

#[update]
pub fn unfollow_user(target_principal: Principal) -> Result<String, String> {
    let principal = caller();
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        // Remove from following list of current user
        if let Some(current_user) = users.get_mut(&principal) {
            current_user.following.retain(|p| *p != target_principal);
        }

        // Remove from followers list of target user
        if let Some(target_user) = users.get_mut(&target_principal) {
            target_user.followers.retain(|p| *p != principal);
        }

        Ok("Successfully unfollowed user".to_string())
    })
}

#[query]
pub fn is_following(target_principal: Principal) -> bool {
    let principal = caller();
    
    USERS.with(|users| {
        users.borrow()
            .get(&principal)
            .map(|user| user.following.contains(&target_principal))
            .unwrap_or(false)
    })
}

#[query]
pub fn get_followers(user_principal: Principal) -> Vec<Principal> {
    USERS.with(|users| {
        users.borrow()
            .get(&user_principal)
            .map(|user| user.followers.clone())
            .unwrap_or_default()
    })
}

#[query]
pub fn get_following(user_principal: Principal) -> Vec<Principal> {
    USERS.with(|users| {
        users.borrow()
            .get(&user_principal)
            .map(|user| user.following.clone())
            .unwrap_or_default()
    })
}

// Notification Functions
fn add_notification_internal(
    sender: Principal,
    receiver: Principal,
    notification_type: NotificationType,
    message: String,
) -> Result<Notification, String> {
    let notification_id = get_next_notification_id();
    let notification = Notification {
        notification_id,
        sender,
        receiver,
        notification_type,
        message,
        created_at: time(),
        read: false,
    };

    NOTIFICATIONS.with(|notifications| {
        notifications.borrow_mut().insert(notification_id, notification.clone());
    });

    Ok(notification)
}

#[query]
pub fn get_notifications() -> Vec<Notification> {
    let principal = caller();
    
    NOTIFICATIONS.with(|notifications| {
        let mut user_notifications: Vec<Notification> = notifications
            .borrow()
            .values()
            .filter(|notif| notif.receiver == principal)
            .cloned()
            .collect();
        user_notifications.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        user_notifications
    })
}

#[update]
pub fn mark_notification_read(notification_id: u64) -> Result<String, String> {
    let principal = caller();
    
    NOTIFICATIONS.with(|notifications| {
        let mut notifications = notifications.borrow_mut();
        
        match notifications.get_mut(&notification_id) {
            Some(notification) if notification.receiver == principal => {
                notification.read = true;
                Ok("Notification marked as read".to_string())
            }
            Some(_) => Err("Unauthorized".to_string()),
            None => Err("Notification not found".to_string()),
        }
    })
}

// Explore Functions
#[query]
pub fn get_all_users() -> Vec<UserProfile> {
    USERS.with(|users| {
        users.borrow().values().cloned().collect()
    })
}

#[query]
pub fn search_users(query: String) -> Vec<UserProfile> {
    let query_lower = query.to_lowercase();
    
    USERS.with(|users| {
        users.borrow()
            .values()
            .filter(|user| {
                user.name.to_lowercase().contains(&query_lower) ||
                user.bio.to_lowercase().contains(&query_lower)
            })
            .cloned()
            .collect()
    })
}

// Feed Functions
#[query]
pub fn get_feed() -> Vec<Post> {
    let principal = caller();
    
    // Get user's following list
    let following = USERS.with(|users| {
        users.borrow()
            .get(&principal)
            .map(|user| user.following.clone())
            .unwrap_or_default()
    });

    POSTS.with(|posts| {
        let mut feed_posts: Vec<Post> = posts
            .borrow()
            .values()
            .filter(|post| {
                // Include posts from users being followed or own posts
                following.contains(&post.author) || post.author == principal
            })
            .cloned()
            .collect();
        
        // If following list is empty or feed is small, include some random posts
        if feed_posts.len() < 10 {
            let all_posts: Vec<Post> = posts.borrow().values().cloned().collect();
            feed_posts.extend(all_posts.into_iter().take(20));
        }
        
        // Remove duplicates and sort by creation time
        feed_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        feed_posts.dedup_by(|a, b| a.post_id == b.post_id);
        
        feed_posts
    })
}

// use candid::export_service;

#[ic_cdk::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
