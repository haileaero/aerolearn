import express from "express";

import {

  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,

} from "../controllers/announcementController.js";

import {

  protect,
  authorize,

} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* ============================================================
   READ
============================================================ */

router.get(

  "/",

  protect,

  getAnnouncements

);

router.get(

  "/:id",

  protect,

  getAnnouncementById

);

/* ============================================================
   CREATE
============================================================ */

router.post(

  "/",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  createAnnouncement

);

/* ============================================================
   UPDATE
============================================================ */

router.put(

  "/:id",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  updateAnnouncement

);

/* ============================================================
   DELETE
============================================================ */

router.delete(

  "/:id",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  deleteAnnouncement

);

export default router;