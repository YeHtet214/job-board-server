/**
 * @swagger
 * /api/dashboard/jobseeker:
 *   get:
 *     summary: Get job seeker dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Get dashboard data for job seekers including applications, saved jobs, and profile completion
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
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
 *                   example: Dashboard data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobApplication'
 *                     savedJobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedJob'
 *                     profileCompletion:
 *                       type: object
 *                       properties:
 *                         percentage:
 *                           type: number
 *                           example: 75
 *                         missingFields:
 *                           type: array
 *                           items:
 *                             type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalApplications:
 *                           type: integer
 *                           example: 15
 *                         pendingApplications:
 *                           type: integer
 *                           example: 8
 *                         interviewApplications:
 *                           type: integer
 *                           example: 3
 *                         acceptedApplications:
 *                           type: integer
 *                           example: 2
 *                         rejectedApplications:
 *                           type: integer
 *                           example: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/dashboard/jobseeker/applications/{id}:
 *   delete:
 *     summary: Withdraw a job application
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Job seekers can withdraw their applications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
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
 *                   example: Application withdrawn successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/dashboard/employer:
 *   get:
 *     summary: Get employer dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Get dashboard data for employers including posted jobs, applications, and company profile
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
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
 *                   example: Dashboard data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *                     jobs:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Job'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   applications:
 *                                     type: integer
 *                     recentApplications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobApplication'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalJobs:
 *                           type: integer
 *                           example: 10
 *                         activeJobs:
 *                           type: integer
 *                           example: 7
 *                         totalApplications:
 *                           type: integer
 *                           example: 45
 *                         pendingApplications:
 *                           type: integer
 *                           example: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/dashboard/employer/applications/{id}:
 *   put:
 *     summary: Update application status
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Employers can update the status of applications for their job postings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/ApplicationStatus'
 *     responses:
 *       200:
 *         description: Application status updated successfully
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
 *                   example: Application status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobApplication'
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
 * /api/dashboard/employer/profile-completion:
 *   get:
 *     summary: Get company profile completion status
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Get the completion status of the employer's company profile
 *     responses:
 *       200:
 *         description: Profile completion status fetched successfully
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
 *                   example: Profile completion status fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     percentage:
 *                       type: number
 *                       example: 80
 *                     missingFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["logo", "website"]
 *                     company:
 *                       $ref: '#/components/schemas/Company'
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
