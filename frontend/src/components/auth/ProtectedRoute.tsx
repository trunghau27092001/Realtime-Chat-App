import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, isLoading, refreshToken, fetchMe } =
    useAuthStore();

  const [starting, setStarting] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      refreshToken().then(() => {
        setStarting(false);
      });
    }
    if (accessToken && !user) {
      fetchMe();
    }
  }, [accessToken, user, refreshToken, fetchMe]);

  if (starting && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!accessToken && !starting) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;
