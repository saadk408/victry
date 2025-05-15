# Victry: AI-Powered Resume Builder - Masterplan

## 1. Application Overview

Victry is an AI-powered resume builder designed to dramatically reduce the time and stress associated with resume tailoring while maintaining authenticity and ATS compatibility. It achieves this through a user-friendly interface, intelligent AI-assisted content generation, and transparent resume optimization.

### Core Value Propositions

- **Time Efficiency**: Transform hours of resume tailoring into minutes
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems
- **Emotional Support**: Reduce anxiety associated with resume writing
- **Authentic Voice**: Preserve the user's unique voice in AI-assisted content
- **Transparency**: Clear visibility into how AI is helping and why changes are suggested

## 2. Target Audience

- **Primary Users**: White-collar professionals aged 25-45 in technology, finance, marketing, consulting, sales, operations, and healthcare
- **Experience Level**: Mid-career individuals with multiple jobs pursuing mid to upper-level positions
- **Context**: Users who are typically pressed for time, often job searching while employed
- **Technical Comfort**: Tech-savvy individuals with varying degrees of comfort with AI tools
- **Emotional State**: People experiencing stress and anxiety about the job search process

## 3. Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15.2.3 with React 19 and TypeScript 5.8.2
- **Styling**: Tailwind CSS 3.4.17 with ShadCN components
- **Animation**: Framer Motion 10.16.4 for smooth transitions and UI feedback
- **State Management**: React Context API for simple state, potentially Zustand for complex state

### Backend & Services

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API Layer**: Next.js API routes as middleware
- **AI Integration**: Claude 3.7 via API

### Infrastructure

- **Hosting**: Vercel for frontend and API routes
- **Database Hosting**: Supabase cloud
- **CI/CD**: Vercel's built-in deployment pipeline

## 4. Core Features & Implementation Plan

### 4.1 User Authentication & Profiles

- Email/password and social login via Supabase Auth
- User profiles with subscription status
- Account management and settings

### 4.2 Resume Management

- Create and manage base resumes
- View and organize job-tailored resumes
- Browse template gallery
- Import existing resumes

### 4.3 Resume Editor

- Two-panel interface (form editor + live preview)
- Collapsible section navigation
- Granular editing of all resume components
- Real-time preview updates
- Template switching

### 4.4 AI-Powered Tailoring Engine

- Job description analysis middleware
- Keyword extraction and matching
- Voice preservation algorithm
- Tailoring intensity controls
- Highlight AI-suggested changes

### 4.5 ATS Optimization System

- ATS compatibility score
- Keyword analysis dashboard
- Format validation
- Parsing simulation

### 4.6 Multi-Version Resume Management

- Base template management
- Version history and tracking
- Application tracking integration
- Easy duplication and modification

### 4.7 Cover Letter Generation

- Template selection
- Content synchronization with resume
- Tone customization
- Personal connection paragraph builder

## 5. Database Schema

### Primary Tables

1. **users**

   - User authentication and profile information

2. **base_resumes**

   - Main table for storing core resume information

3. **tailored_resumes**

   - Job-specific versions linked to base resumes and job descriptions

4. **job_descriptions**

   - Stored job postings for tailoring

5. **job_analysis**
   - AI-extracted data from job descriptions

### Resume Content Tables

6. **resume_target_job_titles**

   - Target job positions

7. **resume_personal_info**

   - Contact and personal details

8. **resume_professional_summaries**

   - Executive summaries and profiles

9. **resume_work_experiences**

   - Job history entries

10. **resume_work_bullets**

    - Individual bullet points for each work experience

11. **resume_volunteer_experiences**

    - Volunteer work entries

12. **resume_volunteer_bullets**

    - Individual bullet points for volunteer experiences

13. **resume_education**

    - Educational background

14. **resume_certifications**

    - Professional certifications

15. **resume_skills**

    - Skills and competencies

16. **resume_projects**

    - Project showcase entries

17. **resume_project_bullets**

    - Individual bullet points for projects

18. **resume_social_links**

    - Social media and web presence

19. **resume_custom_sections**

    - User-defined additional sections

20. **resume_custom_entries**
    - Content for custom sections

## 6. AI Integration Strategy

### AI Implementation Approach

- **Middleware Layer**: Use Next.js API routes to securely handle Claude 3.7 API calls
- **Prompt Engineering**: Create structured prompts for different resume elements
- **Caching Strategy**: Implement hybrid approach for AI suggestions
  - Cache common suggestions
  - Store job-specific suggestions
  - Generate on-demand for interactive editing
  - Smart caching for quick responses

### AI Features

1. **Resume Parsing**: Extract structured data from uploaded resumes
2. **Job Description Analysis**: Identify requirements, keywords, and company values
3. **Content Enhancement**: Improve existing bullet points while preserving voice
4. **Keyword Optimization**: Suggest relevant keywords based on job requirements
5. **Resume Scoring**: Evaluate resume quality and ATS compatibility
6. **Cover Letter Generation**: Create targeted cover letters based on resume and job

## 7. User Interface Design Principles

### Layout Structure

- **Navigation**: Clear, intuitive dashboard with tabs for main functions
- **Editor**: Two-panel design with form inputs and live preview
- **AI Integration**: Visual highlighting of AI suggestions with accept/reject controls

