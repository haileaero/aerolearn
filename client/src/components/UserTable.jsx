import { useMemo, useState } from "react";
import { FaPen, FaTrash, FaSearch } from "react-icons/fa";

function UserTable({ users, editUser, deleteUser }) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    const keyword = search.toLowerCase();
    return userList.filter((user) =>
      [user.fullName, user.email, user.role, user.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [users, search]);

  return (
    <section className="al-data-section">
      <div className="al-toolbar">
        <div className="al-searchbox">
          <FaSearch />
          <input
            type="text"
            placeholder="Search name, email, role or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="al-count-pill">{filteredUsers.length} users</div>
      </div>

      <div className="al-table-shell">
        <table className="al-table al-table-blue">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th className="al-actions-col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="al-empty-cell">No users found.</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="al-strong-cell">{user.fullName}</td>
                <td>{user.email}</td>
                <td><span className={`al-role-badge al-role-${(user.role || "user").toLowerCase()}`}>{user.role}</span></td>
                <td>{user.department || "—"}</td>
                <td><span className={`al-status ${user.isActive ? "is-active" : "is-inactive"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div className="al-row-actions">
                    <button className="al-icon-btn al-edit-btn" onClick={() => editUser(user)} title="Edit user"><FaPen /></button>
                    <button className="al-icon-btn al-delete-btn" onClick={() => deleteUser(user._id)} title="Delete user"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UserTable;
