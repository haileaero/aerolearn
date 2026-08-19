function CourseOverview() {
  return (
    <div className="dashboard-box">

      <h2>Course Overview</h2>

      <table className="course-table">

        <thead>

          <tr>

            <th>Course</th>

            <th>Students</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td>Fluid Mechanics</td>

            <td>42</td>

            <td>Active</td>

          </tr>

          <tr>

            <td>Aerodynamics</td>

            <td>36</td>

            <td>Active</td>

          </tr>

          <tr>

            <td>Aircraft Structures</td>

            <td>28</td>

            <td>Upcoming</td>

          </tr>

        </tbody>

      </table>

    </div>
  );
}

export default CourseOverview;