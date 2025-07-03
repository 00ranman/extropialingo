'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, CheckCircle, XCircle, Award } from 'lucide-react'
import { ExtropianEngine } from '@/lib/extropian-engine'

interface PronunciationTrainerProps {
  engine: ExtropianEngine
  userProgress: any
  onPronunciationCompleted: (xp: number) => void
}

interface PronunciationSession {
  morpheme: string
  data: any
  attempts: number
  bestScore: number
  completed: boolean
}

export default function PronunciationTrainer({ engine, userProgress, onPronunciationCompleted }: PronunciationTrainerProps) {
  const [currentSession, setCurrentSession] = useState<PronunciationSession | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [availableMorphemes, setAvailableMorphemes] = useState<string[]>([])
  const [sessionStats, setSessionStats] = useState({
    totalAttempts: 0,
    successfulPronunciations: 0,
    averageScore: 0,
    streakCount: 0
  })

  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const learned = userProgress.morphemes_learned || []
    setAvailableMorphemes(learned)
    
    if (learned.length > 0 && !currentSession) {
      startNewSession()
    }
  }, [userProgress.morphemes_learned])

  useEffect(() => {
    initializeAudio()
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        audioChunksRef.current = []
        
        // Simulate pronunciation analysis
        analyzePronunciation(audioBlob)
      }
      
      mediaRecorderRef.current = recorder
      setMediaRecorder(recorder)
    } catch (error) {
      console.error('Error initializing audio:', error)
      setFeedback('Unable to access microphone. Please check permissions.')
    }
  }

  const startNewSession = () => {
    if (availableMorphemes.length === 0) return
    
    const randomMorpheme = availableMorphemes[Math.floor(Math.random() * availableMorphemes.length)]
    const morphemeData = engine.getMorpheme(randomMorpheme)
    
    if (morphemeData) {
      setCurrentSession({
        morpheme: randomMorpheme,
        data: morphemeData,
        attempts: 0,
        bestScore: 0,
        completed: false
      })
      setPronunciationScore(null)
      setFeedback('')
      setAudioBlob(null)
    }
  }

  const playTargetPronunciation = () => {
    if (!currentSession || isPlaying) return
    
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(currentSession.morpheme)
    utterance.rate = 0.7
    utterance.pitch = 1.0
    utterance.volume = 0.8
    
    utterance.onend = () => {
      setIsPlaying(false)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  const startRecording = () => {
    if (!mediaRecorder || isRecording) return
    
    setIsRecording(true)
    setAudioBlob(null)
    setPronunciationScore(null)
    setFeedback('Recording... speak clearly')
    
    mediaRecorder.start()
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        stopRecording()
      }
    }, 3000)
  }

  const stopRecording = () => {
    if (!mediaRecorder || !isRecording) return
    
    setIsRecording(false)
    setFeedback('Processing pronunciation...')
    mediaRecorder.stop()
  }

  const analyzePronunciation = (audioBlob: Blob) => {
    if (!currentSession) return
    
    // Simulate pronunciation analysis with realistic scoring
    // In a real implementation, this would use speech recognition API
    const simulatedScore = Math.random() * 0.4 + 0.6 // 60-100% range
    const score = Math.round(simulatedScore * 100)
    
    setPronunciationScore(score)
    
    const newSession = {
      ...currentSession,
      attempts: currentSession.attempts + 1,
      bestScore: Math.max(currentSession.bestScore, score)
    }
    
    // Update session stats
    setSessionStats(prev => ({
      totalAttempts: prev.totalAttempts + 1,
      successfulPronunciations: score >= 80 ? prev.successfulPronunciations + 1 : prev.successfulPronunciations,
      averageScore: Math.round(((prev.averageScore * prev.totalAttempts) + score) / (prev.totalAttempts + 1)),
      streakCount: score >= 80 ? prev.streakCount + 1 : 0
    }))
    
    if (score >= 80) {
      setFeedback('Excellent pronunciation! 🎉')
      newSession.completed = true
      
      // Award XP
      const xpReward = Math.round(score * 0.5) + (newSession.attempts === 1 ? 20 : 0)
      onPronunciationCompleted(xpReward)
    } else if (score >= 60) {
      setFeedback('Good attempt! Try to emphasize the syllables more clearly.')
    } else {
      setFeedback('Keep practicing! Listen to the target pronunciation again.')
    }
    
    setCurrentSession(newSession)
  }

  const playRecording = () => {
    if (!audioBlob || !audioRef.current) return
    
    const url = URL.createObjectURL(audioBlob)
    audioRef.current.src = url
    audioRef.current.play()
  }

  const getPronunciationFeedback = (score: number) => {
    if (score >= 90) return { color: 'text-xp-400', message: 'Perfect!' }
    if (score >= 80) return { color: 'text-xp-400', message: 'Great!' }
    if (score >= 60) return { color: 'text-yellow-400', message: 'Good' }
    return { color: 'text-entropy-400', message: 'Keep trying' }
  }

  const getPronunciationTips = (morpheme: string) => {
    const tips = [
      'Speak slowly and clearly',
      'Emphasize each syllable equally',
      'Use a steady, confident tone',
      'Make sure your microphone is close',
      'Practice the morpheme breakdown'
    ]
    
    return tips[Math.floor(Math.random() * tips.length)]
  }

  if (!currentSession) {
    return (
      <div className="exercise-container">
        <div className="exercise-card">
          <div className="text-center py-12">
            <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Pronunciation Trainer</h2>
            <p className="text-gray-400">Learn morphemes first to unlock pronunciation training</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise-container">
      <div className="exercise-card">
        <div className="exercise-header">
          <div className="flex items-center space-x-2">
            <Mic className="h-6 w-6 text-extropy-400" />
            <h2 className="text-2xl font-bold">Pronunciation Trainer</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Attempt {currentSession.attempts + 1}
            </div>
            <button
              onClick={startNewSession}
              className="btn-secondary p-2"
              title="New morpheme"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Morpheme */}
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="morpheme text-4xl mb-4">{currentSession.morpheme}</div>
            <div className="text-xl text-gray-300 mb-2">{currentSession.data.english}</div>
            <div className="text-sm text-gray-400 mb-4">{currentSession.data.function}</div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={playTargetPronunciation}
                disabled={isPlaying}
                className="btn-primary flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
              </button>
            </div>
          </div>

          {/* Recording Interface */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Your Pronunciation</h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!mediaRecorder}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                      : 'bg-extropy-600 hover:bg-extropy-700'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8 text-white" />
                  ) : (
                    <Mic className="h-8 w-8 text-white" />
                  )}
                </button>
                
                {isRecording && (
                  <div className="absolute -inset-4 border-4 border-red-400 rounded-full animate-ping" />
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {isRecording ? 'Recording... (3 seconds max)' : 'Click to record your pronunciation'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getPronunciationTips(currentSession.morpheme)}
                </p>
              </div>
            </div>

            {audioBlob && (
              <div className="mt-6 text-center">
                <button
                  onClick={playRecording}
                  className="btn-secondary flex items-center space-x-2 mx-auto"
                >
                  <Play className="h-4 w-4" />
                  <span>Play Recording</span>
                </button>
              </div>
            )}
          </div>

          {/* Pronunciation Results */}
          {pronunciationScore !== null && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Pronunciation Analysis</h3>
              
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold">
                  <span className={getPronunciationFeedback(pronunciationScore).color}>
                    {pronunciationScore}%
                  </span>
                </div>
                
                <div className={`text-xl ${getPronunciationFeedback(pronunciationScore).color}`}>
                  {getPronunciationFeedback(pronunciationScore).message}
                </div>
                
                <div className="progress-bar max-w-md mx-auto">
                  <div 
                    className="progress-fill"
                    style={{ width: `${pronunciationScore}%` }}
                  />
                </div>
                
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {feedback}
                </p>
                
                {currentSession.completed && (
                  <div className="flex items-center justify-center space-x-2 text-xp-400">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Morpheme Mastered!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-extropy-400">{sessionStats.totalAttempts}</div>
                <div className="text-sm text-gray-400">Total Attempts</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-xp-400">{sessionStats.successfulPronunciations}</div>
                <div className="text-sm text-gray-400">Successful</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-entropy-400">{sessionStats.averageScore}%</div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{sessionStats.streakCount}</div>
                <div className="text-sm text-gray-400">Current Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}