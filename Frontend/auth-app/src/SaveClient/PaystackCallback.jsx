import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { PaystackReferencePoint } from '../services/Paystackapi';
import { Loader2 } from 'lucide-react';

export function PaystackCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference");

  const {
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ['verify-payment', reference],
    queryFn: () => PaystackReferencePoint({ reference }),
    enabled: !!reference,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: () => {
      toast.success(" Payment verified successfully!");
      setTimeout(() => navigate('/user-Dashboard'), 1500);
    },
    onError: (err) => {
      toast.error(` Verification failed: ${err.message}`);
      setTimeout(() => navigate('/'), 2000);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      {isLoading && (
        <>
          <Loader2 className="animate-spin text-indigo-700 w-8 h-8 mb-3" />
          <p className="text-indigo-700 text-lg font-medium">
            Verifying payment, please wait...
          </p>
        </>
      )}
      {isError && (
        <p className="text-red-600 text-lg font-medium">
          Payment verification failed: {error?.message}
        </p>
      )}
      {isSuccess && (
        <p className="text-green-700 text-lg font-medium">
          Payment verified! 🎉 Redirecting...
        </p>
      )}
    </div>
  );
}
