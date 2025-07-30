import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { onboardUser } from "../services/AdminRoutes/OnboardUser";
import toast from "react-hot-toast";

export function OnboardUserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const { mutate, isLoading } = useMutation({
    mutationFn: onboardUser,
    onSuccess: ({ message }) => {
      toast.success(message || "User onboarded successfully");
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to onboard user");
    },
  });

  const handleOnSubmit = ({ FirstName, LastName, email, role }) => {
    mutate({ FirstName, LastName, email, role });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Onboard New Staff</h2>

      <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            {...register("FirstName", { required: "First name is required" })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-xl"
          />
          {errors.FirstName && <p className="text-red-500 text-xs">{errors.FirstName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            {...register("LastName", { required: "Last name is required" })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-xl"
          />
          {errors.LastName && <p className="text-red-500 text-xs">{errors.LastName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-xl"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            {...register("role", { required: "Role is required" })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-xl"
          >
            <option value="">Select Role</option>
            <option value="loan_officer">Loan Officer</option>
            <option value="disburse_officer">Disburse Officer</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-700 text-white py-2 px-4 rounded-xl hover:bg-indigo-800"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Onboard User"}
        </button>
      </form>
    </div>
  );
}
