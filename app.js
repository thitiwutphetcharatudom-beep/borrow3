// โหลดข้อมูลจาก localStorage หรือใช้ค่าเริ่มต้น
let devices = JSON.parse(localStorage.getItem('devices')) || [
  { id: 1, name: 'ไขควง', total: 20, borrowed: 0, borrowRecords: []},
  { id: 2, name: 'คีม', total: 15, borrowed: 0, borrowRecords: []},
  { id: 3, name: 'ตลับเมตร', total: 10, borrowed: 0, borrowRecords: []},
];

// ฟังก์ชันบันทึกข้อมูลกลับ localStorage
function saveDevices() {
  localStorage.setItem('devices', JSON.stringify(devices));
}

// แสดงอุปกรณ์ในตาราง (หน้า borrow.html)
function renderDevices() {
  const tbody = document.querySelector('#device-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  devices.forEach(device => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${device.name}</td>
      <td>${device.total}</td>
      <td>${device.borrowed}</td>
    `;
    tbody.appendChild(tr);
  });
}

// เติมตัวเลือกใน select ของหน้า borrow.html
function populateDeviceOptions() {
  const select = document.getElementById('device-select');
  if (!select) return;

  select.innerHTML = '';
  devices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.id;
    option.textContent = device.name;
    select.appendChild(option);
  });
}

// แสดงสถานะยืมในหน้า status.html
function renderStatus() {
  const tbody = document.querySelector('#status-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  devices.forEach(device => {
    if (device.borrowRecords && device.borrowRecords.length > 0) {
      device.borrowRecords.forEach(record => {
        const borrowDate = new Date(record.borrowDate);
        const now = new Date();
        const diffDays = Math.floor((now - borrowDate) / (1000 * 60 * 60 * 24));
        let status = "ยืมอยู่";
        let fine = 0;

        if (diffDays > 7) {
          status = "เกินกำหนด (" + diffDays + " วัน)";
          fine = (diffDays - 7) * 10; // ค่าปรับวันละ 10 บาท
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${device.name}</td>
          <td>${record.quantity}</td>
          <td>${record.borrower}</td>
          <td>${borrowDate.toLocaleDateString()}</td>
          <td>${status}</td>
          <td>${fine > 0 ? fine + " บาท" : "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  });
}


// จัดการฟอร์มยืม-คืน
function handleBorrowReturn(e) {
  e.preventDefault();

  const deviceId = parseInt(document.getElementById('device-select').value);
  const action = document.getElementById('action-select').value;
  const quantity = parseInt(document.getElementById('quantity-input').value);
  const messageEl = document.getElementById('message');

  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    messageEl.textContent = 'ไม่พบอุปกรณ์ที่เลือก';
    messageEl.style.color = 'red';
    return;
  }

  if (quantity <= 0 || isNaN(quantity)) {
    messageEl.textContent = 'กรุณากรอกจำนวนให้ถูกต้อง';
    messageEl.style.color = 'red';
    return;
  }

 if (action === 'borrow') {
  const borrower = document.getElementById('borrower-input').value;
  device.borrowRecords.push({
    borrower,
    quantity,
    borrowDate: new Date().toISOString()
  });
  device.borrowed += quantity;

    messageEl.textContent = `ยืมอุปกรณ์ "${device.name}" จำนวน ${quantity} ชิ้น สำเร็จ`;
    messageEl.style.color = 'green';
  } else if (action === 'return') {
    if (device.borrowed < quantity) {
      messageEl.textContent = `จำนวนคืนมากกว่าที่ยืมไปของอุปกรณ์ "${device.name}"`;
      messageEl.style.color = 'red';
      return;
    }
    device.borrowed -= quantity;
    messageEl.textContent = `คืนอุปกรณ์ "${device.name}" จำนวน ${quantity} ชิ้น สำเร็จ`;
    messageEl.style.color = 'green';
  }

  saveDevices();
  renderDevices();
  renderStatus();
  // เคลียร์ฟอร์ม
  e.target.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDevices();
  populateDeviceOptions();
  renderStatus();

  const form = document.getElementById('borrow-return-form');
  if (form) {
    form.addEventListener('submit', handleBorrowReturn);
  }
});
