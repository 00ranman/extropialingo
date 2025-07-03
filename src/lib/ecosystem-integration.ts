/**
 * Ecosystem Integration Module
 * Connects ExtropiaLingo with LevelUp Academy, XP Ledger, and other Extropy services
 */

import axios from 'axios';

export interface EcosystemUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  xp_balance: number;
  skill_levels: Record<string, number>;
  platforms_connected: string[];
  reputation_score: number;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  entropy_delta: number;
  activity_type: string;
  platform: string;
  timestamp: string;
  validation_status: 'pending' | 'validated' | 'rejected';
  metadata: Record<string, any>;
}

export interface LearningProgress {
  user_id: string;
  morphemes_learned: string[];
  morphemes_mastered: string[];
  exercises_completed: number;
  total_xp_earned: number;
  current_streak: number;
  achievements_unlocked: string[];
  last_activity: string;
  skill_levels: Record<string, number>;
}

export interface PlatformIntegration {
  platform: string;
  enabled: boolean;
  api_url: string;
  integration_level: 'basic' | 'advanced' | 'full';
  capabilities: string[];
}

export class EcosystemIntegration {
  private levelupApiUrl: string;
  private xpLedgerUrl: string;
  private authServiceUrl: string;
  private signalflowUrl: string;
  private homeflowUrl: string;

  constructor() {
    this.levelupApiUrl = process.env.LEVELUP_API_URL || 'http://localhost:3004';
    this.xpLedgerUrl = process.env.XP_LEDGER_URL || 'http://localhost:3001';
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    this.signalflowUrl = process.env.SIGNALFLOW_URL || 'http://localhost:3003';
    this.homeflowUrl = process.env.HOMEFLOW_URL || 'http://localhost:3005';
  }

  /**
   * Authenticate user with unified ecosystem
   */
  async authenticateUser(token: string): Promise<EcosystemUser | null> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        avatar: response.data.avatar,
        xp_balance: response.data.xp_balance || 0,
        skill_levels: response.data.skill_levels || {},
        platforms_connected: response.data.platforms_connected || [],
        reputation_score: response.data.reputation_score || 1.0
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Submit XP transaction to ledger
   */
  async submitXPTransaction(transaction: Omit<XPTransaction, 'id' | 'timestamp' | 'validation_status'>): Promise<string | null> {
    try {
      const response = await axios.post(`${this.xpLedgerUrl}/api/xp/submit`, {
        ...transaction,
        platform: 'ExtropiaLingo',
        domain: 'educational',
        calculation_method: 'entropy_reduction_learning',
        physics_formula: 'XP = ΔS / c_L²',
        validation_required: true
      });

      return response.data.transaction_id;
    } catch (error) {
      console.error('XP transaction submission error:', error);
      return null;
    }
  }

  /**
   * Get user's learning progress
   */
  async getLearningProgress(userId: string): Promise<LearningProgress | null> {
    try {
      const response = await axios.get(`${this.levelupApiUrl}/api/progress/${userId}`);
      
      return {
        user_id: userId,
        morphemes_learned: response.data.extropian_morphemes_learned || [],
        morphemes_mastered: response.data.extropian_morphemes_mastered || [],
        exercises_completed: response.data.extropian_exercises_completed || 0,
        total_xp_earned: response.data.extropian_xp_earned || 0,
        current_streak: response.data.extropian_streak || 0,
        achievements_unlocked: response.data.extropian_achievements || [],
        last_activity: response.data.extropian_last_activity || new Date().toISOString(),
        skill_levels: response.data.extropian_skill_levels || {}
      };
    } catch (error) {
      console.error('Learning progress fetch error:', error);
      return null;
    }
  }

  /**
   * Update user's learning progress
   */
  async updateLearningProgress(progress: LearningProgress): Promise<boolean> {
    try {
      await axios.put(`${this.levelupApiUrl}/api/progress/${progress.user_id}`, {
        extropian_morphemes_learned: progress.morphemes_learned,
        extropian_morphemes_mastered: progress.morphemes_mastered,
        extropian_exercises_completed: progress.exercises_completed,
        extropian_xp_earned: progress.total_xp_earned,
        extropian_streak: progress.current_streak,
        extropian_achievements: progress.achievements_unlocked,
        extropian_last_activity: new Date().toISOString(),
        extropian_skill_levels: progress.skill_levels
      });

      return true;
    } catch (error) {
      console.error('Learning progress update error:', error);
      return false;
    }
  }

