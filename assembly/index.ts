export function allocate(size: i32): usize {
  return __new(size, idof<ArrayBuffer>());
}

export function cleanData(ptr: usize, len: i32): usize {
  let buffer = changetype<ArrayBuffer>(ptr);
  let csvStr = String.UTF8.decode(buffer, true);

  let rows: string[] = csvStr.split("\n");
  if (rows.length < 2) return ptr; // ✅ 確保 CSV 至少有標題行和數據行

  let headers: string[] = rows[0].split(",");
  let cleanedRows: string[] = [];
  cleanedRows.push(rows[0]); // ✅ 保留第一行標題

  let seenIds: Set<string> = new Set();

  // ✅ 建立清洗規則 (可擴充)
  let cleaningRules = new Map<string, (value: string) => string>();
  cleaningRules.set("email", validateEmail);
  cleaningRules.set("phone", formatPhone);
  cleaningRules.set("age", parseAge);
  cleaningRules.set("credit_card", maskSensitiveData);

  for (let i: i32 = 1; i < rows.length; i++) { // ✅ 跳過標題行
    let columns: string[] = rows[i].split(",");
    if (columns.length !== headers.length) continue; // ✅ 確保欄位數對齊標題

    let cleanedColumns: string[] = [];
    for (let j: i32 = 0; j < headers.length; j++) {
      let header = headers[j].trim();
      let value = columns[j].trim();

      // ✅ 如果該欄位有清洗規則，則逐個執行
      if (cleaningRules.has(header)) {
        let cleanFunc = cleaningRules.get(header);
        value = cleanFunc(value);
      }

      // ✅ 確保空值變成 "INVALID"
      if (value.length === 0) value = "INVALID";

      cleanedColumns.push(value);
    }

    let id = cleanedColumns[0];
    if (!seenIds.has(id)) {
      seenIds.add(id);
      cleanedRows.push(cleanedColumns.join(","));
    }
  }

  let cleanedCsv = cleanedRows.join("\n");
  let encoded = String.UTF8.encode(cleanedCsv);

  let resultPtr = allocate(encoded.byteLength);
  memory.copy(resultPtr, changetype<usize>(encoded), encoded.byteLength);

  return resultPtr;
}

// ✅ 格式化電話號碼為 `+1-XXX-XXX-XXXX` 或 `"INVALID"`
function formatPhone(phone: string): string {
  let digits = removeNonDigits(phone);
  if (digits.length === 0) return "INVALID";
  if (digits.length < 10) return "+1-000-000-0000";
  digits = digits.slice(-10);
  return "+1-" + digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
}

// ✅ 年齡轉換成數字，異常則標記為 INVALID
function parseAge(age: string): string {
  let ageNum = parseInt(age);
  return isNaN(ageNum) || ageNum < 0 || ageNum > 100 ? "INVALID" : ageNum.toString();
}

// ✅ Email 格式驗證，錯誤則標記為 "INVALID"
function validateEmail(email: string): string {
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
function maskSensitiveData(card: string): string {
  if (card.length < 16) return "INVALID";
  let cleanCard = removeNonDigits(card);
  return "****-****-****-" + cleanCard.slice(-4);
}

// ✅ 移除所有非數字字符
function removeNonDigits(input: string): string {
  let result = "";
  for (let i: i32 = 0; i < input.length; i++) {
    let char: string = input.charAt(i);
    if (char >= "0" && char <= "9") {
      result += char;
    }
  }
  return result;
}
