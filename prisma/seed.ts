import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ----------------------------- Utilities -----------------------------
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const pickManyUnique = <T,>(arr: T[], count: number): T[] => {
  const set = new Set<T>();
  while (set.size < Math.min(count, arr.length)) {
    set.add(pick(arr));
  }
  return Array.from(set);
};
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

// ----------------------------- Seed Config -----------------------------
// Companies: 60 (between 50-80 as requested). Jobs: 50 minimum as requested.
const EMPLOYER_COUNT = 60;
const JOBSEEKER_COUNT = 120;
const JOB_COUNT = 50;

const MIN_APPLICATIONS_PER_JOB = 2;
const MAX_APPLICATIONS_PER_JOB = 6;

const MIN_SAVES_PER_JOB = 1;
const MAX_SAVES_PER_JOB = 5;

const MIN_VIEWS_PER_JOB = 5;
const MAX_VIEWS_PER_JOB = 20;

const CONVERSATION_COUNT = 40;

// ----------------------------- Data Pools -----------------------------
const firstNames = [
  'Alex','Sam','Jamie','Taylor','Jordan','Casey','Riley','Avery','Cameron','Morgan',
  'Quinn','Charlie','Drew','Elliot','Harper','Logan','Emerson','Peyton','Sage','Skyler',
  'Kai','Rowan','Reese','Finley','Dakota'
];
const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'
];

const locations = [
  'San Francisco, USA','New York, USA','London, UK','Berlin, Germany','Singapore','Sydney, Australia',
  'Toronto, Canada','Remote','Tokyo, Japan','Paris, France','Bangalore, India','Dublin, Ireland'
];

const companyNamePrefixes = [
  'Acme','Nova','Quantum','Vertex','Pioneer','Nimbus','Apex','Summit','Atlas','Orbit','Aurora','Fusion','Titan','Vanguard'
];
const companyNameSuffixes = [
  'Tech','Solutions','Labs','Systems','Networks','Dynamics','Industries','Studios','Works','Software','Holdings'
];

const companySizes = ['Startup_1_10','Small_11_50','Medium_51_200','Large_201_500','Enterprise_500_plus'];

const skillPool = [
  'JavaScript','TypeScript','Node.js','React','Angular','Vue','Express','NestJS','Prisma','PostgreSQL','MongoDB',
  'Docker','Kubernetes','AWS','GCP','Azure','Redis','RabbitMQ','GraphQL','REST','CI/CD','Jest','Mocha','Cypress',
  'HTML','CSS','Tailwind','Sass','Next.js','Python','Django','Flask','Go','Rust','Java','Spring','C#','.NET'
];

const jobTitles = [
  'Software Engineer','Backend Engineer','Frontend Engineer','Full-Stack Developer','DevOps Engineer','Data Engineer',
  'QA Engineer','SRE','Product Manager','Mobile Developer','Cloud Engineer','AI Engineer','ML Engineer'
];

 // Enum values provided as strings to avoid direct dependency on client enum types
const industries: string[] = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Media',
  'Transportation',
  'Construction',
];

type JobTypeLiteral = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
const jobTypes: JobTypeLiteral[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'REMOTE',
];

const experienceLevels = ['Junior', 'Mid', 'Senior', 'Lead'];

// ----------------------------- Builders -----------------------------
function randomName() {
  return {
    firstName: pick(firstNames),
    lastName: pick(lastNames),
  };
}

function randomCompanyName(i?: number) {
  const name = `${pick(companyNamePrefixes)} ${pick(companyNameSuffixes)}`;
  return i ? `${name} ${i}` : name;
}

function randomBio(role: 'EMPLOYER' | 'JOBSEEKER') {
  if (role === 'EMPLOYER') {
    return 'Experienced professional managing teams and driving product vision.';
  }
  return 'Passionate developer focused on building scalable, high-quality software.';
}

