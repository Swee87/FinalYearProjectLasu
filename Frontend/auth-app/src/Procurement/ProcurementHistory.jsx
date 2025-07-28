import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { CSVLink } from "react-csv";

const ProcurementHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("procurementHistory");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistoryData(parsed);
        }
      } catch (err) {
        console.error("Invalid procurement data", err);
      }
    }
  }, []);

  const filteredData = historyData?.filter((item) =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          className="border p-2 rounded w-1/2"
          placeholder="Filter by address"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <CSVLink data={filtered} filename="procurement-history.csv">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Export CSV
          </button>
        </CSVLink>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Products</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{entry.date}</td>
              <td className="p-2">{entry.address}</td>
              <td className="p-2">
                {entry.items.map((item, idx) => (
                  <div key={idx}>
                    {item.name} - ₦{item.price}
                  </div>
                ))}
              </td>
              <td className="p-2">₦{entry.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcurementHistory;
