import { Heart, RefreshCw, X, AlertCircle, CircleDollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../Toast';
import { getQuestions } from '../../data/questions';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
  hasShield?: boolean;
  onConsumeShield?: () => void;
  isReadOnly?: boolean;
  sharedState?: any;
  onStateChange?: (state: any) => void;
  customDares?: string[];
  coins?: number;
  onSpendCoins?: (amount: number) => void;
  boardLevel?: number;
  questionBankId?: string;
  customQuestionBanks?: {
    truth: string[];
    dare: string[];
    punishment: string[];
  };
}

// ✅ 本地防重复存储键名
const STORAGE_KEYS = {
  truth: 'used_truth_questions',
  dare: 'used_dare_questions',
  punishment: 'used_punishment_questions'
};

export default function ChallengeModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  hasShield,
  onConsumeShield,
  isReadOnly,
  sharedState,
  onStateChange,
  customDares = [],
  coins = 0,
  onSpendCoins,
  boardLevel = 1,
  questionBankId = 'normal',
  customQuestionBanks = { truth: [], dare: [], punishment: [] },
}: ChallengeModalProps) {
  const toast = useToast();
  const spentCoinsRef = useRef(0);
  const [localState, setLocalState] = useState({
    activeTab: 'truth' as 'truth' | 'dare',
    currentTruthQuestion: '',
    currentDareQuestion: '',
    showPunishment: false,
    currentPunishment: ''
  });

  const availableCoins = coins - spentCoinsRef.current;
  
  const isSmMode = questionBankId === 'sm';
  const isLongDistanceMode = questionBankId === 'longdistance';
  const baseQuestions = getQuestions(boardLevel, isSmMode, undefined, isLongDistanceMode);
  
  const hasCustomQuestions = customQuestionBanks && customQuestionBanks.truth && customQuestionBanks.truth.length > 0;
  const truthQuestions = hasCustomQuestions 
    ? customQuestionBanks.truth 
    : [...baseQuestions.truth, ...(customQuestionBanks?.truth || [])];
  const dareQuestions = hasCustomQuestions 
    ? customQuestionBanks.dare 
    : [...baseQuestions.dare, ...(customQuestionBanks?.dare || []), ...customDares];
  const punishments = hasCustomQuestions 
    ? customQuestionBanks.punishment 
    : [...baseQuestions.punishment, ...(customQuestionBanks?.punishment || [])];

  useEffect(() => {
    if (isOpen) {
      spentCoinsRef.current = 0;
    }
  }, [isOpen]);

  const state = isReadOnly && sharedState ? sharedState : localState;

  const updateState = (newState: Partial<typeof localState>) => {
    if (isReadOnly) return;
    const updated = { ...state, ...newState };
    setLocalState(updated);
    if (onStateChange) onStateChange(updated);
  };

  // ✅ 核心防重复工具函数：读取已用过的题目
  const getUsedQuestions = (type: 'truth' | 'dare' | 'punishment'): string[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS[type]) || '[]');
    } catch {
      return [];
    }
  };

  // ✅ 核心防重复工具函数：标记该题已用过
  const markQuestionAsUsed = (type: 'truth' | 'dare' | 'punishment', question: string) => {
    const used = getUsedQuestions(type);
    if (!used.includes(question)) {
      used.push(question);
      // 为了防止无限扩大，只保留最近 200 道题
      if (used.length > 200) used.shift();
      localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(used));
    }
  };

  // ✅ 核心防重复工具函数：抽不重复的题
  const getRandomUniqueQuestion = (pool: string[], type: 'truth' | 'dare' | 'punishment'): string => {
    if (!pool || pool.length === 0) return "暂无题目，请去题库中添加！";
    
    let used = getUsedQuestions(type);
    // 过滤掉已用过的
    let available = pool.filter(q => !used.includes(q));

    // 如果全用完了，清空历史，重新开始（保证永远有题）
    if (available.length === 0) {
      localStorage.removeItem(STORAGE_KEYS[type]);
      used = [];
      available = pool;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const question = available[randomIndex];
    
    // 记录这道题
    markQuestionAsUsed(type, question);
    return question;
  };

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen && !isReadOnly) {
      // 用“防重复”算法抽题
      const newTruth = getRandomUniqueQuestion(truthQuestions, 'truth');
      const newDare = getRandomUniqueQuestion(dareQuestions, 'dare');
      
      const initial = {
        activeTab: 'truth' as 'truth' | 'dare',
        currentTruthQuestion: newTruth,
        currentDareQuestion: newDare,
        showPunishment: false,
        currentPunishment: ''
      };
      setLocalState(initial);
      if (onStateChange) onStateChange(initial);
    }
  }, [isOpen, isReadOnly]);

  const getRandomDare = () => {
    // 30% chance to pick a custom dare if available
    if (customDares.length > 0 && Math.random() < 0.3) {
      return customDares[Math.floor(Math.random() * customDares.length)];
    }
    return getRandomUniqueQuestion(dareQuestions, 'dare');
  };

  const handleTabChange = (tab: 'truth' | 'dare') => {
    if (isReadOnly) return;
    updateState({
      activeTab: tab
    });
  };

  const handleChangeQuestion = () => {
    if (isReadOnly) return;
    if (availableCoins < 30) {
      toast.showToast('金币不足！换一个需要 30 金币', 'error');
      return;
    }
    
    if (state.activeTab === 'truth') {
      const newQuestion = getRandomUniqueQuestion(truthQuestions, 'truth');
      updateState({ currentTruthQuestion: newQuestion });
    } else {
      const newQuestion = getRandomDare();
      updateState({ currentDareQuestion: newQuestion });
    }
    
    spentCoinsRef.current += 30;
    if (onSpendCoins) onSpendCoins(30);
  };

  const handleSkipClick = () => {
    if (isReadOnly) return;
    if (hasShield && onConsumeShield) {
      onConsumeShield();
      onSkip();
      toast.showToast('甜心护盾生效，免受惩罚！', 'success');
    } else {
      const newPunishment = getRandomUniqueQuestion(punishments, 'punishment');
      updateState({
        showPunishment: true,
        currentPunishment: newPunishment
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      {/* Challenge Popup Container */}
      <div className="relative w-full max-w-md overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        {/* Top Nav Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        {!state.showPunishment ? (
          <>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary">
                <Heart className="w-6 h-6 fill-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)]">心动挑战</h2>
              <p className="mt-1 text-sm text-slate-500 text-[var(--text-tertiary)]">让甜蜜升温的小游戏</p>
            </div>

            {/* Tabs Section */}
            <div className="px-6 pb-2">
              <div className="flex p-1 space-x-1 rounded-xl bg-slate-100 bg-[var(--bg-tertiary)]">
                <button 
                  onClick={() => handleTabChange('truth')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'truth' ? 'bg-white bg-[var(--bg-secondary)] text-primary shadow-sm' : 'text-slate-500 text-[var(--text-tertiary)] hover:text-primary'} ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  真心话
                </button>
                <button 
                  onClick={() => handleTabChange('dare')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'dare' ? 'bg-white bg-[var(--bg-secondary)] text-primary shadow-sm' : 'text-slate-500 text-[var(--text-tertiary)] hover:text-primary'} ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  大冒险
                </button>
              </div>
            </div>

            {/* Central Challenge Card */}
            <div className="px-6 py-6">
              <div className="relative group">
                {/* Soft Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col items-center justify-center p-8 text-center bg-white bg-[var(--bg-tertiary)] border border-primary/5 border-[var(--border-primary)] rounded-xl min-h-[220px]">
                  <div className="absolute top-4 left-4 text-primary/10 text-4xl font-serif">"</div>

                  {/* Image placeholder for decorative mood */}
                  <div className="mb-6 w-full h-32 overflow-hidden rounded-lg relative bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-bounce" />
                  </div>

                  <p className="text-lg font-medium leading-relaxed text-slate-800 text-[var(--text-primary)]">
                    {state.activeTab === 'truth' ? state.currentTruthQuestion : state.currentDareQuestion}
                  </p>

                  {!isReadOnly && (
                    <button 
                      onClick={handleChangeQuestion}
                      disabled={availableCoins < 30}
                      className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity ${availableCoins >= 30 ? 'text-primary hover:opacity-80' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      换一个
                      <span className="flex items-center gap-0.5 text-yellow-600">
                        <CircleDollarSign className="w-3 h-3" />30
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 py-6 bg-slate-50/50 bg-[var(--bg-tertiary)]/50 flex flex-col gap-3">
              {!isReadOnly ? (
                <>
                  <button
                    onClick={onComplete}
                    className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    挑战完成
                  </button>
                  <button
                    onClick={handleSkipClick}
                    className="w-full flex items-center justify-center h-12 px-6 font-bold text-slate-600 text-[var(--text-secondary)] transition-all bg-white bg-[var(--bg-secondary)] border border-slate-200 border-[var(--border-primary)] rounded-xl hover:bg-slate-50 hover:bg-[var(--bg-secondary)] active:scale-[0.98]"
                  >
                    {hasShield ? '使用护盾跳过' : '跳过 (接受惩罚)'}
                  </button>
                </>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
                  等待对方操作...
                </div>
              )}
            </div>
          </>
        ) : (
          /* Punishment Screen */
          <>
            <div className="px-6 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 bg-red-900/30 text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)] mb-2">接受惩罚吧！</h2>
              <p className="text-sm text-slate-500 text-[var(--text-tertiary)] mb-8">既然选择了跳过，就要愿赌服输哦~</p>
              
              <div className="p-6 bg-red-50 bg-red-900/20 border border-red-100 border-red-800 rounded-xl mb-8">
                <p className="text-xl font-bold text-red-600 text-red-400">
                  {state.currentPunishment}
                </p>
              </div>
            </div>

            <div className="px-6 py-6 bg-slate-50/50 bg-[var(--bg-tertiary)]/50 flex flex-col gap-3">
              {!isReadOnly ? (
                <button
                  onClick={onSkip}
                  className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]"
                >
                  我认罚！(关闭)
                </button>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
                  等待对方接受惩罚...
                </div>
              )}
            </div>
          </>
        )}

        {/* Close Button */}
        {!isReadOnly && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}