/**
 * XP Calculator for Extropian Language Learning
 * Implements physics-based XP calculation: XP = ΔS / c_L²
 */

export interface LearningMetrics {
  morphemes_learned: number;
  exercises_completed: number;
  loops_constructed: number;
  pronunciation_accuracy: number;
  consecutive_correct: number;
  time_spent_learning: number; // in minutes
  entropy_reductions_achieved: number;
  teaching_interactions: number;
}

export interface XPEvent {
  event_type: 'morpheme_learned' | 'exercise_completed' | 'loop_constructed' | 
             'pronunciation_perfect' | 'achievement_unlocked' | 'teaching_bonus' |
             'streak_bonus' | 'entropy_reduction' | 'validation_success';
  base_entropy: number;
  difficulty_multiplier: number;
  quality_score: number;
  time_efficiency: number;
  social_bonus: number;
  entropy_delta: number;
  causal_closure_speed: number;
}

export interface XPResult {
  event_type: string;
  base_xp: number;
  entropy_factor: number;
  difficulty_factor: number;
  quality_factor: number;
  efficiency_factor: number;
  social_factor: number;
  final_xp: number;
  entropy_delta: number;
  physics_validation: boolean;
  explanation: string;
}

export class XPCalculator {
  
  /**
   * Calculate XP for language learning activities using entropy reduction principles
   * 
   * Learning_XP = (base_entropy × difficulty × quality × time_efficiency × social_bonus) 
   *               where entropy_delta = measured learning progress
   */
  calculateLearningXP(event: XPEvent): XPResult {
    const {
      base_entropy,
      difficulty_multiplier,
      quality_score,
      time_efficiency,
      social_bonus,
      entropy_delta,
      causal_closure_speed
    } = event;

    // Physics validation: ensure entropy reduction (learning) creates positive XP
    const physics_validation = entropy_delta < 0; // Learning should reduce mental entropy (uncertainty)
    
    // Base XP calculation following learning entropy principles
    let base_xp = base_entropy * difficulty_multiplier;
    
    // Entropy factor: learning (entropy reduction) should yield positive XP
    const entropy_factor = physics_validation ? Math.abs(entropy_delta) : entropy_delta * 0.5;
    
    // Quality factor: higher comprehension = more order created
    const quality_factor = Math.pow(quality_score, 1.5); // Exponential quality reward
    
    // Efficiency factor: faster learning (higher c_L) = more XP per unit time
    const efficiency_factor = Math.min(time_efficiency, 2.0); // Cap at 2x bonus
    
    // Social factor: teaching others = distributed knowledge (entropy reduction)
    const social_factor = 1 + social_bonus;
    
    // Final XP calculation with physics constraint
    let final_xp = base_xp * entropy_factor * quality_factor * efficiency_factor * social_factor;
    
    // Apply causal closure speed constraint: XP = ΔS / c_L²
    if (causal_closure_speed > 0) {
      final_xp = final_xp / Math.pow(causal_closure_speed, 0.5); // Adjusted for learning context
    }
    
    // Ensure physics compliance: no XP for entropy increase in learning
    if (!physics_validation) {
      final_xp *= 0.1; // Minimal XP for failed learning attempts
    }
    
    final_xp = Math.round(Math.max(0, final_xp));
    
    return {
      event_type: event.event_type,
      base_xp,
      entropy_factor,
      difficulty_factor: difficulty_multiplier,
      quality_factor,
      efficiency_factor,
      social_factor,
      final_xp,
      entropy_delta,
      physics_validation,
      explanation: this.generateExplanation(event, final_xp, physics_validation)
    };
  }

  /**
   * Calculate XP for morpheme mastery
   */
  calculateMorphemeXP(morpheme: string, difficulty: number, accuracy: number, time_taken: number): XPResult {
    const base_entropy = 15.0; // Knowledge acquisition baseline
    const expected_time = difficulty * 30; // Expected time in seconds
    const time_efficiency = Math.min(expected_time / time_taken, 2.0);
    
    return this.calculateLearningXP({
      event_type: 'morpheme_learned',
      base_entropy,
      difficulty_multiplier: difficulty,
      quality_score: accuracy,
      time_efficiency,
      social_bonus: 0,
      entropy_delta: -accuracy * 0.5, // Learning reduces uncertainty
      causal_closure_speed: 1000000 // Cognitive domain c_L
    });
  }