### Visual Design

- **Color Scheme**: Calm, professional palette to reduce stress
- **Typography**: Clean, readable fonts that render well in both UI and resumes
- **Components**: ShadCN as the UI component library foundation

### Interaction Design

- **Progressive Disclosure**: Show essential controls first, reveal advanced options as needed
- **Feedback Loops**: Clear visual feedback for AI processes and updates
- **Confidence Building**: Positive reinforcement through progress indicators and scores

## 8. Development Phases

### Phase 1: MVP Core Functionality (1-2 months)

- Basic user authentication
- Resume editor with core sections
- PDF export
- Simple ATS checker
- 2-3 basic ATS-compatible templates

### Phase 2: AI Enhancement (1-2 months)

- Claude 3.7 integration
- Job description analysis
- Resume tailoring suggestions
- Initial version of resume scoring

### Phase 3: Advanced Features (1-2 months)

- Multi-version management
- Cover letter generation
- Template expansion
- Enhanced job matching

### Phase 4: Polish & Optimization (1 month)

- UI/UX refinements
- Performance optimization
- Enhanced mobile experience
- User feedback implementation

## 9. File Upload & Processing Strategy

### Resume Parsing Implementation

- Use PDF.js for extracting text from PDF files
- Implement docx-parser/mammoth.js for Word documents
- Structure the extraction process through the middleware layer
- Store original files in Supabase Storage
- Parse and normalize extracted content into structured database format

### Hybrid Storage Approach

1. Store original resume file as reference
2. Extract and structure content in database
3. Use structured content for AI operations and editing
4. Maintain ability to generate new PDFs from structured content

## 10. Testing Strategy

### Frontend Testing

- Component tests with React Testing Library
- E2E tests with Cypress for critical flows
- Visual testing with Storybook

### Backend Testing

- API endpoint tests
- Database operation tests
- AI integration tests with mocked responses

### User Testing

- Usability testing sessions with target users
- A/B testing for key features
- Performance and load testing

## 11. Security Considerations

- Implement proper Supabase Row-Level Security
- Secure API keys in environment variables
- Regular security audits
- GDPR and privacy compliance
- Data encryption for sensitive information

## 12. Monetization Strategy

### Freemium Model

- **Free Tier**:

  - Create and export up to 3 different resume versions
  - Basic ATS compatibility checking
  - Limited AI tailoring suggestions
  - PDF export capability

- **Premium Subscription**:

  - Unlimited resume versions and exports
  - Advanced ATS optimization
  - Full AI tailoring capabilities
  - Cover letter generation
  - Version history and tracking

- **One-Time Purchase Options**:
  - "Job Search Campaign" package (90-day access)
  - "Single Application" pass (one-time full access)

## 13. Potential Challenges & Solutions

### Technical Challenges

1. **Resume Parsing Accuracy**

   - Solution: Implement multiple parsing approaches and combine results
   - Solution: Allow user correction of parsed content

2. **AI Response Time**

   - Solution: Implement background processing for longer operations
   - Solution: Use staged loading indicators and progressive enhancement

3. **ATS Simulation Accuracy**
   - Solution: Test with multiple real ATS systems
   - Solution: Focus on bulletproof formatting rather than perfect simulation

### Business Challenges

1. **Building User Trust in AI**

   - Solution: Transparent AI with clear explanations
   - Solution: Allow granular control over AI suggestions

2. **Competing with Established Resume Builders**

   - Solution: Focus on unique AI tailoring value proposition
   - Solution: Emphasize time-saving benefits with actual metrics

3. **Scaling AI Costs**
   - Solution: Implement tiered AI usage based on subscription
   - Solution: Optimize prompts for efficiency and caching

## 14. Future Expansion Possibilities

- **LinkedIn Integration**: One-click update of LinkedIn with resume content
- **Job Application Tracking**: Track applications, interviews, and offers
- **Interview Preparation**: AI-powered interview question preparation
- **Career Progression Tools**: Skill gap analysis and career path recommendations
- **Team Collaboration**: Allow trusted reviewers to provide feedback

## 15. Resources & Learning Path

As this is your first web application, here are resources to help you succeed:

### Next.js & React

- Next.js Documentation: https://nextjs.org/docs
- React Documentation: https://react.dev/
- TypeScript with React: https://react-typescript-cheatsheet.netlify.app/

### UI Development

- Tailwind CSS: https://tailwindcss.com/docs
- ShadCN Components: https://ui.shadcn.com/
- Framer Motion: https://www.framer.com/motion/

### Supabase

- Supabase Documentation: https://supabase.com/docs
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

### AI Integration

- Anthropic Claude API: https://docs.anthropic.com/claude/reference/getting-started-with-claude

## 16. Conclusion

Victry has the potential to significantly improve the job application process by addressing real pain points in resume creation and tailoring. By focusing on a clean, intuitive interface combined with powerful AI assistance, the application can deliver substantial time savings while maintaining authenticity and optimizing for ATS success.

The approach of building incrementally - starting with core functionality and progressively adding AI features - will allow for early validation and user feedback while managing the technical complexity. The hybrid database structure provides the flexibility needed for both structured editing and comprehensive resume management.

This masterplan provides a solid foundation for development, but should be treated as a living document that evolves as you gain more insights during the build process.
