import { useEffect, useState } from "react";
import {
  FaPen,
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

function UserTable({
  users,
  editUser,
  deleteUser,
  search,
  onSearch,
  pagination,
  onPageChange,
}) {
  const userList = Array.isArray(users) ? users : [];

  const currentPage =
    Number(pagination?.page) || 1;

  const totalPages =
    Number(pagination?.pages) || 0;

  const totalUsers =
    Number(pagination?.total) || 0;

  const limit =
    Number(pagination?.limit) || 20;

  const firstUser =
    totalUsers === 0
      ? 0
      : (currentPage - 1) * limit + 1;

  const lastUser =
    Math.min(
      currentPage * limit,
      totalUsers
    );

  // Keep the search field responsive even when the parent updates
  // the value from another part of the page.
  const [searchValue, setSearchValue] =
    useState(search || "");

  useEffect(() => {
    setSearchValue(search || "");
  }, [search]);

  // Small debounce prevents an API request for every individual
  // keystroke while the administrator is typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        onSearch(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];

    const pages = [];

    // For a small number of pages, show every page.
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page.
    pages.push(1);

    if (currentPage > 4) {
      pages.push("left-ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("right-ellipsis");
    }

    // Always show last page.
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <section className="al-data-section">

      <div className="al-toolbar">

        <div className="al-searchbox">
          <FaSearch />

          <input
            type="text"
            placeholder="Search name, email, role or department..."
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
            }}
          />
        </div>

        <div className="al-count-pill">
          {totalUsers} users
        </div>

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
              <th className="al-actions-col">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {userList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="al-empty-cell"
                >
                  {search
                    ? "No users match your search."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              userList.map((user) => (
                <tr key={user._id}>

                  <td className="al-strong-cell">
                    {user.fullName}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    <span
                      className={`al-role-badge al-role-${(
                        user.role || "user"
                      ).toLowerCase()}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.department || "—"}
                  </td>

                  <td>
                    <span
                      className={`al-status ${
                        user.isActive
                          ? "is-active"
                          : "is-inactive"
                      }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="al-row-actions">

                      <button
                        className="al-icon-btn al-edit-btn"
                        onClick={() => editUser(user)}
                        title="Edit user"
                      >
                        <FaPen />
                      </button>

                      <button
                        className="al-icon-btn al-delete-btn"
                        onClick={() =>
                          deleteUser(user._id)
                        }
                        title="Delete user"
                      >
                        <FaTrash />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {totalUsers > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            padding: "18px 4px 4px",
          }}
        >

          <div
            style={{
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Showing{" "}
            <strong>
              {firstUser}–{lastUser}
            </strong>{" "}
            of{" "}
            <strong>
              {totalUsers}
            </strong>{" "}
            users
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  onPageChange(
                    Math.max(1, currentPage - 1)
                  )
                }
                disabled={currentPage === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 13px",
                  borderRadius: "9px",
                  border: "1px solid #dbe3ef",
                  background:
                    currentPage === 1
                      ? "#f1f5f9"
                      : "#ffffff",
                  color:
                    currentPage === 1
                      ? "#94a3b8"
                      : "#2563eb",
                  cursor:
                    currentPage === 1
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700",
                }}
              >
                <FaChevronLeft />
                Previous
              </button>

              {pageNumbers.map((pageItem, index) => {
                if (
                  pageItem === "left-ellipsis" ||
                  pageItem === "right-ellipsis"
                ) {
                  return (
                    <span
                      key={`${pageItem}-${index}`}
                      style={{
                        padding: "0 5px",
                        color: "#64748b",
                        fontWeight: "700",
                      }}
                    >
                      …
                    </span>
                  );
                }

                const active =
                  pageItem === currentPage;

                return (
                  <button
                    type="button"
                    key={pageItem}
                    onClick={() =>
                      onPageChange(pageItem)
                    }
                    style={{
                      minWidth: "40px",
                      height: "40px",
                      padding: "0 10px",
                      borderRadius: "9px",
                      border: active
                        ? "1px solid #2563eb"
                        : "1px solid #dbe3ef",
                      background: active
                        ? "#2563eb"
                        : "#ffffff",
                      color: active
                        ? "#ffffff"
                        : "#334155",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    {pageItem}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  onPageChange(
                    Math.min(
                      totalPages,
                      currentPage + 1
                    )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 13px",
                  borderRadius: "9px",
                  border: "1px solid #dbe3ef",
                  background:
                    currentPage === totalPages
                      ? "#f1f5f9"
                      : "#ffffff",
                  color:
                    currentPage === totalPages
                      ? "#94a3b8"
                      : "#2563eb",
                  cursor:
                    currentPage === totalPages
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700",
                }}
              >
                Next
                <FaChevronRight />
              </button>

            </div>
          )}

        </div>
      )}

    </section>
  );
}

export default UserTable;