  /**
   * Calculate XP for exercise completion
   */
  calculateExerciseXP(exercise_type: string, difficulty: number, accuracy: number, 
                      time_taken: number, streak_bonus: number = 0): XPResult {
    const base_entropy = this.getBaseEntropyForExercise(exercise_type);
    const expected_time = difficulty * 45; // Expected time in seconds
    const time_efficiency = Math.min(expected_time / time_taken, 2.0);
    
    return this.calculateLearningXP({
      event_type: 'exercise_completed',
      base_entropy,
      difficulty_multiplier: difficulty,
      quality_score: accuracy,
      time_efficiency,
      social_bonus: streak_bonus,
      entropy_delta: -accuracy * 0.3, // Skill practice reduces uncertainty
      causal_closure_speed: 100000 // Psychomotor domain c_L
    });
  }

  /**
   * Calculate XP for loop construction
   */
  calculateLoopConstructionXP(complexity: number, validity: boolean, 
                             entropy_operators: string[], uncertainty_markers: string[]): XPResult {
    const base_entropy = 20.0; // Loop construction baseline
    const quality_score = validity ? 1.0 : 0.3;
    
    // Bonus for entropy awareness
    let entropy_bonus = 0;
    entropy_operators.forEach(op => {
      if (op === 'nyx-') entropy_bonus += 0.3; // Entropy reduction awareness
      if (op === 'nyx+') entropy_bonus += 0.1; // Entropy increase awareness
      if (op === 'nyx!') entropy_bonus += 0.5; // Critical entropy awareness
    });
    
    // Bonus for uncertainty quantification
    let uncertainty_bonus = uncertainty_markers.length * 0.2;
    
    return this.calculateLearningXP({
      event_type: 'loop_constructed',
      base_entropy,
      difficulty_multiplier: complexity,
      quality_score,
      time_efficiency: 1.0,
      social_bonus: entropy_bonus + uncertainty_bonus,
      entropy_delta: validity ? -0.4 : 0.1, // Valid loops reduce conceptual entropy
      causal_closure_speed: 10000 // Linguistic domain c_L
    });
  }

  /**
   * Calculate XP for pronunciation accuracy
   */
  calculatePronunciationXP(morpheme: string, accuracy: number, attempts: number): XPResult {
    const base_entropy = 8.0; // Pronunciation baseline
    const difficulty = this.getMorphemeDifficulty(morpheme);
    const efficiency = Math.min(3.0 / attempts, 2.0); // Fewer attempts = higher efficiency
    
    return this.calculateLearningXP({
      event_type: 'pronunciation_perfect',
      base_entropy,
      difficulty_multiplier: difficulty,
      quality_score: accuracy,
      time_efficiency: efficiency,
      social_bonus: 0,
      entropy_delta: -accuracy * 0.2, // Pronunciation practice reduces speech uncertainty
      causal_closure_speed: 1000 // Audio-linguistic domain c_L
    });
  }

  /**
   * Calculate XP for teaching/helping others
   */
  calculateTeachingXP(concepts_taught: number, learner_success_rate: number): XPResult {
    const base_entropy = 25.0; // Teaching baseline (higher due to knowledge transfer)
    
    return this.calculateLearningXP({
      event_type: 'teaching_bonus',
      base_entropy,
      difficulty_multiplier: concepts_taught,
      quality_score: learner_success_rate,
      time_efficiency: 1.0,
      social_bonus: 0.5, // Teaching bonus
      entropy_delta: -learner_success_rate * 0.6, // Successful teaching reduces system-wide ignorance
      causal_closure_speed: 100 // Social learning domain c_L
    });
  }

  /**
   * Calculate streak bonuses
   */
  calculateStreakBonus(consecutive_days: number, perfect_exercises: number): number {
    const consistency_bonus = Math.min(consecutive_days * 0.1, 1.0);
    const perfection_bonus = Math.min(perfect_exercises * 0.05, 0.5);
    return consistency_bonus + perfection_bonus;
  }

