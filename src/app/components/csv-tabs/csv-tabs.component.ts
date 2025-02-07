import { Component } from '@angular/core';

@Component({
  selector: 'app-csv-tabs',
  templateUrl: './csv-tabs.component.html',
  styleUrls: ['./csv-tabs.component.scss']
})
export class CsvTabsComponent {
  activeTab: string = 'clean'; // 預設顯示 "清洗 CSV"

  switchTab(tab: string) {
    this.activeTab = tab;
  }
}
