import { Component } from '@angular/core';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-csv-creator',
  templateUrl: './csv-creator.component.html',
  styleUrls: ['./csv-creator.component.scss']
})
export class CsvCreatorComponent {
  recordCount: number = 10; // ✅ 預設產生 10 筆資料
  fileName: string = `測試資料${this.getCurrentDate()}`; // ✅ 預設檔名
  generationTime: number = 0; // ✅ 產生時間
  csvSize: number = 0; // ✅ 下載檔案大小
  formattedFileSize: string = ''; // ✅ 顯示的格式化檔案大小

  csvFields: { name: string; type: string }[] = [
    { name: 'ID', type: 'serial' },
    { name: 'Full Name', type: 'full_name' },
    { name: 'Birthday', type: 'birthday' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'mobile' },
    { name: 'Credit Card', type: 'credit_card' }
  ];

  availableTypes = [
    { label: '流水號', value: 'serial' },
    { label: '姓名 (姓+名)', value: 'full_name' },
    { label: '生日 (18~99 歲內隨機日期)', value: 'birthday' },
    { label: '信箱', value: 'email' },
    { label: '行動電話', value: 'mobile' },
    { label: '信用卡', value: 'credit_card' }
  ];

  csvData: any[] = [];
  csvPreview: string = '';
  lastNames: string[] = ['Patel', 'Reed', 'Davis', 'Evans', 'Cook', 'Peterson', 'Lee', 'Gonzalez', 'Hill', 'Rivera',
    'Walker', 'Mendoza', 'White', 'Rogers', 'Green', 'Stewart', 'Bailey', 'Ramirez', 'Bennett', 'King',
    'Kelly', 'Castillo', 'Sanchez', 'Morris', 'Chavez', 'Phillips', 'Thomas', 'Hall', 'Jimenez', 'Foster',
    'Reyes', 'Adams', 'Martin', 'Morgan', 'Robinson', 'Smith', 'Scott', 'James', 'Thompson', 'Ramos',
    'Mitchell', 'Edwards', 'Ward', 'Allen', 'Harris', 'Anderson', 'Brown', 'Carter', 'Alvarez', 'Gutierrez',
    'Nguyen', 'Campbell', 'Jones', 'Wood', 'Hernandez', 'Perez', 'Moore', 'Howard', 'Wright', 'Cooper',
    'Long', 'Cruz', 'Sanders', 'Roberts', 'Parker', 'Miller', 'Murphy', 'Jackson', 'Garcia', 'Brooks',
    'Rodriguez', 'Ruiz', 'Ortiz', 'Young', 'Torres', 'Wilson', 'Watson', 'Baker', 'Nelson', 'Williams',
    'Morales', 'Gray', 'Cox', 'Kim', 'Diaz', 'Lopez', 'Turner', 'Ross', 'Richardson', 'Taylor', 'Johnson',
    'Collins', 'Martinez', 'Price', 'Hughes', 'Gomez', 'Lewis', 'Flores', 'Myers', 'Clark'];
  firstNames: string[] = ['Brenda', 'Anthony', 'Larry', 'Christine', 'Ruth', 'Eric', 'Brian', 'Kathleen', 'Andrew', 'Dennis',
    'Donald', 'Amy', 'Barbara', 'Nancy', 'Christopher', 'Angela', 'Debra', 'Heather', 'John', 'Mark',
    'Stephen', 'Jacob', 'Ashley', 'Betty', 'Shirley', 'Jeffrey', 'Nicholas', 'Joseph', 'Anna', 'William',
    'Sarah', 'Sandra', 'Michael', 'Samuel', 'Jason', 'Dorothy', 'Rachel', 'Mary', 'George', 'Jessica',
    'Linda', 'Brandon', 'Scott', 'Melissa', 'Joshua', 'Karen', 'Emily', 'Edward', 'Matthew', 'Laura',
    'Catherine', 'Sharon', 'Kevin', 'Patrick', 'Jennifer', 'Rebecca', 'Richard', 'Paul', 'Benjamin',
    'Katherine', 'Frank', 'Susan', 'Gregory', 'Michelle', 'Kimberly', 'Ronald', 'Pamela', 'Ryan', 'Jack',
    'Robert', 'Lisa', 'Steven', 'David', 'Charles', 'Donna', 'Jerry', 'Nicole', 'Samantha', 'Margaret',
    'Helen', 'Daniel', 'Patricia', 'Timothy', 'Justin', 'Carolyn', 'Amanda', 'Deborah', 'Janet', 'Jonathan',
    'Alexander', 'Kenneth', 'Maria', 'James', 'Elizabeth', 'Cynthia', 'Thomas', 'Carol', 'Gary', 'Stephanie',
    'Raymond'
    ];

  addField() {
    this.csvFields.push({ name: '', type: 'serial' });
  }
  removeField(index: number) {
    this.csvFields.splice(index, 1);
  }
  generateCsvData() {
    const startTime = performance.now(); // ✅ 開始計時

    this.csvData = [];
    for (let i = 1; i <= this.recordCount; i++) {
      let row: any = {};
      let fullName = this.generateFullName();
      let birthday = this.randomBirthday();
      this.csvFields.forEach(field => {
        row[field.name] = this.generateRandomValue(field.type, i, fullName, birthday);
      });
      this.csvData.push(row);
    }

    const csvContent = Papa.unparse(this.csvData, { header: true });
    this.csvPreview = Papa.unparse(this.csvData.slice(0, 10), { header: true }); // ✅ 預覽前 10 筆
    this.csvSize = new Blob([csvContent]).size; // ✅ 計算 CSV 檔案大小
    this.formattedFileSize = this.formatFileSize(this.csvSize); // ✅ 格式化檔案大小

    const endTime = performance.now(); // ✅ 結束計時
    this.generationTime = Math.round(endTime - startTime); // ✅ 計算總耗時
  }

  private formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB (${size} bytes)`;
    } else if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} KB (${size} bytes)`;
    }
    return `${size} bytes`;
  }

  downloadGeneratedCsv() {
    const csvContent = Papa.unparse(this.csvData, { header: true });
    this.csvSize = new Blob([csvContent]).size;
    this.formattedFileSize = this.formatFileSize(this.csvSize); // ✅ 更新格式化檔案大小

    let downloadFileName = this.fileName.trim() || `測試資料${this.getCurrentDate()}`;
    this.downloadFile(csvContent, `${downloadFileName}.csv`);
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
  private generateFullName(): string {
    let lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    let firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    return `${firstName} ${lastName}`;
  }
  private generateRandomValue(type: string, index: number, fullName: string, birthday: string): string {
    switch (type) {
      case 'serial':
        return index.toString();
      case 'full_name':
        return fullName;
      case 'birthday':
        return birthday;
      case 'email':
        return this.generateEmail(fullName, birthday);
      case 'mobile':
        return `09${this.randomDigits(8)}`;
      case 'credit_card':
        return this.randomCreditCard();
      default:
        return '';
    }
  }
  private generateEmail(fullName: string, birthday: string): string {
    let birthMonth = birthday.split('-')[1];
    let birthDay = birthday.split('-')[2];
    return `${fullName.toLowerCase().replace(/\s/g, '')}${birthMonth}${birthDay}@example.com`;
  }

  private randomDigits(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  private randomCreditCard(): string {
    return `${this.randomDigits(4)}-${this.randomDigits(4)}-${this.randomDigits(4)}-${this.randomDigits(4)}`;
  }
  private randomBirthday(): string {
    const today = new Date();
    const minYear = today.getFullYear() - 99;
    const maxYear = today.getFullYear() - 18;

    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
