'use client'

import { useState, useEffect } from 'react'
import { Target, Zap, CheckCircle, XCircle, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react'
import { ExtropianEngine } from '@/lib/extropian-engine'
import { XPCalculator } from '@/lib/xp-calculator'

interface LoopConstructorProps {
  engine: ExtropianEngine
  userProgress: any
  onLoopCompleted: (xp: number) => void
}

interface DraggableMorpheme {
  morpheme: string
  data: any
  id: string
}

interface LoopSlot {
  id: string
  type: 'agent' | 'action' | 'validation' | 'entropy' | 'closure'
  morpheme?: string
  required: boolean
}

export default function LoopConstructor({ engine, userProgress, onLoopCompleted }: LoopConstructorProps) {
  const [availableMorphemes, setAvailableMorphemes] = useState<DraggableMorpheme[]>([])
  const [loopSlots, setLoopSlots] = useState<LoopSlot[]>([])
  const [constructedLoop, setConstructedLoop] = useState<string>('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [currentChallenge, setCurrentChallenge] = useState<any>(null)
  const [draggedMorpheme, setDraggedMorpheme] = useState<DraggableMorpheme | null>(null)
  const [xpCalculator] = useState(() => new XPCalculator())

  useEffect(() => {
    initializeConstructor()
  }, [userProgress.morphemes_learned])

  const initializeConstructor = () => {
    // Get available morphemes based on user progress
    const learnedMorphemes = userProgress.morphemes_learned || []
    const morphemeData = learnedMorphemes.map((morpheme: string) => ({
      morpheme,
      data: engine.getMorpheme(morpheme),
      id: `${morpheme}-${Date.now()}-${Math.random()}`
    })).filter((item: any) => item.data)

    setAvailableMorphemes(morphemeData)
    
    // Initialize loop slots
    const slots: LoopSlot[] = [
      { id: 'agent', type: 'agent', required: true },
      { id: 'action', type: 'action', required: true },
      { id: 'validation', type: 'validation', required: false },
      { id: 'entropy', type: 'entropy', required: false },
      { id: 'closure', type: 'closure', required: true }
    ]
    
    setLoopSlots(slots)
    generateNewChallenge()
  }

  const generateNewChallenge = () => {
    const challenges = [
      {
        description: "Create a loop that validates an action and tracks entropy",
        required_types: ['agent', 'action', 'validation', 'entropy', 'closure'],
        example: "ka-sho-ver-nyx-lim",
        hint: "Start with an agent (ka), add an action (sho), validate it (ver), track entropy (nyx), and close the loop (lim)"
      },
      {
        description: "Build a simple action loop with closure",
        required_types: ['agent', 'action', 'closure'],
        example: "ka-log-ek",
        hint: "Keep it simple: agent + action + effect"
      },
      {
        description: "Construct a recursive learning loop",
        required_types: ['agent', 'action', 'validation', 'closure'],
        example: "ka-tik-ver-lim",
        hint: "Use recursion (tik) to create a self-improving loop"
      }
    ]
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    setCurrentChallenge(challenge)
    setShowHint(false)
    clearLoop()
  }

  const clearLoop = () => {
    setLoopSlots(prev => prev.map(slot => ({ ...slot, morpheme: undefined })))
    setConstructedLoop('')
    setValidationResult(null)
  }

  const handleDragStart = (morpheme: DraggableMorpheme) => {
    setDraggedMorpheme(morpheme)
  }

  const handleDragEnd = () => {
    setDraggedMorpheme(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    
    if (!draggedMorpheme) return
    
    const slot = loopSlots.find(s => s.id === slotId)
    if (!slot) return
    
    // Check if morpheme is appropriate for slot type
    if (isValidMorphemeForSlot(draggedMorpheme, slot)) {
      setLoopSlots(prev => prev.map(s => 
        s.id === slotId ? { ...s, morpheme: draggedMorpheme.morpheme } : s
      ))
      updateConstructedLoop(slotId, draggedMorpheme.morpheme)
    }
  }

  const isValidMorphemeForSlot = (morpheme: DraggableMorpheme, slot: LoopSlot): boolean => {
    const category = morpheme.data.category
    
    switch (slot.type) {
      case 'agent':
        return category === 'agents' || morpheme.morpheme === 'ka'
      case 'action':
        return category === 'actions' || category === 'cognitive'
      case 'validation':
        return category === 'validation' || morpheme.morpheme.includes('ver')
      case 'entropy':
        return category === 'entropy' || morpheme.morpheme.includes('nyx')
      case 'closure':
        return category === 'loop_control' || morpheme.morpheme.includes('lim') || morpheme.morpheme.includes('ek')
      default:
        return true
    }
  }

  const updateConstructedLoop = (slotId: string, morpheme: string) => {
    const newSlots = loopSlots.map(s => 
      s.id === slotId ? { ...s, morpheme } : s
    )
    
    const loop = newSlots
      .filter(slot => slot.morpheme)
      .map(slot => slot.morpheme)
      .join('-')
    
    setConstructedLoop(loop)
    
    // Auto-validate when loop is complete
    if (newSlots.every(slot => !slot.required || slot.morpheme)) {
      validateLoop(loop)
    }
  }

  const validateLoop = (loop: string) => {
    if (!loop) return
    
    const validation = engine.validateLoop(loop)
    setValidationResult(validation)
    
    if (validation.valid) {
      // Calculate XP reward
      const xpResult = xpCalculator.calculateLoopXP(loop, validation.complexity || 1)
      onLoopCompleted(xpResult.final_xp)
    }
  }

  const removeMorphemeFromSlot = (slotId: string) => {
    setLoopSlots(prev => prev.map(s => 
      s.id === slotId ? { ...s, morpheme: undefined } : s
    ))
    
    const newLoop = loopSlots
      .filter(slot => slot.id !== slotId && slot.morpheme)
      .map(slot => slot.morpheme)
      .join('-')
    
    setConstructedLoop(newLoop)
    setValidationResult(null)
  }

  const getSlotColor = (slot: LoopSlot) => {
    if (slot.morpheme) {
      return validationResult?.valid ? 'border-xp-400 bg-xp-900/20' : 'border-entropy-400 bg-entropy-900/20'
    }
    return 'border-gray-600 bg-gray-800'
  }

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'agent': return '👤'
      case 'action': return '⚡'
      case 'validation': return '✓'
      case 'entropy': return '🔄'
      case 'closure': return '🔗'
      default: return '?'
    }
  }

  return (
    <div className="exercise-container">
      <div className="exercise-card">
        <div className="exercise-header">
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-extropy-400" />
            <h2 className="text-2xl font-bold">Loop Constructor</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="btn-secondary p-2"
              title="Show hint"
            >
              <Lightbulb className="h-4 w-4" />
            </button>
            <button
              onClick={generateNewChallenge}
              className="btn-secondary p-2"
              title="New challenge"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {currentChallenge && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Challenge</h3>
            <p className="text-gray-300 mb-4">{currentChallenge.description}</p>
            
            {showHint && (
              <div className="bg-extropy-900/20 border border-extropy-600 rounded-lg p-4">
                <p className="text-extropy-400 text-sm">
                  <strong>Hint:</strong> {currentChallenge.hint}
                </p>
                <p className="text-extropy-400 text-sm mt-2">
                  <strong>Example:</strong> <span className="morpheme">{currentChallenge.example}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loop Construction Area */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Construct Your Loop</h3>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {loopSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`drop-zone ${getSlotColor(slot)} min-w-32 relative`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slot.id)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getSlotIcon(slot.type)}</div>
                    <div className="text-xs text-gray-400 mb-2 capitalize">{slot.type}</div>
                    
                    {slot.morpheme ? (
                      <div className="flex items-center justify-between">
                        <span className="morpheme text-sm">{slot.morpheme}</span>
                        <button
                          onClick={() => removeMorphemeFromSlot(slot.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        {slot.required ? 'Required' : 'Optional'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {constructedLoop && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Constructed Loop:</h4>
                <div className="morpheme text-2xl mb-4">{constructedLoop}</div>
                
                {validationResult && (
                  <div className={`p-4 rounded-lg border-2 ${
                    validationResult.valid ? 'border-xp-400 bg-xp-900/20' : 'border-entropy-400 bg-entropy-900/20'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {validationResult.valid ? (
                        <CheckCircle className="h-5 w-5 text-xp-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-entropy-400" />
                      )}
                      <span className="font-semibold">
                        {validationResult.valid ? 'Valid Loop!' : 'Invalid Loop'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{validationResult.explanation}</p>
                    
                    {validationResult.valid && (
                      <div className="flex items-center space-x-2 text-xp-400">
                        <Zap className="h-4 w-4" />
                        <span>+{validationResult.xp_reward || 50} XP</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Available Morphemes */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Available Morphemes</h3>
            <p className="text-gray-400 text-sm mb-4">
              Drag morphemes to the construction slots above
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableMorphemes.map((item) => (
                <div
                  key={item.id}
                  className="morpheme-draggable"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="text-center">
                    <div className="morpheme text-lg mb-1">{item.morpheme}</div>
                    <div className="text-xs text-gray-400">{item.data.english}</div>
                    <div className="text-xs text-gray-500">{item.data.category}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {availableMorphemes.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Learn more morphemes to unlock loop construction!</p>
                <p className="text-sm mt-2">Complete morpheme exercises to expand your vocabulary.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}