import Announcement from "../models/announcement.js";

/* ======================================================
   GET ALL ANNOUNCEMENTS
====================================================== */

export const getAnnouncements = async (
  req,
  res
) => {
  try {

    const announcements =
      await Announcement.find()
        .populate(
          "createdBy",
          "fullName email role"
        )
        .sort({
          isPinned: -1,
          createdAt: -1,
        });

    res.status(200).json(
      announcements
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to load announcements.",
    });

  }
};

/* ======================================================
   GET SINGLE ANNOUNCEMENT
====================================================== */

export const getAnnouncementById =
  async (req, res) => {

    try {

      const announcement =
        await Announcement.findById(
          req.params.id
        ).populate(
          "createdBy",
          "fullName email role"
        );

      if (!announcement) {

        return res.status(404).json({
          message:
            "Announcement not found.",
        });

      }

      res.status(200).json(
        announcement
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to load announcement.",
      });

    }

  };

/* ======================================================
   CREATE ANNOUNCEMENT
====================================================== */

export const createAnnouncement =
  async (req, res) => {

    try {

      const announcement =
        await Announcement.create({

          ...req.body,

          createdBy: req.user._id,

        });

      const populated =
        await Announcement.findById(
          announcement._id
        ).populate(
          "createdBy",
          "fullName email role"
        );

      res.status(201).json(
        populated
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to create announcement.",
      });

    }

  };

/* ======================================================
   UPDATE ANNOUNCEMENT
====================================================== */

export const updateAnnouncement =
  async (req, res) => {

    try {

      const announcement =
        await Announcement.findById(
          req.params.id
        );

      if (!announcement) {

        return res.status(404).json({
          message:
            "Announcement not found.",
        });

      }

      announcement.title =
        req.body.title ??
        announcement.title;

      announcement.content =
        req.body.content ??
        announcement.content;

      announcement.targetAudience =
        req.body.targetAudience ??
        announcement.targetAudience;

      announcement.isPinned =
        req.body.isPinned ??
        announcement.isPinned;

      announcement.expiryDate =
        req.body.expiryDate ??
        announcement.expiryDate;

      await announcement.save();

      const updated =
        await Announcement.findById(
          announcement._id
        ).populate(
          "createdBy",
          "fullName email role"
        );

      res.status(200).json(
        updated
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to update announcement.",
      });

    }

  };

/* ======================================================
   DELETE ANNOUNCEMENT
====================================================== */

export const deleteAnnouncement =
  async (req, res) => {

    try {

      const announcement =
        await Announcement.findById(
          req.params.id
        );

      if (!announcement) {

        return res.status(404).json({
          message:
            "Announcement not found.",
        });

      }

      await announcement.deleteOne();

      res.status(200).json({

        message:
          "Announcement deleted successfully.",

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete announcement.",
      });

    }

  };