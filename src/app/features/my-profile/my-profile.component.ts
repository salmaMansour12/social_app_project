
import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PostsService } from '../../core/auth/services/posts.service';
import { Post, Comment } from '../../core/model/iposts.interface';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {

  private readonly postsService = inject(PostsService);

  // ================= PROFILE =================

  currentUser: any = null;
  currentUserId = '';

  selectedPhotoFile: File | null = null;
  selectedPhotoPreview: string | null = null;
  isUploadingPhoto = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  myPosts: WritableSignal<Post[]> = signal([]);
  isLoading = signal(false);
  errorMessage = '';

  activeTab = signal<'posts' | 'about' | 'photos'>('posts');

  // ================= CREATE POST =================

  newPostBody = '';
  newPostImage: File | null = null;
  newPostImagePreview: string | null = null;
  isCreatingPost = false;

  // ================= EDIT POST =================

  editingPostId: string | null = null;
  editingPostContent = '';
  isUpdatingPost = false;

  // ================= DELETE POST =================

  showDeleteConfirmation = false;
  deleteTarget: { postId: string } | null = null;
  isDeleting = false;

  // ================= LIKE =================

  likingPosts = signal<Record<string, boolean>>({});

  // ================= BOOKMARK =================

  bookmarkingPosts = signal<Record<string, boolean>>({});

  // ================= COMMENTS =================

  selectedPostId = signal<string | null>(null);

  commentsByPost: WritableSignal<Record<string, Comment[]>> = signal({});

  commentContent: Record<string, string> = {};

  loadingComments = signal<Record<string, boolean>>({});
  sendingComment = signal<Record<string, boolean>>({});
  // Share caption
sharingPostId: string | null = null;
shareCaption = '';
isSharing = false;

// Edit share caption
editingShareId: string | null = null;
editingShareCaption = '';
isUpdatingShare = false;

  // ================= EDIT COMMENT =================

  editingCommentId: string | null = null;
  editingCommentContent = '';

  // ================= DELETE COMMENT =================

  deletingCommentId: string | null = null;

  // ================= INIT =================

  ngOnInit(): void {
    this.getCurrentUser();
    this.getMyPosts();
  }
startShare(post: Post): void {
  this.sharingPostId = post._id;
  this.shareCaption = '';
}

cancelShare(): void {
  this.sharingPostId = null;
  this.shareCaption = '';
}

confirmShare(post: Post): void {
  if (this.isSharing) return;

  const formData = {
    body: this.shareCaption.trim()
  };

  this.isSharing = true;

  this.postsService.sharePost(post._id, formData).subscribe({
    next: () => {
      this.isSharing = false;
      this.cancelShare();
      this.showToast('Post shared successfully!', 'success');
      this.getMyPosts();
    },
    error: (error) => {
      console.error('Share Error:', error);
      this.isSharing = false;
      this.showToast('Could not share this post', 'error');
    }
  });
}

startEditShare(post: Post): void {
  this.editingShareId = post._id;
  this.editingShareCaption = post.body || '';
}

cancelEditShare(): void {
  this.editingShareId = null;
  this.editingShareCaption = '';
}

saveShareCaption(post: Post): void {
  if (this.isUpdatingShare) return;

  this.isUpdatingShare = true;

  this.postsService.updatePost(post._id, {
    body: this.editingShareCaption.trim()
  }).subscribe({
    next: () => {
      this.isUpdatingShare = false;
      this.cancelEditShare();
      this.showToast('Share caption updated!', 'success');
      this.getMyPosts();
    },
    error: (error) => {
      console.error('Update Share Caption Error:', error);
      this.isUpdatingShare = false;
      this.showToast('Could not update share caption', 'error');
    }
  });
}
  // ================= CURRENT USER =================

  getCurrentUser(): void {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

      this.currentUser =
        savedUser?.data?.user ??
        savedUser?.user ??
        savedUser?.data ??
        savedUser;

      this.currentUserId =
        this.currentUser?._id ??
        this.currentUser?.id ??
        '';

      const savedPhoto = localStorage.getItem('profilePhoto');

      if (savedPhoto && this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          photo: savedPhoto
        };
      }

    } catch (error) {
      console.error('Current User Error:', error);
      this.currentUser = null;
      this.currentUserId = '';
    }

    if (!this.currentUserId) {
      this.getUserIdFromToken();
    }
  }

  getUserIdFromToken(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      this.currentUserId =
        payload?.id ??
        payload?._id ??
        payload?.sub ??
        '';

    } catch (error) {
      console.error('Token Error:', error);
    }
  }

  // ================= TOAST =================

  showToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  // ================= CREATE POST =================

  onPostImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image', 'error');
      input.value = '';
      return;
    }

    this.removePostImage();

    this.newPostImage = file;
    this.newPostImagePreview = URL.createObjectURL(file);
  }

  removePostImage(): void {
    if (this.newPostImagePreview) {
      URL.revokeObjectURL(this.newPostImagePreview);
    }

    this.newPostImage = null;
    this.newPostImagePreview = null;
  }

  createProfilePost(): void {
    const body = this.newPostBody.trim();

    if (!body && !this.newPostImage) {
      this.showToast('Write something or select an image first', 'error');
      return;
    }

    if (this.isCreatingPost) return;

    const formData = new FormData();

    if (body) {
      formData.append('body', body);
    }

    if (this.newPostImage) {
      formData.append('image', this.newPostImage);
    }

    this.isCreatingPost = true;

    this.postsService.createPost(formData).subscribe({
      next: () => {
        this.isCreatingPost = false;
        this.newPostBody = '';
        this.removePostImage();

        this.showToast('Post created successfully!', 'success');
        this.getMyPosts();
      },

      error: (error) => {
        console.error('Create Post Error:', error);
        this.isCreatingPost = false;

        this.showToast(
          error.error?.message || 'Failed to create post',
          'error'
        );
      }
    });
  }

  // ================= GET MY POSTS =================

  getMyPosts(): void {
    this.isLoading.set(true);
    this.errorMessage = '';

    this.postsService.getallposts().subscribe({
      next: (response: any) => {
        const posts: Post[] = response?.data?.posts ?? [];

        const myPosts = posts.filter(post => this.isMyPost(post));

        myPosts.sort((a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );

        this.myPosts.set(myPosts);
        this.isLoading.set(false);

        console.log('MY PROFILE POSTS:', myPosts);
      },

      error: (error) => {
        console.error('Get My Posts Error:', error);
        this.errorMessage = 'Could not load your posts.';
        this.isLoading.set(false);
      }
    });
  }

  isMyPost(post: Post): boolean {
    const user: any = post.user;

    const ownerId =
      typeof user === 'string'
        ? user
        : user?._id ?? user?.id;

    return !!this.currentUserId &&
      String(ownerId) === String(this.currentUserId);
  }

  // ================= PROFILE PHOTO =================

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image', 'error');
      input.value = '';
      return;
    }

    this.selectedPhotoFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedPhotoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  cancelPhotoChange(): void {
    this.selectedPhotoFile = null;
    this.selectedPhotoPreview = null;
  }

  uploadProfilePhoto(): void {
    if (!this.selectedPhotoFile || this.isUploadingPhoto) return;

    this.isUploadingPhoto = true;

    this.postsService.uploadProfilePhoto(this.selectedPhotoFile).subscribe({
      next: (response: any) => {
        const uploadedPhoto =
          response?.data?.user?.photo ??
          response?.data?.photo ??
          response?.user?.photo ??
          this.selectedPhotoPreview;

        if (uploadedPhoto && this.currentUser) {
          this.currentUser = {
            ...this.currentUser,
            photo: uploadedPhoto
          };

          localStorage.setItem('profilePhoto', uploadedPhoto);
        }

        this.isUploadingPhoto = false;
        this.selectedPhotoFile = null;
        this.selectedPhotoPreview = null;

        this.showToast('Profile photo uploaded successfully!', 'success');
      },

      error: (error) => {
        console.error('Upload Profile Photo Error:', error);
        this.isUploadingPhoto = false;

        this.showToast(
          error.error?.message || 'Could not upload profile photo',
          'error'
        );
      }
    });
  }

  // ================= LIKE =================

  isLiked(post: Post): boolean {
    const likes: any[] = (post as any).likes ?? [];

    return likes.some((like: any) => {
      const likedUserId =
        typeof like === 'string'
          ? like
          : like?._id ?? like?.user?._id;

      return String(likedUserId) === String(this.currentUserId);
    });
  }

  toggleLike(post: Post): void {
    const postId = post._id;

    if (!postId || this.likingPosts()[postId]) return;

    this.likingPosts.update(state => ({
      ...state,
      [postId]: true
    }));

    this.postsService.likePost(postId).subscribe({
      next: (response: any) => {
        const returnedPost = response?.data?.post;

        this.myPosts.update(posts =>
          posts.map(item => {
            if (item._id !== postId) return item;

            if (returnedPost) return returnedPost;

            const currentLikes: any[] = (item as any).likes ?? [];
            const alreadyLiked = this.isLiked(item);

            const updatedLikes = alreadyLiked
              ? currentLikes.filter((like: any) => {
                  const id =
                    typeof like === 'string'
                      ? like
                      : like?._id ?? like?.user?._id;

                  return String(id) !== String(this.currentUserId);
                })
              : [...currentLikes, this.currentUserId];

            return {
              ...item,
              likes: updatedLikes,
              likesCount: updatedLikes.length
            } as Post;
          })
        );

        this.likingPosts.update(state => ({
          ...state,
          [postId]: false
        }));
      },

      error: (error) => {
        console.error('Like Error:', error);

        this.likingPosts.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Could not update like', 'error');
      }
    });
  }

  // ================= BOOKMARK =================

  toggleBookmark(post: Post): void {
    const postId = post._id;

    if (!postId || this.bookmarkingPosts()[postId]) return;

    this.bookmarkingPosts.update(state => ({
      ...state,
      [postId]: true
    }));

    this.postsService.bookmarkPost(postId).subscribe({
      next: (response: any) => {
        const returnedPost = response?.data?.post;

        this.myPosts.update(posts =>
          posts.map(item => {
            if (item._id !== postId) return item;

            if (returnedPost) return returnedPost;

            return {
              ...item,
              bookmarked: !item.bookmarked
            };
          })
        );

        this.bookmarkingPosts.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast(
          post.bookmarked
            ? 'Post removed from saved posts'
            : 'Post saved successfully!',
          'success'
        );
      },

      error: (error) => {
        console.error('Bookmark Error:', error);

        this.bookmarkingPosts.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Could not update bookmark', 'error');
      }
    });
  }

  // ================= COMMENTS =================

  openComments(postId: string): void {
    if (this.selectedPostId() === postId) {
      this.selectedPostId.set(null);
      return;
    }

    this.selectedPostId.set(postId);
    this.loadComments(postId);
  }

  loadComments(postId: string): void {
    this.loadingComments.update(state => ({
      ...state,
      [postId]: true
    }));

    this.postsService.getpostcomments(postId).subscribe({
      next: (response: any) => {
        const comments =
          response?.data?.comments ??
          response?.data?.commentsList ??
          response?.data ??
          [];

        this.commentsByPost.update(state => ({
          ...state,
          [postId]: Array.isArray(comments) ? comments : []
        }));

        this.loadingComments.update(state => ({
          ...state,
          [postId]: false
        }));
      },

      error: (error) => {
        console.error('Get Comments Error:', error);

        this.loadingComments.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Could not load comments', 'error');
      }
    });
  }

  addComment(postId: string): void {
    const content = this.commentContent[postId]?.trim();

    if (!content || this.sendingComment()[postId]) return;

    this.sendingComment.update(state => ({
      ...state,
      [postId]: true
    }));

    this.postsService.createComment(postId, content).subscribe({
      next: () => {
        this.commentContent[postId] = '';

        this.sendingComment.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Comment added successfully', 'success');
        this.loadComments(postId);
        this.refreshPostCommentsCount(postId);
      },

      error: (error) => {
        console.error('Add Comment Error:', error);

        this.sendingComment.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Could not add comment', 'error');
      }
    });
  }

  refreshPostCommentsCount(postId: string): void {
    this.postsService.getpostcomments(postId).subscribe({
      next: (response: any) => {
        const comments =
          response?.data?.comments ??
          response?.data?.commentsList ??
          response?.data ??
          [];

        if (!Array.isArray(comments)) return;

        this.myPosts.update(posts =>
          posts.map(post =>
            post._id === postId
              ? { ...post, commentsCount: comments.length }
              : post
          )
        );
      }
    });
  }

  isMyComment(comment: Comment): boolean {
    const creator: any = comment.commentCreator;

    const creatorId =
      typeof creator === 'string'
        ? creator
        : creator?._id ?? creator?.id;

    return !!this.currentUserId &&
      String(creatorId) === String(this.currentUserId);
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment._id;
    this.editingCommentContent = comment.content ?? '';
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  saveComment(postId: string, commentId: string): void {
    const content = this.editingCommentContent.trim();

    if (!content) {
      this.showToast('Comment cannot be empty', 'error');
      return;
    }

    this.postsService.updateComment(postId, commentId, content).subscribe({
      next: () => {
        this.cancelEditComment();
        this.showToast('Comment updated successfully', 'success');
        this.loadComments(postId);
      },

      error: (error) => {
        console.error('Update Comment Error:', error);
        this.showToast('Could not update comment', 'error');
      }
    });
  }

  deleteComment(postId: string, commentId: string): void {
    if (this.deletingCommentId) return;

    this.deletingCommentId = commentId;

    this.postsService.deleteComment(postId, commentId).subscribe({
      next: () => {
        this.deletingCommentId = null;
        this.showToast('Comment deleted successfully', 'success');
        this.loadComments(postId);
        this.refreshPostCommentsCount(postId);
      },

      error: (error) => {
        console.error('Delete Comment Error:', error);
        this.deletingCommentId = null;
        this.showToast('Could not delete comment', 'error');
      }
    });
  }

  // ================= EDIT POST =================

  startEditPost(post: Post): void {
    if (!this.isMyPost(post) || post.isShare) return;

    this.editingPostId = post._id;
    this.editingPostContent = post.body ?? '';
  }

  cancelEditPost(): void {
    this.editingPostId = null;
    this.editingPostContent = '';
  }

  savePost(post: Post): void {
    if (!this.isMyPost(post) || this.isUpdatingPost) return;

    const body = this.editingPostContent.trim();

    if (!body) {
      this.showToast('Post content cannot be empty', 'error');
      return;
    }

    this.isUpdatingPost = true;

    this.postsService.updatePost(post._id, { body }).subscribe({
      next: () => {
        this.isUpdatingPost = false;
        this.cancelEditPost();

        this.showToast('Post updated successfully', 'success');
        this.getMyPosts();
      },

      error: (error) => {
        console.error('Update Post Error:', error);
        this.isUpdatingPost = false;
        this.showToast(
          error.error?.message || 'Could not update post',
          'error'
        );
      }
    });
  }

  // ================= DELETE POST =================

  confirmDeletePost(post: Post): void {
    if (!this.isMyPost(post)) return;

    this.deleteTarget = { postId: post._id };
    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.deleteTarget = null;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget || this.isDeleting) return;

    const postId = this.deleteTarget.postId;

    this.isDeleting = true;

    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteConfirmation();

        this.myPosts.update(posts =>
          posts.filter(post => post._id !== postId)
        );

        if (this.selectedPostId() === postId) {
          this.selectedPostId.set(null);
        }

        this.showToast('Post deleted successfully', 'success');
      },

      error: (error) => {
        console.error('Delete Post Error:', error);

        this.isDeleting = false;
        this.showToast('Could not delete post', 'error');
      }
    });
  }

  // ================= TABS & COUNTS =================

  changeTab(tab: 'posts' | 'about' | 'photos'): void {
    this.activeTab.set(tab);
  }

  get postsCount(): number {
    return this.myPosts().filter(post => !post.isShare).length;
  }

  get sharedPostsCount(): number {
    return this.myPosts().filter(post => post.isShare).length;
  }

  get photosCount(): number {
    return this.myPosts().filter(
      post => !!post.image || !!post.sharedPost?.image
    ).length;
  }

  get profileName(): string {
    return this.currentUser?.name || 'My Profile';
  }

  get profilePhoto(): string {
    return this.currentUser?.photo ||
      'https://ui-avatars.com/api/?name=My+Profile&background=7c3aed&color=fff';
  }
}
