import { useMemo, useState } from "react";

function UserTable({
  users,
  editUser,
  deleteUser,
}) {
  const [search, setSearch] =
    useState("");

  const filteredUsers =
  useMemo(() => {
    const userList = Array.isArray(users) ? users : [];

    return userList.filter(
        (user) =>
          user.fullName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user.email
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user.role
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user.department
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [users, search]);

  return (
    <>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      />

      <table className="course-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length ===
          0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                }}
              >
                No users found.
              </td>
            </tr>
          ) : (
            filteredUsers.map(
              (user) => (
                <tr key={user._id}>
                  <td>
                    {user.fullName}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.role}
                  </td>

                  <td>
                    {user.department}
                  </td>

                  <td>
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        editUser(user)
                      }
                    >
                      Edit
                    </button>

                    <button
                      style={{
                        marginLeft:
                          "10px",
                      }}
                      onClick={() =>
                        deleteUser(
                          user._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </>
  );
}

export default UserTable;