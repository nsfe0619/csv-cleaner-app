import { Component } from '@angular/core';
import { CsvCleanerService } from 'src/app/services/csv-cleaner.service';
import { WasmLoaderService } from 'src/app/services/wasm-loader.service';

@Component({
  selector: 'app-csv-cleaner',
  templateUrl: './csv-cleaner.component.html',
  styleUrls: ['./csv-cleaner.component.scss']
})
export class CsvCleanerComponent {
  rawCsv: string = '';
  cleanedCsvJs: string = '';
  cleanedCsvWasm: string = '';
  fileSizeBefore: number = 0;
  fileSizeAfterJs: number = 0;
  fileSizeAfterWasm: number = 0;
  cleaningTimeJs: number = 0;
  cleaningTimeWasm: number = 0;

  constructor(
    private csvCleanerService: CsvCleanerService,
    private wasmLoader: WasmLoaderService
  ) {}

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileSizeBefore = file.size;
      const reader = new FileReader();

      reader.onload = () => {
        this.rawCsv = reader.result as string;
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
  }

  async processCsvWasm() {
    if (!this.rawCsv) return;

    try {
      const startTime = performance.now();
      this.cleanedCsvWasm = await this.wasmLoader.cleanCsv(this.rawCsv);
      const endTime = performance.now();

      this.cleaningTimeWasm = Math.round(endTime - startTime);
      this.fileSizeAfterWasm = new Blob([this.cleanedCsvWasm]).size;
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
}
