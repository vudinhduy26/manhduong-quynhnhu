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

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mở đường dẫn /exec bằng trình duyệt sẽ chạy hàm này.
 * Dùng để kiểm tra xem đã cài đặt đúng chưa.
 */
function doGet() {
  var sheet = getSheet_();
  var soDong = Math.max(0, sheet.getLastRow() - 1);
  return jsonOut_({
    ok: true,
    message: 'Máy chủ RSVP đang hoạt động. Đã nhận ' + soDong + ' xác nhận.'
  });
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
