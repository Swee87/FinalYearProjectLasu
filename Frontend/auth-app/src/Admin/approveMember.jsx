// src/components/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {MemberTable} from "./MembershipTable";

export const MembershipApproval = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from API
  useEffect(() => {
    // Replace this with real API call in production
    setTimeout(() => {
      setMembers([
        {
          _id: "1",
          userId: { email: "john.doe@example.com", FirstName: "John", LastName: "Doe" },
          memberId: "M123456789",
          phoneNumber: "+2348012345678",
          appId: "APP123456",
          staffType: "Full-Time",
          payMentProof: "https://picsum.photos/200/100 ",
          isVerified: false,
          accountNumber: "0123456789",
          bankName: "GTBank",
        },
        {
          _id: "2",
          userId: { email: "jane.smith@example.com", FirstName: "Jane", LastName: "Smith" },
          memberId: "M987654321",
          phoneNumber: "+2348098765432",
          appId: "APP789012",
          staffType: "Part-Time",
          payMentProof: "https://picsum.photos/200/101 ",
          isVerified: false,
          accountNumber: null,
          bankName: null,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleApprove = async (memberId) => {
    // Replace with actual API call
    alert(`Member ID ${memberId} approved!`);
    setMembers((prev) =>
      prev.map((m) =>
        m._id === memberId ? { ...m, isVerified: true } : m
      )
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      {loading ? (
        <div className="text-center py-10">Loading members...</div>
      ) : (
        <MemberTable members={members} onApprove={handleApprove} />
      )}
    </div>
  );
};