function makeEducation(): Prisma.InputJsonValue {
  const startYear = randInt(2008, 2018);
  const endYear = startYear + randInt(2, 5);
  const degrees = ['BSc Computer Science', 'BEng Software Engineering', 'BSc Information Systems', 'MSc Computer Science'];
  return [
    {
      school: 'University of Technology',
      degree: pick(degrees),
      startYear,
      endYear,
    },
  ];
}

function makeExperience(): Prisma.InputJsonValue {
  const start = randInt(2016, 2022);
  const end = start + randInt(1, 4);
  return [
    {
      company: randomCompanyName(),
      title: pick(jobTitles),
      start: `${start}-0${randInt(1, 9)}`,
      end: `${end}-0${randInt(1, 9)}`,
      responsibilities: [
        'Delivered high-quality features in an agile environment',
        'Collaborated with cross-functional teams',
        'Improved performance and reliability',
      ],
    },
  ];
}

function randomWebsite(companyName: string) {
  const slug = companyName.toLowerCase().replace(/\s+/g, '');
  return `https://www.${slug}.com`;
}

function randomSalary(type: JobTypeLiteral) {
  // Simple ranges per type, in USD
  switch (type) {
    case 'INTERNSHIP':
      return { min: 1500, max: 3000 };
    case 'PART_TIME':
      return { min: 20000, max: 45000 };
    case 'CONTRACT':
      return { min: 60000, max: 110000 };
    case 'REMOTE':
      return { min: 50000, max: 130000 };
    case 'FULL_TIME':
    default:
      return { min: 60000, max: 150000 };
  }
}

function randomEmail(prefix: string, index: number) {
  return `${prefix}.${index}@example.com`;
}

// ----------------------------- Main Seed -----------------------------
async function clearDatabase() {
  // Delete child tables before parents to avoid FK issues
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();

  await prisma.jobView.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobApplication.deleteMany();

  await prisma.refreshToken.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.profile.deleteMany();

  await prisma.blacklistedToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const employers: any[] = [];
  const seekers: any[] = [];
  const password = await bcrypt.hash("user123", 10);

  for (let i = 1; i <= EMPLOYER_COUNT; i++) {
    const { firstName, lastName } = randomName();
    const email = randomEmail('employer', i);
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: password,
        role: 'EMPLOYER',
        phone: `+1-555-01${String(i).padStart(2, '0')}`,
        isEmailVerified: Math.random() > 0.5,
      },
    });
    employers.push(user);

    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: randomBio('EMPLOYER'),
        skills: pickManyUnique(skillPool, randInt(3, 8)),
        education: makeEducation(),
        experience: makeExperience(),
        profileImageURL: null,
        linkedInUrl: `https://www.linkedin.com/in/${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
        githubUrl: null,
        portfolioUrl: null,
        resumeUrl: null,
      },
    });
  }

  for (let i = 1; i <= JOBSEEKER_COUNT; i++) {
    const { firstName, lastName } = randomName();
    const email = randomEmail('seeker', i);
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: password,
        role: 'JOBSEEKER',
        phone: `+1-555-02${String(i).padStart(2, '0')}`,
        isEmailVerified: Math.random() > 0.5,
      },
    });
    seekers.push(user);

    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: randomBio('JOBSEEKER'),
        skills: pickManyUnique(skillPool, randInt(4, 10)),
        education: makeEducation(),
        experience: makeExperience(),
        profileImageURL: null,
        linkedInUrl: `https://www.linkedin.com/in/${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
        githubUrl: `https://github.com/${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
        portfolioUrl: Math.random() > 0.4 ? `https://portfolio.${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}.dev` : null,
        resumeUrl: Math.random() > 0.3 ? `https://resumes.example.com/${user.id}.pdf` : null,
      },
    });
  }

  return { employers, seekers };
}

