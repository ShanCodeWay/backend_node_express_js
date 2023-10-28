import express from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

export default () => {
  authRoutes(router);
  userRoutes(router);
  return router;
};
