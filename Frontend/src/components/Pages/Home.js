import React from 'react';
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Terminal, Container, Cloud, Server, Workflow, Database, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { Card } from "../../Dashboard/UI/Card";
import { CardContent } from "../../Dashboard/UI/CardContent";

const tools = [
  {
    name: "Version Control",
    description: "Master Git and GitHub for effective code collaboration",
    icon: GitBranch,
    color: "#80EE98"
  },
  {
    name: "Linux & Shell",
    description: "Learn essential system administration with Ubuntu",
    icon: Terminal,
    color: "#46E5B7"
  },
  {
    name: "Docker",
    description: "Build and manage containerized applications",
    icon: Container,
    color: "#09D1C7"
  },
  {
    name: "Kubernetes",
    description: "Orchestrate container deployments at scale",
    icon: Cloud,
    color: "#15919C"
  },
  {
    name: "Jenkins & ArgoCD",
    description: "Implement automated CI/CD pipelines",
    icon: Workflow,
    color: "#156F8F"
  },
  {
    name: "AWS Cloud",
    description: "Deploy and manage cloud infrastructure",
    icon: Server,
    color: "#213A58"
  }
];

const features = [
  "Hands-on learning with real-world projects",
  "Expert-led curriculum covering all major DevOps tools",
  "Interactive labs and virtual environments",
  "AI-powered assistance and progress tracking",
  "Community support and networking opportunities",
  "Flexible learning pace to fit your schedule"
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'facebook.svg' },
  { name: 'Twitter', href: '#', icon: 'twitter.svg' },
  { name: 'LinkedIn', href: '#', icon: 'linkedin.svg' },
  { name: 'Vimeo', href: '#', icon: 'vimeo.svg' },
  { name: 'Skype', href: '#', icon: 'skype.svg' },
];

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-y-auto">
      <div className="min-h-screen bg-[#1A202C]">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[100vh] flex items-center justify-center overflow-hidden"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/homebgc.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Logo/Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-8 left-8 z-10"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mt-1 bg-transparent">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-gtb z-10 text-2xl md:text-8xl font-semibold uppercase mb-4"
            >
              DEVOPS Mentor
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl md:text2xl font-bold text-white mb-6"
            >
              Master Devops with <br /><span className="text-btg"> Hands-on Learning </span>
              <br />
              DevOps Platform
            </motion.h1>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="px-4 py-2 bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] rounded-md transition-all duration-300 font-semibold text-xl"
            >
              Start Learning
            </motion.button>
          </div>

          {/* Bottom Gallery */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1A202C] to-transparent z-10" />
        </motion.section>

        {/* Tools Grid */}
        <section className="px-4 py-20 bg-[#1A202C]/90">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-6xl font-bold text-btg text-center mb-16"
            >
               DevOps Curriculum
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card className={`bg-[#1A202C]/50 border-[#09D1C7]/20 transition-colors group p-6
                    ${
                      index % 3 === 0
                        ? "hover:bg-[#09D1C7]/5"
                        : index % 3 === 1
                        ? "hover:bg-[#80EE98]/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <CardContent className="p-6">
                      <tool.icon className="w-12 h-12 mb-4" style={{ color: tool.color }} />
                      <h3 className={`text-xl font-semibold mb-2
                        ${
                          index % 3 === 0
                            ? "text-[#09D1C7]"
                            : index % 3 === 1
                            ? "text-[#80EE98]"
                            : "text-white"
                        }`}
                      >
                        {tool.name}
                      </h3>
                      <p className="text-white/70">{tool.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose DevOps Mentor Section */}
        <section className="px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-16"
            >
              Why Choose DevOps Mentor
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-[#80EE98] flex-shrink-0 mt-1" />
                  <p className="text-white/80">{feature}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Interactive Learning Experience
                </h2>
                <ul className="space-y-4">
                  {[
                    "Virtual environments for hands-on practice",
                    "Real-time assistance through shared terminals",
                    "AI-powered DevOps query assistant",
                    "Comprehensive progress tracking",
                  ].map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 text-white/80"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#09D1C7]" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-[#09D1C7] to-[#80EE98]/30 p-1">
                  <div className="w-full h-full rounded-lg bg-[#1A202C] p-6 flex items-center justify-center">
                    <Database className="w-24 h-24 text-[#09D1C7]" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;

