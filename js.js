// 1. 定义API基础URL
const API_BASE = "https://jsonplaceholder.typicode.com";
let users = [];

// 2. 创建加载用户列表的函数
async function loadUsers() {
  document.getElementById("loadUsersBtn").textContent = "加载中...";
  try {
    const response = await axios.get(`${API_BASE}/users`);
    users = response.data.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
    }));
    renderUsers();
  } catch (error) {
    alert("加载用户失败");
  } finally {
    document.getElementById("loadUsersBtn").textContent = "🔄 加载用户列表";
  }
}

function renderUsers() {
  const container = document.getElementById("userListContainer");
  const userCountElement = document.getElementById("userCount");
  
  if (users.length === 0) {
    container.innerHTML = "<p>暂无用户数据</p>";
    userCountElement.textContent = "0 个用户";
    return;
  }
  
  let html = "";
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    html += `
         <div class="card mb-3">
                <div class="card-body">
                    <h5>${user.name}</h5>
                    <p>📧 ${user.email}</p>
                    <div>
                      <button class="btn btn-primary btn-sm me-2" onclick="openEditModal(${user.id})">
                        编辑
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                        删除
                      </button>
                    </div>
                </div>
            </div>`;
  }
  container.innerHTML = html;
  
  // 更新用户计数
  userCountElement.textContent = `${users.length} 个用户`;
}
document.getElementById("loadUsersBtn").addEventListener("click", loadUsers);

// 添加用户
async function handleAddUser(event) {
  // 阻止表单默认提交行为（页面刷新）
  event.preventDefault();

  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  const submitButton = document.getElementById("submitted");
  // 显示加载状态
  try {
    submitButton.textContent = "添加中...";
    submitButton.disabled = true; //禁用

    // 调用API添加用户
    const newUser = await addUserToAPI(name, email);
    // 将新用户添加到本地列表
    users.unshift(newUser);
    // 重新渲染用户列表
    renderUsers();

    alert("用户添加成功");
  } catch (error) {
    console.error("添加用户失败:", error);
    alert("添加用户失败，请重试");
  } finally {
    submitButton.textContent = "添加用户";
    submitButton.disabled = false;
    // 清空表单
    nameInput.value = "";
    emailInput.value = "";
  }
}
// 为表单添加事件监听
document.getElementById("userForm").addEventListener("submit", handleAddUser);

// 调用API添加用户的函数
async function addUserToAPI(name, email) {
  const newUserData = {
    name: name,
    email: email,
  };
  const response = await axios.post(`${API_BASE}/users`, newUserData);
  console.log("API响应", response.data);

  return response.data;
}

// 删除用户函数
async function deleteUser(userId) {
  if (!confirm("确定要删除这个用户吗？")) {
    return;
  }

  try {
    // 显示删除中状态
    const buttons = document.querySelectorAll(".card button");
    buttons.forEach((button) => {
      if (button.onclick && button.onclick.toString().includes(`${userId}`)) {
        button.textContent = "删除中...";
        button.disabled = true;
        button.classList.remove("btn-danger");
        button.classList.add("btn-secondary");
      }
    });

    // 调用API删除
    await axios.delete(`${API_BASE}/users/${userId}`);

    // 从本地数据中移除
    users = users.filter((user) => user.id !== userId);

    // 重新渲染
    renderUsers();

    alert("用户删除成功");
  } catch (error) {
    console.log("删除失败", error);

    // 恢复按钮状态
    const buttons = document.querySelectorAll(".card button");
    buttons.forEach((button) => {
      if (button.textContent === "删除中...") {
        button.textContent = "删除";
        button.disabled = false;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-danger");
      }
    });

    alert("用户删除失败");
  }
}

// 打开编辑模态框并填充数据
function openEditModal(userId) {
  // 找到要编辑的用户
  const user = users.find((u) => u.id === userId);
  if (!user) {
    alert("用户不存在");
    return;
  }

  // 填充表单数据
  document.getElementById("editUserId").value = user.id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;

  // 显示模态框
  const editModal = new bootstrap.Modal(
    document.getElementById("editUserModal")
  );
  editModal.show();
}

// 保存编辑的用户信息
async function saveEditUser() {
  const userId = parseInt(document.getElementById("editUserId").value);
  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();

  // 验证输入
  if (!name || !email) {
    alert("请填写姓名和邮箱");
    return;
  }

  const saveButton = document.getElementById("saveEditBtn");

  try {
    // 显示加载状态
    saveButton.textContent = "保存中...";
    saveButton.disabled = true;

    // 调用API更新用户
    const updatedUser = await updateUserToAPI(userId, name, email);

    // 更新本地数据
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
    }

    // 重新渲染列表
    renderUsers();

    // 关闭模态框
    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editUserModal")
    );
    editModal.hide();

    alert("用户信息更新成功！");
  } catch (error) {
    console.error("更新用户失败:", error);
    alert("更新用户失败，请重试");
  } finally {
    // 恢复按钮状态
    saveButton.textContent = "保存修改";
    saveButton.disabled = false;
  }
}

// 调用API更新用户的函数
async function updateUserToAPI(userId, name, email) {
  const updateData = {
    name: name,
    email: email,
  };

  // 发送PUT请求更新用户
  const response = await axios.put(`${API_BASE}/users/${userId}`, updateData);
  console.log("更新API响应", response.data);

  return {
    id: userId,
    name: response.data.name || name,
    email: response.data.email || email,
  };
}
// 为保存按钮添加事件监听
document.getElementById("saveEditBtn").addEventListener("click", saveEditUser);
