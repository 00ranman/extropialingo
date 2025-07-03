'use client'

import { useState, useEffect } from 'react'
import { Brain, Zap, Volume2, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { ExtropianEngine } from '@/lib/extropian-engine'

interface MorphemeCardProps {
  engine: ExtropianEngine
  userProgress: any
  onMorphemeLearned: (morpheme: string, accuracy: number, timeSpent: number) => void
}

interface Exercise {
  type: 'translation' | 'definition' | 'audio' | 'construction'
  question: string
  options?: string[]
  correct_answer: string
  explanation: string
}

export default function MorphemeCard({ engine, userProgress, onMorphemeLearned }: MorphemeCardProps) {
  const [currentMorpheme, setCurrentMorpheme] = useState<string>('')
  const [morphemeData, setMorphemeData] = useState<any>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [exerciseResult, setExerciseResult] = useState<'correct' | 'incorrect' | null>(null)
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(0)
  const [exerciseScore, setExerciseScore] = useState<number>(0)
  const [totalExercises, setTotalExercises] = useState<number>(0)
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [availableMorphemes, setAvailableMorphemes] = useState<string[]>([])

  useEffect(() => {
    const available = engine.getAvailableMorphemes(userProgress.morphemes_learned)
    setAvailableMorphemes(available)
    if (available.length > 0 && !currentMorpheme) {
      selectRandomMorpheme()
    }
  }, [userProgress.morphemes_learned, engine])

  const selectRandomMorpheme = () => {
    if (availableMorphemes.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * availableMorphemes.length)
    const morpheme = availableMorphemes[randomIndex]
    setCurrentMorpheme(morpheme)
    
    const data = engine.getMorpheme(morpheme)
    setMorphemeData(data)
    
    if (data) {
      generateExercise(morpheme, data)
    }
  }

  const generateExercise = (morpheme: string, data: any) => {
    const exerciseTypes = ['translation', 'definition', 'construction']
    const type = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)] as Exercise['type']
    
    let exercise: Exercise
    
    switch (type) {
      case 'translation':
        exercise = {
          type: 'translation',
          question: `What does "${morpheme}" mean in English?`,
          options: generateTranslationOptions(data.english),
          correct_answer: data.english,
          explanation: `"${morpheme}" means "${data.english}". It is used as ${data.function}.`
        }
        break
        
      case 'definition':
        exercise = {
          type: 'definition',
          question: `Which morpheme means "${data.english}"?`,
          options: generateMorphemeOptions(morpheme),
          correct_answer: morpheme,
          explanation: `The morpheme "${morpheme}" means "${data.english}". ${data.example || ''}`
        }
        break
        
      case 'construction':
        exercise = {
          type: 'construction',
          question: `Complete this Extropian expression: "ka-sho-${morpheme}-..."`,
          options: generateConstructionOptions(data),
          correct_answer: getConstructionAnswer(data),
          explanation: `In loop construction, "${morpheme}" functions as ${data.function}.`
        }
        break
        
      default:
        exercise = {
          type: 'translation',
          question: `What does "${morpheme}" mean?`,
          correct_answer: data.english,
          explanation: `"${morpheme}" means "${data.english}".`
        }
    }
    
    setCurrentExercise(exercise)
    setExerciseStartTime(Date.now())
    setSelectedAnswer('')
    setExerciseResult(null)
    setShowExplanation(false)
  }

  const generateTranslationOptions = (correct: string): string[] => {
    const alternatives = [
      'validate', 'reduce', 'measure', 'connect', 'analyze', 'optimize', 'verify', 'track',
      'loop', 'closure', 'entropy', 'uncertainty', 'effect', 'cause', 'temporal', 'spatial'
    ]
    
    const options = [correct]
    while (options.length < 4) {
      const alt = alternatives[Math.floor(Math.random() * alternatives.length)]
      if (!options.includes(alt)) {
        options.push(alt)
      }
    }
    
    return options.sort(() => Math.random() - 0.5)
  }

  const generateMorphemeOptions = (correct: string): string[] => {
    const morphemes = engine.getAllMorphemeNames()
    const options = [correct]
    
    while (options.length < 4) {
      const morpheme = morphemes[Math.floor(Math.random() * morphemes.length)]
      if (!options.includes(morpheme)) {
        options.push(morpheme)
      }
    }
    
    return options.sort(() => Math.random() - 0.5)
  }

  const generateConstructionOptions = (data: any): string[] => {
    const suffixes = ['ver-lim', 'nyx-ek', 'tik-ver', 'log-ek']
    return suffixes.sort(() => Math.random() - 0.5)
  }

  const getConstructionAnswer = (data: any): string => {
    if (data.category === 'validation') return 'ver-lim'
    if (data.category === 'entropy') return 'nyx-ek'
    if (data.category === 'loop_control') return 'tik-ver'
    return 'log-ek'
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!currentExercise || !selectedAnswer) return
    
    const isCorrect = selectedAnswer === currentExercise.correct_answer
    setExerciseResult(isCorrect ? 'correct' : 'incorrect')
    setShowExplanation(true)
    
    const timeSpent = (Date.now() - exerciseStartTime) / 1000
    const accuracy = isCorrect ? 1.0 : 0.0
    
    setTotalExercises(prev => prev + 1)
    if (isCorrect) {
      setExerciseScore(prev => prev + 1)
    }
    
    // Check if morpheme is mastered (3 correct answers)
    if (isCorrect && exerciseScore >= 2) {
      onMorphemeLearned(currentMorpheme, accuracy, timeSpent)
    }
  }

  const handleNextExercise = () => {
    if (exerciseScore >= 3) {
      // Morpheme mastered, move to next
      selectRandomMorpheme()
      setExerciseScore(0)
      setTotalExercises(0)
    } else {
      // Generate new exercise for same morpheme
      if (morphemeData) {
        generateExercise(currentMorpheme, morphemeData)
      }
    }
  }

  const speakMorpheme = () => {
    if (currentMorpheme) {
      const utterance = new SpeechSynthesisUtterance(currentMorpheme)
      utterance.rate = 0.8
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!currentMorpheme || !morphemeData || !currentExercise) {
    return (
      <div className="exercise-container">
        <div className="exercise-card">
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Loading Morpheme Exercise</h2>
            <p className="text-gray-400">Preparing your personalized learning experience...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise-container">
      <div className="exercise-card">
        <div className="exercise-header">
          <div className="flex items-center space-x-4">
            <div className="morpheme text-2xl">{currentMorpheme}</div>
            <button
              onClick={speakMorpheme}
              className="btn-secondary p-2"
              title="Pronounce morpheme"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Score: {exerciseScore}/{totalExercises}
            </div>
            <div className="difficulty-indicator">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`difficulty-star ${
                    i < morphemeData.difficulty ? 'difficulty-star-filled' : 'difficulty-star-empty'
                  }`}
                >★</div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{currentExercise.question}</h3>
            
            {currentExercise.options ? (
              <div className="grid grid-cols-1 gap-3">
                {currentExercise.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={exerciseResult !== null}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedAnswer === option
                        ? exerciseResult === 'correct'
                          ? 'border-xp-400 bg-xp-900/20'
                          : exerciseResult === 'incorrect'
                          ? 'border-entropy-400 bg-entropy-900/20'
                          : 'border-extropy-400 bg-extropy-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    } ${
                      exerciseResult && option === currentExercise.correct_answer
                        ? 'border-xp-400 bg-xp-900/20'
                        : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-extropy-400 focus:outline-none"
                  disabled={exerciseResult !== null}
                />
              </div>
            )}
          </div>

          {showExplanation && (
            <div className={`p-4 rounded-lg border-2 ${
              exerciseResult === 'correct' ? 'border-xp-400 bg-xp-900/20' : 'border-entropy-400 bg-entropy-900/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {exerciseResult === 'correct' ? (
                  <CheckCircle className="h-5 w-5 text-xp-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-entropy-400" />
                )}
                <span className="font-semibold">
                  {exerciseResult === 'correct' ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-gray-300">{currentExercise.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={selectRandomMorpheme}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>New Morpheme</span>
            </button>
            
            {!exerciseResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Submit Answer</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleNextExercise}
                className="btn-success flex items-center space-x-2"
              >
                <span>
                  {exerciseScore >= 3 ? 'Next Morpheme' : 'Try Again'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Morpheme Mastery Progress</span>
          <span className="text-sm font-semibold">{Math.round((exerciseScore / 3) * 100)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(exerciseScore / 3) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Complete 3 exercises correctly to master this morpheme
        </p>
      </div>
    </div>
  )
}