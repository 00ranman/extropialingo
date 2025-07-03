'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Brain, Zap, Target, Trophy, BookOpen, Users, ArrowRight, Sparkles } from 'lucide-react'
import { ExtropianEngine } from '@/lib/extropian-engine'
import { XPCalculator } from '@/lib/xp-calculator'
import MorphemeCard from '@/components/MorphemeCard'
import ProgressDashboard from '@/components/ProgressDashboard'
import LoopConstructor from '@/components/LoopConstructor'
import PronunciationTrainer from '@/components/PronunciationTrainer'

interface UserProgress {
  morphemes_learned: string[]
  morphemes_mastered: string[]
  total_xp: number
  current_streak: number
  exercises_completed: number
  achievements_unlocked: string[]
}

export default function LearnPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'morphemes' | 'construction' | 'pronunciation' | 'progress'>('overview')
  const [userProgress, setUserProgress] = useState<UserProgress>({
    morphemes_learned: [],
    morphemes_mastered: [],
    total_xp: 0,
    current_streak: 0,
    exercises_completed: 0,
    achievements_unlocked: []
  })
  const [engine] = useState(() => new ExtropianEngine())
  const [xpCalculator] = useState(() => new XPCalculator())
  const [availableMorphemes, setAvailableMorphemes] = useState<string[]>([])

  useEffect(() => {
    if (session?.user) {
      // Load user progress from localStorage or API
      loadUserProgress()
    }
  }, [session])

  useEffect(() => {
    // Update available morphemes based on progress
    const available = engine.getAvailableMorphemes(userProgress.morphemes_learned)
    setAvailableMorphemes(available)
  }, [userProgress.morphemes_learned, engine])

  const loadUserProgress = () => {
    // For now, load from localStorage. In production, this would come from the API
    const saved = localStorage.getItem('extropialingo-progress')
    if (saved) {
      try {
        const progress = JSON.parse(saved)
        setUserProgress(progress)
      } catch (error) {
        console.error('Error loading progress:', error)
      }
    }
  }

  const saveUserProgress = (progress: UserProgress) => {
    setUserProgress(progress)
    localStorage.setItem('extropialingo-progress', JSON.stringify(progress))
  }

  const handleMorphemeLearned = (morpheme: string, accuracy: number, timeSpent: number) => {
    if (userProgress.morphemes_learned.includes(morpheme)) return

    const morphemeData = engine.getMorpheme(morpheme)
    if (!morphemeData) return

    // Calculate XP reward
    const xpResult = xpCalculator.calculateMorphemeXP(morpheme, morphemeData.difficulty, accuracy, timeSpent)
    
    // Update progress
    const newProgress = {
      ...userProgress,
      morphemes_learned: [...userProgress.morphemes_learned, morpheme],
      total_xp: userProgress.total_xp + xpResult.final_xp,
      exercises_completed: userProgress.exercises_completed + 1
    }

    // Check for mastery (requires high accuracy)
    if (accuracy >= 0.9 && !userProgress.morphemes_mastered.includes(morpheme)) {
      newProgress.morphemes_mastered = [...userProgress.morphemes_mastered, morpheme]
    }

    saveUserProgress(newProgress)

    // Show XP gain animation
    showXPGain(xpResult.final_xp)
  }

  const showXPGain = (xp: number) => {
    // Create floating XP notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-20 right-4 bg-xp-600 text-white px-4 py-2 rounded-lg font-bold z-50 animate-xp-gain'
    notification.textContent = `+${xp} XP`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 2000)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-extropy-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-extropy-400 to-xp-400 bg-clip-text text-transparent">
              ExtropiaLingo
            </h1>
            <p className="text-xl text-gray-300">
              Master the revolutionary Extropian language through gamified learning
            </p>
            <p className="text-lg text-gray-400">
              Physics-based XP rewards • Entropy reduction tracking • Loop construction mastery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="bg-gray-800 rounded-lg p-6 border border-extropy-600">
              <Brain className="h-12 w-12 text-extropy-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Learn Morphemes</h3>
              <p className="text-gray-400 text-sm">Master 90+ Extropian morphemes through interactive exercises</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-xp-600">
              <Zap className="h-12 w-12 text-xp-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Earn XP</h3>
              <p className="text-gray-400 text-sm">Physics-based rewards for verified entropy reduction</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-entropy-600">
              <Target className="h-12 w-12 text-entropy-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Build Loops</h3>
              <p className="text-gray-400 text-sm">Construct valid Extropian expressions with loop closure</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => signIn('google')}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <span>Sign in with Google</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-sm text-gray-500">
              Requires @xpengine.org email for ecosystem integration
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-extropy-400" />
              <span>Sample Extropian Expression</span>
            </h3>
            <div className="font-extropian text-extropy-400 text-xl mb-2">
              ka-sho-nyx-ver-lim-ek
            </div>
            <p className="text-gray-400 text-sm">
              "I (ka) initiate (sho) entropy tracking (nyx), verify (ver), close the loop (lim) with effect (ek)"
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'morphemes', label: 'Morphemes', icon: Brain },
    { id: 'construction', label: 'Construction', icon: Target },
    { id: 'pronunciation', label: 'Pronunciation', icon: Users },
    { id: 'progress', label: 'Progress', icon: Trophy }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-extropy-400">ExtropiaLingo</h1>
              <div className="hidden md:flex items-center space-x-4">
                <div className="xp-counter">
                  <Zap className="h-4 w-4 text-xp-400" />
                  <span className="text-xp-400 font-bold">{userProgress.total_xp.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">XP</span>
                </div>
                <div className="streak-counter">
                  <Target className="h-4 w-4 text-entropy-400" />
                  <span className="text-entropy-400 font-bold">{userProgress.current_streak}</span>
                  <span className="text-gray-400 text-sm">streak</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-extropy-400 text-extropy-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Learning Dashboard</h2>
              <p className="text-gray-400">
                Progress through morpheme mastery with physics-based XP rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Exercises Completed</p>
                    <p className="text-2xl font-bold text-entropy-400">
                      {userProgress.exercises_completed}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-entropy-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Achievements</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {userProgress.achievements_unlocked.length}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Next Learning Steps */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Next Learning Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMorphemes.slice(0, 4).map((morpheme) => {
                  const data = engine.getMorpheme(morpheme)
                  if (!data) return null
                  
                  return (
                    <div key={morpheme} className="morpheme-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="morpheme text-lg">{morpheme}</span>
                        <div className="difficulty-indicator">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`difficulty-star ${
                                i < data.difficulty ? 'difficulty-star-filled' : 'difficulty-star-empty'
                              }`}
                            >★</div>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{data.english}</p>
                      <p className="text-gray-500 text-xs">{data.function}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'morphemes' && (
          <MorphemeCard
            engine={engine}
            userProgress={userProgress}
            onMorphemeLearned={handleMorphemeLearned}
          />
        )}

        {activeTab === 'construction' && (
          <LoopConstructor
            engine={engine}
            userProgress={userProgress}
            onLoopCompleted={(xp) => {
              const newProgress = {
                ...userProgress,
                total_xp: userProgress.total_xp + xp,
                exercises_completed: userProgress.exercises_completed + 1
              }
              saveUserProgress(newProgress)
              showXPGain(xp)
            }}
          />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationTrainer
            engine={engine}
            userProgress={userProgress}
            onPronunciationCompleted={(xp) => {
              const newProgress = {
                ...userProgress,
                total_xp: userProgress.total_xp + xp,
                exercises_completed: userProgress.exercises_completed + 1
              }
              saveUserProgress(newProgress)
              showXPGain(xp)
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            userProgress={userProgress}
            engine={engine}
            xpCalculator={xpCalculator}
          />
        )}
      </main>
    </div>
  )
}