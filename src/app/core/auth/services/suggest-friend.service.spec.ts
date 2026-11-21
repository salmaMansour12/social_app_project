import { TestBed } from '@angular/core/testing';
import { SuggestFriendService } from './suggest-friend.service';

describe('SuggestFriendService', () => {
  let service: SuggestFriendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestFriendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
