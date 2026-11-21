
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private readonly httpClient = inject(HttpClient);

  // Get the latest token for every request
  private getAuthOptions() {
    const token = localStorage.getItem('token');

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  // Get all posts
  getallposts(): Observable<any> {
    return this.httpClient.get(
      `${environment.baseurl}/posts`,
      this.getAuthOptions()
    );
  }

  // Get following feed
  getHomePosts(): Observable<any> {
    return this.httpClient.get(
      `${environment.baseurl}/posts/feed?only=following&limit=10`,
      this.getAuthOptions()
    );
  }

  // Create post with text and/or image
  createPost(body: FormData): Observable<any> {
    return this.httpClient.post(
      `${environment.baseurl}/posts`,
      body,
      this.getAuthOptions()
    );
  }

  // Get post comments
  getpostcomments(postId: string): Observable<any> {
    return this.httpClient.get(
      `${environment.baseurl}/posts/${postId}/comments`,
      this.getAuthOptions()
    );
  }

  // Delete post
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(
      `${environment.baseurl}/posts/${postId}`,
      this.getAuthOptions()
    );
  }

  // Get single post
  getsinglePost(postId: string): Observable<any> {
    return this.httpClient.get(
      `${environment.baseurl}/posts/${postId}`,
      this.getAuthOptions()
    );
  }
likePost(postId: string): Observable<void> {
  return this.httpClient.put<void>(
    `${environment.baseurl}/posts/${postId}/like`,
    {},
    this.getAuthOptions()
  );
}
// Create comment
createComment(postId: string, content: string): Observable<any> {
  return this.httpClient.post(
    `${environment.baseurl}/posts/${postId}/comments`,
    { content },
    this.getAuthOptions()
  );
}
// Update Post
updatePost(postId: string, body: FormData | object): Observable<any> {
  return this.httpClient.put(
    `${environment.baseurl}/posts/${postId}`,
    body,
    this.getAuthOptions()
  );
}updateComment(
  postId: string,
  commentId: string,
  content: string
): Observable<any> {
  return this.httpClient.put(
    `${environment.baseurl}/posts/${postId}/comments/${commentId}`,
    { content },
    this.getAuthOptions()
  );
}deleteComment(
  postId: string,
  commentId: string
): Observable<any> {
  return this.httpClient.delete(
    `${environment.baseurl}/posts/${postId}/comments/${commentId}`,
    this.getAuthOptions()
  );
}bookmarkPost(postId: string): Observable<any> {
  return this.httpClient.put(
    `${environment.baseurl}/posts/${postId}/bookmark`,
    {},
    this.getAuthOptions()
  );
}sharePost(postId: string, body: object = {}): Observable<any> {
  return this.httpClient.post(
    `${environment.baseurl}/posts/${postId}/share`,
    body,
    this.getAuthOptions()
  );
}
uploadProfilePhoto(photo: File): Observable<any> {
  const formData = new FormData();
  formData.append('photo', photo);

  return this.httpClient.put(
    `${environment.baseurl}/users/upload-photo`,
    formData,
    this.getAuthOptions()
  );
}

}
