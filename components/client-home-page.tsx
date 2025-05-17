"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function ClientHomePage() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
        
        {/* Animated background blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-orange-500/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-pink-500/10 blur-[80px] animate-pulse-slower"></div>
        
        <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:flex lg:items-center lg:gap-x-12 lg:px-8 lg:py-32">
          <motion.div 
            className="max-w-2xl lg:w-1/2"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md shadow-lg">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                New Version 2.0 Released
              </span>
              
              <h1 className="font-heading mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block text-white">Transform Your</span>
                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">
                  Job Search with AI
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-relaxed text-blue-100/90">
                Victry turns hours of resume tailoring into minutes while
                maintaining your authentic voice and optimizing for ATS systems.
              </p>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex flex-col gap-4 sm:flex-row"
              variants={fadeIn}
            >
              <div className="transition-all hover:scale-105 active:scale-98">
                <Link
                  href="/dashboard"
                  className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/40"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_80%)]"></span>
                  <span className="relative flex items-center">
                    Get Started
                    <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Link>
              </div>
              
              <div className="transition-all hover:scale-105 active:scale-98">
                <Link
                  href="/login"
                  className="group flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-lg"
                >
                  Log In
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-8 flex items-center"
              variants={fadeIn}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-10 w-10 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-orange-${i*100} to-blue-${i*100} shadow-lg`}
                  >
                    {["JD", "TK", "AM", "RH"][i-1]}
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-blue-100">
                <span className="font-semibold">2,000+</span> professionals 
                <span className="hidden sm:inline"> trust Victry for their job search</span>
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 lg:mt-0 lg:w-1/2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative">
              <div className="relative rounded-2xl bg-white/10 p-2 shadow-2xl shadow-blue-950/50 backdrop-blur-xl ring-1 ring-white/20 overflow-hidden">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-blue-500/5"></div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-inner">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">V</div>
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
                      <div className="h-10 w-2/5 rounded-xl bg-gradient-to-r from-orange-200 to-pink-200 transition-transform hover:scale-105 shadow"></div>
                      <div className="h-10 w-2/5 rounded-xl bg-gradient-to-r from-blue-200 to-indigo-200 transition-transform hover:scale-105 shadow"></div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl"></div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -right-6 h-14 w-14 rounded-xl bg-blue-600/80 backdrop-blur-xl p-3 shadow-lg ring-1 ring-white/20"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <div className="h-full w-full rounded bg-white/20"></div>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500/80 to-pink-500/80 backdrop-blur-xl p-4 shadow-lg ring-1 ring-white/20"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              >
                <div className="h-full w-full rounded bg-white/20"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 mb-4">Why Victry</span>
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              Why Professionals Choose Victry
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform is designed to give you a competitive edge in your job search.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card 1 */}
            <motion.div
              className="group overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="relative z-10 p-6 lg:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 text-orange-600 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
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
                <h3 className="mb-3 text-xl font-semibold text-blue-950 group-hover:text-blue-800 transition-colors">
                  Save Hours of Time
                </h3>
                <p className="text-gray-600">
                  Our AI tailoring engine customizes your resume for each job in
                  minutes, not hours, letting you apply to more positions faster.
                </p>
              </div>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              className="group overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="relative z-10 p-6 lg:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
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
                <h3 className="mb-3 text-xl font-semibold text-blue-950 group-hover:text-blue-800 transition-colors">
                  Pass ATS Systems
                </h3>
                <p className="text-gray-600">
                  Optimize your resume to pass Applicant Tracking Systems with our
                  ATS compatibility score and keyword analysis.
                </p>
              </div>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              className="group overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="h-1.5 bg-gradient-to-r from-pink-500 to-pink-600"></div>
              <div className="relative z-10 p-6 lg:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 text-pink-600 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
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
                <h3 className="mb-3 text-xl font-semibold text-blue-950 group-hover:text-blue-800 transition-colors">
                  Maintain Your Voice
                </h3>
                <p className="text-gray-600">
                  Our AI preserves your authentic voice while optimizing your
                  content for each job application, so it always sounds like you.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-24 lg:py-28 text-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5"></div>
        
        {/* Animated blobs */}
        <div className="absolute top-0 right-0 -mt-40 -mr-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px] animate-pulse-slower"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-sm font-medium text-white mb-6 shadow-lg border border-white/10">Start Today</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Land Your Dream Job?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100/90">
              Join thousands of professionals who are saving time and getting more
              interviews with Victry.
            </p>
            <motion.div 
              className="mt-10 flex flex-col items-center justify-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="transition-all hover:scale-105 active:scale-95">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 bg-size-200 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:bg-pos-100 hover:shadow-xl shadow-orange-500/20"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  <span className="relative flex items-center">
                    Create Your Free Account
                    <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Link>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/75">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No credit card required to get started</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}