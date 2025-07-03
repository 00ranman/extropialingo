/**
 * Extropian Language Engine
 * Core logic for parsing, validating, and calculating XP for Extropian language constructs
 */

import morphemeData from '../data/morphemes.json';

export interface Morpheme {
  english: string;
  function: string;
  category: string;
  difficulty: number;
  pronunciation: string;
  examples: string[];
  execution_mapping?: string;
  unlocked_by: string | null;
  xp_modifier?: number;
  xp_impact?: string;
}

export interface LoopStructure {
  agent?: string;
  initiator?: string;
  actions: string[];
  validation?: string;
  closure?: string;
  effect?: string;
  uncertainty_markers: string[];
  entropy_operators: string[];
  nesting_level: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  structure: LoopStructure;
  xp_calculation: XPCalculation;
}

export interface XPCalculation {
  base_xp: number;
  entropy_modifier: number;
  complexity_multiplier: number;
  validation_bonus: number;
  uncertainty_bonus: number;
  final_xp: number;
  entropy_delta: number;
}

export class ExtropianEngine {
  private morphemes: Record<string, Record<string, Morpheme>>;
  
  constructor() {
    this.morphemes = morphemeData;
  }

  /**
   * Get all morphemes flattened into a single object
   */
  getAllMorphemes(): Record<string, Morpheme> {
    const allMorphemes: Record<string, Morpheme> = {};
    
    Object.values(this.morphemes).forEach(category => {
      Object.entries(category).forEach(([key, morpheme]) => {
        allMorphemes[key] = morpheme;
      });
    });
    
    return allMorphemes;
  }

  /**
   * Get all morpheme names as an array
   */
  getAllMorphemeNames(): string[] {
    return Object.keys(this.getAllMorphemes());
  }

  /**
   * Get morphemes by category
   */
  getMorphemesByCategory(category: string): Record<string, Morpheme> {
    return this.morphemes[category] || {};
  }

  /**
   * Get a specific morpheme
   */
  getMorpheme(morpheme: string): Morpheme | undefined {
    const allMorphemes = this.getAllMorphemes();
    return allMorphemes[morpheme];
  }

  /**
   * Check if a morpheme is unlocked based on learned morphemes
   */
  isMorphemeUnlocked(morpheme: string, learnedMorphemes: string[]): boolean {
    const morphemeData = this.getMorpheme(morpheme);
    if (!morphemeData) return false;
    
    // If no prerequisite, it's unlocked
    if (!morphemeData.unlocked_by) return true;
    
    // Check if prerequisite is learned
    return learnedMorphemes.includes(morphemeData.unlocked_by);
  }

  /**
   * Get next available morphemes to learn
   */
  getAvailableMorphemes(learnedMorphemes: string[]): string[] {
    const allMorphemes = this.getAllMorphemes();
    const available: string[] = [];
    
    Object.keys(allMorphemes).forEach(morpheme => {
      if (!learnedMorphemes.includes(morpheme) && 
          this.isMorphemeUnlocked(morpheme, learnedMorphemes)) {
        available.push(morpheme);
      }
    });
    
    return available.sort((a, b) => {
      const diffA = allMorphemes[a].difficulty;
      const diffB = allMorphemes[b].difficulty;
      return diffA - diffB;
    });
  }

  /**
   * Parse an Extropian expression into morphemes
   */
  parseExpression(expression: string): string[] {
    // Handle both hyphen-separated and space-separated input
    const morphemes = expression
      .toLowerCase()
      .replace(/[^a-z\-\+\!\?\s]/g, '') // Keep letters, hyphens, and operators
      .split(/[\s\-]+/)
      .filter(m => m.length > 0);
    
    return morphemes;
  }

