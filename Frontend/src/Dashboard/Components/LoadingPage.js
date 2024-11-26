import React from 'react';
import { motion } from 'framer-motion';

function LoadingScreen({ toolName = "", labName = "" }) {
  const segments = Array.from({ length: 33 });

  return (
    <div className="fixed inset-0 flex items-center justify-center ">
      {/* Glowing line */}
      <div className="absolute w-full h-px top-1/2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent">
        <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Tool and Lab names */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0, delay: 0 }}
        >
          <h2 className="text-4xl  text-btg mb-4 mt-10">{toolName}</h2>
          <h3 className="text-2xl text-btg">{labName}</h3>
        </motion.div>

        {/* Fixed position container */}
        <div className="relative w-96 h-96">
          {/* Rotating container */}
          <motion.div
            className="w-full h-full absolute"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Individual segments */}
            {segments.map((_, index) => (
              <motion.div
                key={index}
                className="absolute w-2 h-8 bg-gray-700 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  marginLeft: '-1px',
                  marginTop: '-10rem',
                  transformOrigin: '50% 10rem',
                  rotate: `${(360 / segments.length) * index}deg`,
                }}
                animate={{
                  backgroundColor: [
                    'rgb(31, 41, 55)', // gray-800
                    '#80EE98', 
                    'rgb(31, 41, 55)' // gray-800
                  ],
                  filter: [
                    'brightness(1) drop-shadow(0 0 0 rgb(6, 182, 212))',
                    'brightness(1.5) drop-shadow(0 0 12px rgb(6, 182, 212))',
                    'brightness(1) drop-shadow(0 0 0 rgb(6, 182, 212))'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * (2 / segments.length),
                  ease: "easeInOut",
                  
                }}
              />
            ))}
          </motion.div>

          {/* Loading text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-btg font-mono text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            Loading...
          </motion.div>
        </div>

        {/* Status message */}
        <motion.div
          className="mt-8 text-white text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Provisioning your lab environment...
        </motion.div>

        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>
    </div>
  );
}

export default LoadingScreen;