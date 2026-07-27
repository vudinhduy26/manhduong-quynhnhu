# Hướng dẫn nhận xác nhận tham dự về Google Sheets

Làm một lần, khoảng **10 phút**. Sau khi xong, mỗi lần khách bấm "Gửi Xác Nhận"
sẽ có thêm một dòng trong Google Trang tính của bạn.

Không cần biết lập trình — chỉ copy và dán.

---

## Phần 1 — Tạo nơi lưu dữ liệu (khoảng 7 phút)

### Bước 1. Tạo Google Trang tính mới

Mở <https://sheets.new> (đăng nhập bằng Gmail của bạn).

Đặt tên file, ví dụ: **Danh sách khách cưới 18-10-2026**.

Không cần tạo cột hay tiêu đề gì cả — hệ thống sẽ tự tạo.

### Bước 2. Mở trình soạn thảo script

Trên thanh menu của Trang tính, chọn:

**Tiện ích mở rộng** → **Apps Script**
*(bản tiếng Anh: **Extensions** → **Apps Script**)*

Một tab mới sẽ mở ra, có sẵn vài dòng code mẫu như `function myFunction() {}`.

### Bước 3. Dán code vào

1. **Xoá sạch** toàn bộ nội dung đang có trong ô soạn thảo.
2. Mở file `google-apps-script.gs` (nằm cùng thư mục với thiệp), copy **toàn bộ**.
3. Dán vào ô soạn thảo.
4. Bấm biểu tượng **đĩa mềm 💾** để lưu (hoặc `Ctrl + S`).

### Bước 4. Xuất bản

1. Góc trên bên phải, bấm nút xanh **Triển khai** → **Tùy chọn triển khai mới**
   *(**Deploy** → **New deployment**)*
2. Bấm biểu tượng **bánh răng ⚙️** cạnh chữ "Chọn loại", chọn **Ứng dụng web**
   *(**Web app**)*
3. Điền đúng 2 ô này — **quan trọng nhất**:

   | Ô | Chọn |
   |---|---|
   | Thực thi với tư cách *(Execute as)* | **Tôi** *(Me)* |
   | Người có quyền truy cập *(Who has access)* | **Bất kỳ ai** *(Anyone)* |

   > ⚠️ Phải là **"Bất kỳ ai"**, KHÔNG phải "Bất kỳ ai có Tài khoản Google".
   > Chọn sai thì khách sẽ bị bắt đăng nhập Gmail và gửi không được.

4. Bấm **Triển khai** *(Deploy)*.

### Bước 5. Cấp quyền

Google sẽ hỏi quyền truy cập. Đây là bước làm nhiều người bối rối vì màn hình
cảnh báo trông đáng sợ — nhưng nó chỉ đang hỏi bạn có cho phép **script của
chính bạn** ghi vào **trang tính của chính bạn** hay không.

1. Bấm **Ủy quyền truy cập** *(Authorize access)* → chọn tài khoản Gmail của bạn.
2. Hiện màn hình *"Google chưa xác minh ứng dụng này"* → bấm **Nâng cao**
   *(Advanced)* ở góc dưới bên trái.
3. Bấm dòng **Chuyển đến … (không an toàn)** *(Go to … (unsafe))*.
4. Bấm **Cho phép** *(Allow)*.

### Bước 6. Lấy đường dẫn

Sau khi triển khai xong, màn hình hiện một đường dẫn dạng:

```
https://script.google.com/macros/s/AKfycbz.....................tw/exec
```

**Copy đường dẫn này.** Nó phải kết thúc bằng **`/exec`**.

> Nếu đường dẫn kết thúc bằng `/dev` là bạn đang lấy nhầm bản thử nghiệm —
> bản đó chỉ mình bạn dùng được, khách sẽ không gửi được.

### Bước 7. Kiểm tra ngay

Dán đường dẫn vừa copy vào thanh địa chỉ trình duyệt rồi Enter.

Nếu thấy dòng chữ này thì **đã thành công**:

```json
{"ok":true,"message":"Máy chủ RSVP đang hoạt động. Đã nhận 0 xác nhận."}
```

Quay lại Google Trang tính, bạn sẽ thấy một tab mới tên **RSVP** với các cột
đã được tạo sẵn.

---

## Phần 2 — Nối vào thiệp (1 phút)

Mở file `app.js`, tìm **dòng 15** (ngay đầu file, ngay dưới khung chú thích):

```js
const RSVP_ENDPOINT = '';
```

Dán đường dẫn vào giữa hai dấu nháy:

```js
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz.....tw/exec';
```

Lưu file. **Xong.**

---

## Phần 3 — Kiểm tra thật

