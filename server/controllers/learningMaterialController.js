import LearningMaterial from "../models/learningMaterial.js";

// Create Learning Material
export const createLearningMaterial = async (
  req,
  res
) => {
  try {
    const {
      title,
      course,
      category,
      description,
      dueDate,
    } = req.body;

    let file = "";

    if (category === "Video") {
      file = req.body.file;
    } else if (req.file) {
      file = `/uploads/materials/${req.file.filename}`;
    }

    const learningMaterial =
      await LearningMaterial.create({
        title,
        course,
        category,
        description,
        file,
        dueDate,
      });

    res.status(201).json(
      learningMaterial
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Learning Materials
export const getLearningMaterials = async (
  req,
  res
) => {
  try {
    const learningMaterials =
  await LearningMaterial.find()
    .populate("course", "name title")
    .sort({
      createdAt: -1,
    });

    res.status(200).json(
      learningMaterials
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Learning Material By ID
export const getLearningMaterialById =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findById(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      res.status(200).json(
        learningMaterial
      );
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

// Update Learning Material
export const updateLearningMaterial =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findById(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      learningMaterial.title =
        req.body.title ??
        learningMaterial.title;

      learningMaterial.course =
        req.body.course ??
        learningMaterial.course;

      learningMaterial.category =
        req.body.category ??
        learningMaterial.category;

      learningMaterial.description =
        req.body.description ??
        learningMaterial.description;

      learningMaterial.dueDate =
        req.body.dueDate ??
        learningMaterial.dueDate;

      if (
        req.body.category === "Video"
      ) {
        learningMaterial.file =
          req.body.file;
      } else if (req.file) {
        learningMaterial.file =
          `/uploads/materials/${req.file.filename}`;
      }

      const updated =
        await learningMaterial.save();

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

// Delete Learning Material
export const deleteLearningMaterial =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findByIdAndDelete(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      res.status(200).json({
        message:
          "Learning material deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };