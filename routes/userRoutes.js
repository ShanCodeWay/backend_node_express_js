import {
  getAllUsers,
  getUserById,
  addAddress,
  updateAddress,
} from "../controllers/userController.js";

import { protectedRoute } from "../controllers/authController.js";

export default (router) => {
  router.get("/users", getAllUsers);
  router.get("/users/:id", getUserById);
  router.post(
    "/users/addAddress",
    protectedRoute,
    addAddress
  );
  router.patch("/users/updateAddress", updateAddress);
  return router;
};
