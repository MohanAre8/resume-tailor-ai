import * as fs from 'fs';
import { researcherAgent, tailorAgent, criticAgent } from '../src/lib/agents/nodes';
import { GraphStateType } from '../src/lib/agents/state';

async function testNikeSE() {
    const jd = `Software Engineer - Nike Inc.- Beaverton, OR. Develop, code, configure, and test programs, systems and solutions independently with minimal supervision in order to meet defined digital product specifications; advise product owners on discrete technology-related business problems; formulate options, including assessing their relative merits and risks; create robust advanced analytics and machine learning solutions that have a direct impact on the business; work with product owners to determine the best solution; help design and build scalable software solutions to implement and integrate new technologies; build and implement scalable applications that leverage prediction models and optimization programs to deliver data driven decisions that result in immense business impact; lead the development of a technical solution that meets the needs of the business and aligns with architectural standards; contribute to core advanced analytics and machine learning platforms and tools to enable both prediction and optimization model development; solve machine learning problems at scale and evolve existing platforms; and develop products focused primarily on consumer data. Telecommuting is available from anywhere in the U.S., except from AK, AL, AR, DE, HI, IA, ID, IN, KS, KY, LA, MT, ND, NE, NH, NM, NV, OH, OK, RI, SD, VT, WV, and WY. 

Must have a Master’s degree in Computer Science or Computer Engineering and 24 months of experience in the job offered or in an engineering-related occupation. Position requires: 

• Cloud-based distributed systems 

• REST APIs microservices 

• Front End Frameworks including React, Angular, and Vue.js 

• AWS tools such as Lambda, Dynamodb, Elastise and Arch/API Gateway 

• Jenkins using CI/CD 

• Terraform 

• Modern Testing Frameworks including Mocha, Jasmine, and Vitest 

• Architectural Design Patterns 

• Git 

• Jira`;

    const sampleResume = `# John Doe
Technical Lead & Full Stack Engineer

## SUMMARY
Experienced engineer with 5+ years of building scalable web applications and cloud infrastructure. Proficient in React, Node.js, and AWS.

## EXPERIENCE
### TechCorp | Senior Engineer | 2021 - Present
- Built a microservices architecture using Node.js and AWS.
- Managed CI/CD pipelines with GitHub Actions.
- Mentored junior engineers and led system design reviews.

## EDUCATION
- Master's in Computer Science, Stanford University
`;

    let state: GraphStateType = {
        companyName: "Nike",
        roleTitle: "Software Engineer",
        jobDescription: jd,
        baseResume: sampleResume,
        currentTailoredResume: "",
        researchInsights: "",
        companyInsights: "",
        currentScore: 0,
        originalScore: 0,
        criticFeedback: "",
        resumeHTML: "",
        tailorIterations: 0,
        messages: [],
        scoreHistory: [],
        improvedSections: ""
    };

    console.log("--- Starting Nike SE Test ---");
    
    try {
        // 1. Research
        console.log("Running Researcher...");
        const res = await researcherAgent(state);
        state.researchInsights = res.researchInsights || "";
        console.log("Researcher Insights Got.");

        // 2. Tailor
        console.log("Running Tailor...");
        const tail = await tailorAgent(state);
        state.currentTailoredResume = tail.currentTailoredResume || "";
        state.tailorIterations += tail.tailorIterations || 0;
        console.log("Tailored Resume Produced.");

        // 3. Critic
        console.log("Running Critic...");
        const crit = await criticAgent(state);
        state.currentScore = crit.currentScore || 0;
        state.criticFeedback = crit.criticFeedback || "";
        console.log(`Final ATS Score: ${state.currentScore}`);
        console.log(`Feedback: ${state.criticFeedback}`);

        fs.writeFileSync('test_output_nike_se.md', state.currentTailoredResume);
        console.log("Saved tailored resume to test_output_nike_se.md");
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testNikeSE();
