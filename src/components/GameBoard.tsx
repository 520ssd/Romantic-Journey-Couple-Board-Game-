import { Heart, CircleDollarSign, Play, Flag, Store, HelpCircle, Shuffle } from 'lucide-react';
import ChatPanel from './ChatPanel';

export const BOARD_TILES = [
  { id: 1, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 2, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 3, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 4, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 5, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 6, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 7, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 8, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 9, type: 'fate', bgClass: 'bg-amber-100' },
  { id: 10, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 11, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 12, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 13, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 14, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 15, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 16, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 17, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 18, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 19, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 20, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 21, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 22, type: 'fate', bgClass: 'bg-amber-100' },
  { id: 23, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 24, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 25, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 26, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 27, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 28, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 29, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 30, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 31, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 32, type: 'finish', bgClass: 'bg-yellow-100' },
] as const;

export type TileType = typeof BOARD_TILES[number]['type'];

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

interface GameBoardProps {
  himPosition: number;
  herPosition: number;
  turn: 'him' | 'her';
  himJoined: boolean;
  herJoined: boolean;
  himName: string;
  herName: string;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentPlayer?: string;
  onRollDice?: () => void;
  isRolling?: boolean;
  diceResult?: number | null;
  isMyTurn?: boolean;
}

export default function GameBoard({ 
  himPosition, 
  herPosition, 
  turn, 
  himJoined, 
  herJoined, 
  himName, 
  herName, 
  messages, 
  onSendMessage, 
  currentPlayer, 
  onRollDice, 
  isRolling, 
  diceResult, 
  isMyTurn 
}: GameBoardProps) {
  const himAvatar = '/avatars/him-avatar.svg';
  const herAvatar = '/avatars/her-avatar.svg';

  const renderPlayer = (player: 'him' | 'her', position: number, targetPosition: number) => {
    if (player === 'him' && !himJoined) return null;
    if (player === 'her' && !herJoined) return null;
    if (position !== targetPosition) return null;
    return (
      <div
        className={`absolute ${
          player === 'him' ? '-top-4 -right-4' : '-bottom-4 -left-4'
        } h-12 w-12 rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] z-30 overflow-hidden bg-white transition-all duration-500 hover:scale-110`}
      >
        <img
          alt={player === 'him' ? '他' : '她'}
          src={player === 'him' ? himAvatar : herAvatar}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const getTileStyle = (num: number) => {
    let col = 1;
    let row = 1;
    if (num >= 1 && num <= 9) {
      col = num;
      row = 1;
    } else if (num >= 10 && num <= 16) {
      col = 9;
      row = num - 8;
    } else if (num >= 17 && num <= 25) {
      col = 26 - num;
      row = 9;
    } else if (num >= 26 && num <= 32) {
      col = 1;
      row = 34 - num;
    }
    return { gridColumnStart: col, gridRowStart: row };
  };

  const renderTile = (
    num: number,
    type: TileType,
    bgClass: string
  ) => {
    const isStart = num === 1;
    const isFinish = num === 32;
    const isActive = himPosition === num || herPosition === num;

    return (
      <div
        key={num}
        style={getTileStyle(num)}
        className={`
          w-full h-full min-h-[60px] md:min-h-[80px] 
          relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          flex flex-col items-center justify-center 
          
          /* 核心糖果风：超大圆角 + 微积木厚度 */
          rounded-3xl 
          border-b-[4px] border-r-[2px] border-black/10
          
          /* 顶部微光 */
          shadow-[inset_0_2px_6px_rgba(255,255,255,0.7),0_4px_10px_rgba(0,0,0,0.05)]
          
          /* 保持底色 */
          ${bgClass} 
          
          /* 悬停时微微抬起 */
          hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1
          
          /* ⭐ 核心要求：走到格子时的立体悬浮 (抬起 + 放大 + 漂浮) */
          ${isActive ? `
            translate-y-[-12px] scale-105 z-20
            shadow-[0_16px_32px_rgba(0,0,0,0.25),0_0_0_2px_rgba(255,255,255,0.8)]
            border-b-[4px] border-primary
            animate-[float_2s_ease-in-out_infinite]
          ` : ''}
        `}
      >
        {/* 定义悬浮动画（放在 div 里面作为局部样式） */}
        {isActive && (
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(-12px) scale(1.05); }
              50% { transform: translateY(-20px) scale(1.08); }
            }
          `}</style>
        )}

        {isStart && (
          <div className="absolute -top-3 -left-3 bg-[#ee2b4b] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-30">
            <Play className="w-3 h-3 fill-white" /> 起点
          </div>
        )}
        {isFinish && (
          <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-30">
            <Flag className="w-3 h-3 fill-white" /> 终点
          </div>
        )}
        
        <span className="absolute top-1 left-2 text-[10px] font-bold text-slate-400/60">{num}</span>
        
        {type === 'heart' && (
          <>
            <Heart className="text-[#ee2b4b] w-5 h-5 md:w-7 md:h-7 fill-[#ee2b4b]" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">心动</span>
          </>
        )}
        {type === 'coin' && (
          <>
            <CircleDollarSign className="text-emerald-500 w-5 h-5 md:w-7 md:h-7 fill-emerald-500" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">奖励</span>
          </>
        )}
        {type === 'shop' && (
          <>
            <Store className="text-blue-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">商店</span>
          </>
        )}
        {type === 'quiz' && (
          <>
            <HelpCircle className="text-purple-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">默契</span>
          </>
        )}
        {type === 'fate' && (
          <>
            <Shuffle className="text-amber-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">命运</span>
          </>
        )}
        {type === 'finish' && (
          <>
            <Flag className="text-yellow-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">终点</span>
          </>
        )}
        {renderPlayer('her', herPosition, num)}
        {renderPlayer('him', himPosition, num)}
      </div>
    );
  };

  return (
    <section className="flex-1 order-1 lg:order-2">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 relative overflow-hidden min-h-[600px] flex items-center justify-center">
        {/* 背景蜜桃色渐变图 */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50 pointer-events-none"></div>
        
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-9 grid-rows-9 gap-2 md:gap-3 w-full aspect-square">
            {BOARD_TILES.map(tile => renderTile(tile.id, tile.type, tile.bgClass))}
            
            <div className="col-start-2 col-span-7 row-start-2 row-span-7 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl border-[3px] border-white/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.04)] p-4 md:p-6 shadow-xl gap-4 z-10">
              {messages && onSendMessage && currentPlayer && (
                <div className="w-full">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={onSendMessage}
                    currentPlayer={currentPlayer}
                  />
                </div>
              )}
              {onRollDice && isMyTurn !== undefined && (
                <div className="w-full">
                  <button
                    onClick={onRollDice}
                    disabled={!isMyTurn || isRolling}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2
                      ${isMyTurn && !isRolling 
                        ? 'bg-[#ee2b4b] text-white hover:bg-[#d4203d] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:bg-[#b01a33]' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                    `}
                  >
                    {isRolling ? (
                      <>
                        <Shuffle className="w-6 h-6 animate-spin" />
                        掷骰子中... {diceResult !== null && `${diceResult}点`}
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-6 h-6" />
                        掷骰子
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}