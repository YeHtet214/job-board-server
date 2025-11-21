/**
 * @swagger
 * /api/saved-jobs:
 *   get:
 *     summary: Get all saved jobs for current user
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     description: Only job seekers can access saved jobs
 *     responses:
 *       200:
 *         description: Saved jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Saved jobs fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedJob'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Save a job
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     description: Only job seekers can save jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Job saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job saved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SavedJob'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/saved-jobs/check/{jobId}:
 *   get:
 *     summary: Check if a job is saved by the user
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     description: Only job seekers can check saved status
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID to check
 *     responses:
 *       200:
 *         description: Saved status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Saved status checked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isSaved:
 *                       type: boolean
 *                       example: true
 *                     savedJobId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/saved-jobs/check-batch:
 *   post:
 *     summary: Check if multiple jobs are saved by the user
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     description: Batch operation to check saved status for multiple jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobIds
 *             properties:
 *               jobIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["123e4567-e89b-12d3-a456-426614174000", "223e4567-e89b-12d3-a456-426614174001"]
 *     responses:
 *       200:
 *         description: Batch saved status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Batch saved status checked successfully
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       isSaved:
 *                         type: boolean
 *                       savedJobId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/saved-jobs/{savedJobId}:
 *   delete:
 *     summary: Remove a saved job
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     description: Only job seekers can remove saved jobs
 *     parameters:
 *       - in: path
 *         name: savedJobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Saved job ID to remove
 *     responses:
 *       200:
 *         description: Saved job removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Saved job removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

export {};
