# Product Requirements Document: Victry Signup Flow

## Document Information
- **Product**: Victry - AI-Powered Resume Builder
- **Feature**: User Signup & Onboarding Flow
- **Version**: 2.0
- **Last Updated**: Current
- **Audience**: Claude Code (AI Development Assistant)
- **Implementation Framework**: Next.js 15.3.2, React 19, Supabase, TypeScript

## Executive Summary

This document specifies a LinkedIn-first signup flow designed for exhausted job seekers aged 22-40. The primary goal is to demonstrate value within 90 seconds by importing LinkedIn data and showing an AI-enhanced resume. The flow prioritizes emotional support, minimal friction, and immediate gratification to combat job search fatigue.

## User Context & Personas

### Primary Persona: "Exhausted Emily"
- **Age**: 28-35
- **Status**: Actively job searching for 2-3 months
- **Pain Points**: 
  - Applied to 100+ jobs with minimal responses
  - Spent hours tailoring resumes manually
  - Skeptical of "another resume tool"
  - Time-pressed (searching while employed)
- **Technical Profile**: Has LinkedIn, comfortable with OAuth
- **Emotional State**: Frustrated, exhausted, needs quick wins

### Secondary Persona: "Cautious Carlos"
- **Age**: 22-28
- **Status**: First major job transition
- **Pain Points**:
  - Unsure if resume is "good enough"
  - Privacy conscious about data sharing
  - Limited resume writing experience
- **Technical Profile**: Prefers email signup
- **Emotional State**: Anxious, needs guidance and validation

## High-Level Flow Architecture

```
Landing Page
    ├── LinkedIn OAuth (Primary Path - 75% of users)
    │   ├── LinkedIn Authorization
    │   ├── Profile Import & Processing
    │   ├── Instant Preview Generation
    │   ├── Job Search Status Selection
    │   └── First Tailoring Experience
    │
    └── Email Signup (Fallback Path - 25% of users)
        ├── Email Entry
        ├── Account Creation
        ├── Manual Resume Entry/Upload
        ├── Guided Profile Building
        └── First Tailoring Experience
```

## Detailed Flow Specifications

### 1. Landing Page Requirements

#### 1.1 Hero Section
- **Primary CTA**: "Import from LinkedIn" (large button, LinkedIn blue)
- **Secondary CTA**: "Start with Email" (text link below)
- **Headline**: Rotate between empathy-focused messages:
  - "Job Search Burnout is Real"
  - "Your Resume Shouldn't Hold You Back"
  - "Land Interviews, Not in Resume Black Holes"
- **Social Proof**: "Join 50,000+ professionals who've escaped resume hell"
- **Trust Signals**: 
  - "No credit card required"
  - "Your data stays private"
  - "Cancel anytime"

#### 1.2 Value Proposition Display
- **Time Saved Calculator**: Interactive element showing hours saved
- **Success Metrics**: "73% of users land interviews within 2 weeks"
- **Feature Preview**: 3-second GIF showing resume transformation

### 2. LinkedIn OAuth Flow (Primary Path)

#### 2.1 OAuth Initiation
**Trigger**: User clicks "Import from LinkedIn"

