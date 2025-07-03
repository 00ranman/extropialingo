'use client'

import { useState, useEffect } from 'react'
import { Trophy, Zap, Brain, Target, TrendingUp, Calendar, Award, Star, Users, BookOpen } from 'lucide-react'
import { ExtropianEngine } from '@/lib/extropian-engine'
import { XPCalculator } from '@/lib/xp-calculator'

interface ProgressDashboardProps {
  userProgress: any
  engine: ExtropianEngine
  xpCalculator: XPCalculator
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
  xpReward: number
}

interface SkillLevel {
  name: string
  level: number
  xp: number
  nextLevelXP: number
  color: string
}

export default function ProgressDashboard({ userProgress, engine, xpCalculator }: ProgressDashboardProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([])
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    loadAchievements()
    calculateSkillLevels()
    generateWeeklyStats()
  }, [userProgress])

  const loadAchievements = () => {
    const allAchievements: Achievement[] = [
      {
        id: 'first_morpheme',
        name: 'First Steps',
        description: 'Learn your first morpheme',
        icon: '🎯',
        unlocked: userProgress.morphemes_learned.length > 0,
        progress: Math.min(userProgress.morphemes_learned.length, 1),
        maxProgress: 1,
        xpReward: 50
      },
      {
        id: 'ten_morphemes',
        name: 'Building Blocks',
        description: 'Master 10 morphemes',
        icon: '🧱',
        unlocked: userProgress.morphemes_learned.length >= 10,
        progress: Math.min(userProgress.morphemes_learned.length, 10),
        maxProgress: 10,
        xpReward: 200
      },
      {
        id: 'morpheme_master',
        name: 'Morpheme Master',
        description: 'Learn all 90+ morphemes',
        icon: '🏆',
        unlocked: userProgress.morphemes_learned.length >= 90,
        progress: Math.min(userProgress.morphemes_learned.length, 90),
        maxProgress: 90,
        xpReward: 1000
      },
      {
        id: 'first_loop',
        name: 'Loop Architect',
        description: 'Construct your first valid loop',
        icon: '🔄',
        unlocked: userProgress.exercises_completed > 0,
        progress: Math.min(userProgress.exercises_completed, 1),
        maxProgress: 1,
        xpReward: 100
      },
      {
        id: 'streak_master',
        name: 'Consistency Champion',
        description: 'maintain a 30-day learning streak',
        icon: '🔥',
        unlocked: userProgress.current_streak >= 30,
        progress: Math.min(userProgress.current_streak, 30),
        maxProgress: 30,
        xpReward: 500
      },
      {
        id: 'xp_millionaire',
        name: 'XP Millionaire',
        description: 'Accumulate 1,000,000 XP',
        icon: '💎',
        unlocked: userProgress.total_xp >= 1000000,
        progress: Math.min(userProgress.total_xp, 1000000),
        maxProgress: 1000000,
        xpReward: 10000
      },
      {
        id: 'perfect_pronunciation',
        name: 'Perfect Pronunciation',
        description: 'Achieve 100% pronunciation accuracy',
        icon: '🎤',
        unlocked: false, // Would need pronunciation data
        progress: 0,
        maxProgress: 1,
        xpReward: 300
      },
      {
        id: 'complexity_master',
        name: 'Complexity Master',
        description: 'Master all morpheme categories',
        icon: '🧠',
        unlocked: userProgress.morphemes_mastered.length >= 15,
        progress: Math.min(userProgress.morphemes_mastered.length, 15),
        maxProgress: 15,
        xpReward: 750
      }
    ]
    
    setAchievements(allAchievements)
  }

  const calculateSkillLevels = () => {
    const skills: SkillLevel[] = [
      {
        name: 'Morpheme Mastery',
        level: Math.floor(userProgress.morphemes_learned.length / 10) + 1,
        xp: userProgress.morphemes_learned.length * 50,
        nextLevelXP: ((Math.floor(userProgress.morphemes_learned.length / 10) + 1) * 10) * 50,
        color: 'text-extropy-400'
      },
      {
        name: 'Loop Construction',
        level: Math.floor(userProgress.exercises_completed / 5) + 1,
        xp: userProgress.exercises_completed * 100,
        nextLevelXP: ((Math.floor(userProgress.exercises_completed / 5) + 1) * 5) * 100,
        color: 'text-xp-400'
      },
      {
        name: 'Entropy Analysis',
        level: Math.floor(userProgress.total_xp / 10000) + 1,
        xp: userProgress.total_xp,
        nextLevelXP: ((Math.floor(userProgress.total_xp / 10000) + 1) * 10000),
        color: 'text-entropy-400'
      },
      {
        name: 'Consistency',
        level: Math.floor(userProgress.current_streak / 7) + 1,
        xp: userProgress.current_streak * 25,
        nextLevelXP: ((Math.floor(userProgress.current_streak / 7) + 1) * 7) * 25,
        color: 'text-yellow-400'
      }
    ]
    
    setSkillLevels(skills)
  }

  const generateWeeklyStats = () => {
    // Simulate weekly progress data
    const stats = {
      xp_gained: Math.floor(Math.random() * 5000) + 1000,
      morphemes_learned: Math.floor(Math.random() * 10) + 2,
      exercises_completed: Math.floor(Math.random() * 20) + 5,
      time_spent: Math.floor(Math.random() * 300) + 60, // minutes
      best_day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)],
      average_accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
      daily_data: Array.from({ length: 7 }, () => ({
        xp: Math.floor(Math.random() * 1000) + 100,
        exercises: Math.floor(Math.random() * 5) + 1,
        time: Math.floor(Math.random() * 60) + 10
      }))
    }
    
    setWeeklyStats(stats)
  }

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getAchievementBadge = (achievement: Achievement) => {
    if (achievement.unlocked) {
      return 'achievement-unlocked'
    }
    return 'achievement-locked'
  }

  return (
    <div className="exercise-container">
      <div className="space-y-8">
        {/* Overall Progress Summary */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span>Progress Dashboard</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total XP</p>
                  <p className="text-2xl font-bold text-xp-400">
                    {userProgress.total_xp.toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-xp-400" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Morphemes Learned</p>
                  <p className="text-2xl font-bold text-extropy-400">
                    {userProgress.morphemes_learned.length}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-extropy-400" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-entropy-400">
                    {userProgress.current_streak}
                  </p>
                </div>
                <Target className="h-8 w-8 text-entropy-400" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Achievements</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {achievements.filter(a => a.unlocked).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Levels */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-extropy-400" />
            <span>Skill Levels</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillLevels.map((skill) => (
              <div key={skill.name} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{skill.name}</h4>
                  <div className="level-indicator">
                    <span className={`text-lg font-bold ${skill.color}`}>
                      Level {skill.level}
                    </span>
                  </div>
                </div>
                
                <div className="progress-bar mb-2">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(skill.xp, skill.nextLevelXP)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{skill.xp.toLocaleString()} XP</span>
                  <span>{skill.nextLevelXP.toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Stats */}
        {weeklyStats && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-entropy-400" />
              <span>Weekly Statistics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">XP Gained</p>
                  <p className="text-2xl font-bold text-xp-400">
                    +{weeklyStats.xp_gained.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Time Spent</p>
                  <p className="text-2xl font-bold text-extropy-400">
                    {formatTime(weeklyStats.time_spent)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Best Day</p>
                  <p className="text-2xl font-bold text-entropy-400">
                    {weeklyStats.best_day}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-4">Daily Progress</h4>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-400 mb-2">{day}</div>
                    <div className="bg-gray-800 rounded p-2">
                      <div className="text-sm font-semibold text-xp-400">
                        {weeklyStats.daily_data[index].xp}
                      </div>
                      <div className="text-xs text-gray-400">
                        {weeklyStats.daily_data[index].exercises}ex
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Award className="h-6 w-6 text-yellow-400" />
            <span>Achievements</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-gray-900 rounded-lg p-4 border-2 ${
                  achievement.unlocked ? 'border-xp-400' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`achievement-badge ${getAchievementBadge(achievement)}`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${getProgressPercentage(achievement.progress, achievement.maxProgress)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {achievement.progress} / {achievement.maxProgress}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 mt-2">
                      <Zap className="h-3 w-3 text-xp-400" />
                      <span className="text-xs text-xp-400">
                        {achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Insights */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-extropy-400" />
            <span>Learning Insights</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Morpheme Categories Mastered</h4>
              <div className="space-y-2">
                {['Agents', 'Actions', 'Validation', 'Entropy', 'Loop Control'].map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{category}</span>
                    <span className="text-sm font-semibold text-extropy-400">
                      {Math.floor(Math.random() * 10) + 5}/15
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Next Learning Goals</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Master advanced loop construction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Improve pronunciation accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Learn recursive morphemes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}