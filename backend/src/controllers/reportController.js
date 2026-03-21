import { createReportService } from "../services/reportService.js";

export const createReport = async (req, res) => {
  try {
    const newReport = await createReportService(req.body);

    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      data: newReport
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};