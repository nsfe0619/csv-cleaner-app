import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvCreatorComponent } from './csv-creator.component';

describe('CsvCreatorComponent', () => {
  let component: CsvCreatorComponent;
  let fixture: ComponentFixture<CsvCreatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CsvCreatorComponent]
    });
    fixture = TestBed.createComponent(CsvCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
