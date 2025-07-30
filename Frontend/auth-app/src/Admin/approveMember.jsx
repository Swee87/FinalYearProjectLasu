// src/components/AdminDashboard.jsx
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { MemberTable } from "./MembershipTable";
import { UnverifiedMember, ApproveMember } from "../services/AdminRoutes/ApproveMember";
import { ErrorPage } from '../components/Error';

import { useQueryClient } from "@tanstack/react-query";

export const MembershipApproval = () => {
  const queryClient = useQueryClient();

  // Fetch unverified members
  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ["unverified-members"], // More specific key
    queryFn: UnverifiedMember,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      toast.error(`Loading failed: ${error.message}`);
    },
  });
 
 const { mutate: approveMember, isPending: approving } = useMutation({
  mutationFn: ApproveMember,
  onError: (error) => {
    const message = error.message.includes('Failed to fetch') 
      ? 'Network error - check server connection' 
      : error.message;
    toast.error(`Approval failed: ${message}`);
  },
  onSuccess: (_, memberId) => {
    toast.success("Member approved!");
    queryClient.setQueryData(["unverified-members"], old => 
      old?.filter(m => m._id !== memberId)
    );
  }
});

  if (isLoading) {
      return (
        <div className="text-center py-10">Loading loan details...</div>
      );
    }
  
    if (error) {
      return <ErrorPage title="Failed to Load Loan Data" message={error.message} onRetry={refetch} showHomeButton />;
    }


const handleApprove = (memberId) => {
  approveMember(memberId);
};
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      
      {isLoading && <div className="text-center py-10">Loading members...</div>}
      
      {error && (
        <div className="text-red-500 text-center py-4">
          Error: {error.message}
        </div>
      )}
      
      {members && (
        <MemberTable 
          members={members} 
          onApprove={handleApprove} 
          approving={approving} 
        />
      )}
    </div>
  );
};