import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/address";

export const addressRouter = express.Router();

addressRouter
  .route("/")
  .get(Controller.getAddresses)
  .post(
    Permission.isLoggedIn,
    Permission.isOwnerOrAdmin(
      Permission.OwnerOfProvider,
      true,
      "provider",
      "You cannot create a address for another provider"
    ),
    Controller.addAddress
  );

addressRouter
  .route("/:id")
  .get(Controller.getAddress)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfAddress),
    Permission.isOwnerOrAdmin(
      Permission.OwnerOfProvider,
      true,
      "provider",
      "You cannot give an address to another provider"
    ),
    Controller.modifyAddress
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfAddress),
    Controller.deleteAddress
  );

export default addressRouter;
