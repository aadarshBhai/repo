import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  if (!token) return null;
  return <>{children}</>;
}