  /**
   * Validate XP against physics constraints
   */
  validatePhysicsCompliance(xp_result: XPResult): boolean {
    // Learning should reduce entropy (increase order)
    if (xp_result.entropy_delta >= 0 && xp_result.final_xp > 0) {
      return false; // Cannot gain XP while increasing entropy in learning
    }
    
    // XP should correlate with entropy reduction magnitude
    const expected_xp_range = Math.abs(xp_result.entropy_delta) * 100;
    if (xp_result.final_xp > expected_xp_range * 2) {
      return false; // XP too high for entropy reduction achieved
    }
    
    return true;
  }

  /**
   * Get learning statistics summary
   */
  calculateLearningStats(metrics: LearningMetrics): {
    total_entropy_reduced: number;
    learning_efficiency: number;
    knowledge_density: number;
    teaching_ratio: number;
    mastery_progression: number;
  } {
    const total_entropy_reduced = metrics.entropy_reductions_achieved * 0.3;
    const learning_efficiency = metrics.exercises_completed / Math.max(metrics.time_spent_learning, 1);
    const knowledge_density = metrics.morphemes_learned / Math.max(metrics.exercises_completed, 1);
    const teaching_ratio = metrics.teaching_interactions / Math.max(metrics.morphemes_learned, 1);
    const mastery_progression = (metrics.pronunciation_accuracy + metrics.consecutive_correct / 10) / 2;
    
    return {
      total_entropy_reduced,
      learning_efficiency,
      knowledge_density,
      teaching_ratio,
      mastery_progression
    };
  }

  private getBaseEntropyForExercise(exercise_type: string): number {
    const entropy_map: Record<string, number> = {
      'pronunciation': 8.0,
      'morpheme_matching': 12.0,
      'loop_construction': 20.0,
      'entropy_understanding': 18.0,
      'uncertainty_practice': 15.0,
      'complex_construction': 25.0,
      'story_mode': 22.0,
      'recursive_challenge': 30.0
    };
    
    return entropy_map[exercise_type] || 10.0;
  }

  private getMorphemeDifficulty(morpheme: string): number {
    // Simplified difficulty mapping - in real implementation, fetch from morpheme data
    const difficulty_map: Record<string, number> = {
      'ka': 1, 'mu': 1, 'sho': 1, 'lim': 1, 'ver': 1,
      'vi': 2, 'tu': 2, 'zur': 2, 'rep': 2, 'nyx': 2,
      'tok': 3, 'log': 3, 'zen': 3, 'mor': 3, 'kol': 3,
      'evo': 4, 'aug': 4, 'opt': 4, 'int': 4,
      'tra': 5, 'wi': 5
    };
    
    return difficulty_map[morpheme] || 2;
  }

  /**
   * Calculate XP for loop construction (simplified interface)
   */
  calculateLoopXP(loop: string, complexity: number): XPResult {
    // Extract entropy operators and uncertainty markers from loop
    const entropy_operators = loop.match(/nyx[\-\+\!\?]/g) || [];
    const uncertainty_markers = loop.match(/[\-][xzqw]a/g) || [];
    
    return this.calculateLoopConstructionXP(complexity, true, entropy_operators, uncertainty_markers);
  }

  private generateExplanation(event: XPEvent, final_xp: number, physics_valid: boolean): string {
    const explanations = [
      `Earned ${final_xp} XP for ${event.event_type.replace('_', ' ')}`,
      physics_valid ? 
        '✅ Physics compliant: Learning reduced entropy (uncertainty)' :
        '⚠️ Low XP: Learning should reduce mental entropy',
      `Entropy Δ: ${event.entropy_delta.toFixed(3)} (negative = learning success)`,
      `Quality factor: ${(event.quality_score * 100).toFixed(0)}%`,
      event.social_bonus > 0 ? `Social bonus: +${(event.social_bonus * 100).toFixed(0)}%` : ''
    ].filter(Boolean);
    
    return explanations.join(' | ');
  }
}