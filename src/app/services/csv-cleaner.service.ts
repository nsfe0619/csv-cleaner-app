import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvCleanerService {
  cleanData(data: string): string {
    let jsonData = this.parseCsv(data);
    if (jsonData.length === 0) return ""; // ✅ 空檔案處理

    // ✅ 取得 CSV 標題 (第一行)
    const headers = Object.keys(jsonData[0]);

    // ✅ 動態規則映射 (可擴充)
    const cleaningRules: { [key: string]: ((value: string) => string)[] } = {
      email: [this.ensureNotEmpty, this.validateEmail], // ✅ Email: 空白變 INVALID + 格式檢查
      phone: [this.ensureNotEmpty, this.formatPhone], // ✅ 電話: 空白變 INVALID + 格式標準化
      age: [this.ensureNotEmpty, this.parseAge], // ✅ 年齡: 空白變 INVALID + 數字轉換
      credit_card: [this.maskSensitiveData], // ✅ 信用卡: 遮蔽前 12 碼
    };

    // ✅ 清洗每筆數據
    const cleanedData = jsonData.map(row => {
      let cleanedRow: { [key: string]: string } = {};

      headers.forEach(header => {
        let value = row[header]?.trim() || "";

        // ✅ 如果該欄位有對應的清洗規則，則逐個執行
        if (cleaningRules[header]) {
          cleaningRules[header].forEach(rule => {
            value = rule(value);
          });
        }

        cleanedRow[header] = value;
      });

      return cleanedRow;
    });

    return Papa.unparse(cleanedData, {  delimiter: ",", newline: "\n" });
  }

  private parseCsv(csvString: string): any[] {
    return Papa.parse(csvString, { header: true, skipEmptyLines: true }).data;
  }

  // ✅ 如果為空，則變成 "INVALID"
  private ensureNotEmpty(value: string): string {
    return value.trim() === "" ? "INVALID" : value;
  }

  // ✅ 格式化電話號碼為 `+1-XXX-XXX-XXXX`
  private formatPhone(phone: string): string {
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return "INVALID"; // ✅ 空值變 "INVALID"
    if (digits.length < 10) return "+1-000-000-0000"; // ✅ 不足 10 碼填 0
    digits = digits.slice(-10);
    return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // ✅ 年齡轉換成數字，異常則標記為 INVALID
  private parseAge(age: string): string {
    let ageNum = parseInt(age, 10);
    return isNaN(ageNum) || ageNum < 0 || ageNum > 100 ? "INVALID" : ageNum.toString();
  }

  // ✅ Email 格式驗證，錯誤則標記為 "INVALID"
  private validateEmail(email: string): string {
    let atIndex = email.indexOf("@");
    let dotIndex = email.lastIndexOf(".");

    if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
      return "INVALID";
    }
    if (email.indexOf("@", atIndex + 1) !== -1) {
      return "INVALID";
    }
    if (email.indexOf("..") !== -1) {
      return "INVALID";
    }
    return email;
  }

  // ✅ 信用卡遮蔽 (前 12 碼變 `****`)
  private maskSensitiveData(data: string): string {
    return data.replace(/(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})/, '****-****-****-$4');
  }
}
