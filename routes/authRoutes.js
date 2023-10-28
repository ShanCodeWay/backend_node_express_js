// AUTH ROUTES

import {
  register,
  login,
  protectedRoute,
} from "../controllers/authController.js";

export default (router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  return router;
};
