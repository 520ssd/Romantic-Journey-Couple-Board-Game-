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
          player === 'him' ? '-top-2 -right-2 md:-top-3 md:-right-3' : '-bottom-2 -left-2 md:-bottom-3 md:-left-3'
        } h-8 w-8 md:h-12 md:w-12 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(236,72,153,0.3)] z-30 overflow-hidden bg-white transition-all duration-500`}
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
          w-full h-full min-h-[40px] md:min-h-[80px] 
          relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          flex flex-col items-center justify-center 
          
          /* 立体感：圆角、厚度、内部高光 */
          rounded-2xl md:rounded-3xl
          border-b-[3px] md:border-b-[4px] border-r-[2px] border-black/5
          shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),0_6px_16px_rgba(236,72,153,0.12)]
          ${bgClass} 
          
          /* 悬浮效果 */
          hover:shadow-[0_12px_24px_rgba(236,72,153,0.2)] hover:-translate-y-1
          
          /* 玩家所在位置：立体悬浮 */
          ${isActive ? `
            translate-y-[-6px] md:translate-y-[-12px] scale-105 z-20
            shadow-[0_8px_20px_rgba(236,72,153,0.3),0_0_0_2px_rgba(255,255,255,0.9)]
            border-b-[3px] border-[#ec4899]
            animate-[float_2s_ease-in-out_infinite]
          ` : ''}
        `}
      >
        {isActive && (
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(-6px) scale(1.05); }
              50% { transform: translateY(-10px) scale(1.08); }
            }
            @media (min-width: 768px) {
              @keyframes float {
                0%, 100% { transform: translateY(-12px) scale(1.05); }
                50% { transform: translateY(-20px) scale(1.08); }
              }
            }
          `}</style>
        )}

        {/* 起点/终点标签（手机版居中防溢出） */}
        {isStart && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 md:-top-3 md:-left-3 bg-[#ec4899] text-white text-[8px] md:text-[10px] font-bold px-2 md:px-2 py-0.5 md:py-1 rounded-full flex items-center gap-1 shadow-md z-30 scale-90 md:scale-100">
            <Play className="w-2 h-2 md:w-3 md:h-3 fill-white" /> 起点
          </div>
        )}
        {isFinish && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 md:-top-3 md:-left-3 bg-slate-800 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-2 py-0.5 md:py-1 rounded-full flex items-center gap-1 shadow-md z-30 scale-90 md:scale-100">
            <Flag className="w-2 h-2 md:w-3 md:h-3 fill-white" /> 终点
          </div>
        )}
        
        <span className="absolute top-0.5 left-1 md:top-1 md:left-2 text-[6px] md:text-[10px] font-bold text-slate-400/60">{num}</span>
        
        {/* 图标增加跳动动画 */}
        {type === 'heart' && (
          <>
            <Heart className="heartbeat text-[#ec4899] w-3.5 h-3.5 md:w-7 md:h-7 fill-[#ec4899]" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">心动</span>
          </>
        )}
        {type === 'coin' && (
          <>
            <CircleDollarSign className="text-emerald-500 w-3.5 h-3.5 md:w-7 md:h-7 fill-emerald-500" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">奖励</span>
          </>
        )}
        {type === 'shop' && (
          <>
            <Store className="text-blue-500 w-3.5 h-3.5 md:w-7 md:h-7" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">商店</span>
          </>
        )}
        {type === 'quiz' && (
          <>
            <HelpCircle className="text-purple-500 w-3.5 h-3.5 md:w-7 md:h-7" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">默契</span>
          </>
        )}
        {type === 'fate' && (
          <>
            <Shuffle className="text-amber-500 w-3.5 h-3.5 md:w-7 md:h-7" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">命运</span>
          </>
        )}
        {type === 'finish' && (
          <>
            <Flag className="text-yellow-500 w-3.5 h-3.5 md:w-7 md:h-7" />
            <span className="hidden md:block text-[9px] md:text-[10px] font-bold text-slate-700 mt-1">终点</span>
          </>
        )}
        {renderPlayer('her', herPosition, num)}
        {renderPlayer('him', himPosition, num)}
      </div>
    );
  };

  return (
    <section className="flex-1 order-1 lg:order-2 w-full">
      {/* 外层容器升级：加入背景渐变圆角和柔光 */}
      <div className="bg-white rounded-3xl shadow-xl p-2 md:p-12 relative overflow-hidden min-h-[500px] flex items-center justify-center border border-[#fbcfe8]">
        {/* 粉色梦幻背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-white to-purple-50/80 pointer-events-none"></div>
        
        <div className="relative w-full max-w-2xl mx-auto">
          {/* 棋盘网格 */}
          <div className="grid grid-cols-9 grid-rows-9 gap-[2px] md:gap-2 w-full aspect-square">
            {BOARD_TILES.map(tile => renderTile(tile.id, tile.type, tile.bgClass))}
            
            {/* 聊天区域：磨砂玻璃质感 */}
            <div className="col-start-2 col-span-7 row-start-2 row-span-7 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl border-[2px] border-white/80 shadow-[inset_0_4px_12px_rgba(236,72,153,0.08)] p-2 md:p-6 shadow-xl gap-2 md:gap-4 z-10">
              {messages && onSendMessage && currentPlayer && (
                <div className="w-full h-full flex-1 flex flex-col justify-center">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={onSendMessage}
                    currentPlayer={currentPlayer}
                  />
                </div>
              )}
              {onRollDice && isMyTurn !== undefined && (
                <div className="w-full mt-1 md:mt-0">
                  {/* 掷骰子按钮：加入流光扫过动画 */}
                  <button
                    onClick={onRollDice}
                    disabled={!isMyTurn || isRolling}
                    className={`shimmer-button w-full py-2 md:py-4 px-4 md:px-6 rounded-xl md:rounded-xl font-bold text-sm md:text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2
                      ${isMyTurn && !isRolling 
                        ? 'bg-[#ec4899] text-white hover:bg-[#db2777] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:bg-[#be185d]' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
                    `}
                  >
                    {isRolling ? (
                      <>
                        <Shuffle className="w-4 h-4 md:w-6 md:h-6 animate-spin" />
                        <span className="hidden xs:inline">掷骰子中...</span> {diceResult !== null && `${diceResult}点`}
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-4 h-4 md:w-6 md:h-6" />
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