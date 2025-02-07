export function allocate(size: i32): usize {
  return __new(size, idof<ArrayBuffer>());
}

export function cleanData(ptr: usize, len: i32): usize {
  let buffer = changetype<ArrayBuffer>(ptr);
  let csvStr = String.UTF8.decode(buffer, true);

  let rows: string[] = csvStr.split("\n");
  if (rows.length < 2) return ptr; // ✅ 確保 CSV 至少有標題行和數據行

  let cleanedRows: string[] = [];
  cleanedRows.push(rows[0]); // ✅ 保留第一行標題

  let seenIds: Set<string> = new Set();

  for (let i: i32 = 1; i < rows.length; i++) { // ✅ 跳過第一行標題
    let columns: string[] = rows[i].split(",");

    if (columns.length < 7) continue; // ✅ 確保至少有 7 個欄位 (包含信用卡)

    let id = columns[0].trim();
    let name = columns[1].trim();
    let age = columns[2].trim();
    let phone = formatPhone(columns[3]);
    let date = formatDate(columns[4]);
    let email = columns[5].trim();
    let creditCard = maskSensitiveData(columns[6].trim()); // ✅ 保留信用卡資料

    // ✅ 年齡處理：空白 或 非數字 或 超過 100 歲，標記為 "INVALID"
    let isAgeInvalid: bool = age.length === 0;
    let ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 100) {
      isAgeInvalid = true;
      age = "INVALID";
    }

    // ✅ Email 格式檢查，保持 `INVALID` 的 Email
    if (!validateEmail(email)) {
      email = "INVALID"; // ✅ 讓 Email 變成 INVALID，但不刪除
    }

    // ✅ 避免重複 ID
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    cleanedRows.push(id + "," + name + "," + age + "," + phone + "," + date + "," + email + "," + creditCard);
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
  if (digits.length === 0 ||digits.length < 10) return "INVALID"; // ✅ 如果沒有數字，設為 INVALID
  digits = digits.slice(-10); // ✅ 取最後 10 碼
  return "+1-" + digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
}

// ✅ 格式化日期為 `YYYY-MM-DD`
function formatDate(date: string): string {
  let parts = date.split("/");
  if (parts.length !== 3) return "INVALID"; // ✅ 預設無效日期
  return parts[2] + "-" + parts[0].padStart(2, "0") + "-" + parts[1].padStart(2, "0");
}

// ✅ Email 驗證 (簡單判斷 `@` 和 `.` 必須存在)
// ✅ Email 驗證 (確保 `username@domain.tld` 格式正確)
function validateEmail(email: string): boolean {
  let atIndex = email.indexOf("@");
  let dotIndex = email.lastIndexOf(".");

  // ✅ 必須包含 `@` 和 `.`，且 `@` 不能是第一個字元
  if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
    return false;
  }

  // ✅ `@` 只能出現一次
  if (email.indexOf("@", atIndex + 1) !== -1) {
    return false;
  }

  // ✅ `..` 不能出現
  if (email.indexOf("..") !== -1) {
    return false;
  }

  return true;
}
function maskSensitiveData(card: string): string {
  if (card.length < 16) return "INVALID";
  let cleanCard = removeNonDigits(card);
  return "****-****-****-" + cleanCard.slice(-4);
}

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
