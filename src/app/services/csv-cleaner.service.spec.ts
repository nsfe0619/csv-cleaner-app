import { TestBed } from '@angular/core/testing';

import { CsvCleanerService } from './csv-cleaner.service';

describe('CsvCleanerService', () => {
  let service: CsvCleanerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvCleanerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
