import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { executeQuery } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract filename from URL
export const getFilenameFromUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/uploads/blogs/")) {
    return url.replace("/uploads/blogs/", "");
  }
  return null;
};

// Helper function to cleanup unused images
export const cleanupUnusedImages = async () => {
  try {
    const uploadsDir = path.join(__dirname, "uploads", "blogs");

    // Get all files in uploads directory
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(
      (file) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && !file.startsWith(".")
    );

    if (imageFiles.length === 0) {
      console.log("No image files to check");
      return;
    }

    // Get all image URLs from database
    const [blogImages, blogFeaturedImages] = await Promise.all([
      executeQuery("SELECT url FROM blog_images"),
      executeQuery(
        "SELECT featured_image FROM blogs WHERE featured_image IS NOT NULL"
      ),
    ]);

    const usedFiles = new Set();

    // Extract filenames from blog_images
    blogImages.forEach((row) => {
      const filename = getFilenameFromUrl(row.url);
      if (filename) usedFiles.add(filename);
    });

    // Extract filenames from featured_images
    blogFeaturedImages.forEach((row) => {
      const filename = getFilenameFromUrl(row.featured_image);
      if (filename) usedFiles.add(filename);
    });

    // Find unused files
    const unusedFiles = imageFiles.filter((file) => !usedFiles.has(file));

    if (unusedFiles.length === 0) {
      console.log("No unused image files found");
      return;
    }

    console.log(`Found ${unusedFiles.length} unused image files:`, unusedFiles);

    // Delete unused files
    const deletePromises = unusedFiles.map(async (file) => {
      const filePath = path.join(uploadsDir, file);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted unused file: ${file}`);
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error.message);
      }
    });

    await Promise.all(deletePromises);
    console.log(
      `Cleanup completed. Deleted ${unusedFiles.length} unused files.`
    );
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

// Helper function to validate image file
export const validateImageFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(
        ", "
      )}`
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      `File quá lớn. Kích thước tối đa: ${maxSize / (1024 * 1024)}MB`
    );
  }

  return true;
};
