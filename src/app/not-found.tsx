"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Waves } from "@/components/waves-animation"
import { SearchParamsComponent } from "@/components/search-param"

// Create a client component that uses useSearchParams
export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <Container className="relative flex flex-col items-center justify-center min-h-[80vh] py-10 overflow-hidden">
      {/* Ocean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-950 overflow-hidden">
        <Waves />
      </div>

      {/* Sea creatures and objects */}
      <AnimatePresence>
        {isLoaded && !prefersReducedMotion && (
          <>
            {/* Swimming fish school */}
            <motion.div
              className="absolute z-0"
              initial={{ x: -100, y: 120 }}
              animate={{
                x: [null, isMobile ? 250 : 500],
                transition: {
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }
              }}
            >
              <FishSchool />
            </motion.div>

            {/* Floating seaweed */}
            <motion.div 
              className="absolute bottom-0 left-10 z-0"
              animate={{
                y: [0, -10, 0],
                rotateZ: [0, 5, 0, -5, 0],
                transition: {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                }
              }}
            >
              <Seaweed />
            </motion.div>

            {/* Another seaweed on right */}
            <motion.div 
              className="absolute bottom-0 right-20 z-0"
              animate={{
                y: [0, -8, 0],
                rotateZ: [0, -3, 0, 3, 0],
                transition: {
                  duration: 3.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 1,
                }
              }}
            >
              <Seaweed />
            </motion.div>

            {/* Floating package/cargo box */}
            <motion.div
              className="absolute right-16 bottom-28 z-0"
              initial={{ y: 0, rotate: 3 }}
              animate={{
                y: [0, -15, 0],
                rotate: [3, 10, 3, -5, 3],
                transition: {
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                }
              }}
            >
              <CargoBox />
            </motion.div>
            
            {/* Jellyfish */}
            <motion.div
              className="absolute left-24 top-24 z-0"
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.05, 1],
                transition: {
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                }
              }}
            >
              <Jellyfish />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content container with glass effect */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-8 max-w-md w-full shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-2 text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Container Lost at Sea!</h2>

          <AnimatePresence>
            {isLoaded && !prefersReducedMotion && (
              <div className="relative h-64 mb-6">
                {/* Sinking Docker container */}
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2"
                  initial={{ y: -100, rotate: 0 }}
                  animate={{
                    y: [null, 20, 40, 60, 80, 100],
                    rotate: [0, -5, 5, -8, 8, -12],
                    transition: {
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <DockerContainer />
                </motion.div>

                {/* Enhanced bubbles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${5 + (i * 8)}%`,
                      bottom: 0,
                      opacity: Math.random() * 0.5 + 0.3,
                    }}
                    initial={{ y: 100, opacity: 0.7 }}
                    animate={{
                      y: -150,
                      x: Math.random() > 0.5 ? 10 : -10,
                      opacity: [0.7, 0.9, 0.7, 0.5, 0],
                      scale: [0.8, 1, 1.2, 1, 0.8],
                      transition: {
                        duration: 2 + Math.random() * 4,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.25,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div 
                      className={`rounded-full bg-white/80 ${
                        i % 3 === 0 ? "w-4 h-4" : i % 2 === 0 ? "w-3 h-3" : "w-2 h-2"
                      }`} 
                    />
                  </motion.div>
                ))}

                {/* Life preserver */}
                <motion.div
                  className="absolute right-10 top-20"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, 10, 0, -10, 0],
                    transition: {
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                    },
                  }}
                >
                  <LifePreserver />
                </motion.div>
                
                {/* Animated anchor */}
                <motion.div
                  className="absolute left-8 top-8"
                  animate={{
                    y: [0, 15, 0],
                    rotate: [0, -15, 0, 15, 0],
                    transition: {
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 1,
                    },
                  }}
                >
                  <Anchor />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Fallback image for reduced motion or before JS loads */}
          {(prefersReducedMotion || !isLoaded) && (
            <div className="h-64 mb-6 flex items-center justify-center">
              <DockerContainer />
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Oops! Looks like this Docker container has drifted off course.
            <br />
            <span className="text-sm italic">Error: CONTAINER_NOT_FOUND</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="relative overflow-hidden group">
              <Link href="/">
                <span className="relative z-10">Return to Base</span>
                <motion.span
                  className="absolute inset-0 bg-blue-700 dark:bg-blue-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-blue-500 dark:border-blue-400">
              <Link href="/repositories">View Repos</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* This Suspense boundary is required for useSearchParams */}
      <Suspense fallback={<>🌀</>}>
        <SearchParamsComponent />
      </Suspense>
    </Container>
  )
}

// Docker Container SVG Component
function DockerContainer() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Container body */}
      <rect x="10" y="10" width="100" height="60" rx="4" fill="#2496ED" />
      <rect x="10" y="10" width="100" height="60" rx="4" stroke="#13283f" strokeWidth="2" />

      {/* Container ridges */}
      <rect x="20" y="20" width="80" height="2" fill="#1D72B8" />
      <rect x="20" y="30" width="80" height="2" fill="#1D72B8" />
      <rect x="20" y="40" width="80" height="2" fill="#1D72B8" />
      <rect x="20" y="50" width="80" height="2" fill="#1D72B8" />

      {/* Docker logo */}
      <g transform="translate(40, 25) scale(0.4)">
        <path d="M40 55H55V70H40V55Z" fill="white" />
        <path d="M65 55H80V70H65V55Z" fill="white" />
        <path d="M40 30H55V45H40V30Z" fill="white" />
        <path d="M65 30H80V45H65V30Z" fill="white" />
        <path d="M90 30H105V45H90V30Z" fill="white" />
        <path d="M15 55H30V70H15V55Z" fill="white" />
        <path d="M65 5H80V20H65V5Z" fill="white" />
        <path d="M90 55H105V70H90V55Z" fill="white" />
      </g>

      {/* Sad face */}
      <circle cx="60" cy="35" r="15" fill="#FFC107" stroke="#13283f" strokeWidth="1" />
      <circle cx="53" cy="30" r="2" fill="#13283f" />
      <circle cx="67" cy="30" r="2" fill="#13283f" />
      <path d="M50 45C53 40 67 40 70 45" stroke="#13283f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Enhanced Life Preserver Component
