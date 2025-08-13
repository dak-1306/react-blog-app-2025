import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import BlogEdit from "../pages/Blog/BlogEdit";
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => {
          const { path, element: Component, isPrivate, layout } = route;

          // Chọn layout
          const LayoutComponent = layout === "auth" ? AuthLayout : MainLayout;

          // Wrap component với layout
          const ElementWithLayout = (
            <LayoutComponent>
              <Component />
            </LayoutComponent>
          );

          // Wrap với PrivateRoute nếu cần
          const ProtectedElement = isPrivate ? (
            <PrivateRoute>{ElementWithLayout}</PrivateRoute>
          ) : (
            ElementWithLayout
          );

          return <Route key={index} path={path} element={ProtectedElement} />;
        })}

        {/* 404 Page */}
        <Route path="/blogs/:id/edit" element={<BlogEdit />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
