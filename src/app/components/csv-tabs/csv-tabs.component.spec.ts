import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvTabsComponent } from './csv-tabs.component';

describe('CsvTabsComponent', () => {
  let component: CsvTabsComponent;
  let fixture: ComponentFixture<CsvTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CsvTabsComponent]
    });
    fixture = TestBed.createComponent(CsvTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
