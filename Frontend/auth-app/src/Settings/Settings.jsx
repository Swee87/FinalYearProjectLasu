import React from "react";

function Settings() {
  return (
    <div>
      <div>
        <h1>Settings</h1>
        <button>Back</button>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td>Surname:</td>
              <td>Quadri</td>
            </tr>
            <tr>
              <td>First Name:</td>
              <td>Latifat</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>latifatquadri@gmail.com</td>
            </tr>
            <tr>
              <td>Mobile Number:</td>
              <td>08012345678</td>
            </tr>
            <tr>
              <td>Address:</td>
              <td>Iyana School</td>
            </tr>
            <tr>
              <td>Occupation:</td>
              <td>Student</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Settings;
