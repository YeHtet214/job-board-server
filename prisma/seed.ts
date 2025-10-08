import { PrismaClient, UserRole, JobType, ApplicationStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (optional - be careful in production!)
  await prisma.blacklistedToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.jobView.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const employer1 = await prisma.user.create({
    data: {
      email: 'employer@techcorp.com',
      passwordHash: await hash('password123', 12),
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.EMPLOYER,
      phone: '+1234567890',
      isEmailVerified: true,
    },
  });

  const employer2 = await prisma.user.create({
    data: {
      email: 'recruiter@startup.io',
      passwordHash: await hash('password123', 12),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.EMPLOYER,
      phone: '+0987654321',
      isEmailVerified: true,
    },
  });

  const jobSeeker1 = await prisma.user.create({
    data: {
      email: 'alice.dev@email.com',
      passwordHash: await hash('password123', 12),
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.JOBSEEKER,
      phone: '+1122334455',
      isEmailVerified: true,
    },
  });

  const jobSeeker2 = await prisma.user.create({
    data: {
      email: 'bob.engineer@email.com',
      passwordHash: await hash('password123', 12),
      firstName: 'Bob',
      lastName: 'Wilson',
      role: UserRole.JOBSEEKER,
      phone: '+5566778899',
      isEmailVerified: true,
    },
  });

  console.log('Created users');

  // Create profiles for job seekers
  await prisma.profile.create({
    data: {
      userId: jobSeeker1.id,
      bio: 'Passionate full-stack developer with 3+ years of experience in modern web technologies. Love building scalable applications and learning new technologies.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          school: 'University of Technology',
          year: '2020',
          field: 'Computer Science'
        }
      ],
      experience: [
        {
          title: 'Full Stack Developer',
          company: 'Tech Solutions Inc',
          startDate: '2021-01-01',
          endDate: '2023-12-31',
          current: false,
          description: 'Developed and maintained web applications using React and Node.js'
        }
      ],
      resumeUrl: 'https://example.com/resumes/alice-johnson.pdf',
      linkedInUrl: 'https://linkedin.com/in/alicejohnson',
      githubUrl: 'https://github.com/alicejohnson',
      portfolioUrl: 'https://alicejohnson.dev',
    },
  });

  await prisma.profile.create({
    data: {
      userId: jobSeeker2.id,
      bio: 'Backend engineer specializing in distributed systems and microservices. Experienced with Go, Python, and cloud infrastructure.',
      skills: ['Go', 'Python', 'Docker', 'Kubernetes', 'gRPC', 'Redis', 'PostgreSQL'],
      education: [
        {
          degree: 'Master of Software Engineering',
          school: 'Tech Institute',
          year: '2019',
          field: 'Software Engineering'
        }
      ],
      experience: [
        {
          title: 'Backend Engineer',
          company: 'ScaleUp Tech',
          startDate: '2019-06-01',
          endDate: null,
          current: true,
          description: 'Building scalable microservices architecture for high-traffic applications'
        }
      ],
      linkedInUrl: 'https://linkedin.com/in/bobwilson',
      githubUrl: 'https://github.com/bobwilson',
    },
  });

  console.log('Created profiles');

  // Create companies
  const company1 = await prisma.company.create({
    data: {
      ownerId: employer1.id,
      name: 'TechCorp Inc',
      description: 'Leading technology company focused on innovative software solutions. We build products that make a difference.',
      logo: 'https://example.com/logos/techcorp.png',
      website: 'https://techcorp.com',
      location: 'San Francisco, CA',
      industry: 'Software Development',
      foundedYear: '2015',
      size: '500-1000',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      ownerId: employer2.id,
      name: 'StartupXYZ',
      description: 'Fast-growing startup revolutionizing the e-commerce space with AI-powered solutions.',
      logo: 'https://example.com/logos/startupxyz.png',
      website: 'https://startupxyz.com',
      location: 'Austin, TX',
      industry: 'E-commerce & AI',
      foundedYear: '2020',
      size: '50-100',
    },
  });

  console.log('Created companies');

  // Create jobs
  const jobs = await prisma.job.createMany({
    data: [
      {
        postedById: employer1.id,
        companyId: company1.id,
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
        location: 'San Francisco, CA',
        type: JobType.FULL_TIME,
        salaryMin: 120000,
        salaryMax: 160000,
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        experienceLevel: 'Senior',
        expiresAt: new Date('2024-12-31'),
      },
      {
        postedById: employer1.id,
        companyId: company1.id,
        title: 'Frontend Developer',
        description: 'Join our frontend team to build beautiful and responsive user interfaces. Experience with modern JavaScript frameworks required.',
        location: 'Remote',
        type: JobType.REMOTE,
        salaryMin: 90000,
        salaryMax: 120000,
        requiredSkills: ['JavaScript', 'React', 'CSS', 'HTML5', 'Redux'],
        experienceLevel: 'Mid-level',
        expiresAt: new Date('2024-11-30'),
      },
      {
        postedById: employer2.id,
        companyId: company2.id,
        title: 'Backend Engineer - Go',
        description: 'Looking for a backend engineer with Go experience to help scale our microservices architecture. Experience with distributed systems is a plus.',
        location: 'Austin, TX',
        type: JobType.FULL_TIME,
        salaryMin: 110000,
        salaryMax: 140000,
        requiredSkills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'gRPC'],
        experienceLevel: 'Mid-level',
        expiresAt: new Date('2024-10-31'),
      },
      {
        postedById: employer2.id,
        companyId: company2.id,
        title: 'DevOps Engineer',
        description: 'Seeking a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. AWS experience required.',
        location: 'Remote',
        type: JobType.CONTRACT,
        salaryMin: 80000,
        salaryMax: 100000,
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
        experienceLevel: 'Mid-level',
        expiresAt: new Date('2024-09-30'),
      },
      {
        postedById: employer1.id,
        companyId: company1.id,
        title: 'Software Engineering Intern',
        description: 'Summer internship program for aspiring software engineers. Learn from experienced developers and work on real projects.',
        location: 'San Francisco, CA',
        type: JobType.INTERNSHIP,
        salaryMin: 25000,
        salaryMax: 30000,
        requiredSkills: ['Python', 'JavaScript', 'Basic Algorithms'],
        experienceLevel: 'Intern',
        expiresAt: new Date('2024-08-31'),
      },
    ],
  });

  const createdJobs = await prisma.job.findMany();
  console.log('Created jobs');

  // Create job applications
  await prisma.jobApplication.createMany({
    data: [
      {
        jobId: createdJobs[0].id,
        applicantId: jobSeeker1.id,
        resumeUrl: 'https://example.com/resumes/alice-johnson.pdf',
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. My experience with React and Node.js aligns perfectly with your requirements.',
        acceptTerms: true,
        status: ApplicationStatus.PENDING,
      },
      {
        jobId: createdJobs[2].id,
        applicantId: jobSeeker1.id,
        resumeUrl: 'https://example.com/resumes/alice-johnson.pdf',
        coverLetter: 'While my primary experience is with JavaScript/TypeScript, I have been learning Go and would love the opportunity to work with your backend team.',
        acceptTerms: true,
        status: ApplicationStatus.INTERVIEW,
      },
      {
        jobId: createdJobs[2].id,
        applicantId: jobSeeker2.id,
        resumeUrl: 'https://example.com/resumes/bob-wilson.pdf',
        coverLetter: 'I have extensive experience with Go and microservices architecture. I believe I can contribute significantly to your backend systems.',
        acceptTerms: true,
        status: ApplicationStatus.ACCEPTED,
      },
      {
        jobId: createdJobs[1].id,
        applicantId: jobSeeker2.id,
        resumeUrl: 'https://example.com/resumes/bob-wilson.pdf',
        coverLetter: 'Interested in the Frontend Developer position to expand my skills beyond backend development.',
        acceptTerms: true,
        status: ApplicationStatus.REJECTED,
      },
    ],
  });

  console.log('Created job applications');

  // Create saved jobs
  await prisma.savedJob.createMany({
    data: [
      {
        jobId: createdJobs[0].id,
        userId: jobSeeker1.id,
      },
      {
        jobId: createdJobs[3].id,
        userId: jobSeeker1.id,
      },
      {
        jobId: createdJobs[1].id,
        userId: jobSeeker2.id,
      },
    ],
  });

  console.log('Created saved jobs');

  // Create job views
  await prisma.jobView.createMany({
    data: [
      {
        jobId: createdJobs[0].id,
        userId: jobSeeker1.id,
      },
      {
        jobId: createdJobs[0].id,
        userId: jobSeeker2.id,
      },
      {
        jobId: createdJobs[1].id,
        userId: jobSeeker1.id,
      },
      {
        jobId: createdJobs[2].id,
        userId: jobSeeker1.id,
      },
      {
        jobId: createdJobs[2].id,
        userId: jobSeeker2.id,
      },
    ],
  });

  console.log('Created job views');

  // Create conversation and messages
  const conversation = await prisma.conversation.create({
    data: {
      isDirect: true,
      directKey: `${employer2.id}_${jobSeeker2.id}`,
      participants: {
        create: [
          { userId: employer2.id },
          { userId: jobSeeker2.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: employer2.id,
        body: 'Hi Bob! Thanks for applying to our Backend Engineer position. Are you available for a quick chat this week?',
        deliveredAt: new Date(),
        readAt: new Date(),
      },
      {
        conversationId: conversation.id,
        senderId: jobSeeker2.id,
        body: 'Hi Sarah! Yes, I\'m available. Looking forward to learning more about the role.',
        deliveredAt: new Date(),
        readAt: new Date(),
      },
      {
        conversationId: conversation.id,
        senderId: employer2.id,
        body: 'Great! How about Wednesday at 2 PM PST?',
        deliveredAt: new Date(),
      },
    ],
  });

  console.log('Created conversation and messages');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: jobSeeker1.id,
        type: 'application_update',
        payload: {
          message: 'Your application status has been updated',
          applicationId: createdJobs[2].id,
          newStatus: 'INTERVIEW',
        },
        read: false,
      },
      {
        userId: jobSeeker2.id,
        type: 'new_message',
        payload: {
          message: 'You have a new message from Sarah Johnson',
          conversationId: conversation.id,
          senderName: 'Sarah Johnson',
        },
        read: true,
      },
      {
        userId: jobSeeker1.id,
        type: 'job_recommendation',
        payload: {
          message: 'New jobs matching your skills',
          jobIds: [createdJobs[3].id, createdJobs[4].id],
        },
        read: false,
      },
    ],
  });

  console.log('Created notifications');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });