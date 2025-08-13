import { config } from "../config";

// Import các page components
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import BlogList from "../pages/Blog/BlogList";
import BlogCreate from "../pages/Blog/BlogCreate";
import BlogEdit from "../pages/Blog/BlogEdit";
import BlogDetail from "../pages/Blog/BlogDetail";

export const routes = [
  {
    path: config.ROUTES.HOME,
    element: Home,
    isPrivate: false,
    layout: "main",
  },
  {
    path: config.ROUTES.LOGIN,
    element: Login,
    isPrivate: false,
    layout: "auth",
  },
  {
    path: config.ROUTES.REGISTER,
    element: Register,
    isPrivate: false,
    layout: "auth",
  },
  {
    path: config.ROUTES.PROFILE,
    element: Profile,
    isPrivate: true,
    layout: "main",
  },
  {
    path: config.ROUTES.BLOGS,
    element: BlogList,
    isPrivate: false,
    layout: "main",
  },
  {
    path: config.ROUTES.BLOG_CREATE,
    element: BlogCreate,
    isPrivate: true,
    layout: "main",
  },
  {
    path: config.ROUTES.BLOG_EDIT + "/:id",
    element: BlogEdit,
    isPrivate: true,
    layout: "main",
  },
  {
    path: config.ROUTES.BLOG_DETAIL.replace(":id", ":id"),
    element: BlogDetail,
    isPrivate: false,
    layout: "main",
  },
];