1. Mở thiệp, kéo xuống mục **Xác Nhận Tham Dự**.
2. Điền tên rồi bấm **Gửi Xác Nhận & Lời Chúc**.
3. Nút chuyển thành *"Đang gửi..."* rồi hiện thông báo
   *"Cảm ơn bạn đã gửi xác nhận & lời chúc!"*
4. Mở Google Trang tính → tab **RSVP** → phải thấy một dòng mới.

Nếu hiện *"Gửi không thành công"* → xem mục **Xử lý sự cố** bên dưới.

---

## Bảng dữ liệu bạn nhận được

| Thời gian | Họ và tên | Khách của | Xác nhận | Số người (chữ) | Số người (số) | Lời chúc |
|---|---|---|---|---|---|---|
| 18/09/2026 20:14:03 | Trần Hoàng Nam | Khách nhà trai | Sẽ tham dự | Đi 2 người | 2 | Chúc mừng hai bạn! |

**Mẹo đếm tổng số khách:** gõ vào một ô trống công thức `=SUM(F:F)` — cột
*Số người (số)* được thiết kế riêng để cộng được như vậy.

**Mẹo lọc:** bấm **Dữ liệu → Tạo bộ lọc**, rồi lọc cột *Xác nhận* để tách
riêng người đi và người không đi.

---

## Xử lý sự cố

**Hiện "Gửi không thành công"**

- Mở lại đường dẫn `/exec` bằng trình duyệt. Không thấy `{"ok":true...}` nghĩa là
  phần triển khai có vấn đề → làm lại Bước 4, chú ý ô **"Bất kỳ ai"**.
- Kiểm tra đường dẫn trong `app.js` có kết thúc bằng `/exec` không.
- Bấm `F12` → tab **Console** để xem thông báo lỗi cụ thể.

**Khách bị bắt đăng nhập Gmail**

Bạn đã chọn "Bất kỳ ai **có Tài khoản Google**". Vào **Triển khai → Quản lý
triển khai → biểu tượng bút chì ✏️** và đổi thành **"Bất kỳ ai"**.

**Sửa file `.gs` rồi mà không thấy thay đổi**

Apps Script không tự cập nhật. Mỗi lần sửa phải vào **Triển khai → Quản lý
triển khai → ✏️ → Phiên bản: Phiên bản mới → Triển khai**. Đường dẫn `/exec`
giữ nguyên, không cần sửa lại `app.js`.

**Không thấy tab RSVP trong Trang tính**

Tab chỉ được tạo khi có lượt gửi đầu tiên hoặc khi bạn mở `/exec` một lần.
Hãy thử Bước 7.

---

## Vài điều nên biết

- **Đường dẫn này lộ trong mã nguồn trang.** Ai xem mã nguồn đều thấy được và
  về lý thuyết có thể gửi dữ liệu rác. Với một thiệp cưới thì rủi ro rất thấp,
  và script đã giới hạn độ dài từng trường để hạn chế. Nếu bị spam, chỉ cần vào
  **Quản lý triển khai** bấm **Lưu trữ** *(Archive)* là chặn được ngay.
- **Lời chúc không hiển thị công khai.** Khách chỉ thấy lời chúc của chính mình
  cộng 2 lời chúc mẫu có sẵn trong `index.html`. Bạn xem tất cả trong Trang tính.
  Muốn lời chúc hiện cho mọi khách cùng đọc (như website mẫu) thì cần thêm bước
  đọc ngược dữ liệu về — nói tôi biết nếu bạn muốn làm.
- **Giới hạn của Google:** khoảng 20.000 lượt gửi mỗi ngày. Thừa sức cho đám cưới.
- **Dữ liệu là của bạn**, nằm trong Google Drive của bạn, không qua bên thứ ba nào.

---

## Khi đưa thiệp lên mạng

Thiệp được đăng bằng **GitHub Pages** tại:

```
https://vudinhduy26.github.io/manhduong-quynhnhu/
```

Google lo phần lưu trữ dữ liệu RSVP, GitHub chỉ phục vụ file tĩnh — hai bên
độc lập nhau nên không ảnh hưởng gì đến nhau.

**Nếu sau này đổi tên repo hoặc mua tên miền riêng**, phải sửa 2 dòng trong
`index.html` (khoảng dòng 15-16), nếu không ảnh sẽ không hiện khi chia sẻ lên
Facebook/Zalo:

```html
<meta property="og:url"   content="https://dia-chi-moi/">
<meta property="og:image" content="https://dia-chi-moi/images/og-cover.jpg">
```

Facebook và Zalo bắt buộc dùng đường dẫn đầy đủ, không nhận đường dẫn tương đối.
