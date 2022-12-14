import { TestBed } from '@angular/core/testing';

import { UsersOnlineService } from './users-online.service';

describe('UsersOnlineService', () => {
  let service: UsersOnlineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersOnlineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
