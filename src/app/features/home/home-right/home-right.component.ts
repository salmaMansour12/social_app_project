
import { Component, OnInit, inject, signal } from '@angular/core';
import { SuggestFriendService } from '../../../core/auth/services/suggest-friend.service';

interface Friend {
  _id: string;
  name: string;
  photo?: string;
  isFollowing?: boolean;
  following?: boolean;
}

@Component({
  selector: 'app-home-right',
  standalone: true,
  imports: [],
  templateUrl: './home-right.component.html',
  styleUrl: './home-right.component.css',
})
export class HomeRightComponent implements OnInit {

  private suggestFriendService = inject(SuggestFriendService);

  // =========================
  // Suggestions
  // =========================

  suggestions = signal<Friend[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // =========================
  // Friends
  // =========================

  friends = signal<Friend[]>([]);
  showAllFriends = false;

  openFriends(): void {
    if (this.friends().length > 0) {
      this.showAllFriends = true;
    }
  }

  closeFriends(): void {
    this.showAllFriends = false;
  }

  // =========================
  // Follow / Unfollow
  // =========================

  followingUsers = signal<string[]>([]);
  followLoading = signal<string[]>([]);

  // =========================
  // Toast
  // =========================

  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  private toastTimeout: ReturnType<typeof setTimeout> | undefined;

  showToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage.set(message);
    this.toastType.set(type);

    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }

  closeToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage.set('');
  }

  // =========================
  // Initialization
  // =========================

  ngOnInit(): void {
    this.getSuggestions();
  }

  // =========================
  // Get Suggestions
  // =========================

  getSuggestions(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.suggestFriendService.getSuggestions().subscribe({

      next: (response: any) => {

        console.log('Suggestions Response:', response);

        const users: Friend[] = response?.data?.suggestions ?? [];

        this.suggestions.set(users);

        this.followingUsers.set(
          users
            .filter(user =>
              user.isFollowing === true || user.following === true
            )
            .map(user => user._id)
        );

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error('Suggestions Error:', error);

        this.errorMessage.set(
          error.error?.message || 'Could not load suggestions'
        );

        this.isLoading.set(false);
      }

    });
  }

  // =========================
  // Toggle Follow / Unfollow
  // =========================

  toggleFollow(userId: string): void {

    if (!userId || this.followLoading().includes(userId)) {
      return;
    }

    const isFollowing = this.followingUsers().includes(userId);

    this.followLoading.update(ids => [...ids, userId]);

    this.suggestFriendService.followUser(userId).subscribe({

      next: () => {

        this.followingUsers.update(ids => {

          return isFollowing
            ? ids.filter(id => id !== userId)
            : [...ids, userId];

        });

        this.showToast(
          isFollowing
            ? 'Unfollowed successfully'
            : 'Following successfully',
          'success'
        );

        this.followLoading.update(ids =>
          ids.filter(id => id !== userId)
        );

      },

      error: (error) => {

        console.error('Follow Error:', error);

        this.showToast(
          error.error?.message || 'Something went wrong. Try again!',
          'error'
        );

        this.followLoading.update(ids =>
          ids.filter(id => id !== userId)
        );

      }

    });

  }

  // =========================
  // Helpers
  // =========================

  isFollowing(userId: string): boolean {
    return this.followingUsers().includes(userId);
  }

  isFollowLoading(userId: string): boolean {
    return this.followLoading().includes(userId);
  }

}
