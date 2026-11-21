
import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Post, Comment } from './../../../core/model/iposts.interface';
import { PostsService } from '../../../core/auth/services/posts.service';

@Component({
  selector: 'app-home-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-center.component.html',
  styleUrl: './home-center.component.css'
})
export class HomeCenterComponent implements OnInit {

  private readonly postsService = inject(PostsService);

  // ================= POSTS =================

  allposts: WritableSignal<Post[]> = signal([]);

  isPostsLoading = false;
  postsError = '';

  // ================= CURRENT USER =================

  currentUser: any = null;
  currentUserId = '';

  // ================= CREATE POST =================

  postContent = '';
  selectedFile: File | null = null;
  selectedImage: string | null = null;

  isLoading = false;

  // ================= EDIT POST =================

  editingPostId: string | null = null;
  editingPostContent = '';

  // ================= DELETE =================

  showDeleteConfirmation = false;

  deleteTarget: {
    type: 'post' | 'comment';
    postId: string;
    commentId?: string;
  } | null = null;

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

  // ================= EDIT COMMENT =================

  editingCommentId: string | null = null;
  editingCommentContent = '';

  // ================= SHARE =================

  selectedSharePost: Post | null = null;
  isSharingPosts = false;

  // ================= TOAST =================

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // ================= INIT =================

  ngOnInit(): void {
    this.getCurrentUser();
    this.getallPosts();
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

  } catch (error) {
    console.error('Current User Error:', error);

    this.currentUser = null;
    this.currentUserId = '';
  }
}
get currentUserPhoto(): string {
  return (
    localStorage.getItem('profilePhoto') ||
    this.currentUser?.photo ||
    'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff'
  );
}

