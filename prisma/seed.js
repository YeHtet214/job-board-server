"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// ----------------------------- Utilities -----------------------------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const pickManyUnique = (arr, count) => {
    const set = new Set();
    while (set.size < Math.min(count, arr.length)) {
        set.add(pick(arr));
    }
    return Array.from(set);
};
const daysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};
const daysAgo = (days) => {
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
    'Alex', 'Sam', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Cameron', 'Morgan',
    'Quinn', 'Charlie', 'Drew', 'Elliot', 'Harper', 'Logan', 'Emerson', 'Peyton', 'Sage', 'Skyler',
    'Kai', 'Rowan', 'Reese', 'Finley', 'Dakota'
];
const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];
const locations = [
    'San Francisco, USA', 'New York, USA', 'London, UK', 'Berlin, Germany', 'Singapore', 'Sydney, Australia',
    'Toronto, Canada', 'Remote', 'Tokyo, Japan', 'Paris, France', 'Bangalore, India', 'Dublin, Ireland'
];
const companyNamePrefixes = [
    'Acme', 'Nova', 'Quantum', 'Vertex', 'Pioneer', 'Nimbus', 'Apex', 'Summit', 'Atlas', 'Orbit', 'Aurora', 'Fusion', 'Titan', 'Vanguard'
];
const companyNameSuffixes = [
    'Tech', 'Solutions', 'Labs', 'Systems', 'Networks', 'Dynamics', 'Industries', 'Studios', 'Works', 'Software', 'Holdings'
];
const companySizes = ['Startup_1_10', 'Small_11_50', 'Medium_51_200', 'Large_201_500', 'Enterprise_500_plus'];
const skillPool = [
    'JavaScript', 'TypeScript', 'Node.js', 'React', 'Angular', 'Vue', 'Express', 'NestJS', 'Prisma', 'PostgreSQL', 'MongoDB',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Redis', 'RabbitMQ', 'GraphQL', 'REST', 'CI/CD', 'Jest', 'Mocha', 'Cypress',
    'HTML', 'CSS', 'Tailwind', 'Sass', 'Next.js', 'Python', 'Django', 'Flask', 'Go', 'Rust', 'Java', 'Spring', 'C#', '.NET'
];
const jobTitles = [
    'Software Engineer', 'Backend Engineer', 'Frontend Engineer', 'Full-Stack Developer', 'DevOps Engineer', 'Data Engineer',
    'QA Engineer', 'SRE', 'Product Manager', 'Mobile Developer', 'Cloud Engineer', 'AI Engineer', 'ML Engineer'
];
// Enum values provided as strings to avoid direct dependency on client enum types
const industries = [
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
const jobTypes = [
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
function randomCompanyName(i) {
    const name = `${pick(companyNamePrefixes)} ${pick(companyNameSuffixes)}`;
    return i ? `${name} ${i}` : name;
}
function randomBio(role) {
    if (role === 'EMPLOYER') {
        return 'Experienced professional managing teams and driving product vision.';
    }
    return 'Passionate developer focused on building scalable, high-quality software.';
}
function makeEducation() {
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
function makeExperience() {
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
function randomWebsite(companyName) {
    const slug = companyName.toLowerCase().replace(/\s+/g, '');
    return `https://www.${slug}.com`;
}
function randomSalary(type) {
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
function randomEmail(prefix, index) {
    return `${prefix}.${index}@example.com`;
}
// ----------------------------- Main Seed -----------------------------
function clearDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete child tables before parents to avoid FK issues
        yield prisma.notification.deleteMany();
        yield prisma.message.deleteMany();
        yield prisma.conversationParticipant.deleteMany();
        yield prisma.conversation.deleteMany();
        yield prisma.jobView.deleteMany();
        yield prisma.savedJob.deleteMany();
        yield prisma.jobApplication.deleteMany();
        yield prisma.refreshToken.deleteMany();
        yield prisma.job.deleteMany();
        yield prisma.company.deleteMany();
        yield prisma.profile.deleteMany();
        yield prisma.blacklistedToken.deleteMany();
        yield prisma.user.deleteMany();
    });
}
function seedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const employers = [];
        const seekers = [];
        const password = yield bcrypt_1.default.hash("user123", 10);
        for (let i = 1; i <= EMPLOYER_COUNT; i++) {
            const { firstName, lastName } = randomName();
            const email = randomEmail('employer', i);
            const user = yield prisma.user.create({
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
            yield prisma.profile.create({
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
            const user = yield prisma.user.create({
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
            yield prisma.profile.create({
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
    });
}
function seedCompanies(employers) {
    return __awaiter(this, void 0, void 0, function* () {
        const companies = [];
        for (let i = 0; i < employers.length; i++) {
            const owner = employers[i];
            const name = randomCompanyName(i + 1);
            const company = yield prisma.company.create({
                data: {
                    ownerId: owner.id,
                    name,
                    description: `We are ${name}, focused on innovation and excellence across ${pick(industries)} solutions.`,
                    logo: null,
                    website: randomWebsite(name),
                    location: pick(locations),
                    industry: pick(industries),
                    foundedYear: String(randInt(1985, 2022)),
                    size: pick(companySizes),
                },
            });
            companies.push(company);
        }
        return companies;
    });
}
function randomJobDescription(title, companyName) {
    return `${companyName} is seeking a ${title} to join our team. The ideal candidate has strong communication, collaboration, and technical skills. Responsibilities include delivering features, writing tests, and improving reliability.`;
}
function seedJobs(companies) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobs = [];
        for (let i = 1; i <= JOB_COUNT; i++) {
            const company = pick(companies);
            const postedById = company.ownerId;
            const type = pick(jobTypes);
            const { min, max } = randomSalary(type);
            const salaryMin = randInt(min, Math.floor((min + max) / 2));
            const salaryMax = randInt(salaryMin + 1000, max);
            const title = pick(jobTitles);
            const job = yield prisma.job.create({
                data: {
                    postedById,
                    companyId: company.id,
                    title,
                    description: randomJobDescription(title, company.name),
                    location: Math.random() > 0.15 ? pick(locations) : null,
                    type: type,
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
    });
}
function seedApplicationsSavesViews(jobs, seekers) {
    return __awaiter(this, void 0, void 0, function* () {
        // Applications
        let applicationCount = 0;
        for (const job of jobs) {
            const applicants = pickManyUnique(seekers, randInt(MIN_APPLICATIONS_PER_JOB, MAX_APPLICATIONS_PER_JOB));
            for (const applicant of applicants) {
                yield prisma.jobApplication.create({
                    data: {
                        jobId: job.id,
                        applicantId: applicant.id,
                        resumeUrl: Math.random() > 0.3 ? `https://resumes.example.com/${applicant.id}.pdf` : null,
                        acceptTerms: true,
                        additionalInfo: Math.random() > 0.6 ? 'Open to relocation and remote opportunities.' : null,
                        coverLetter: Math.random() > 0.6 ? 'I am excited to apply for this position as my skills match the requirements closely.' : null,
                        status: pick(['PENDING', 'INTERVIEW', 'REJECTED', 'ACCEPTED']),
                    },
                });
                applicationCount++;
                // Notification to employer about job application
                yield prisma.notification.create({
                    data: {
                        receiverId: job.postedById,
                        type: 'Job_Application',
                        payload: {
                            jobId: job.id,
                            applicantId: applicant.id,
                            message: 'New job application received.',
                        },
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
                yield prisma.savedJob.create({
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
                yield prisma.jobView.create({
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
    });
}
function seedMessagingAndNotifications(employers, seekers) {
    return __awaiter(this, void 0, void 0, function* () {
        const conversations = [];
        const directKeys = new Set();
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
            const conv = yield prisma.conversation.create({
                data: {
                    isDirect: true,
                    directKey,
                },
            });
            conversations.push(conv);
            yield prisma.conversationParticipant.createMany({
                data: [
                    { conversationId: conv.id, userId: a.id },
                    { conversationId: conv.id, userId: b.id },
                ],
            });
            const msgCount = randInt(1, 4);
            for (let m = 0; m < msgCount; m++) {
                const sender = Math.random() > 0.5 ? a : b;
                const receiver = sender.id === a.id ? b : a;
                const body = sender.id === a.id
                    ? m === 0
                        ? 'Hello, I am interested in your opening.'
                        : 'Can we discuss the role further?'
                    : m === 0
                        ? 'Hello! Thanks for reaching out.'
                        : 'Sure, let’s schedule a call.';
                const message = yield prisma.message.create({
                    data: {
                        conversationId: conv.id,
                        senderId: sender.id,
                        body,
                        createdAt: daysAgo(randInt(0, 20)),
                        meta: Math.random() > 0.9 ? { attachments: [] } : client_1.Prisma.JsonNull,
                    },
                });
                messagesCreated++;
                yield prisma.notification.create({
                    data: {
                        receiverId: receiver.id,
                        type: 'New_Message',
                        payload: {
                            conversationId: conv.id,
                            messageId: message.id,
                            from: sender.id,
                        },
                        status: 'PENDING',
                    },
                });
                notificationsCreated++;
            }
        }
        return { conversationsCreated: conversations.length, messagesCreated, notificationsCreated };
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Clearing database...');
        yield clearDatabase();
        console.log(`Seeding users: ${EMPLOYER_COUNT} employers, ${JOBSEEKER_COUNT} seekers...`);
        const { employers, seekers } = yield seedUsers();
        console.log(`Seeding companies for employers (${employers.length})...`);
        const companies = yield seedCompanies(employers);
        console.log(`Seeding jobs (${JOB_COUNT})...`);
        const jobs = yield seedJobs(companies);
        console.log('Seeding applications, saved jobs, and views...');
        const { applicationCount, savedCount, viewCount } = yield seedApplicationsSavesViews(jobs, seekers);
        console.log('Seeding messaging and notifications...');
        const { conversationsCreated, messagesCreated, notificationsCreated } = yield seedMessagingAndNotifications(employers, seekers);
        const summary = {
            counts: {
                users: yield prisma.user.count(),
                profiles: yield prisma.profile.count(),
                employers: employers.length,
                jobseekers: seekers.length,
                companies: yield prisma.company.count(),
                jobs: yield prisma.job.count(),
                applications: yield prisma.jobApplication.count(),
                savedJobs: yield prisma.savedJob.count(),
                jobViews: yield prisma.jobView.count(),
                conversations: yield prisma.conversation.count(),
                messages: yield prisma.message.count(),
                notifications: yield prisma.notification.count(),
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
    });
}
main()
    .catch((e) => {
    console.error('Seed error:', e);
    process.exitCode = 1;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    // Ensure process exits for Prisma seed
    process.exit();
}));
