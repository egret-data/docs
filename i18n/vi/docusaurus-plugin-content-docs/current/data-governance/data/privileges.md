---
sidebar_position: 4
---

# Đặc quyền và chủ sở hữu

Một [grant](./grants.md) cấp một **đặc quyền** (privilege) trên một đối tượng. Bộ từ vựng đặc quyền gồm năm từ: **BROWSE**, **READ**, **WRITE**, **CREATE** và **MANAGE**. Mỗi đối tượng còn có đúng một **OWNER** (chủ sở hữu). Trang này giải thích ý nghĩa từng đặc quyền, cách chúng kết hợp và lan xuống cây catalog, và điểm thực thi (enforcement point) nào thực thi đặc quyền nào.

## Năm đặc quyền

| Đặc quyền | Cho phép người nắm giữ |
|---|---|
| **BROWSE** | Thấy đối tượng tồn tại: tên và metadata của nó. Không mở được dữ liệu. |
| **READ** | Đọc dữ liệu, ví dụ `SELECT` trên một bảng. |
| **WRITE** | Ghi dữ liệu: insert, update và delete dòng. |
| **CREATE** | Tạo đối tượng con bên dưới, ví dụ tạo bảng trong một schema (DDL create). |
| **MANAGE** | Quản lý chính đối tượng: drop và alter nó, cấp và thu hồi quyền trên nó. Đây là quyền kiểu DDL và quyền sở hữu. |

Trước phiên bản này một grant chỉ có thể nêu read và write; hai quyền đó giữ nguyên ý nghĩa. **BROWSE**, **CREATE** và **MANAGE** là mới và chỉ có hiệu lực ở nơi có người cấp chúng.

## Các đặc quyền kết hợp như thế nào

Ba quy tắc quyết định một người làm được gì trên một đối tượng.

- **Thấy được những gì dùng được.** Nắm **READ**, **WRITE**, **CREATE** hoặc **MANAGE** trên một đối tượng ngầm kéo theo **BROWSE** trên đối tượng đó và trên mọi đối tượng cha (schema và catalog của nó). Bạn không cần cấp **BROWSE** riêng cho những đối tượng đã dùng được.
- **Grant kế thừa xuống cây.** Grant trên catalog lan tới schema, bảng và cột của nó. Grant trên schema lan tới các bảng của schema đó, và tiếp tục như vậy.
- **Deny thắng.** Một grant **Deny** trên đối tượng hoặc trên bất kỳ đối tượng cha nào thắng mọi allow trên đường đi. Không có độ ưu tiên giữa các grant và không có việc loại trừ một allow bằng allow khác; cách duy nhất để vượt qua một deny là gỡ nó.

```text
demo_warehouse                      allow READ   -> user alice
  analytics                         deny  READ   -> user alice
    sessions                        (alice không đọc được: deny trên đường đi thắng)
  sales
    orders                          (alice đọc được: chỉ có allow ở catalog lan tới)
```

## OWNER

Mỗi đối tượng có thể bảo mật (catalog, schema, bảng, view) có đúng một **OWNER**. Mặc định đó là principal đã tạo ra đối tượng. Owner nắm mọi đặc quyền trên đối tượng và trên mọi thứ bên dưới nó, và quyền sở hữu có thể chuyển cho principal khác.

:::note
Phiên bản này đưa owner vào mô hình phân quyền. Màn hình và API để đặt hoặc chuyển owner sẽ có ở một gói sau, nên hiện chưa có gì để cấu hình.
:::

## Điểm thực thi nào thực thi đặc quyền nào

Điểm thực thi là phần của data plane áp các policy đã biên dịch vào truy vấn. Không phải điểm nào cũng thực thi mọi đặc quyền. Egret không âm thầm cấp thứ mà một điểm không thực thi được: nó báo đặc quyền đó là **Not enforced** bởi target ấy, kèm lý do, giống cách nó đã báo một rule mà không engine nào áp dụng (xem [Explain access](./explain-access.md#not-enforced)).

| Điểm thực thi | READ | WRITE | CREATE | MANAGE | BROWSE |
|---|---|---|---|---|---|
| Trino hoặc StarRocks trên Ranger | Được thực thi | Được thực thi | Được thực thi | Được thực thi | Không thực thi riêng |
| Trino trên OPA | Được thực thi | Được thực thi | Not enforced | Not enforced | Not enforced |

- **Engine dùng Ranger** thực thi **READ**, **WRITE**, **CREATE** và **MANAGE**. **BROWSE** không được thực thi như một đặc quyền riêng ở đó: các engine này vốn đã liệt kê một đối tượng cho người dùng có bất kỳ grant nào trên nó, đúng với hành vi mà **BROWSE** mô tả.
- **Trino trên OPA** chỉ thực thi **READ** và **WRITE**. Grant **CREATE**, **MANAGE** hoặc **BROWSE** được báo là **Not enforced** bởi target đó, kèm lý do, và không bị coi là được phép. Xem [Trino on OPA](../engines-and-policy/trino-on-opa.md).

:::warning
Hãy kiểm tra câu trả lời **Not enforced** trước khi dựa vào grant **CREATE** hoặc **MANAGE** trên profile chạy OPA: grant được lưu, nhưng engine không áp dụng nó.
:::

## Grant hiện có không đổi

Mọi grant **read** và **write** hiện có biên dịch ra đúng các policy engine như trước (kết quả giống từng byte), nên không profile nào đổi và không engine nào phải nạp lại vì phiên bản này. Các đặc quyền mới chỉ ảnh hưởng đến engine sau khi có người cấp chúng.

## Đọc thêm

- [Grants](./grants.md)
- [How permissions work](../concepts.md)
- [Explain access](./explain-access.md)
