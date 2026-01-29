
const express = require('express');
const { getProfile, updateProfile, uploadAvatar, getAvatar, changePassword } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { check } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *                 fullName:
 *                   type: string
 *                   example: "John Doe"
 *                 phone:
 *                   type: string
 *                   example: "+54 9 11 1234 5678"
 *                 currency:
 *                   type: string
 *                   enum: [USD, EUR, ARS, MXN]
 *                   example: "ARS"
 *                 avatar:
 *                   type: string
 *                   example: "/uploads/avatars/john-1234567890.jpg"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized (token is missing or invalid)
 *       404:
 *         description: User not found
 */
router.get('/me', verifyToken, getProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+54 9 11 1234 5678"
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, ARS, MXN]
 *                 example: "USD"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request (validation error or email already in use)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  '/me',
  verifyToken,
  [
    check('email', 'Please include a valid email').optional().isEmail(),
    check('fullName', 'Full name must be at least 3 characters').optional().isLength({ min: 3 }),
    check('phone', 'Invalid phone format').optional().isMobilePhone(),
    check('currency', 'Invalid currency').optional().isIn(['USD', 'EUR', 'ARS', 'MXN']),
  ],
  updateProfile
);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload or update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP) - Max 5MB
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Avatar uploaded successfully"
 *                 avatar:
 *                   type: string
 *                   example: "/uploads/avatars/profile-1234567890.jpg"
 *       400:
 *         description: Bad request (no file or invalid file type/size)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  '/avatar',
  verifyToken,
  upload.single('avatar'),
  uploadAvatar
);

/**
 * @swagger
 * /api/users/avatars/{filename}:
 *   get:
 *     summary: Get user avatar image
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Avatar filename
 *     responses:
 *       200:
 *         description: Avatar image file
 *         content:
 *           image/jpeg: {}
 *           image/png: {}
 *           image/gif: {}
 *           image/webp: {}
 *       400:
 *         description: Invalid filename
 *       404:
 *         description: Avatar not found
 */
router.get('/avatars/:filename', getAvatar);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change the password of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword456"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword456"
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Contraseña actualizada correctamente"
 *       400:
 *         description: Bad request (validation error, incorrect password, or passwords don't match)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  '/change-password',
  verifyToken,
  [
    check('currentPassword', 'Current password is required').notEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    check('newPassword', 'Password must contain letters and numbers').matches(/^(?=.*[A-Za-z])(?=.*\d)/),
    check('confirmPassword', 'Passwords must match').custom((value, { req }) => value === req.body.newPassword),
  ],
  changePassword
);

module.exports = router;