async function seedCompanies(employers: any[]) {
  const companies: any[] = [];
  for (let i = 0; i < employers.length; i++) {
    const owner = employers[i];
    const name = randomCompanyName(i + 1);
    const company = await prisma.company.create({
      data: {
        ownerId: owner.id,
        name,
        description: `We are ${name}, focused on innovation and excellence across ${pick(industries)} solutions.`,
        logo: null,
        website: randomWebsite(name),
        location: pick(locations),
        industry: pick(industries) as any,
        foundedYear: String(randInt(1985, 2022)),
        size: pick(companySizes) as any,
      },
    });
    companies.push(company);
  }
  return companies;
}

function randomJobDescription(title: string, companyName: string) {
  return `${companyName} is seeking a ${title} to join our team. The ideal candidate has strong communication, collaboration, and technical skills. Responsibilities include delivering features, writing tests, and improving reliability.`;
}

async function seedJobs(companies: any[]) {
  const jobs: any[] = [];
  for (let i = 1; i <= JOB_COUNT; i++) {
    const company = pick(companies);
    const postedById = company.ownerId;

    const type: JobTypeLiteral = pick(jobTypes);
    const { min, max } = randomSalary(type);
    const salaryMin = randInt(min, Math.floor((min + max) / 2));
    const salaryMax = randInt(salaryMin + 1000, max);

    const title = pick(jobTitles);
    const job = await prisma.job.create({
      data: {
        postedById,
        companyId: company.id,
        title,
        description: randomJobDescription(title, company.name),
        location: Math.random() > 0.15 ? pick(locations) : null,
        type: type as any,
        salaryMin,
        salaryMax,
        requiredSkills: pickManyUnique(skillPool, randInt(3, 7)),
        experienceLevel: pick(experienceLevels),
        isActive: Math.random() > 0.1,
        expiresAt: Math.random() > 0.3 ? daysFromNow(randInt(15, 120)) : null,
      },
    });

    jobs.push(job);
  }
  return jobs;
}

async function seedApplicationsSavesViews(jobs: any[], seekers: any[]) {
  // Applications
  let applicationCount = 0;
  for (const job of jobs) {
    const applicants = pickManyUnique(seekers, randInt(MIN_APPLICATIONS_PER_JOB, MAX_APPLICATIONS_PER_JOB));
    for (const applicant of applicants) {
      await prisma.jobApplication.create({
        data: {
          jobId: job.id,
          applicantId: applicant.id,
          resumeUrl: Math.random() > 0.3 ? `https://resumes.example.com/${applicant.id}.pdf` : null,
          acceptTerms: true,
          additionalInfo: Math.random() > 0.6 ? 'Open to relocation and remote opportunities.' : null,
          coverLetter: Math.random() > 0.6 ? 'I am excited to apply for this position as my skills match the requirements closely.' : null,
          status: pick(['PENDING', 'INTERVIEW', 'REJECTED', 'ACCEPTED']) as any,
        },
      });
      applicationCount++;

      // Notification to employer about job application
      await prisma.notification.create({
        data: {
          receiverId: job.postedById,
          type: 'Job_Application',
          payload: {
            jobId: job.id,
            applicantId: applicant.id,
            message: 'New job application received.',
          } as unknown as Prisma.InputJsonValue,
          status: 'PENDING',
        },
      });
    }
  }

  // Saved jobs
  let savedCount = 0;
  for (const job of jobs) {
    const savers = pickManyUnique(seekers, randInt(MIN_SAVES_PER_JOB, MAX_SAVES_PER_JOB));
    for (const saver of savers) {
      await prisma.savedJob.create({
        data: {
          jobId: job.id,
          userId: saver.id,
        },
      });
      savedCount++;
    }
  }

  // Job views
  let viewCount = 0;
  for (const job of jobs) {
    const viewers = pickManyUnique(seekers, randInt(MIN_VIEWS_PER_JOB, MAX_VIEWS_PER_JOB));
    for (const viewer of viewers) {
      await prisma.jobView.create({
        data: {
          jobId: job.id,
          userId: viewer.id,
          createdAt: daysAgo(randInt(0, 60)),
        },
      });
      viewCount++;
    }
  }

  return { applicationCount, savedCount, viewCount };
}

