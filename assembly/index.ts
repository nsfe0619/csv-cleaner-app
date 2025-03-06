export function allocate(size: i32): usize {
  return __new(size, idof<ArrayBuffer>());
}

export function cleanData(ptr: usize, len: i32): usize {
  let buffer = changetype<ArrayBuffer>(ptr);
  let csvStr = String.UTF8.decode(buffer, true);

  let rows: string[] = csvStr.split("\n");
  if (rows.length < 2) return ptr;

  let headers: string[] = rows[0].split(",");
  let cleanedRows: string[] = [];
  cleanedRows.push(rows[0]);

  let seenIds = new Map<string, bool>();

  for (let i: i32 = 1; i < rows.length; i++) {
    let columns = parseColumns(rows[i], headers.length);
    if (columns.length !== headers.length) continue;

    let id = columns[0];
    if (seenIds.has(id)) continue;
    seenIds.set(id, true);

    let cleanedColumns: string[] = [];
    for (let j: i32 = 0; j < headers.length; j++) {
      let header = headers[j].trim();
      let value = columns[j].trim();

      if (header == "email") {
        value = validateEmail(value);
      } else if (header == "phone") {
        value = formatPhone(value);
      } else if (header == "age") {
        value = parseAge(value);
      } else if (header == "credit_card") {
        value = maskSensitiveData(value);
      }

      if (value.length === 0) value = "INVALID";
      cleanedColumns.push(value);
    }

    cleanedRows.push(cleanedColumns.join(","));
  }

  let cleanedCsv = cleanedRows.join("\n");
  let encoded = String.UTF8.encode(cleanedCsv);

  return changetype<usize>(encoded);
}

function parseColumns(row: string, columnCount: i32): string[] {
  let columns: string[] = [];
  let start: i32 = 0;
  for (let i: i32 = 0; i < columnCount - 1; i++) {
    let end = row.indexOf(",", start);
    if (end === -1) end = row.length;
    columns.push(row.slice(start, end));
    start = end + 1;
  }
  columns.push(row.slice(start));
  return columns;
}


// ✅ 格式化電話號碼為 `+886-XXX-XXX-XXX` 或 `"INVALID"`
function formatPhone(phone: string): string {
  let digits = removeNonDigits(phone);
  if (digits.length === 0) return "INVALID";
  if (digits.length < 10) return "+886-000-000-000";
  digits = digits.slice(-10);
  return "+886-" + digits.slice(1, 4) + "-" + digits.slice(4, 7) + "-" + digits.slice(7);
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
