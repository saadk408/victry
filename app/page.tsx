// File: /app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
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

      {/* How It Works Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-100/40 to-transparent"></div>
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-blue-100/40 to-transparent"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-4">Simple Process</span>
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              How Victry Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A simple four-step process to supercharge your job applications
            </p>
          </motion.div>

          <div className="relative mt-20">
            {/* Connecting line with animation */}
            <div className="absolute left-1/2 top-24 h-[calc(100%-120px)] w-1 -translate-x-1/2 bg-gradient-to-b from-blue-300 via-pink-300 to-orange-300 rounded-full md:block hidden"></div>
            
            <div className="grid gap-16 md:gap-12">
              {/* Step 1 */}
              <motion.div 
                className="relative grid md:grid-cols-5 items-center gap-6 md:gap-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="md:col-span-2 md:text-right order-2 md:order-1">
                  <h3 className="text-xl font-semibold text-blue-950 mb-3">
                    Create Your Base Resume
                  </h3>
                  <p className="text-gray-600">
                    Build or import your master resume with all your experience and skills. This serves as the foundation for all your tailored applications.
                  </p>
                </div>
                
                <div className="mx-auto order-1 md:order-2 md:col-span-1 flex justify-center">
                  <motion.div 
                    className="relative flex h-20 w-20 items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 opacity-90 shadow-lg"></div>
                    <span className="relative text-2xl font-bold text-white">1</span>
                    <div className="absolute -inset-3 rounded-3xl border-2 border-dashed border-orange-300 opacity-50"></div>
                  </motion.div>
                </div>
                
                <div className="md:col-span-2 order-3">
                  <div className="bg-white rounded-2xl p-2 shadow-xl overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center p-4">
                      <div className="w-full space-y-3 max-w-[200px] mx-auto">
                        <div className="h-6 w-full rounded-md bg-orange-200/70"></div>
                        <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-full rounded-md bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className="relative grid md:grid-cols-5 items-center gap-6 md:gap-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="md:col-span-2 order-3 md:order-1">
                  <div className="bg-white rounded-2xl p-2 shadow-xl overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center p-4">
                      <div className="w-full space-y-3 max-w-[200px] mx-auto">
                        <div className="h-6 w-full rounded-md bg-blue-200/70"></div>
                        <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-full rounded-md bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mx-auto order-1 md:order-2 md:col-span-1 flex justify-center">
                  <motion.div 
                    className="relative flex h-20 w-20 items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-90 shadow-lg"></div>
                    <span className="relative text-2xl font-bold text-white">2</span>
                    <div className="absolute -inset-3 rounded-3xl border-2 border-dashed border-blue-300 opacity-50"></div>
                  </motion.div>
                </div>
                
                <div className="md:col-span-2 md:text-left order-2 md:order-3">
                  <h3 className="text-xl font-semibold text-blue-950 mb-3">
                    Add Job Description
                  </h3>
                  <p className="text-gray-600">
                    Paste the job posting you're interested in applying for. Our system will analyze it for key requirements and ATS keywords.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="relative grid md:grid-cols-5 items-center gap-6 md:gap-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="md:col-span-2 md:text-right order-2 md:order-1">
                  <h3 className="text-xl font-semibold text-blue-950 mb-3">
                    Customize Tailoring
                  </h3>
                  <p className="text-gray-600">
                    Set your preferences for tailoring intensity and keyword focus. Control how much AI assistance you want for each section.
                  </p>
                </div>
                
                <div className="mx-auto order-1 md:order-2 md:col-span-1 flex justify-center">
                  <motion.div 
                    className="relative flex h-20 w-20 items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 opacity-90 shadow-lg"></div>
                    <span className="relative text-2xl font-bold text-white">3</span>
                    <div className="absolute -inset-3 rounded-3xl border-2 border-dashed border-pink-300 opacity-50"></div>
                  </motion.div>
                </div>
                
                <div className="md:col-span-2 order-3">
                  <div className="bg-white rounded-2xl p-2 shadow-xl overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center p-4">
                      <div className="w-full space-y-3 max-w-[200px] mx-auto">
                        <div className="h-6 w-full rounded-md bg-pink-200/70"></div>
                        <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-full rounded-md bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                className="relative grid md:grid-cols-5 items-center gap-6 md:gap-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="md:col-span-2 order-3 md:order-1">
                  <div className="bg-white rounded-2xl p-2 shadow-xl overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center p-4">
                      <div className="w-full space-y-3 max-w-[200px] mx-auto">
                        <div className="h-6 w-full rounded-md bg-indigo-200/70"></div>
                        <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded-md bg-gray-200"></div>
                        <div className="h-4 w-full rounded-md bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mx-auto order-1 md:order-2 md:col-span-1 flex justify-center">
                  <motion.div 
                    className="relative flex h-20 w-20 items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-90 shadow-lg"></div>
                    <span className="relative text-2xl font-bold text-white">4</span>
                    <div className="absolute -inset-3 rounded-3xl border-2 border-dashed border-indigo-300 opacity-50"></div>
                  </motion.div>
                </div>
                
                <div className="md:col-span-2 md:text-left order-2 md:order-3">
                  <h3 className="text-xl font-semibold text-blue-950 mb-3">
                    Export Your Resume
                  </h3>
                  <p className="text-gray-600">
                    Download your tailored resume in multiple formats (PDF, DOCX) or apply directly to the job with perfect ATS optimization.
                  </p>
                </div>
              </motion.div>
            </div>
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

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-4">Testimonials</span>
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Don't just take our word for it. Hear from those who've transformed their job search with Victry.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-5xl text-orange-500 opacity-20 font-serif">"</div>
                  <p className="mb-8 text-gray-600">
                    I applied to 5 jobs with my Victry-tailored resume and got
                    4 interviews. The ATS optimization feature was a
                    game-changer.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-md ring-4 ring-orange-500/10">
                    JP
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">John P.</h3>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-5xl text-blue-500 opacity-20 font-serif">"</div>
                  <p className="mb-8 text-gray-600">
                    What used to take me 2 hours now takes 10 minutes. Victry
                    helped me land a job with a 30% higher salary.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-md ring-4 ring-blue-500/10">
                    SM
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">Sarah M.</h3>
                    <p className="text-sm text-gray-500">Marketing Director</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mb-6 text-5xl text-pink-500 opacity-20 font-serif">"</div>
                  <p className="mb-8 text-gray-600">
                    The AI suggestions were spot-on and still sounded like me.
                    I&apos;m recommending Victry to everyone in my network.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-sm font-bold text-white shadow-md ring-4 ring-pink-500/10">
                    RT
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950">Robert T.</h3>
                    <p className="text-sm text-gray-500">Financial Analyst</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile app banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 py-20 lg:py-28 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        
        {/* Animated background blobs */}
        <div className="absolute -bottom-40 right-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute -top-40 left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px] animate-pulse-slower"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div 
              className="lg:w-1/2 mb-10 lg:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-sm font-medium text-white mb-6 shadow-lg border border-white/10">Coming Soon</span>
              <h2 className="text-3xl font-bold text-white mb-6 lg:text-4xl">Take Victry on the Go</h2>
              <p className="text-blue-100/90 mb-8 text-lg max-w-lg">
                Access your resumes, track applications, and get interview notifications from anywhere with our mobile app. Stay on top of your job search wherever you are.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-black/30 backdrop-blur-md rounded-xl px-5 py-3 text-white border border-white/10 shadow-lg hover:bg-black/40 transition-colors">
                  <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0H6.5C5.67 0 5 0.67 5 1.5V22.5C5 23.33 5.67 24 6.5 24H17.5C18.33 24 19 23.33 19 22.5V1.5C19 0.67 18.33 0 17.5 0ZM12 23C11.17 23 10.5 22.33 10.5 21.5C10.5 20.67 11.17 20 12 20C12.83 20 13.5 20.67 13.5 21.5C13.5 22.33 12.83 23 12 23ZM17 19.5H7V2.5H17V19.5Z" />
                  </svg>
                  <div>
                    <div className="text-xs opacity-75">Download on the</div>
                    <div className="text-base font-semibold">App Store</div>
                  </div>
                </div>
                <div className="flex items-center bg-black/30 backdrop-blur-md rounded-xl px-5 py-3 text-white border border-white/10 shadow-lg hover:bg-black/40 transition-colors">
                  <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.191 0C1.661 0 0.568 1.163 0.584 2.563L0.645 21.465C0.661 22.864 1.773 24 3.303 24L20.673 23.897C22.2 23.881 23.32 22.724 23.303 21.328L23.242 2.433C23.226 1.036 22.136 0 20.613 0L3.191 0ZM16.5 12L9 6.311V17.689L16.5 12Z" />
                  </svg>
                  <div>
                    <div className="text-xs opacity-75">GET IT ON</div>
                    <div className="text-base font-semibold">Google Play</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative w-72 h-[500px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-[40px] blur-xl"></div>
                <div className="relative w-full h-full bg-black rounded-[40px] overflow-hidden border-[6px] border-gray-800 shadow-2xl">
                  <div className="absolute top-0 w-full h-6 bg-black z-10 flex justify-center">
                    <div className="w-24 h-1 bg-gray-800 rounded-full mt-2"></div>
                  </div>
                  <div className="absolute bottom-0 w-full h-10 bg-black z-10 flex justify-center items-center">
                    <div className="w-1/3 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="w-full h-full bg-gradient-to-b from-blue-900/50 via-indigo-900/50 to-blue-900/50 pt-6 overflow-hidden">
                    {/* Phone content */}
                    <div className="w-full h-10 bg-indigo-600/80 flex items-center justify-between px-4">
                      <div className="text-white text-xs">12:30</div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-white/50"></div>
                        <div className="w-3 h-3 rounded-full bg-white/50"></div>
                        <div className="w-3 h-3 rounded-full bg-white/50"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 w-1/2 bg-white/20 rounded-full mb-6"></div>
                      <div className="flex flex-col gap-3">
                        <div className="h-16 bg-white/10 rounded-xl backdrop-blur-sm shadow-sm border border-white/10"></div>
                        <div className="h-16 bg-white/10 rounded-xl backdrop-blur-sm shadow-sm border border-white/10"></div>
                        <div className="h-16 bg-indigo-600/20 rounded-xl backdrop-blur-sm shadow-sm border border-indigo-500/30 flex items-center px-4">
                          <div className="h-8 w-8 rounded-full bg-indigo-500/50 mr-3"></div>
                          <div className="h-3 w-3/4 bg-white/30 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-8">
                        <div className="h-4 w-1/3 bg-white/20 rounded-full mb-4"></div>
                        <div className="h-40 bg-white/10 rounded-xl shadow-sm backdrop-blur-sm border border-white/10 flex items-center justify-center p-4">
                          <div className="h-24 w-5/6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-blue-500/30 backdrop-blur-sm border border-white/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Small floating elements */}
                <motion.div 
                  className="absolute -top-5 -right-5 h-12 w-12 rounded-xl bg-indigo-500/80 backdrop-blur-md shadow-lg"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                ></motion.div>
                <motion.div 
                  className="absolute -bottom-5 -left-5 h-14 w-14 rounded-xl bg-blue-500/80 backdrop-blur-md shadow-lg"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer call to action */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
              <div className="relative p-8 md:p-12 lg:p-16 text-center">
                <div 
                  className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 blur-3xl">
                </div>
                <div 
                  className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gradient-to-br from-orange-600/10 to-pink-600/10 blur-3xl">
                </div>
                
                <h2 className="text-3xl font-bold text-blue-950 mb-6 md:text-4xl relative">
                  Start Your Job Search Journey Today
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 relative">
                  Join the thousands of professionals who have revolutionized their job application process with Victry.
                </p>
                <div className="relative inline-block transition-all hover:scale-105 active:scale-95">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl blur opacity-50"></div>
                  <Link
                    href="/register"
                    className="relative bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium px-8 py-4 rounded-xl inline-flex items-center transition-colors"
                  >
                    Get Started For Free
                    <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}