async function seedMessagingAndNotifications(employers: any[], seekers: any[]) {
  const conversations: any[] = [];
  const directKeys = new Set<string>();
  let messagesCreated = 0;
  let notificationsCreated = 0;

  for (let i = 0; i < CONVERSATION_COUNT; i++) {
    let a = pick(seekers);
    let b = pick(employers);
    let directKey = [a.id, b.id].sort().join(':');

    // try to keep direct pairs unique
    let tries = 0;
    while (directKeys.has(directKey) && tries < 5) {
      a = pick(seekers);
      b = pick(employers);
      directKey = [a.id, b.id].sort().join(':');
      tries++;
    }
    if (directKeys.has(directKey)) {
      continue;
    }
    directKeys.add(directKey);

    const conv = await prisma.conversation.create({
      data: {
        isDirect: true,
        directKey,
      },
    });
    conversations.push(conv);

    await prisma.conversationParticipant.createMany({
      data: [
        { conversationId: conv.id, userId: a.id },
        { conversationId: conv.id, userId: b.id },
      ],
    });

    const msgCount = randInt(1, 4);
    for (let m = 0; m < msgCount; m++) {
      const sender = Math.random() > 0.5 ? a : b;
      const receiver = sender.id === a.id ? b : a;
      const body =
        sender.id === a.id
          ? m === 0
            ? 'Hello, I am interested in your opening.'
            : 'Can we discuss the role further?'
          : m === 0
          ? 'Hello! Thanks for reaching out.'
          : 'Sure, let’s schedule a call.';

      const message = await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: sender.id,
          body,
          createdAt: daysAgo(randInt(0, 20)),
          meta: Math.random() > 0.9 ? ({ attachments: [] } as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
      messagesCreated++;

      await prisma.notification.create({
        data: {
          receiverId: receiver.id,
          type: 'New_Message',
          payload: {
            conversationId: conv.id,
            messageId: message.id,
            from: sender.id,
          } as unknown as Prisma.InputJsonValue,
          status: 'PENDING',
        },
      });
      notificationsCreated++;
    }
  }

  return { conversationsCreated: conversations.length, messagesCreated, notificationsCreated };
}

async function main() {
  console.log('Clearing database...');
  await clearDatabase();

  console.log(`Seeding users: ${EMPLOYER_COUNT} employers, ${JOBSEEKER_COUNT} seekers...`);
  const { employers, seekers } = await seedUsers();

  console.log(`Seeding companies for employers (${employers.length})...`);
  const companies = await seedCompanies(employers);

  console.log(`Seeding jobs (${JOB_COUNT})...`);
  const jobs = await seedJobs(companies);

  console.log('Seeding applications, saved jobs, and views...');
  const { applicationCount, savedCount, viewCount } = await seedApplicationsSavesViews(jobs, seekers);

  console.log('Seeding messaging and notifications...');
  const { conversationsCreated, messagesCreated, notificationsCreated } = await seedMessagingAndNotifications(employers, seekers);

  const summary = {
    counts: {
      users: await prisma.user.count(),
      profiles: await prisma.profile.count(),
      employers: employers.length,
      jobseekers: seekers.length,
      companies: await prisma.company.count(),
      jobs: await prisma.job.count(),
      applications: await prisma.jobApplication.count(),
      savedJobs: await prisma.savedJob.count(),
      jobViews: await prisma.jobView.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
      notifications: await prisma.notification.count(),
    },
    seeded: {
      applications: applicationCount,
      savedJobs: savedCount,
      jobViews: viewCount,
      conversations: conversationsCreated,
      messages: messagesCreated,
      notifications: notificationsCreated,
    },
  };

  console.log('Seed summary:\n', JSON.stringify(summary));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Ensure process exits for Prisma seed
    process.exit();
  });
