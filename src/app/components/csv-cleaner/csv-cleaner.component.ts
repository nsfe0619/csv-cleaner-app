import { Component } from '@angular/core';
import { CsvCleanerService } from 'src/app/services/csv-cleaner.service';
import { WasmLoaderService } from 'src/app/services/wasm-loader.service';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-csv-cleaner',
  templateUrl: './csv-cleaner.component.html',
  styleUrls: ['./csv-cleaner.component.scss']
})
export class CsvCleanerComponent {
  rawCsv: string = '';
  cleanedCsvJs: string = '';
  cleanedCsvWasm: string = '';

  rawCsvPreview: string = '';
  cleanedCsvJsPreview: string = '';
  cleanedCsvWasmPreview: string = '';

  fileSizeBefore: number = 0;
  fileSizeAfterJs: number = 0;
  fileSizeAfterWasm: number = 0;
  cleaningTimeJs: number = 0;
  cleaningTimeWasm: number = 0;

  formattedFileSizeBefore: string = '';
  formattedFileSizeAfterJs: string = '';
  formattedFileSizeAfterWasm: string = '';

  headers: string[] = [];
  cleaningRules: { [key: string]: string[] } = {};

  constructor(
    private csvCleanerService: CsvCleanerService,
    private wasmLoader: WasmLoaderService
  ) {}

  handleFileUpload(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.txt')) {
        alert("❌ 檔案格式錯誤！請上傳 CSV 或 TXT 檔案。");
        // ✅ 清空檔案選擇欄位
        inputElement.value = "";
        return;
      }
      this.fileSizeBefore = file.size;
      this.formattedFileSizeBefore = this.formatFileSize(this.fileSizeBefore);

      const reader = new FileReader();
      reader.onload = () => {
        this.rawCsv = reader.result as string;
        this.rawCsvPreview = this.getCsvPreview(this.rawCsv);
        this.extractHeaders(); // ✅ 解析欄位標題
      };
      reader.readAsText(file);
    }
  }

  processCsvJs() {
    if (!this.rawCsv) return;

    const startTime = performance.now();
    this.cleanedCsvJs = this.csvCleanerService.cleanData(this.rawCsv);
    const endTime = performance.now();

    this.cleaningTimeJs = Math.round(endTime - startTime);
    this.fileSizeAfterJs = new Blob([this.cleanedCsvJs]).size;
    this.formattedFileSizeAfterJs = this.formatFileSize(this.fileSizeAfterJs);
    this.cleanedCsvJsPreview = this.getCsvPreview(this.cleanedCsvJs);
  }

  async processCsvWasm() {
    if (!this.rawCsv) return;

    try {
      const startTime = performance.now();
      this.cleanedCsvWasm = await this.wasmLoader.cleanCsv(this.rawCsv);
      const endTime = performance.now();

      this.cleaningTimeWasm = Math.round(endTime - startTime);
      this.fileSizeAfterWasm = new Blob([this.cleanedCsvWasm]).size;
      this.formattedFileSizeAfterWasm = this.formatFileSize(this.fileSizeAfterWasm);
      this.cleanedCsvWasmPreview = this.getCsvPreview(this.cleanedCsvWasm); // ✅ 確保只取前 10 筆
    } catch (error) {
      console.error("WASM 清洗失敗:", error);
    }
  }

  downloadCsv(type: 'js' | 'wasm') {
    const csvData = type === 'js' ? this.cleanedCsvJs : this.cleanedCsvWasm;

    if (!csvData) {
      alert(`沒有清洗後的數據可下載 (${type === 'js' ? 'JavaScript' : 'WASM'})`);
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cleaned_data_${type}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  extractHeaders() {
    if (!this.rawCsv) return;

    const jsonData = this.csvCleanerService.parseCsv(this.rawCsv);
    if (jsonData.length > 0) {
      this.headers = Object.keys(jsonData[0]); // ✅ 取得 CSV 欄位標題
      this.setCleaningRules();
    }
  }

  setCleaningRules() {
    this.cleaningRules = {
      email: ['必填', '格式驗證'],
      phone: ['必填', '格式化電話'],
      age: ['必填', '數字轉換'],
      credit_card: ['遮蔽前12碼']
    };

    // ✅ 為沒有定義清洗規則的欄位填入「無規則」
    this.headers.forEach(header => {
      if (!this.cleaningRules[header]) {
        this.cleaningRules[header] = ['無規則'];
      }
    });
  }

  private getCsvPreview(csvData: string): string {
    if (!csvData) return '';

    const parsed = Papa.parse(csvData, { header: true,
      skipEmptyLines: true, // ✅ 忽略空行
      newline: "\n" // ✅ 确保按照 `\n` 换行
     }).data;
    const previewData = parsed.slice(0, 10); // ✅ 只取前 10 筆
    return Papa.unparse(previewData, { header: true });
  }

  private formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB (${size} bytes)`;
    } else if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} KB (${size} bytes)`;
    }
    return `${size} bytes`;
  }
}