function LifePreserver() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#F44336" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="20" cy="20" r="10" fill="#FFFFFF" stroke="#F44336" strokeWidth="1" />
      <rect x="18" y="2" width="4" height="8" fill="#FFFFFF" />
      <rect x="18" y="30" width="4" height="8" fill="#FFFFFF" />
      <rect x="30" y="18" width="8" height="4" fill="#FFFFFF" />
      <rect x="2" y="18" width="8" height="4" fill="#FFFFFF" />
      <text x="20" y="15" textAnchor="middle" fontSize="5" fill="#F44336" fontWeight="bold">S.O.S</text>
    </svg>
  )
}

// New Component: Anchor
function Anchor() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6C19.6569 6 21 4.65685 21 3C21 1.34315 19.6569 0 18 0C16.3431 0 15 1.34315 15 3C15 4.65685 16.3431 6 18 6Z" fill="#78909C"/>
      <path d="M18 36V6" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 30C11 30 5 26 5 20" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 30C25 30 31 26 31 20" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M3 20H7" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M29 20H33" stroke="#546E7A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

// New Component: Fish School
function FishSchool() {
  return (
    <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Multiple fish in a school */}
      <g transform="translate(10, 20) rotate(-10)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#E0F7FA" />
        <path d="M10 10L25 5V15L10 10Z" fill="#4FC3F7" />
        <path d="M0 10L10 5V15L0 10Z" fill="#29B6F6" />
        <circle cx="20" cy="10" r="1" fill="#01579B" />
      </g>
      <g transform="translate(30, 40) rotate(5)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#E1BEE7" />
        <path d="M10 10L25 5V15L10 10Z" fill="#CE93D8" />
        <path d="M0 10L10 5V15L0 10Z" fill="#BA68C8" />
        <circle cx="20" cy="10" r="1" fill="#4A148C" />
      </g>
      <g transform="translate(0, 50) rotate(-5)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#B3E5FC" />
        <path d="M10 10L25 5V15L10 10Z" fill="#81D4FA" />
        <path d="M0 10L10 5V15L0 10Z" fill="#4FC3F7" />
        <circle cx="20" cy="10" r="1" fill="#01579B" />
      </g>
      <g transform="translate(50, 10) rotate(15)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#BBDEFB" />
        <path d="M10 10L25 5V15L10 10Z" fill="#90CAF9" />
        <path d="M0 10L10 5V15L0 10Z" fill="#64B5F6" />
        <circle cx="20" cy="10" r="1" fill="#0D47A1" />
      </g>
      <g transform="translate(70, 30) rotate(-8)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#B2EBF2" />
        <path d="M10 10L25 5V15L10 10Z" fill="#80DEEA" />
        <path d="M0 10L10 5V15L0 10Z" fill="#4DD0E1" />
        <circle cx="20" cy="10" r="1" fill="#006064" />
      </g>
      <g transform="translate(100, 50) rotate(10)">
        <path d="M25 10C25 10 35 5 40 10C35 15 25 10 25 10Z" fill="#C8E6C9" />
        <path d="M10 10L25 5V15L10 10Z" fill="#A5D6A7" />
        <path d="M0 10L10 5V15L0 10Z" fill="#81C784" />
        <circle cx="20" cy="10" r="1" fill="#1B5E20" />
      </g>
    </svg>
  )
}

// New Component: Jellyfish
function Jellyfish() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 20C41.0457 20 50 11.0457 50 0H10C10 11.0457 18.9543 20 30 20Z" fill="#E1BEE7" fillOpacity="0.8" />
      <path d="M15 20C15 50 13 70 13 70" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
      <path d="M22 20C22 45 20 65 20 65" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
      <path d="M30 20C30 55 28 75 28 75" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
      <path d="M38 20C38 50 36 70 36 70" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
      <path d="M45 20C45 40 43 60 43 60" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
      <circle cx="22" cy="10" r="2" fill="#7B1FA2" fillOpacity="0.6" />
      <circle cx="38" cy="10" r="2" fill="#7B1FA2" fillOpacity="0.6" />
    </svg>
  )
}

// New Component: Seaweed
function Seaweed() {
  return (
    <svg width="40" height="100" viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 100C20 100 10 90 20 80C30 70 10 60 20 50C30 40 10 30 20 20C30 10 20 0 20 0" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 90C10 90 0 80 10 70C20 60 0 50 10 40C20 30 10 20 10 20" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 80C30 80 40 70 30 60C20 50 30 40 30 40" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// New Component: Cargo Box
function CargoBox() {
  return (
    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="40" height="30" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
      <line x1="5" y1="15" x2="45" y2="15" stroke="#5D4037" strokeWidth="1" />
      <line x1="5" y1="25" x2="45" y2="25" stroke="#5D4037" strokeWidth="1" />
      <rect x="18" y="12" width="14" height="6" fill="#FDD835" stroke="#F57F17" strokeWidth="1" />
      <path d="M25 10L28 14L25 18L22 14L25 10Z" fill="#F44336" />
    </svg>
  )
}