**Requirements**:
- Display LinkedIn OAuth consent screen
- Request scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`
- Show loading overlay: "Securely connecting to LinkedIn..."
- Include reassurance text: "We'll import your experience, not post anything"

#### 2.2 LinkedIn Callback Handling
**URL Pattern**: `/auth/callback?code={auth_code}&state={state}`

**Success Path**:
1. Exchange authorization code for access token
2. Store tokens securely (encrypted, server-side only)
3. Redirect to `/onboarding/import`
4. Begin profile data fetching

**Error Handling**:
- **User Denied**: Show message "No worries! You can start with email instead"
- **LinkedIn Error**: Fallback to email signup with explanation
- **Rate Limit**: Queue for retry, proceed with email option

#### 2.3 Import & Processing Page
**URL**: `/onboarding/import`

**Layout**: Split screen (50/50)
- Left: Import progress and encouragement
- Right: Live resume preview building progressively

**Left Panel - Import Progress**:
Display sequential progress with these stages:
1. "Connecting to LinkedIn" (0-2 seconds)
2. "Reading your profile" (2-4 seconds)
3. "Importing work experience" (4-7 seconds)
4. "Analyzing your skills" (7-9 seconds)
5. "Optimizing for ATS" (9-12 seconds)
6. "Generating your resume" (12-15 seconds)

**Progress Indicators**:
- Animated progress bar
- Checkmarks for completed steps
- Current step highlighted with spinner
- Estimated time remaining

**Encouragement Messages** (rotate every 3 seconds):
- "Did you know? 75% of resumes never reach human eyes"
- "We're making sure yours gets through"
- "Your experience is impressive - let's make it shine"
- "Almost there! This usually takes 30 minutes manually"

**Right Panel - Live Preview**:
- Start with skeleton/placeholder resume template
- Progressively populate sections as imported:
  1. Name and headline appear first
  2. Current job title
  3. Work experiences (newest first)
  4. Education
  5. Skills extracted from experience
- Apply subtle highlight animation as each section appears
- Show ATS score building up (start at 0, end at calculated score)

#### 2.4 Import Completion Transition
**Duration**: 2-second celebration animation

**Elements**:
- Confetti or success animation
- Large checkmark
- Message: "Resume imported successfully!"
- ATS score reveal with gauge animation
- Immediate CTA: "Let's personalize your experience"

### 3. Personalization Step

#### 3.1 Job Search Status Selection
**URL**: `/onboarding/personalize`

**Layout**: Centered card with three options

**Question**: "What's your job search status?"

**Options** (Radio button cards with icons):

1. **Actively Searching**
   - Icon: Lightning bolt (orange)
   - Description: "I need to land something ASAP"
   - Benefits shown:
     - "Priority ATS optimization"
     - "Daily job matches"
     - "Interview prep tools"

2. **Open to Opportunities**
   - Icon: Search/Eye (blue)
   - Description: "Not desperate, but interested in the right role"
   - Benefits shown:
     - "Weekly curated matches"
     - "Passive optimization"
     - "Market insights"

3. **Planning Ahead**
   - Icon: Trending up arrow (green)
   - Description: "Getting ready for future moves"
   - Benefits shown:
     - "Skills gap analysis"
     - "Career path planning"
     - "Industry trends"

**Interaction Requirements**:
- Hover states show benefit details
- Selection highlights entire card
- "Continue" button enables only after selection
- "Skip for now" link at bottom (tracks as conversion friction)

### 4. First Tailoring Experience

#### 4.1 Initial Setup
**URL**: `/dashboard?firstTime=true`

**Layout**: Full-screen guided experience

**Header Message**: 
- "Let's see Victry in action"
- Subtext: "Paste any job description and watch your resume transform"

#### 4.2 Job Description Input
**Left Panel - Input Section**:

**Components**:
- Large textarea (minimum 10 rows)
- Placeholder: "Paste any job posting here..."
- Character count indicator
- Auto-detect job posting format

**Smart Suggestions Section**:
- Header: "Or try one of these recent postings:"
- Display 3 relevant jobs based on:
  - User's current job title
  - User's industry
  - Popular jobs in their location
- Each suggestion shows:
  - Job title
  - Company name
  - Location
  - "Posted X days ago"
- Clicking suggestion auto-fills textarea

**Validation**:
- Minimum 100 characters
- Detect if content is actually a job description
- Show warning if appears to be resume content

**CTA Button**:
- Text: "Analyze & Tailor Resume"
- Disabled until valid input
- Loading state: "Analyzing job requirements..."

**Right Panel - Current Resume**:
- Header: "Your current resume"
- Subheader: "ATS Score: X%"
- Compact resume preview
- Highlight potential missing keywords in red

#### 4.3 Analysis Animation Sequence
**Duration**: 8-10 seconds total

**Full-screen takeover with steps**:
1. "Reading job requirements..." (0-2s)
   - Show extracted job title and company
2. "Identifying must-have skills..." (2-4s)
   - Display extracted keywords as pills
3. "Matching your experience..." (4-6s)
   - Show percentage match building up
4. "Optimizing for ATS systems..." (6-8s)
   - Display ATS score increasing
5. "Polishing impact statements..." (8-10s)
   - Show "AI Enhancement Active" badge

**Visual Design**:
- Dark overlay with centered content
- Animated progress bar
- Step icons animating in sequence
- Smooth transitions between steps

#### 4.4 Results Presentation
**Layout**: Three-column comparison view

**Column 1 - Original Resume**:
- Header: "Before"
- ATS Score display
- Compact resume view
- Missing keywords highlighted

**Column 2 - Analysis Results**:
- Match percentage (large number)
- Key improvements list:
  - "Added X missing keywords"
  - "Enhanced Y bullet points"
  - "Improved ATS score by Z%"
- Keyword gap analysis
- AI explanation of changes

**Column 3 - Tailored Resume**:
- Header: "After"
- New ATS Score (animated increase)
- Enhanced resume with changes highlighted
- Green highlights for improvements
- Hover to see original vs. improved text

**Action Buttons**:
- Primary: "Use This Version" 
- Secondary: "Customize Further"
- Tertiary: "Try Different Job"

### 5. Email Signup Flow (Fallback Path)

#### 5.1 Email Entry Step
**Triggered by**: "Start with Email" link

**Modal/Page Content**:
- Header: "Start with email"
- Single email input field
- CTA: "Continue"
- LinkedIn nudge box:
  - Icon: LinkedIn logo
  - Text: "Save 10+ minutes by importing from LinkedIn"
  - Link: "Use LinkedIn instead"

**Email Validation**:
- Real-time validation
- Check for common typos (gmial.com → gmail.com)
- Verify deliverability (API check)
- Show suggestions for common domains

#### 5.2 Account Creation
**Shown when**: Email is new (not existing user)

**Fields**:
- Password (required)
  - Minimum 8 characters
  - Show/hide toggle
  - Strength indicator (weak/medium/strong)
  - Requirements shown while typing
- First Name (optional)
  - Label: "Optional - helps us personalize"
  - Placeholder: "How should we address you?"

**Legal Compliance**:
- Checkbox: "I agree to Terms and Privacy Policy"
- Links open in new tab
- Must be checked to continue

#### 5.3 Existing User Detection
**Shown when**: Email already exists

**Options Presented**:
1. "Login instead" - Switch to login form
2. "Forgot password?" - Trigger reset flow
3. "Use different email" - Return to email entry

### 6. Post-Signup Data Collection

#### 6.1 Resume Creation Options
**Presented immediately after account creation**

**Options** (Card selection):
1. **Upload Resume**
   - Icon: Upload cloud
   - Text: "I have a resume file"
   - Subtext: "PDF, DOCX, or TXT"
   - Triggers: File picker

2. **Start Fresh**
   - Icon: Sparkles
   - Text: "Build from scratch"
   - Subtext: "We'll guide you step-by-step"
   - Triggers: Template selection

3. **Import from LinkedIn**
   - Icon: LinkedIn logo
   - Text: "Import from LinkedIn"
   - Subtext: "Fastest way to start"
   - Triggers: OAuth flow

#### 6.2 File Upload Flow
**File Requirements**:
- Accept: .pdf, .docx, .doc, .txt
- Max size: 10MB
- Show preview after selection
- Progress bar during upload

**Processing States**:
1. "Uploading..." (0-2s)
2. "Reading your resume..." (2-4s)
3. "Extracting information..." (4-6s)
4. "Enhancing with AI..." (6-8s)

**Error Handling**:
- Corrupted file: "We couldn't read this file. Try another?"
- Wrong format: "Please upload a PDF, Word, or text file"
- Too large: "File is too large. Maximum size is 10MB"

### 7. Progressive Profile Enhancement

#### 7.1 Contextual Data Collection
**Timing**: Throughout first session, not all at once

**Collection Points**:
1. After first resume save: "What type of role are you targeting?"
2. After viewing templates: "Which industry are you in?"
3. After first tailoring: "How many years of experience do you have?"

**UI Pattern**:
- Slide-up modal (not blocking)
- Can dismiss with "Ask me later"
- Track dismissals to avoid annoyance

#### 7.2 Smart Defaults
**Based on imported/uploaded data**:
- Pre-fill industry from work experience
- Guess experience level from graduation date
- Suggest job titles from current/recent roles
- Extract skills from job descriptions

## Non-Functional Requirements

### Performance Requirements
- LinkedIn import: < 15 seconds total
- Page transitions: < 300ms
- Resume preview updates: < 100ms
- AI processing: < 10 seconds
- Time to first resume view: < 90 seconds from signup start

### Accessibility Requirements
- All forms keyboard navigable
- Screen reader labels for all inputs
- Color contrast ratio: minimum 4.5:1
- Focus indicators visible
- Error messages announced to screen readers

### Security Requirements
- OAuth tokens: Encrypted at rest, never sent to client
- Password requirements: Minimum 8 chars, complexity scoring
- Session timeout: 30 days with refresh
- Data isolation: Row-level security in database
- HTTPS only: Enforce SSL/TLS

### Browser Compatibility
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS Safari 14+, Chrome Android

## Error States & Recovery

### LinkedIn OAuth Errors
1. **User Denial**: 
   - Message: "No worries! You can start with email instead"
   - Action: Show email signup form
   
2. **Network Error**:
   - Message: "Connection issue. Please try again"
   - Action: Retry button + email alternative

3. **Rate Limit**:
   - Message: "LinkedIn is busy. Let's use email for now"
   - Action: Auto-switch to email form

### Form Validation Errors
1. **Invalid Email**:
   - Message: "Please enter a valid email address"
   - Suggestion: Show corrected email if typo detected

2. **Weak Password**:
   - Message: "Password is too weak"
   - Help: Show specific requirements not met

3. **Existing Account**:
   - Message: "You already have an account"
   - Actions: Login or reset password options

### Import/Processing Errors
1. **Parse Failure**:
   - Message: "We couldn't read your resume file"
   - Recovery: Offer manual entry or different file

2. **Timeout**:
   - Message: "This is taking longer than usual"
   - Recovery: Continue in background, email when ready

## Success Metrics

### Primary KPIs
- **Signup Completion Rate**: Target 85% for LinkedIn, 70% for email
- **Time to Value**: < 90 seconds to first resume view
- **Activation Rate**: 60% create/import first resume in session 1
- **D1 Retention**: 40% return within 24 hours

### Secondary Metrics
- **LinkedIn vs Email Split**: Track preference trends
- **Drop-off Points**: Identify friction in funnel
- **Error Rates**: < 2% for OAuth, < 5% for parsing
- **Support Tickets**: < 1% of signups need help

### Engagement Metrics
- **Profile Completion**: 80% within first week
- **First Tailoring**: 50% in first session
- **Template Changes**: Average 2.3 per user
- **Time in First Session**: Average 12 minutes

## A/B Testing Requirements

### Test Variants

1. **LinkedIn Button Prominence**
   - A: LinkedIn button 2x size of email option
   - B: Equal visual weight for both options

2. **Progress Messaging**
   - A: Technical progress messages
   - B: Emotional/encouraging messages

3. **First Action**
   - A: Force resume import/creation
   - B: Allow dashboard exploration first

4. **Onboarding Length**
   - A: Just job search status
   - B: Status + role + experience level

### Test Infrastructure
- User bucketing by ID hash
- Minimum sample size: 1000 per variant
- Track through entire funnel
- Statistical significance: 95% confidence

## Copy & Messaging Guidelines

### Tone Principles
- **Empathetic**: Acknowledge job search difficulty
- **Encouraging**: Celebrate small wins
- **Professional**: Maintain credibility
- **Conversational**: Avoid corporate speak

### Key Messages
- Time savings: Always quantify (minutes/hours saved)
- Success rates: Use specific percentages
- Privacy: Reassure about data handling
- Value: Emphasize free tier generosity

### Error Message Pattern
- **What happened**: Clear explanation
- **Why it happened**: If relevant
- **What to do**: Specific next action
- **Alternative**: Always offer another path

## Testing Requirements

### Unit Test Coverage
- All form validations
- OAuth error handling
- Data parsing logic
- Progressive disclosure rules

### Integration Tests
- Complete LinkedIn flow
- Complete email flow
- Error recovery paths
- Data persistence

### E2E Test Scenarios
1. Happy path: LinkedIn → Import → Personalize → First tailor
2. Email path: Signup → Upload → First tailor
3. Error recovery: OAuth fail → Email fallback
4. Existing user: Recognition → Login redirect
5. Mobile flow: Responsive behavior validation

## Implementation Notes

### State Management
- Signup progress must persist across page refreshes
- OAuth state parameter for CSRF protection
- Imported data cached for session duration
- Form data saved on blur for recovery

### Analytics Events
Track these key events:
- `signup_started`: With source (landing CTA clicked)
- `signup_method_selected`: LinkedIn or email
- `oauth_completed`: Success or failure reason
- `resume_imported`: With source and parse time
- `personalization_completed`: With selections
- `first_resume_viewed`: Time from signup start
- `signup_completed`: Total time and path taken

### Database Operations
- User creation atomic with profile
- Resume import batched for performance
- Audit log all data imports
- Soft delete for user removal

### Performance Optimizations
- Preload OAuth redirect page
- Stream resume parsing results
- Progressive preview rendering
- Optimistic UI updates
- CDN for static assets

This PRD provides comprehensive requirements for implementing the Victry signup flow. The focus on emotional support, minimal friction, and immediate value demonstration addresses the core needs of exhausted job seekers while maintaining technical robustness and business objectives.