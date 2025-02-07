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
      .map(row => {
        let formattedAge = this.parseAge(row.age); // 5. 處理年齡
        return {
          ...row,
          phone: this.formatPhone(row.phone?.trim()) || 'INVALID', // 2. 格式標準化 (電話)
          date: this.formatDate(row.date)||'INVALID', // 3. 格式標準化 (日期)
          name: row.name?.trim() || '', // 4. 去除空白
          age: formattedAge !== null ? formattedAge : 'INVALID', // ✅ 如果年齡異常則標記 `INVALID`
          email: this.validateEmail(row.email?.trim()) ? row.email : 'INVALID', // 6. 格式驗證
          credit_card: this.maskSensitiveData(row.credit_card), // 7. 敏感數據遮蔽
        };
      })
      .reduce((acc, row) => {
        if (!acc.some((item: { id: any }) => item.id === row.id)) acc.push(row); // 8. 去除重複數據
        return acc;
      }, []);

    // return Papa.unparse(cleanedData, { quotes: true, quoteChar: '"', delimiter: "," });
    return Papa.unparse(cleanedData, { newline: "\n" });
    // return Papa.unparse(cleanedData); // ✅ JSON 轉 CSV 回傳
  }

  private parseCsv(csvString: string): any[] { // ✅ 解析 CSV 為 JSON 陣列
    return Papa.parse(csvString, { header: true, skipEmptyLines: true }).data;
  }

  private formatPhone(phone: string): string {
    let digits = phone ? phone.replace(/\D/g, '') : '';
    if (digits.length === 0) return 'INVALID'; // ✅ 如果電話為空則設為 "INVALID"
    if (digits.length < 10) return '+1-000-000-0000'; // ✅ 預設無效電話
    digits = digits.slice(-10); // 取最後 10 碼
    return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  private formatDate(date: string | null): string {
    if (!date || typeof date !== 'string' || !date.trim()) return ''; // ✅ 確保 `null` 或 `undefined` 不報錯
    const parts = date.split('/');
    if (parts.length !== 3) return ''; // ✅ 確保格式正確
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private parseAge(age: any): number | null {
    if (!age || age.toString().trim() === '') return null; // ✅ 空白年齡
    const parsedAge = parseInt(age, 10);
    return isNaN(parsedAge) || parsedAge < 0 || parsedAge > 100 ? null : parsedAge;
  }

  private validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
  }

  private maskSensitiveData(data: string): string {
    return data ? data.replace(/(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})/, '****-****-****-$4') : '';
  }
}
