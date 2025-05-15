// File: /app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]"></div>
        
        <div className="container relative mx-auto px-4 py-16 sm:px-6 lg:flex lg:items-center lg:gap-x-12 lg:px-8 lg:py-28">
          <div className="max-w-2xl lg:w-1/2">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-green-400"></span>
                New Version 2.0 Released
              </span>
              
              <h1 className="font-heading mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block text-white">Transform Your</span>
                <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
                  Job Search with AI
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-relaxed text-blue-100/90">
                Victry turns hours of resume tailoring into minutes while
                maintaining your authentic voice and optimizing for ATS systems.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <div className="transition-transform hover:scale-102 active:scale-98">
                  <Link
                    href="/dashboard"
                    className="group relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-orange-500/25 transition-all"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
                    <span className="relative flex items-center">
                      Get Started
                      <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                <div className="transition-transform hover:scale-102 active:scale-98">
                  <Link
                    href="/login"
                    className="group flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    Log In
                  </Link>
                </div>
              </div>
              
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-orange-${i*100} to-blue-${i*100}`}></div>
                  ))}
                </div>
                <p className="ml-4 text-sm text-blue-100">
                  <span className="font-semibold">2,000+</span> professionals 
                  <span className="hidden sm:inline"> trust Victry for their job search</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0 lg:w-1/2">
            <div className="animate-fade-in-up-delayed relative">
              <div className="relative rounded-2xl bg-white/10 p-2 shadow-2xl shadow-blue-950/50 backdrop-blur-sm ring-1 ring-white/20">
                <div className="overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-inner">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">V</div>
                      <div className="h-6 w-2/3 rounded-md bg-blue-100"></div>
                    </div>
                    
                    {/* Animated lines to simulate text */}
                    <div className="space-y-3">
                      <div className="h-5 animate-pulse-width w-full rounded-md bg-gray-200"></div>
                      <div className="h-5 animate-pulse-width-delayed-1 w-5/6 rounded-md bg-gray-200"></div>
                      <div className="h-5 animate-pulse-width-delayed-2 w-4/6 rounded-md bg-gray-200"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-5 w-full rounded-md bg-gray-200"></div>
                      <div className="h-5 w-full rounded-md bg-gray-200"></div>
                      <div className="h-5 w-3/4 rounded-md bg-gray-200"></div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <div className="h-10 w-2/5 rounded-md bg-orange-200 transition-transform hover:scale-105"></div>
                      <div className="h-10 w-2/5 rounded-md bg-blue-200 transition-transform hover:scale-105"></div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl"></div>
              </div>
              
              {/* Floating elements */}
              <div
                className="absolute -top-6 -right-6 h-12 w-12 rounded-lg bg-blue-600/80 backdrop-blur-sm p-3 shadow-lg ring-1 ring-white/20 animate-float"
              >
                <div className="h-full w-full rounded bg-white/20"></div>
              </div>
              
              <div
                className="absolute -bottom-4 -left-4 h-16 w-16 rounded-lg bg-orange-500/80 backdrop-blur-sm p-4 shadow-lg ring-1 ring-white/20 animate-float-delayed"
              >
                <div className="h-full w-full rounded bg-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
                Why Professionals Choose Victry
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our platform is designed to give you a competitive edge in your job search.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card 1 */}
            <div
              className="animate-fade-in-up-staggered-1 overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-blue-950">
                  Save Hours of Time
                </h3>
                <p className="text-gray-600">
                  Our AI tailoring engine customizes your resume for each job in
                  minutes, not hours, letting you apply to more positions faster.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div
              className="animate-fade-in-up-staggered-2 overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-blue-950">
                  Pass ATS Systems
                </h3>
                <p className="text-gray-600">
                  Optimize your resume to pass Applicant Tracking Systems with our
                  ATS compatibility score and keyword analysis.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div
              className="animate-fade-in-up-staggered-3 overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-blue-950">
                  Maintain Your Voice
                </h3>
                <p className="text-gray-600">
                  Our AI preserves your authentic voice while optimizing your
                  content for each job application, so it always sounds like you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden bg-blue-50 py-24">
        <div className="absolute inset-0 bg-gradient-radial from-blue-200/30 to-transparent"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
                How Victry Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                A simple four-step process to supercharge your job applications
              </p>
            </div>
          </div>

          <div className="relative mt-16">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-200 via-blue-300 to-orange-200 md:block hidden"></div>
            
            <div className="grid gap-8 md:grid-cols-4">
              {/* Step 1 */}
              <div className="animate-fade-in-up-staggered-1 flex flex-col items-center">
                <div className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-90"></div>
                  <span className="relative text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-center text-xl font-semibold text-blue-950">
                  Create Your Base Resume
                </h3>
                <p className="mt-2 text-center text-gray-600">
                  Build or import your master resume with all your experience and skills.
                </p>
              </div>

              {/* Step 2 */}
              <div className="animate-fade-in-up-staggered-2 flex flex-col items-center">
                <div className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-90"></div>
                  <span className="relative text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-center text-xl font-semibold text-blue-950">
                  Add Job Description
                </h3>
                <p className="mt-2 text-center text-gray-600">
                  Paste the job posting you&apos;re interested in applying for.
                </p>
              </div>

              {/* Step 3 */}
              <div className="animate-fade-in-up-staggered-3 flex flex-col items-center">
                <div className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-90"></div>
                  <span className="relative text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-center text-xl font-semibold text-blue-950">
                  Customize Tailoring
                </h3>
                <p className="mt-2 text-center text-gray-600">
                  Set your preferences for tailoring intensity and keyword focus.
                </p>
              </div>

              {/* Step 4 */}
              <div className="animate-fade-in-up-staggered-4 flex flex-col items-center">
                <div className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-90"></div>
                  <span className="relative text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-center text-xl font-semibold text-blue-950">
                  Export Your Resume
                </h3>
                <p className="mt-2 text-center text-gray-600">
                  Download your tailored resume or apply directly to the job.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-24 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]"></div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Land Your Dream Job?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
                Join thousands of professionals who are saving time and getting more
                interviews with Victry.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center space-y-4">
                <div className="transition-transform hover:scale-105 active:scale-95">
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
                    <span className="relative flex items-center">
                      Create Your Free Account
                      <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Link>
                </div>
                <p className="text-white/75">
                  No credit card required to get started
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"></div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Don't just take our word for it. Hear from those who've transformed their job search with Victry.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="animate-fade-in-up-staggered-1 overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-4xl text-orange-500 opacity-20">"</div>
                  <p className="mb-8 text-gray-600">
                    I applied to 5 jobs with my Victry-tailored resume and got
                    4 interviews. The ATS optimization feature was a
                    game-changer.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white">
                    JP
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">John P.</h3>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="animate-fade-in-up-staggered-2 overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-4xl text-blue-500 opacity-20">"</div>
                  <p className="mb-8 text-gray-600">
                    What used to take me 2 hours now takes 10 minutes. Victry
                    helped me land a job with a 30% higher salary.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
                    SM
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">Sarah M.</h3>
                    <p className="text-sm text-gray-500">Marketing Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="animate-fade-in-up-staggered-3 overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-4xl text-green-500 opacity-20">"</div>
                  <p className="mb-8 text-gray-600">
                    The AI suggestions were spot-on and still sounded like me.
                    I&apos;m recommending Victry to everyone in my network.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white">
                    RT
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">Robert T.</h3>
                    <p className="text-sm text-gray-500">Financial Analyst</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile app banner */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <div className="animate-fade-in-left">
                <h2 className="text-3xl font-bold text-white mb-4">Take Victry on the Go</h2>
                <p className="text-blue-100 mb-6">
                  Access your resumes, track applications, and get interview notifications from anywhere with our mobile app.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                    <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.6 0.5H6.4C3.4 0.5 1 2.9 1 5.9V18.1C1 21.1 3.4 23.5 6.4 23.5H17.6C20.6 23.5 23 21.1 23 18.1V5.9C23 2.9 20.6 0.5 17.6 0.5ZM8.3 18.1H5.8V9.2H8.3V18.1ZM7 7.9C6.1 7.9 5.3 7.1 5.3 6.2C5.3 5.3 6.1 4.5 7 4.5C7.9 4.5 8.7 5.3 8.7 6.2C8.7 7.1 7.9 7.9 7 7.9ZM18.7 18.1H16.2V13.9C16.2 12.7 16.2 11.1 14.5 11.1C12.8 11.1 12.5 12.4 12.5 13.8V18.1H10V9.2H12.4V10.4H12.4C12.8 9.7 13.7 9 15.1 9C17.6 9 18.7 11.1 18.7 13.8V18.1Z" />
                    </svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                    <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.9 5C17.9 5 17.3 4.1 16.2 3.4C15 2.7 13.6 2.6 12.9 2.5C10.3 2.3 7.7 2.3 5.1 2.5C4.4 2.6 3 2.7 1.8 3.4C0.7 4.1 0.1 5 0.1 5C-0.4 6.2 0.1 8.7 0.1 8.7V15.3C0.1 15.3 -0.4 17.8 0.1 19C0.1 19 0.7 19.9 1.8 20.6C3 21.3 4.4 21.4 5.1 21.5C7.7 21.7 10.3 21.7 12.9 21.5C13.6 21.4 15 21.3 16.2 20.6C17.3 19.9 17.9 19 17.9 19C18.4 17.8 17.9 15.3 17.9 15.3V8.7C17.9 8.7 18.4 6.2 17.9 5ZM7.9 16.5V7.5L12.9 12L7.9 16.5Z" />
                    </svg>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="animate-fade-in-up">
                <div className="relative w-64 h-96 mx-auto bg-black rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                  <div className="absolute top-0 w-full h-6 bg-black z-10 flex justify-center">
                    <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                  </div>
                  <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 pt-6">
                    <div className="w-full h-6 bg-blue-600 flex items-center px-4">
                      <div className="h-2 w-1/2 bg-white/50 rounded-full"></div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 w-1/2 bg-gray-300 rounded-full mb-4"></div>
                      <div className="flex flex-col gap-2">
                        <div className="h-12 bg-white rounded-lg shadow-sm"></div>
                        <div className="h-12 bg-white rounded-lg shadow-sm"></div>
                        <div className="h-12 bg-white rounded-lg shadow-sm"></div>
                      </div>
                      <div className="mt-6">
                        <div className="h-4 w-1/3 bg-gray-300 rounded-full mb-4"></div>
                        <div className="h-32 bg-white rounded-lg shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer call to action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-blue-950 mb-6">Start Your Job Search Journey Today</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join the thousands of professionals who have revolutionized their job application process with Victry.
            </p>
            <div className="transition-transform hover:scale-105 active:scale-95 inline-block">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg inline-flex items-center transition-colors"
              >
                Get Started For Free
                <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}