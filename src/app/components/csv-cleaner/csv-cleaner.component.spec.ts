import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvCleanerComponent } from './csv-cleaner.component';

describe('CsvCleanerComponent', () => {
  let component: CsvCleanerComponent;
  let fixture: ComponentFixture<CsvCleanerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CsvCleanerComponent]
    });
    fixture = TestBed.createComponent(CsvCleanerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