  /**
   * Validate an Extropian expression structure
   */
  validateExpression(expression: string): ValidationResult {
    const morphemes = this.parseExpression(expression);
    const allMorphemeData = this.getAllMorphemes();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if all morphemes exist
    const unknownMorphemes = morphemes.filter(m => !allMorphemeData[m]);
    if (unknownMorphemes.length > 0) {
      errors.push(`Unknown morphemes: ${unknownMorphemes.join(', ')}`);
    }

    // Analyze structure
    const structure = this.analyzeStructure(morphemes);
    
    // Validate loop structure
    if (!structure.agent) {
      warnings.push('No agent specified - consider adding ka, mu, vi, or tu');
    }
    
    if (!structure.closure) {
      errors.push('No closure specified - loops must end with lim or zur');
    }
    
    if (structure.actions.length === 0) {
      warnings.push('No actions specified - consider adding morphemes between initiation and closure');
    }

    // Calculate XP
    const xp_calculation = this.calculateXP(structure, morphemes);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      structure,
      xp_calculation
    };
  }

  /**
   * Analyze the grammatical structure of morphemes
   */
  private analyzeStructure(morphemes: string[]): LoopStructure {
    const allMorphemeData = this.getAllMorphemes();
    const structure: LoopStructure = {
      actions: [],
      uncertainty_markers: [],
      entropy_operators: [],
      nesting_level: 0
    };

    morphemes.forEach(morpheme => {
      const data = allMorphemeData[morpheme];
      if (!data) return;

      switch (data.category) {
        case 'agent':
          structure.agent = morpheme;
          break;
        case 'loop_control':
          if (morpheme === 'sho') {
            structure.initiator = morpheme;
          } else if (morpheme === 'lim' || morpheme === 'zur') {
            structure.closure = morpheme;
          } else {
            structure.actions.push(morpheme);
          }
          break;
        case 'validation':
          structure.validation = morpheme;
          break;
        case 'entropy':
          if (morpheme === 'ek') {
            structure.effect = morpheme;
          } else {
            structure.actions.push(morpheme);
          }
          break;
        case 'uncertainty':
          structure.uncertainty_markers.push(morpheme);
          break;
        case 'entropy_operator':
          structure.entropy_operators.push(morpheme);
          break;
        default:
          structure.actions.push(morpheme);
      }
    });

    return structure;
  }

  /**
   * Calculate XP reward for a validated expression
   * XP = (1 - H) × C × V × U
   * Where: H = entropy, C = complexity, V = validation bonus, U = uncertainty bonus
   */
  calculateXP(structure: LoopStructure, morphemes: string[]): XPCalculation {
    const allMorphemeData = this.getAllMorphemes();
    
    // Base XP from morpheme complexity
    const base_xp = morphemes.reduce((sum, morpheme) => {
      const data = allMorphemeData[morpheme];
      return sum + (data ? data.difficulty * 5 : 0);
    }, 0);

    // Entropy calculation based on operators
    let entropy_delta = 0;
    let entropy_modifier = 1.0;
    
    structure.entropy_operators.forEach(op => {
      switch (op) {
        case 'nyx-': // Entropy decrease (positive XP)
          entropy_delta = -0.3;
          entropy_modifier = 1.5;
          break;
        case 'nyx+': // Entropy increase (negative XP)
          entropy_delta = 0.3;
          entropy_modifier = 0.5;
          break;
        case 'nyx!': // Critical entropy
          entropy_delta = Math.abs(entropy_delta) > 0 ? entropy_delta * 2 : -0.5;
          entropy_modifier = 2.0;
          break;
        case 'nyx?': // Unknown entropy
          entropy_delta = 0;
          entropy_modifier = 0.8;
          break;
      }
    });

    // Complexity multiplier based on structure
    let complexity_multiplier = 1.0;
    if (structure.agent) complexity_multiplier += 0.2;
    if (structure.validation) complexity_multiplier += 0.3;
    if (structure.effect) complexity_multiplier += 0.2;
    complexity_multiplier += structure.actions.length * 0.1;
    complexity_multiplier += structure.nesting_level * 0.5;

    // Validation bonus
    let validation_bonus = 1.0;
    if (structure.closure === 'lim') validation_bonus = 1.2;
    if (structure.closure === 'zur') validation_bonus = 0.8;

    // Uncertainty bonus
    let uncertainty_bonus = 1.0;
    structure.uncertainty_markers.forEach(marker => {
      const data = allMorphemeData[marker];
      if (data && data.xp_modifier) {
        uncertainty_bonus *= (1 + data.xp_modifier);
      }
    });

    const final_xp = Math.round(
      base_xp * entropy_modifier * complexity_multiplier * validation_bonus * uncertainty_bonus
    );

    return {
      base_xp,
      entropy_modifier,
      complexity_multiplier,
      validation_bonus,
      uncertainty_bonus,
      final_xp: Math.max(0, final_xp), // Ensure non-negative
      entropy_delta
    };
  }

  /**
   * Generate hints for improving an expression
   */
  generateHints(structure: LoopStructure, morphemes: string[]): string[] {
    const hints: string[] = [];
    
    if (!structure.agent) {
      hints.push("Try adding an agent like 'ka' (I) to specify who is acting");
    }
    
    if (!structure.validation) {
      hints.push("Consider adding 'ver' (verify) to validate your process");
    }
    
    if (structure.entropy_operators.length === 0) {
      hints.push("Add entropy tracking with 'nyx-' (order) or 'nyx+' (disorder)");
    }
    
    if (structure.uncertainty_markers.length === 0 && morphemes.length > 3) {
      hints.push("Express certainty with '-zo' (certain) or '-xa' (provisional)");
    }
    
    if (!structure.effect && structure.actions.length > 2) {
      hints.push("Consider adding 'ek' (effect) to show the impact of your actions");
    }
    
    return hints;
  }

  /**
   * Get random exercise based on learned morphemes
   */
  generateExercise(learnedMorphemes: string[], difficulty: number = 1): any {
    const availableMorphemes = this.getAvailableMorphemes(learnedMorphemes);
    
    if (availableMorphemes.length === 0) {
      return null;
    }
    
    // Simple morpheme identification exercise
    const targetMorpheme = availableMorphemes[Math.floor(Math.random() * availableMorphemes.length)];
    const morphemeData = this.getMorpheme(targetMorpheme);
    
    if (!morphemeData) return null;
    
    // Generate multiple choice options
    const allMorphemes = this.getAllMorphemes();
    const otherMorphemes = Object.keys(allMorphemes)
      .filter(m => m !== targetMorpheme)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [morphemeData.english, ...otherMorphemes.map(m => allMorphemes[m].english)]
      .sort(() => Math.random() - 0.5);
    
    return {
      type: 'morpheme_identification',
      question: `What does the morpheme '${targetMorpheme}' mean?`,
      options,
      correct_answer: options.indexOf(morphemeData.english),
      explanation: `'${targetMorpheme}' means "${morphemeData.english}" - ${morphemeData.function}`,
      target_morpheme: targetMorpheme,
      xp_reward: morphemeData.difficulty * 10
    };
  }

  /**
   * Validate a loop construction (alias for validateExpression for convenience)
   */
  validateLoop(expression: string) {
    const result = this.validateExpression(expression);
    return {
      valid: result.valid,
      explanation: result.errors.join(' ') || 'Valid loop structure',
      complexity: result.structure.actions.length + (result.structure.validation ? 1 : 0) + (result.structure.closure ? 1 : 0),
      xp_reward: result.xp_calculation.final_xp,
      errors: result.errors,
      warnings: result.warnings
    };
  }
}