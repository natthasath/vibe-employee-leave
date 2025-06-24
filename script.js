// Data structure to hold all information
let employeeData = {
    groups: {}
};
let nextEmployeeId = 1;
let currentEditingEmployee = null;

// Initialize the application
function init() {
    updateGroupsList();
    updateEmployeesList();
    updateGroupSelect();
}

// Group management functions
function addGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    if (!groupName) {
        alert('กรุณาใส่ชื่อกลุ่มงาน');
        return;
    }

    if (employeeData.groups[groupName]) {
        alert('กลุ่มงานนี้มีอยู่แล้ว');
        return;
    }

    employeeData.groups[groupName] = [];
    document.getElementById('groupName').value = '';
    
    updateGroupsList();
    updateGroupSelect();
    updateEmployeesList();
}

function deleteGroup(groupName) {
    if (confirm(`ต้องการลบกลุ่มงาน "${groupName}" หรือไม่?`)) {
        delete employeeData.groups[groupName];
        updateGroupsList();
        updateGroupSelect();
        updateEmployeesList();
    }
}

function updateGroupsList() {
    const container = document.getElementById('groupsList');
    container.innerHTML = '';

    Object.keys(employeeData.groups).forEach(groupName => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <h3>${groupName}</h3>
            <p>จำนวนพนักงาน: ${employeeData.groups[groupName].length} คน</p>
            <button class="btn btn-danger" onclick="deleteGroup('${groupName}')">ลบกลุ่ม</button>
        `;
        container.appendChild(groupCard);
    });
}

function updateGroupSelect() {
    const select = document.getElementById('empGroup');
    select.innerHTML = '<option value="">เลือกกลุ่มงาน</option>';
    
    Object.keys(employeeData.groups).forEach(groupName => {
        const option = document.createElement('option');
        option.value = groupName;
        option.textContent = groupName;
        select.appendChild(option);
    });
}

// Employee management functions
function addEmployee() {
    const groupName = document.getElementById('empGroup').value;
    const empName = document.getElementById('empName').value.trim();

    if (!groupName) {
        alert('กรุณาเลือกกลุ่มงาน');
        return;
    }

    if (!empName) {
        alert('กรุณาใส่ชื่อพนักงาน');
        return;
    }

    const newEmployee = {
        id: nextEmployeeId++,
        name: empName,
        leavedays: [],
        restrictions: {
            no_weekends: false,
            no_weekdays: false,
            no_specific_days: []
        }
    };

    employeeData.groups[groupName].push(newEmployee);
    document.getElementById('empName').value = '';
    
    updateEmployeesList();
    updateGroupsList();
}

function editEmployee(groupName, employeeId) {
    const employee = employeeData.groups[groupName].find(emp => emp.id === employeeId);
    if (!employee) return;

    currentEditingEmployee = { groupName, employeeId };

    // Fill modal with employee data
    document.getElementById('modalEmpName').value = employee.name;
    document.getElementById('modalLeaveDays').value = employee.leavedays.join(', ');
    document.getElementById('modalNoWeekends').checked = employee.restrictions.no_weekends;
    document.getElementById('modalNoWeekdays').checked = employee.restrictions.no_weekdays;

    // Clear and set specific days checkboxes
    const dayCheckboxes = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    dayCheckboxes.forEach(day => {
        document.getElementById(`modal${day.charAt(0).toUpperCase() + day.slice(1)}`).checked = 
            employee.restrictions.no_specific_days.includes(day);
    });

    document.getElementById('employeeModal').style.display = 'block';
}

function saveEmployee() {
    if (!currentEditingEmployee) return;

    const { groupName, employeeId } = currentEditingEmployee;
    const employee = employeeData.groups[groupName].find(emp => emp.id === employeeId);
    
    if (!employee) return;

    // Update employee data
    employee.name = document.getElementById('modalEmpName').value.trim();
    
    // Parse leave days
    const leaveDaysStr = document.getElementById('modalLeaveDays').value.trim();
    employee.leavedays = leaveDaysStr ? leaveDaysStr.split(',').map(day => day.trim()).filter(day => day) : [];

    // Update restrictions
    employee.restrictions.no_weekends = document.getElementById('modalNoWeekends').checked;
    employee.restrictions.no_weekdays = document.getElementById('modalNoWeekdays').checked;

    // Update specific days
    const dayCheckboxes = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    employee.restrictions.no_specific_days = dayCheckboxes.filter(day => 
        document.getElementById(`modal${day.charAt(0).toUpperCase() + day.slice(1)}`).checked
    );

    closeModal();
    updateEmployeesList();
}

function deleteEmployee(groupName, employeeId) {
    if (confirm('ต้องการลบพนักงานคนนี้หรือไม่?')) {
        employeeData.groups[groupName] = employeeData.groups[groupName].filter(emp => emp.id !== employeeId);
        updateEmployeesList();
        updateGroupsList();
    }
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    currentEditingEmployee = null;
}

function updateEmployeesList() {
    const container = document.getElementById('employeesList');
    container.innerHTML = '';

    Object.keys(employeeData.groups).forEach(groupName => {
        employeeData.groups[groupName].forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.className = 'employee-card';
            
            const leaveDaysHtml = employee.leavedays.map(day => 
                `<span class="leave-day">${day}</span>`
            ).join('');

            const restrictionsText = [];
            if (employee.restrictions.no_weekends) restrictionsText.push('ไม่ทำงานวันหยุดสุดสัปดาห์');
            if (employee.restrictions.no_weekdays) restrictionsText.push('ไม่ทำงานวันธรรมดา');
            if (employee.restrictions.no_specific_days.length > 0) {
                restrictionsText.push(`ไม่ทำงานวัน: ${employee.restrictions.no_specific_days.join(', ')}`);
            }

            employeeCard.innerHTML = `
                <h3>${employee.name}</h3>
                <p><strong>กลุ่มงาน:</strong> ${groupName}</p>
                <p><strong>ID:</strong> ${employee.id}</p>
                <div>
                    <strong>วันลา:</strong>
                    <div class="leave-days">${leaveDaysHtml || '<span style="color: #7f8c8d;">ไม่มีวันลา</span>'}</div>
                </div>
                <div class="restrictions">
                    <strong>ข้อจำกัด:</strong> ${restrictionsText.length > 0 ? restrictionsText.join(', ') : 'ไม่มีข้อจำกัด'}
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn" onclick="editEmployee('${groupName}', ${employee.id})">แก้ไข</button>
                    <button class="btn btn-danger" onclick="deleteEmployee('${groupName}', ${employee.id})">ลบ</button>
                </div>
            `;
            container.appendChild(employeeCard);
        });
    });
}

// Export/Import functions
function exportData() {
    const dataStr = JSON.stringify(employeeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const file = document.getElementById('importFile').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate structure
            if (!importedData.groups || typeof importedData.groups !== 'object') {
                throw new Error('Invalid file format');
            }

            employeeData = importedData;
            
            // Update next employee ID
            let maxId = 0;
            Object.values(employeeData.groups).forEach(group => {
                group.forEach(emp => {
                    if (emp.id > maxId) maxId = emp.id;
                });
            });
            nextEmployeeId = maxId + 1;

            // Update UI
            updateGroupsList();
            updateGroupSelect();
            updateEmployeesList();
            
            alert('นำเข้าข้อมูลสำเร็จ!');
        } catch (error) {
            alert('ไฟล์ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    document.getElementById('importFile').value = '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    init();
});