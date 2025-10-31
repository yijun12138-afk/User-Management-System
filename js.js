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
      phone: item.phone,
      website: item.website,
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
  if (users.length === 0) {
    container.innerHTML = "<p>暂无用户数据</p>";
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
                    <p>📞 ${user.phone}</p>
                    <p>🌐 ${user.website}</p>
                </div>
            </div>`;
  }
  container.innerHTML = html;
}
document.getElementById("loadUsersBtn").addEventListener("click", loadUsers);