  /**
   * Export skills to SignalFlow for task routing
   */
  async exportSkillsToSignalFlow(userId: string, skills: Record<string, number>): Promise<boolean> {
    try {
      // Convert Extropian language skills to SignalFlow skill format
      const signalflowSkills = {
        'extropian_language': this.calculateOverallLanguageSkill(skills),
        'loop_construction': skills.loop_construction || 0,
        'entropy_analysis': skills.entropy_analysis || 0,
        'validation_logic': skills.validation_logic || 0,
        'uncertainty_quantification': skills.uncertainty_quantification || 0,
        'recursive_thinking': skills.recursive_thinking || 0
      };

      await axios.post(`${this.signalflowUrl}/api/skills/import`, {
        user_id: userId,
        skills: signalflowSkills,
        source: 'ExtropiaLingo',
        validation_level: 'extropian_verified'
      });

      return true;
    } catch (error) {
      console.error('SignalFlow skill export error:', error);
      return false;
    }
  }

  /**
   * Export skills to HomeFlow for household coordination
   */
  async exportSkillsToHomeFlow(userId: string, skills: Record<string, number>): Promise<boolean> {
    try {
      // Convert Extropian skills to HomeFlow capabilities
      const homeflowCapabilities = {
        'communication_precision': skills.morpheme_mastery || 0,
        'logical_reasoning': skills.loop_construction || 0,
        'process_optimization': skills.entropy_analysis || 0,
        'family_coordination': skills.social_learning || 0,
        'task_clarity': skills.uncertainty_quantification || 0
      };

      await axios.post(`${this.homeflowUrl}/api/family/skills/update`, {
        user_id: userId,
        capabilities: homeflowCapabilities,
        source: 'ExtropiaLingo',
        language_proficiency: 'extropian'
      });

      return true;
    } catch (error) {
      console.error('HomeFlow skill export error:', error);
      return false;
    }
  }

  /**
   * Get cross-platform achievements
   */
  async getCrossPlatformAchievements(userId: string): Promise<any[]> {
    try {
      const achievements = [];

      // Check SignalFlow achievements
      try {
        const signalflowResponse = await axios.get(`${this.signalflowUrl}/api/achievements/${userId}`);
        achievements.push(...signalflowResponse.data.map((a: any) => ({ ...a, platform: 'SignalFlow' })));
      } catch (e) {
        console.warn('SignalFlow achievements unavailable');
      }

      // Check HomeFlow achievements
      try {
        const homeflowResponse = await axios.get(`${this.homeflowUrl}/api/achievements/${userId}`);
        achievements.push(...homeflowResponse.data.map((a: any) => ({ ...a, platform: 'HomeFlow' })));
      } catch (e) {
        console.warn('HomeFlow achievements unavailable');
      }

      // Check LevelUp Academy achievements
      try {
        const levelupResponse = await axios.get(`${this.levelupApiUrl}/api/achievements/${userId}`);
        achievements.push(...levelupResponse.data.map((a: any) => ({ ...a, platform: 'LevelUp Academy' })));
      } catch (e) {
        console.warn('LevelUp Academy achievements unavailable');
      }

      return achievements;
    } catch (error) {
      console.error('Cross-platform achievements error:', error);
      return [];
    }
  }

  /**
   * Create task in SignalFlow using Extropian description
   */
  async createExtropianTask(userId: string, extropianDescription: string, englishDescription: string): Promise<string | null> {
    try {
      const response = await axios.post(`${this.signalflowUrl}/api/tasks/create`, {
        user_id: userId,
        title: englishDescription,
        description: englishDescription,
        extropian_description: extropianDescription,
        language: 'extropian',
        difficulty: this.estimateTaskDifficulty(extropianDescription),
        required_skills: this.extractRequiredSkills(extropianDescription),
        entropy_tracking: true,
        validation_required: true
      });

      return response.data.task_id;
    } catch (error) {
      console.error('Extropian task creation error:', error);
      return null;
    }
  }

