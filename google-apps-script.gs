/**
 * =========================================================================
 *  NHẬN XÁC NHẬN THAM DỰ (RSVP) — Thiệp cưới Mạnh Dưỡng & Quỳnh Như
 * =========================================================================
 *
 *  ĐÂY LÀ CODE CHẠY TRÊN GOOGLE, KHÔNG PHẢI CODE CỦA TRANG THIỆP.
 *  Bạn chỉ cần copy toàn bộ file này dán vào Google Apps Script.
 *  Các bước chi tiết nằm trong HUONG-DAN-RSVP.md
 *
 *  Sau khi cài xong, mỗi lần khách bấm "Gửi Xác Nhận" sẽ có thêm một dòng
 *  trong Google Trang tính của bạn.
 * =========================================================================
 */

// Tên tab (sheet) sẽ chứa dữ liệu. Không cần tạo trước — script tự tạo.
var SHEET_NAME = 'RSVP';

// Số lời chúc mới nhất hiển thị trên thiệp.
var MAX_WISHES = 100;

// Lưu đệm kết quả để nhiều khách vào cùng lúc không phải đọc Sheet mỗi lần
// (đọc Sheet chậm, và Google có giới hạn số lần gọi mỗi ngày).
var CACHE_KEY = 'wishes_v1';
var CACHE_SECONDS = 30;

var HEADERS = [
  'Thời gian',
  'Họ và tên',
  'Khách của',
  'Xác nhận',
  'Số người (chữ)',
  'Số người (số)',
  'Lời chúc'
];

/**
 * Khách bấm "Gửi Xác Nhận" -> hàm này chạy.
 */
function doPost(e) {
  // Khoá lại để hai khách bấm gửi cùng lúc không ghi đè lên nhau.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'Máy chủ đang bận, vui lòng thử lại' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'Không nhận được dữ liệu' });
    }

    var d = JSON.parse(e.postData.contents);

    var name = String(d.name || '').trim();
    if (!name) {
      return jsonOut_({ ok: false, error: 'Thiếu họ và tên' });
    }

    // Chặn dữ liệu rác: giới hạn độ dài từng trường.
    name = name.substring(0, 100);
    var message = String(d.message || '').trim().substring(0, 1000);
    var side = String(d.side || '').substring(0, 50);
    var attendance = String(d.attendance || '').substring(0, 50);
    var countLabel = String(d.countLabel || '').substring(0, 50);

    // '4+' -> 4, để cột này cộng tổng được bằng hàm SUM.
    var countNum = parseInt(String(d.countValue || '').replace(/[^0-9]/g, ''), 10);
    if (isNaN(countNum) || countNum < 1) countNum = 1;

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      name,
      side,
      attendance,
      countLabel,
      countNum,
      message
    ]);

    // Bỏ bộ đệm cũ, nếu không lời chúc vừa gửi sẽ không xuất hiện trong 30 giây.
    CacheService.getScriptCache().remove(CACHE_KEY);

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Thiệp gọi hàm này để LẤY danh sách lời chúc về hiển thị.
 * Mở đường dẫn /exec bằng trình duyệt cũng chạy hàm này -> dùng để kiểm tra.
 *
 * CHỈ trả về: tên, khách của, xác nhận, lời chúc, ngày.
 * KHÔNG trả về số người đi cùng — thông tin đó chỉ bạn xem trong Sheet.
 */
function doGet() {
  try {
    var cache = CacheService.getScriptCache();
    var cached = cache.get(CACHE_KEY);
    if (cached) return ContentService.createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);

    var sheet = getSheet_();
    var last = sheet.getLastRow();
    var wishes = [];

    if (last >= 2) {
      // Chỉ lấy MAX_WISHES dòng cuối để phản hồi không bị phình to.
      var start = Math.max(2, last - MAX_WISHES + 1);
      var rows = sheet.getRange(start, 1, last - start + 1, 7).getValues();

      // Duyệt ngược để lời chúc mới nhất nằm trên cùng.
      for (var i = rows.length - 1; i >= 0; i--) {
        var name = String(rows[i][1] || '').trim();
        if (!name) continue;
        wishes.push({
          name: name,
          side: String(rows[i][2] || '').trim(),
          attendance: String(rows[i][3] || '').trim(),
          message: String(rows[i][6] || '').trim(),
          date: formatDate_(rows[i][0])
        });
      }
    }

    var payload = JSON.stringify({ ok: true, total: wishes.length, wishes: wishes });

    // CacheService giới hạn 100KB mỗi mục — vượt thì thôi không lưu đệm.
    if (payload.length < 90000) cache.put(CACHE_KEY, payload, CACHE_SECONDS);

    return ContentService.createTextOutput(payload)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function formatDate_(v) {
  if (!(v instanceof Date) || isNaN(v.getTime())) return '';
  return Utilities.formatDate(v, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
}

/**
 * Lấy tab RSVP, tự tạo kèm dòng tiêu đề nếu chưa có.
 */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#511419')
      .setFontColor('#f5efe6');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150); // Thời gian
    sheet.setColumnWidth(2, 180); // Họ và tên
    sheet.setColumnWidth(7, 400); // Lời chúc
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }

  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