get currentUserName(): string {
  return this.currentUser?.name || 'User';
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

  // ================= GET ALL POSTS =================

  getallPosts(): void {
    this.isPostsLoading = true;
    this.postsError = '';

    this.postsService.getallposts().subscribe({
      next: (response: any) => {
        const posts: Post[] = response?.data?.posts ?? [];

        this.allposts.set(Array.isArray(posts) ? posts : []);

        console.log('Total posts displayed:', this.allposts().length);
        console.log('FIRST POST:', this.allposts()[0]);

        this.isPostsLoading = false;
      },

      error: (error) => {
        console.error('Get Posts Error:', error);

        this.isPostsLoading = false;

        this.postsError = error.status === 401
          ? 'Your session has expired. Please login again.'
          : 'Could not load posts. Please try again.';
      }
    });
  }

  // ================= CREATE POST =================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select an image file', 'error');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.selectedImage = null;
  }

  createPost(): void {
    if (!this.postContent.trim() && !this.selectedFile) {
      this.showToast('Write something or choose an image', 'error');
      return;
    }

    const formData = new FormData();

    if (this.postContent.trim()) {
      formData.append('body', this.postContent.trim());
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isLoading = true;

    this.postsService.createPost(formData).subscribe({
      next: () => {
        this.postContent = '';
        this.removeImage();

        this.isLoading = false;

        this.showToast('Post created successfully', 'success');
        this.getallPosts();
      },

      error: (error) => {
        console.error('Create Post Error:', error);

        this.isLoading = false;
        this.showToast(
          error.error?.message || 'Could not create post',
          'error'
        );
      }
    });
  }

  // ================= POST OWNER =================

  isMyPost(post: Post): boolean {
    const postUser: any = (post as any).user;

    const ownerId =
      typeof postUser === 'string'
        ? postUser
        : postUser?._id ?? postUser?.id;

    return !!this.currentUserId && ownerId === this.currentUserId;
  }

  // ================= EDIT POST =================

  startEditPost(post: Post): void {
    this.editingPostId = post._id;
    this.editingPostContent = (post as any).body ?? '';
  }

  cancelEditPost(): void {
    this.editingPostId = null;
    this.editingPostContent = '';
  }

  savePost(post: Post): void {
    const body = this.editingPostContent.trim();

    if (!body) {
      this.showToast('Post content cannot be empty', 'error');
      return;
    }

    this.postsService.updatePost(post._id, { body }).subscribe({
      next: () => {
        this.cancelEditPost();

        this.showToast('Post updated successfully', 'success');
        this.getallPosts();
      },

      error: (error) => {
        console.error('Update Post Error:', error);
        this.showToast('Could not update post', 'error');
      }
    });
  }

  // ================= DELETE =================

  confirmDeletePost(postId: string): void {
    this.deleteTarget = {
      type: 'post',
      postId
    };

    this.showDeleteConfirmation = true;
  }

  confirmDeleteComment(postId: string, commentId: string): void {
    this.deleteTarget = {
      type: 'comment',
      postId,
      commentId
    };

    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.deleteTarget = null;
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget || this.isDeleting) return;

    const target = this.deleteTarget;

    this.isDeleting = true;

    const request = target.type === 'post'
      ? this.postsService.deletePost(target.postId)
      : this.postsService.deleteComment(
          target.postId,
          target.commentId!
        );

    request.subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteConfirmation();

        this.showToast('Deleted successfully', 'success');

        if (target.type === 'post') {
          this.allposts.update(posts =>
            posts.filter(post => post._id !== target.postId)
          );

        } else {
          this.loadComments(target.postId);
          this.getallPosts();
        }
      },

      error: (error) => {
        console.error('Delete Error:', error);

        this.isDeleting = false;
        this.showToast('Could not delete', 'error');
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

      return likedUserId === this.currentUserId;
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

        if (returnedPost) {
          this.allposts.update(posts =>
            posts.map(item =>
              item._id === postId ? returnedPost : item
            )
          );
        } else {
          this.allposts.update(posts =>
            posts.map(item => {
              if (item._id !== postId) return item;

              const currentLikes: any[] =
                (item as any).likes ?? [];

              const alreadyLiked = this.isLiked(item);

              const updatedLikes = alreadyLiked
                ? currentLikes.filter((like: any) => {
                    const id =
                      typeof like === 'string'
                        ? like
                        : like?._id ?? like?.user?._id;

                    return id !== this.currentUserId;
                  })
                : [...currentLikes, this.currentUserId];

              return {
                ...item,
                likes: updatedLikes,
                likesCount: updatedLikes.length
              } as Post;
            })
          );
        }

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

        this.allposts.update(posts =>
          posts.map(item => {
            if (item._id !== postId) return item;

            if (returnedPost) {
              return returnedPost;
            }

            return {
              ...item,
              bookmarked: !((item as any).bookmarked)
            } as Post;
          })
        );

        this.bookmarkingPosts.update(state => ({
          ...state,
          [postId]: false
        }));

  this.showToast('Post saved successfully!', 'success');
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
        this.getallPosts();
      },

      error: (error) => {
        console.error('Create Comment Error:', error);

        this.sendingComment.update(state => ({
          ...state,
          [postId]: false
        }));

        this.showToast('Could not add comment', 'error');
      }
    });
  }

  isMyComment(comment: Comment): boolean {
    const creator: any = (comment as any).commentCreator;

    const creatorId =
      typeof creator === 'string'
        ? creator
        : creator?._id ?? creator?.id;

    return !!this.currentUserId && creatorId === this.currentUserId;
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment._id;
    this.editingCommentContent = (comment as any).content ?? '';
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

    this.postsService.updateComment(
      postId,
      commentId,
      content
    ).subscribe({
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

  // ================= SHARE =================

  openShareModal(post: Post): void {
    this.selectedSharePost = post;
  }

  closeShareModal(): void {
    this.selectedSharePost = null;
  }

  sharePostNow(): void {
    if (!this.selectedSharePost || this.isSharingPosts) return;

    const postId = this.selectedSharePost._id;

    this.isSharingPosts = true;

    this.postsService.sharePost(postId).subscribe({
      next: () => {
        this.isSharingPosts = false;
        this.closeShareModal();

        this.showToast('Post shared successfully', 'success');
        this.getallPosts();
      },

      error: (error) => {
        console.error('Share Post Error:', error);

        this.isSharingPosts = false;
        this.showToast('Could not share post', 'error');
      }
    });
  }

  copyPostLink(post: Post): void {
    const link = `${window.location.origin}/post/${post._id}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => {
          this.showToast('Link copied successfully', 'success');
        })
        .catch(() => {
          this.showToast('Could not copy link', 'error');
        });
    } else {
      this.showToast(link, 'success');
    }
  }

  // ================= HELPERS =================

  formatPostDate(date: string | Date): string {
    if (!date) return '';

    const postDate = new Date(date);

    if (Number.isNaN(postDate.getTime())) return '';

    return postDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
