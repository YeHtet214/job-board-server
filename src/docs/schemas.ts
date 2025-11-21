/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum:
 *         - EMPLOYER
 *         - JOBSEEKER
 *       description: User role in the system
 *
 *     JobType:
 *       type: string
 *       enum:
 *         - FULL_TIME
 *         - PART_TIME
 *         - CONTRACT
 *         - INTERNSHIP
 *         - REMOTE
 *       description: Type of job employment
 *
 *     ApplicationStatus:
 *       type: string
 *       enum:
 *         - PENDING
 *         - INTERVIEW
 *         - ACCEPTED
 *         - REJECTED
 *       description: Status of job application
 *
 *     Industry:
 *       type: string
 *       enum:
 *         - Technology
 *         - Healthcare
 *         - Finance
 *         - Education
 *         - Manufacturing
 *         - Retail
 *         - Hospitality
 *         - Media
 *         - Transportation
 *         - Construction
 *       description: Industry type for companies
 *
 *     CompanySize:
 *       type: string
 *       enum:
 *         - 1-10
 *         - 11-50
 *         - 51-200
 *         - 201-500
 *         - 500+
 *       description: Company size range
 *
 *     NotiType:
 *       type: string
 *       enum:
 *         - New_Message
 *         - Job_Application
 *         - Application_Status_Update
 *       description: Type of notification
 *
 *     NotiStatus:
 *       type: string
 *       enum:
 *         - PENDING
 *         - DELIVERED
 *         - READ
 *       description: Status of notification
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique user identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         firstName:
 *           type: string
 *           description: User first name
 *         lastName:
 *           type: string
 *           description: User last name
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         phone:
 *           type: string
 *           nullable: true
 *           description: User phone number
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether email is verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         bio:
 *           type: string
 *           description: User biography
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user skills
 *         education:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               institution:
 *                 type: string
 *               degree:
 *                 type: string
 *               fieldOfStudy:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *         experience:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *         resumeUrl:
 *           type: string
 *           nullable: true
 *           description: URL to uploaded resume
 *         profileImageURL:
 *           type: string
 *           nullable: true
 *           description: URL to profile image
 *         linkedInUrl:
 *           type: string
 *           nullable: true
 *         githubUrl:
 *           type: string
 *           nullable: true
 *         portfolioUrl:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ownerId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           description: Company name
 *         description:
 *           type: string
 *           description: Company description
 *         logo:
 *           type: string
 *           nullable: true
 *           description: URL to company logo
 *         website:
 *           type: string
 *           nullable: true
 *           description: Company website URL
 *         location:
 *           type: string
 *           description: Company location
 *         industry:
 *           $ref: '#/components/schemas/Industry'
 *         foundedYear:
 *           type: string
 *           description: Year company was founded
 *         size:
 *           $ref: '#/components/schemas/CompanySize'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         postedById:
 *           type: string
 *           format: uuid
 *         companyId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         location:
 *           type: string
 *           nullable: true
 *           description: Job location
 *         type:
 *           $ref: '#/components/schemas/JobType'
 *         salaryMin:
 *           type: integer
 *           nullable: true
 *           description: Minimum salary
 *         salaryMax:
 *           type: integer
 *           nullable: true
 *           description: Maximum salary
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *           description: Required skills for the job
 *         experienceLevel:
 *           type: string
 *           nullable: true
 *           description: Required experience level
 *         isActive:
 *           type: boolean
 *           description: Whether job is active
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Job expiration date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         company:
 *           $ref: '#/components/schemas/Company'
 *
 *     JobApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         jobId:
 *           type: string
 *           format: uuid
 *         applicantId:
 *           type: string
 *           format: uuid
 *         resumeUrl:
 *           type: string
 *           nullable: true
 *           description: URL to application resume
 *         acceptTerms:
 *           type: boolean
 *           description: Whether applicant accepted terms
 *         additionalInfo:
 *           type: string
 *           nullable: true
 *           description: Additional information from applicant
 *         coverLetter:
 *           type: string
 *           nullable: true
 *           description: Cover letter text
 *         status:
 *           $ref: '#/components/schemas/ApplicationStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     SavedJob:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         jobId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         job:
 *           $ref: '#/components/schemas/Job'
 *
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         isDirect:
 *           type: boolean
 *           description: Whether conversation is direct message
 *         directKey:
 *           type: string
 *           nullable: true
 *           description: Unique key for direct conversations
 *         createdAt:
 *           type: string
 *           format: date-time
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConversationParticipant'
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *
 *     ConversationParticipant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         conversationId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         lastReadAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         conversationId:
 *           type: string
 *           format: uuid
 *         senderId:
 *           type: string
 *           format: uuid
 *         body:
 *           type: string
 *           description: Message content
 *         meta:
 *           type: object
 *           nullable: true
 *           description: Additional metadata (attachments, etc.)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         receiverId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         type:
 *           $ref: '#/components/schemas/NotiType'
 *         payload:
 *           type: object
 *           description: Notification payload data
 *         status:
 *           $ref: '#/components/schemas/NotiStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Items per page
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

export {};
