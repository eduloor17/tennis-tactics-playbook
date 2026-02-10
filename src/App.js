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
    link.download = `Tennis_Tactic.png`;
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
        .app-wrapper { display: flex; height: 100vh; background-color: #121212; color: white; font-family: sans-serif; overflow: hidden; }
        .sidebar { width: 300px; background-color: #1e272e; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; align-items: center; padding: 10px; overflow-y: auto; }
        .play-list { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
        
        @media (max-width: 768px) {
          .app-wrapper { flex-direction: column; }
          .sidebar { width: 100%; height: auto; padding: 10px; border-bottom: 1px solid #333; }
          .play-list { flex-direction: row; overflow-x: auto; padding: 5px 0; }
          .play-btn-mobile { min-width: 80px; font-size: 11px !important; padding: 8px !important; text-align: center !important; }
          .canvas-container { transform: scale(0.55); margin: -130px 0; } /* CANCHA MÁS PEQUEÑA PARA QUE QUEPA TODO */
          .tool-grid { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; }
          .tool-btn-small { flex: 1; padding: 8px !important; font-size: 10px !important; min-width: 70px; }
          h2 { font-size: 16px !important; margin: 5px 0 !important; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 style={{ color: '#3498db', textAlign: 'center' }}>TennisTactic Pro</h2>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          <button onClick={() => { setView('singles'); handlePlaySelect(PLAYBOOKS.singles[0]); }} style={view === 'singles' ? tabActive : tabInactive}>Singles</button>
          <button onClick={() => { setView('doubles'); handlePlaySelect(PLAYBOOKS.doubles[0]); }} style={view === 'doubles' ? tabActive : tabInactive}>Doubles</button>
        </div>

        <div className="play-list">
          {PLAYBOOKS[view].map((play, i) => (
            <button 
              key={i} 
              className="play-btn-mobile"
              onClick={() => handlePlaySelect(play)} 
              style={{...playBtn, borderBottom: currentScenario.name === play.name ? '3px solid #3498db' : 'none', backgroundColor: currentScenario.name === play.name ? '#2c3e50' : 'transparent'}}
            >
              Tactic {i + 1}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
            {['#f1c40f', '#e74c3c', '#ffffff'].map(c => (
              <div key={c} onClick={() => setDrawColor(c)} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, border: drawColor === c ? '2px solid #3498db' : '1px solid white' }} />
            ))}
          </div>
          <div className="tool-grid">
            <button className="tool-btn-small" onClick={() => setIsDrawing(!isDrawing)} style={{...toolBtn, backgroundColor: isDrawing ? '#e74c3c' : '#27ae60'}}>{isDrawing ? "LOCK" : "DRAW"}</button>
            <button className="tool-btn-small" onClick={resetPositions} style={{...toolBtn, backgroundColor: '#7f8c8d'}}>RESET</button>
            <button className="tool-btn-small" onClick={handleExport} style={{...toolBtn, backgroundColor: '#3498db'}}>PNG</button>
            <button className="tool-btn-small" onClick={() => setUserArrows([])} style={{...toolBtn, background: 'none', color: '#e74c3c', border: '1px solid #e74c3c'}}>CLR</button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div style={{ background: '#2c3e50', padding: '5px 15px', borderRadius: '15px', marginBottom: '5px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', color: '#3498db' }}>
            {PLAYBOOKS[view].indexOf(currentScenario) + 1}. {currentScenario.name}
          </h2>
        </div>
        
        <div className="canvas-container">
          <Stage 
            width={400} height={600} ref={stageRef} 
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={() => isDrawingNow.current = false}
            onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={() => isDrawingNow.current = false}
          >
            <Layer>
              <CourtBackground />
              {currentScenario.lines?.map((l, i) => (
                <Arrow key={`t-${i}`} points={l.points} stroke={l.stroke} fill={l.stroke} strokeWidth={2} dash={l.dash} pointerLength={6} pointerWidth={6} opacity={0.4} />
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

        <div style={tipBox}>
          <small><strong>COACH:</strong> {currentScenario.tip}</small>
        </div>
      </div>
    </div>
  );
}

const tabActive = { flex: 1, padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
const tabInactive = { flex: 1, padding: '8px', backgroundColor: '#485460', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px' };
const playBtn = { width: '100%', padding: '10px', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', borderRadius: '4px' };
const toolBtn = { padding: '10px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold' };
const tipBox = { marginTop: '5px', padding: '10px', backgroundColor: '#1e272e', borderRadius: '8px', borderLeft: '4px solid #3498db', width: '90%', fontSize: '11px' };

export default App;