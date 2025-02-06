import { Component } from '@angular/core';
import { CsvCleanerService } from 'src/app/services/csv-cleaner.service';

@Component({
  selector: 'app-csv-cleaner',
  templateUrl: './csv-cleaner.component.html',
  styleUrls: ['./csv-cleaner.component.scss']
})
export class CsvCleanerComponent {
  rawCsv: string = '';
  cleanedCsv: string = '';
  fileSizeBefore: number = 0; // ✅ 原始 CSV 檔案大小 (Bytes)
  fileSizeAfter: number = 0; // ✅ 清洗後 CSV 檔案大小 (Bytes)
  cleaningTime: number = 0; // ✅ 清洗所需時間 (毫秒)

  constructor(private csvCleanerService: CsvCleanerService) {}

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileSizeBefore = file.size; // ✅ 取得原始 CSV 檔案大小 (Bytes)
      const reader = new FileReader();

      reader.onload = () => {
        this.rawCsv = reader.result as string;
      };

      reader.readAsText(file);
    }
  }

  processCsv() {
    if (!this.rawCsv) return;

    const startTime = performance.now(); // ✅ 記錄開始時間

    this.cleanedCsv = this.csvCleanerService.cleanData(this.rawCsv);

    const endTime = performance.now(); // ✅ 記錄結束時間
    this.cleaningTime = Math.round(endTime - startTime); // ✅ 計算清洗所需時間 (毫秒)
    this.fileSizeAfter = new Blob([this.cleanedCsv]).size; // ✅ 計算清洗後的檔案大小
  }

  downloadCsv() {
    if (!this.cleanedCsv) {
      alert("沒有清洗後的數據可下載");
      return;
    }

    const blob = new Blob([this.cleanedCsv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cleaned_data.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
