import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAdmin({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (!token) return null;
  return <>{children}</>;
}
