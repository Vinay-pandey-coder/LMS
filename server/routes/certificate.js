const express = require('express');
const PDFDocument = require('pdfkit');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Lecture = require('../model/Lecturemodel');
const WatchTime = require('../model/WatchTimemodel');
const Course = require('../model/Coursemodel');
const User = require('../model/usermodel');

const router = express.Router();

// ============================================
// GENERATE CERTIFICATE PDF
// ============================================
// GET /api/certificate/course/:courseId
// Protected route - Only students can generate certificates
// Returns PDF file only if course is 100% completed
router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // ============================================
      // STEP 1: GET DATA FROM REQUEST
      // ============================================
      // Get courseId from URL parameter
      const courseId = req.params.courseId;

      // Get studentId from authenticated user (set by authMiddleware)
      const studentId = req.user.id;

      console.log(`Generating certificate for student ${studentId}, course ${courseId}`);

      // ============================================
      // STEP 2: FETCH COURSE AND STUDENT DETAILS
      // ============================================
      // Get course information
      const course = await Course.findById(courseId);

      // Check if course exists
      if (!course) {
        return res.status(404).json({
          message: 'Course not found',
        });
      }

      // Get student information
      const student = await User.findById(studentId);

      // Check if student exists
      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }

      // ============================================
      // STEP 3: CHECK COMPLETION PERCENTAGE
      // ============================================
      // Find all lectures in the course
      const allLectures = await Lecture.find({ courseId });

      // Count total lectures
      const totalLectures = allLectures.length;

      // Find watch time records for this student in this course
      const watchedRecords = await WatchTime.find({
        studentId,
        lectureId: {
          $in: allLectures.map((lecture) => lecture._id),
        },
      });

      // Count lectures watched by student
      const lecturesWatched = watchedRecords.length;

      // Calculate completion percentage
      let completionPercent = 0;

      // Only calculate if there are lectures in the course
      if (totalLectures > 0) {
        completionPercent = Math.round(
          (lecturesWatched / totalLectures) * 100
        );
      }

      console.log(
        `Course completion: ${lecturesWatched}/${totalLectures} (${completionPercent}%)`
      );

      // ============================================
      // STEP 4: CHECK IF COURSE IS COMPLETED
      // ============================================
      // Only allow certificate generation if completion is 100%
      if (completionPercent < 100) {
        return res.status(400).json({
          message: 'Complete the course to generate certificate',
          completionPercent,
          required: 100,
        });
      }

      // ============================================
      // STEP 5: CREATE PDF DOCUMENT
      // ============================================
      // Create a new PDF document
      // Size: A4 (standard certificate size)
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // ============================================
      // STEP 6: SET RESPONSE HEADERS
      // ============================================
      // Tell browser to download as PDF attachment
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificate-${courseId}-${studentId}.pdf"`
      );

      // Pipe PDF directly to response (send to client)
      doc.pipe(res);

      // ============================================
      // STEP 7: DESIGN CERTIFICATE
      // ============================================

      // Add decorative top border
      doc
        .moveTo(50, 100)
        .lineTo(550, 100)
        .lineWidth(3)
        .stroke('#2c3e50');

      // Add certificate title
      doc
        .fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text('Certificate of Completion', {
          align: 'center',
          underline: false,
        });

      // Add spacing
      doc.moveDown(2);

      // Add "This is to certify that" text
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#34495e')
        .text('This is to certify that', {
          align: 'center',
        });

      // Add spacing
      doc.moveDown(1);

      // Add student name (in large bold text)
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text(student.name, {
          align: 'center',
          underline: true,
        });

      // Add spacing
      doc.moveDown(1.5);

      // Add main certificate text
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#34495e')
        .text(
          `has successfully completed the course`,
          {
            align: 'center',
          }
        );

      // Add spacing
      doc.moveDown(0.5);

      // Add course name (in italic)
      doc
        .fontSize(16)
        .font('Helvetica-Oblique')
        .fillColor('#2c3e50')
        .text(course.title, {
          align: 'center',
          underline: true,
        });

      // Add spacing
      doc.moveDown(2);

      // Add completion date
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#34495e');

      // Get current date
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.text(`Completed on: ${formattedDate}`, {
        align: 'center',
      });

      // Add spacing
      doc.moveDown(2);

      // Add decorative bottom border
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .lineWidth(3)
        .stroke('#2c3e50');

      // Add footer text
      doc.moveDown(1);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#7f8c8d')
        .text(
          'This certificate is awarded in recognition of the successful completion of all course requirements.',
          {
            align: 'center',
          }
        );

      // ============================================
      // STEP 8: FINISH PDF
      // ============================================
      // End the PDF and send it to client
      doc.end();

      console.log(`Certificate generated successfully for student ${studentId}`);
    } catch (error) {
      console.error('Certificate generation error:', error.message);
      res.status(500).json({
        message: 'Error generating certificate',
        error: error.message,
      });
    }
  }
);

module.exports = router;