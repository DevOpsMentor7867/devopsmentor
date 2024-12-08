'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
 XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { Bell, Search, User, Calendar, Book, Award, Zap, Target, Users } from 'lucide-react'

// Sample data for charts
const monthlyData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 75 },
  { name: 'Mar', value: 85 },
  { name: 'Apr', value: 78 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 88 },
]

const progressData = [
  { name: 'Docker', progress: 75, color: '#09D1C7' },
  { name: 'Kubernetes', progress: 60, color: '#80EE98' },
  { name: 'Jenkins', progress: 85, color: '#845EF7' },
  { name: 'AWS', progress: 45, color: '#FF6B6B' },
]

const scheduleData = [
  { time: '09:00', title: 'Docker Basics', type: 'workshop', color: '#09D1C7' },
  { time: '11:00', title: 'K8s Lab', type: 'lab', color: '#80EE98' },
  { time: '14:00', title: 'CI/CD Pipeline', type: 'practical', color: '#845EF7' },
]

const pieData = [
  { name: 'Completed', value: 65, color: '#09D1C7' },
  { name: 'In Progress', value: 25, color: '#80EE98' },
  { name: 'Not Started', value: 10, color: '#845EF7' },
]

export default function DashboardOverview() {
  return (
    <div className="min-h-screen backdrop-blur-lg text-white p-6 z-50">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#09D1C7]/20 flex items-center justify-center">
            <User className="w-6 h-6 text-[#09D1C7]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-btg">Welcome back, Ahmad Sattar!</h1>
            <p className="text-btg">Continue your DevOps journey</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 ring-[#09D1C7]/20"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <button className="relative p-2 rounded-lg bg-white/20 hover:bg-white/20 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#09D1C7] rounded-full" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 text-gtb">
        {/* Learning Progress */}
        <div className="col-span-8 bg-[#09D1C7]/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Learning Progress</h2>
            <select className="bg-white/20 rounded-lg px-3 py-1">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09D1C7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#09D1C7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#09D1C7" 
                  fillOpacity={1} 
                  fill="url(#colorGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-span-4 bg-[#80EE98]/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Today's Schedule</h2>
            <Calendar className="w-5 h-5 text-[#80EE98]" />
          </div>
          <div className="space-y-4">
            {scheduleData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-16 text-sm text-gray-400">{item.time}</div>
                <div
                  className="flex-1 rounded-lg p-3"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <h4 className="font-medium" style={{ color: item.color }}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tools Progress */}
        <div className="col-span-6 bg-[#845EF7]/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Tools Progress</h2>
          <div className="grid grid-cols-2 gap-6">
            {progressData.map((tool) => (
              <motion.div
                key={tool.name}
                whileHover={{ scale: 1.02 }}
                className="bg-white/20 rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <span style={{ color: tool.color }}>{tool.progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tool.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ backgroundColor: tool.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Course Completion */}
        <div className="col-span-6 bg-[#FF6B6B]/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Course Completion</h2>
          <div className="flex items-center justify-center h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-4 bg-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Start Lab', icon: Zap, color: '#09D1C7' },
              { name: 'Join Meeting', icon: Users, color: '#80EE98' },
              { name: 'View Progress', icon: Target, color: '#845EF7' },
              { name: 'Get Help', icon: Book, color: '#FF6B6B' }
            ].map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/20 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                style={{ color: action.color }}
              >
                <action.icon className="w-6 h-6" />
                {action.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-8 bg-[#09D1C7]/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { title: 'Completed Docker Basics', time: '2 hours ago', icon: Award, color: '#09D1C7' },
              { title: 'Started Kubernetes Lab', time: 'Yesterday', icon: Zap, color: '#80EE98' },
              { title: 'Joined CI/CD Webinar', time: '2 days ago', icon: Users, color: '#845EF7' },
              { title: 'Submitted Project', time: '3 days ago', icon: Book, color: '#FF6B6B' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${activity.color}20` }}>
                  <activity.icon className="w-5 h-5" style={{ color: activity.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