  /**
   * Get ecosystem-wide XP leaderboard
   */
  async getEcosystemLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<any[]> {
    try {
      const response = await axios.get(`${this.xpLedgerUrl}/api/leaderboard`, {
        params: {
          timeframe,
          platforms: ['ExtropiaLingo', 'SignalFlow', 'HomeFlow', 'LevelUp Academy'],
          metric: 'total_xp'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return [];
    }
  }

  /**
   * Validate XP transaction with ecosystem
   */
  async validateXPWithEcosystem(transactionId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.xpLedgerUrl}/api/xp/validate`, {
        transaction_id: transactionId,
        validation_source: 'ExtropiaLingo',
        entropy_verification: true,
        physics_compliance_check: true
      });

      return response.data.validated;
    } catch (error) {
      console.error('XP validation error:', error);
      return false;
    }
  }

  /**
   * Get available platform integrations
   */
  async getAvailableIntegrations(): Promise<PlatformIntegration[]> {
    const integrations: PlatformIntegration[] = [
      {
        platform: 'LevelUp Academy',
        enabled: true,
        api_url: this.levelupApiUrl,
        integration_level: 'full',
        capabilities: ['skill_export', 'progress_sync', 'achievement_sharing', 'xp_transfer']
      },
      {
        platform: 'SignalFlow',
        enabled: true,
        api_url: this.signalflowUrl,
        integration_level: 'advanced',
        capabilities: ['skill_export', 'task_creation', 'extropian_descriptions', 'validation_mesh']
      },
      {
        platform: 'HomeFlow',
        enabled: true,
        api_url: this.homeflowUrl,
        integration_level: 'basic',
        capabilities: ['skill_export', 'family_coordination', 'household_tasks']
      },
      {
        platform: 'XP Ledger',
        enabled: true,
        api_url: this.xpLedgerUrl,
        integration_level: 'full',
        capabilities: ['xp_submission', 'validation', 'leaderboards', 'physics_compliance']
      }
    ];

    // Test connectivity for each integration
    for (const integration of integrations) {
      try {
        await axios.get(`${integration.api_url}/api/health`, { timeout: 2000 });
      } catch (error) {
        integration.enabled = false;
      }
    }

    return integrations;
  }

  /**
   * Sync all user data across ecosystem
   */
  async syncUserAcrossEcosystem(userId: string, userData: any): Promise<boolean> {
    const syncPromises = [
      this.updateLearningProgress(userData.progress),
      this.exportSkillsToSignalFlow(userId, userData.skills),
      this.exportSkillsToHomeFlow(userId, userData.skills)
    ];

    try {
      await Promise.allSettled(syncPromises);
      return true;
    } catch (error) {
      console.error('Ecosystem sync error:', error);
      return false;
    }
  }

  private calculateOverallLanguageSkill(skills: Record<string, number>): number {
    const skillValues = Object.values(skills);
    if (skillValues.length === 0) return 0;
    
    // Weighted average with emphasis on advanced skills
    const weights = {
      'morpheme_mastery': 1.0,
      'loop_construction': 1.5,
      'entropy_analysis': 2.0,
      'recursive_thinking': 2.5,
      'teaching_ability': 1.8
    };
    
    let totalWeighted = 0;
    let totalWeights = 0;
    
    Object.entries(skills).forEach(([skill, level]) => {
      const weight = weights[skill as keyof typeof weights] || 1.0;
      totalWeighted += level * weight;
      totalWeights += weight;
    });
    
    return totalWeights > 0 ? totalWeighted / totalWeights : 0;
  }

  private estimateTaskDifficulty(extropianDescription: string): number {
    // Simple heuristic based on Extropian complexity
    const morphemeCount = extropianDescription.split(/[\s\-]+/).length;
    const hasNesting = extropianDescription.includes('tik');
    const hasUncertainty = /[xzqw]a$/.test(extropianDescription);
    const hasEntropy = extropianDescription.includes('nyx');
    
    let difficulty = morphemeCount * 0.3;
    if (hasNesting) difficulty += 1.5;
    if (hasUncertainty) difficulty += 1.0;
    if (hasEntropy) difficulty += 0.5;
    
    return Math.min(Math.max(difficulty, 1), 5);
  }

  private extractRequiredSkills(extropianDescription: string): string[] {
    const skills = [];
    
    if (extropianDescription.includes('ver')) skills.push('validation');
    if (extropianDescription.includes('nyx')) skills.push('entropy_analysis');
    if (extropianDescription.includes('tik')) skills.push('recursive_thinking');
    if (extropianDescription.includes('log')) skills.push('logical_reasoning');
    if (/[xzqw]a$/.test(extropianDescription)) skills.push('uncertainty_quantification');
    
    return skills;
  }
}