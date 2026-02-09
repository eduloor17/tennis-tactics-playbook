import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Line, Circle, Arrow, Text, Group } from 'react-konva';

// Datos
import singlesPlaybook from './playbooks/singlesPlaybook.json';
import doublesPlaybook from './playbooks/doublesPlaybook.json';

const PLAYBOOKS = { singles: singlesPlaybook, doubles: doublesPlaybook };

const CourtBackground = () => (
  <Group>
    <Rect x={0} y={0} width={400} height={600} fill="#4b8b3b" />
    <Rect x={50} y={50} width={300} height={500} fill="#3b729f" stroke="white" strokeWidth={2} />
    <Line points={[85, 50, 85, 550]} stroke="white" strokeWidth={2} />
    <Line points={[315, 50, 315, 550]} stroke="white" strokeWidth={2} />
    <Line points={[85, 160, 315, 160]} stroke="white" strokeWidth={3} />
    <Line points={[85, 440, 315, 440]} stroke="white" strokeWidth={3} />
    <Line points={[200, 160, 200, 440]} stroke="white" strokeWidth={3} />
    <Line points={[45, 300, 355, 300]} stroke="#111" strokeWidth={6} />
    <Line points={[45, 300, 355, 300]} stroke="white" strokeWidth={1} />
  </Group>
);

const PlayerIcon = ({ color }) => (
  <Group>
    <Rect x={-12} y={-2} width={24} height={12} fill={color} cornerRadius={5} stroke="white" strokeWidth={1} />
    <Circle x={0} y={-8} radius={7} fill="#f3c39a" stroke="white" strokeWidth={1} />
    <Rect x={-5} y={-14} width={10} height={4} fill={color} cornerRadius={2} />
  </Group>
);

