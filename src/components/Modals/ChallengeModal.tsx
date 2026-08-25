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
  // 注意：这里我们主动删掉了 customQuestionBanks 和 roomId！
}

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
  
  // ✅ 100% 从本地代码（data/questions.ts）里读取，绝对不依赖后端！
  const baseQuestions = getQuestions(boardLevel, isSmMode, undefined, isLongDistanceMode);
  
  const truthQuestions = baseQuestions.truth;
  const dareQuestions = [...baseQuestions.dare, ...customDares];
  const punishments = baseQuestions.punishment;

  const state = isReadOnly && sharedState ? sharedState : localState;
  const updateState = (newState: Partial<typeof localState>) => {
    if (isReadOnly) return;
    const updated = { ...state, ...newState };
    setLocalState(updated);
    if (onStateChange) onStateChange(updated);
  };

  // ✅ 防重复：读取已用过记录
  const getUsedQuestions = (type: 'truth' | 'dare' | 'punishment'): string[] => {
    try { return JSON.parse(localStorage.getItem(`used_${type}_questions`) || '[]'); } 
    catch { return []; }
  };

  // ✅ 防重复：标记已用
  const markQuestionAsUsed = (type: 'truth' | 'dare' | 'punishment', question: string) => {
    const used = getUsedQuestions(type);
    if (!used.includes(question)) {
      used.push(question);
      if (used.length > 200) used.shift();
      localStorage.setItem(`used_${type}_questions`, JSON.stringify(used));
    }
  };

  // ✅ 核心防重复逻辑
  const getRandomUniqueQuestion = (pool: string[], type: 'truth' | 'dare' | 'punishment'): string => {
    if (!pool || pool.length === 0) return "题库为空，请去 data/questions.ts 添加题目！";
    
    let used = getUsedQuestions(type);
    let available = pool.filter(q => !used.includes(q));

    if (available.length === 0) {
      localStorage.removeItem(`used_${type}_questions`);
      available = pool;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const question = available[randomIndex];
    markQuestionAsUsed(type, question);
    return question;
  };

  // 初始化弹窗
  useEffect(() => {
    if (isOpen && !isReadOnly) {
      const newTruth = getRandomUniqueQuestion(truthQuestions, 'truth');
      const newDare = getRandomUniqueQuestion(dareQuestions, 'dare');
      setLocalState({
        activeTab: 'truth',
        currentTruthQuestion: newTruth,
        currentDareQuestion: newDare,
        showPunishment: false,
        currentPunishment: ''
      });
    }
  }, [isOpen, isReadOnly]);

  const handleTabChange = (tab: 'truth' | 'dare') => {
    if (isReadOnly) return;
    updateState({ activeTab: tab });
  };

  const handleChangeQuestion = () => {
    if (isReadOnly) return;
    if (availableCoins < 30) {
      toast.showToast('金币不足！换一个需要 30 金币', 'error');
      return;
    }
    
    const newQuestion = state.activeTab === 'truth' 
      ? getRandomUniqueQuestion(truthQuestions, 'truth')
      : getRandomUniqueQuestion(dareQuestions, 'dare');
    
    updateState(state.activeTab === 'truth' ? { currentTruthQuestion: newQuestion } : { currentDareQuestion: newQuestion });
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
      updateState({ showPunishment: true, currentPunishment: newPunishment });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-xl shadow-2xl border border-pink-200 animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>

        {!state.showPunishment ? (
          <>
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-pink-100 text-pink-500">
                <Heart className="w-6 h-6 fill-pink-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">心动挑战</h2>
              <p className="mt-1 text-sm text-slate-500">让甜蜜升温的小游戏</p>
            </div>

            <div className="px-6 pb-2">
              <div className="flex p-1 space-x-1 rounded-xl bg-slate-100">
                <button 
                  onClick={() => handleTabChange('truth')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'truth' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-pink-500'} ${isReadOnly ? 'cursor-default' : ''}`}
                >真心话</button>
                <button 
                  onClick={() => handleTabChange('dare')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'dare' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-pink-500'} ${isReadOnly ? 'cursor-default' : ''}`}
                >大冒险</button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 to-purple-200 rounded-xl blur opacity-75"></div>
                <div className="relative flex flex-col items-center justify-center p-8 text-center bg-white border border-pink-100 rounded-xl min-h-[220px]">
                  <div className="absolute top-4 left-4 text-pink-100 text-4xl font-serif">"</div>
                  
                  <div className="mb-6 w-full h-32 overflow-hidden rounded-lg relative bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-bounce" />
                  </div>

                  <p className="text-lg font-medium leading-relaxed text-slate-800">
                    {state.activeTab === 'truth' ? state.currentTruthQuestion : state.currentDareQuestion}
                  </p>

                  {!isReadOnly && (
                    <button 
                      onClick={handleChangeQuestion}
                      disabled={availableCoins < 30}
                      className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity ${availableCoins >= 30 ? 'text-pink-500 hover:opacity-80' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <RefreshCw className="w-4 h-4" />换一个 <span className="flex items-center gap-0.5 text-yellow-600"><CircleDollarSign className="w-3 h-3" />30</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 bg-slate-50 flex flex-col gap-3">
              {!isReadOnly ? (
                <>
                  <button onClick={onComplete} className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-500/20 active:scale-[0.98]">
                    挑战完成
                  </button>
                  <button onClick={handleSkipClick} className="w-full flex items-center justify-center h-12 px-6 font-bold text-slate-600 transition-all bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-[0.98]">
                    {hasShield ? '使用护盾跳过' : '跳过 (接受惩罚)'}
                  </button>
                </>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 py-3">等待对方操作...</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">接受惩罚吧！</h2>
              <p className="text-sm text-slate-500 mb-8">既然选择了跳过，就要愿赌服输哦~</p>
              <div className="p-6 bg-red-50 border border-red-100 rounded-xl mb-8">
                <p className="text-xl font-bold text-red-600">{state.currentPunishment}</p>
              </div>
            </div>
            <div className="px-6 py-6 bg-slate-50 flex flex-col gap-3">
              {!isReadOnly ? (
                <button onClick={onSkip} className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]">
                  我认罚！(关闭)
                </button>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 py-3">等待对方接受惩罚...</div>
              )}
            </div>
          </>
        )}

        {!isReadOnly && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-pink-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}