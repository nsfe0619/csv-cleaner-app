import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvCleanerService {
  cleanData(data: string): string {
    let jsonData = this.parseCsv(data); // ✅ 先解析 CSV 字串

    const cleanedData = jsonData
      .filter(row => Object.values(row).some(value => value !== '')) // 1. 清除空行
      .map(row => ({
        ...row,
        phone: this.formatPhone(row.phone), // 2. 格式標準化 (電話)
        date: this.formatDate(row.date), // 3. 格式標準化 (日期)
        name: row.name?.trim() || '', // 4. 去除空白
        age: this.parseAge(row.age), // 5. 數據轉換 (確保 `null` 可用)
        email: this.validateEmail(row.email) ? row.email : 'INVALID', // 6. 格式驗證
        credit_card: this.maskSensitiveData(row.credit_card), // 7. 敏感數據遮蔽
      }))
      .filter(row => row.age === null || (row.age > 0 && row.age < 100)) // 8. 過濾異常年齡
      .reduce((acc, row) => {
        if (!acc.some((item: { id: any }) => item.id === row.id)) acc.push(row); // 9. 去除重複數據
        return acc;
      }, []);

    return Papa.unparse(cleanedData); // ✅ JSON 轉 CSV 回傳
  }

  private parseCsv(csvString: string): any[] { // ✅ 解析 CSV 為 JSON 陣列
    return Papa.parse(csvString, { header: true, skipEmptyLines: true }).data;
  }

  private formatPhone(phone: string): string {
    return phone ? phone.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3') : '';
  }

  private formatDate(date: string | null): string {
    if (!date || typeof date !== 'string' || !date.trim()) return ''; // ✅ 確保 `null` 或 `undefined` 不報錯
    const parts = date.split('/');
    if (parts.length !== 3) return ''; // ✅ 確保格式正確
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private parseAge(age: any): number | null {
    const parsedAge = parseInt(age, 10);
    return isNaN(parsedAge) ? null : parsedAge;
  }

  private validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
  }

  private maskSensitiveData(data: string): string {
    return data ? data.replace(/\d{4}(?=\d{4})/g, '****') : '';
  }
}