function App() {
  const [view, setView] = useState('singles');
  const [currentScenario, setCurrentScenario] = useState(PLAYBOOKS.singles[0]);
  const [players, setPlayers] = useState(currentScenario.positions);
  const [userArrows, setUserArrows] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#f1c40f');
  const isDrawingNow = useRef(false);
  const stageRef = useRef(null);

  const handlePlaySelect = (play) => {
    setCurrentScenario(play);
    setPlayers(play.positions);
    setUserArrows([]);
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `TennisTactics_${currentScenario.name}.png`;
    link.href = uri;
    link.click();
  };

  const resetPositions = () => setPlayers(currentScenario.positions);

  const handleStart = (e) => {
    if (!isDrawing) return;
    isDrawingNow.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setUserArrows([...userArrows, { points: [pos.x, pos.y, pos.x, pos.y], color: drawColor }]);
  };

  const handleMove = (e) => {
    if (!isDrawingNow.current) return;
    const point = e.target.getStage().getPointerPosition();
    let lastArrow = userArrows[userArrows.length - 1];
    lastArrow.points = [lastArrow.points[0], lastArrow.points[1], point.x, point.y];
    setUserArrows([...userArrows.slice(0, -1), lastArrow]);
  };

  return (
    <div className="app-wrapper">
      <style>{`
        .app-wrapper {
          display: flex;
          height: 100vh;
          background-color: #121212;
          color: white;
          font-family: system-ui;
        }
        .sidebar {
          width: 320px;
          background-color: #1e272e;
          padding: 20px;
          overflow-y: auto;
          border-right: 1px solid #333;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 10px;
        }
        .play-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .canvas-container {
          transform-origin: center;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* --- OPTIMIZACIÓN MÓVIL --- */
        @media (max-width: 768px) {
          .app-wrapper { flex-direction: column; }
          .sidebar {
            width: 100%;
            height: auto;
            max-height: 40vh; /* Reducido un poco para dar aire a la cancha */
            padding: 12px;
            border-right: none;
            border-bottom: 1px solid #333;
          }
          .play-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            gap: 6px;
          }
          .play-btn-mobile {
            min-width: 130px; /* Ancho justo para que se lea el número y nombre */
            padding: 8px !important;
            font-size: 11px !important; /* TEXTO LEGIBLE 11px */
            white-space: nowrap;
          }
          .canvas-container {
            transform: scale(0.65); 
            margin: -90px 0; 
          }
          .tool-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          h2 { font-size: 18px !important; margin-bottom: 8px !important; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 style={{ color: '#3498db', fontSize: '22px', textAlign: 'center', marginBottom: '15px' }}>TennisTactic Pro</h2>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
          <button onClick={() => { setView('singles'); handlePlaySelect(PLAYBOOKS.singles[0]); }} style={view === 'singles' ? tabActive : tabInactive}>Singles</button>
          <button onClick={() => { setView('doubles'); handlePlaySelect(PLAYBOOKS.doubles[0]); }} style={view === 'doubles' ? tabActive : tabInactive}>Doubles</button>
        </div>

        <div className="play-list">
          {PLAYBOOKS[view].map((play, i) => (
            <button 
              key={i} 
              className="play-btn-mobile"
              onClick={() => handlePlaySelect(play)} 
              style={{...playBtn, borderLeft: currentScenario.name === play.name ? '4px solid #3498db' : '4px solid transparent', backgroundColor: currentScenario.name === play.name ? '#2c3e50' : 'transparent'}}
            >
              {i + 1}. {play.name}
            </button>
          ))}
        </div>

        <div className="tool-section" style={{ borderTop: '1px solid #444', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', justifyContent: 'center', alignItems: 'center' }}>
            {['#f1c40f', '#e74c3c', '#ffffff'].map(c => (
              <div key={c} onClick={() => setDrawColor(c)} style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: c, border: drawColor === c ? '3px solid #3498db' : '2px solid white', cursor: 'pointer' }} />
            ))}
          </div>
          
          <div className="tool-grid">
            <button onClick={() => setIsDrawing(!isDrawing)} style={{...toolBtn, backgroundColor: isDrawing ? '#e74c3c' : '#27ae60'}}>{isDrawing ? "🔒 LOCK" : "✏️ DRAW"}</button>
            <button onClick={resetPositions} style={{...toolBtn, backgroundColor: '#7f8c8d'}}>🔄 RESET</button>
            <button onClick={handleExport} style={{...toolBtn, backgroundColor: '#3498db'}}>📸 EXPORT</button>
            <button onClick={() => setUserArrows([])} style={{...toolBtn, background: 'none', color: '#e74c3c', border: '1px solid #e74c3c', fontSize: '10px'}}>🗑️ CLEAR</button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div style={{ background: '#2c3e50', padding: '6px 20px', borderRadius: '20px', marginBottom: '8px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '14px' }}>{currentScenario.name}</h2>
        </div>
        
        <div className="canvas-container">
          <Stage 
            width={400} 
            height={600} 
            ref={stageRef} 
            onMouseDown={handleStart} 
            onMouseMove={handleMove} 
            onMouseUp={() => isDrawingNow.current = false}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={() => isDrawingNow.current = false}
          >
            <Layer>
              <CourtBackground />
              {currentScenario.lines?.map((l, i) => (
                <Arrow key={`t-${i}`} points={l.points} stroke={l.stroke} fill={l.stroke} strokeWidth={2} dash={l.dash} pointerLength={6} pointerWidth={6} opacity={0.5} />
              ))}
              {userArrows.map((arr, i) => (
                <Arrow key={`u-${i}`} points={arr.points} stroke={arr.color} fill={arr.color} strokeWidth={3} />
              ))}
              {players.map((p) => (
                <Group key={p.id} x={p.x} y={p.y} draggable={!isDrawing} onDragEnd={(e) => {
                  const updated = players.map(pl => pl.id === p.id ? { ...pl, x: e.target.x(), y: e.target.y() } : pl);
                  setPlayers(updated);
                }}>
                  {p.id === 'ball' ? <Circle radius={8} fill="yellow" stroke="black" strokeWidth={1} /> : <PlayerIcon color={p.color} />}
                  {p.label && <Text text={p.label} y={15} x={-25} width={50} align="center" fill="white" fontSize={10} fontStyle="bold" />}
                </Group>
              ))}
            </Layer>
          </Stage>
        </div>

        <div style={{...tipBox, width: '92%', maxWidth: '380px'}}>
          <span style={{fontSize: '11px'}}><strong>COACH:</strong> {currentScenario.tip}</span>
        </div>
      </div>
    </div>
  );
}

// Estilos constantes (Desktop y base)
const tabActive = { flex: 1, padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const tabInactive = { flex: 1, padding: '10px', backgroundColor: '#485460', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const playBtn = { width: '100%', textAlign: 'left', padding: '12px', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', borderRadius: '4px' };
const toolBtn = { width: '100%', padding: '10px', marginBottom: '2px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' };
const tipBox = { marginTop: '8px', padding: '10px', backgroundColor: '#1e272e', borderRadius: '10px', borderLeft: '5px solid #3498db' };

export default App;