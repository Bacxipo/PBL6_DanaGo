export function mapFeedPost(post) {
  return {
    ...post,
    user: {
      ...post.user,
      name: post.user.fullName || post.user.username,
      avatar: post.user.avatarUrl,
    },
    images: post.images.map((image) => image.imageUrl),
    likes: post._count.likes,
    commentsCount: post._count.comments,
    location: post.destination?.name,
    date: new Date(post.createdAt).toLocaleDateString('vi-VN'),
  };
}

export function updatePostInList(posts, updatedPost) {
  return posts.map((post) =>
    post.id === updatedPost.id
      ? {
        ...post,
        content: updatedPost.content,
        status: updatedPost.status,
        updatedAt: updatedPost.updatedAt,
      }
      : post
  );
}
