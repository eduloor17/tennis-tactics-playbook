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

  const handleMouseDown = (e) => {
    if (!isDrawing) return;
    isDrawingNow.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setUserArrows([...userArrows, { points: [pos.x, pos.y, pos.x, pos.y], color: drawColor }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingNow.current) return;
    const point = e.target.getStage().getPointerPosition();
    let lastArrow = userArrows[userArrows.length - 1];
    lastArrow.points = [lastArrow.points[0], lastArrow.points[1], point.x, point.y];
    setUserArrows([...userArrows.slice(0, -1), lastArrow]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'system-ui' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '320px', backgroundColor: '#1e272e', padding: '20px', overflowY: 'auto', borderRight: '1px solid #333' }}>
        <h2 style={{ color: '#3498db', fontSize: '24px', textAlign: 'center' }}>TennisIQ Pro</h2>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
          <button onClick={() => { setView('singles'); handlePlaySelect(PLAYBOOKS.singles[0]); }} style={view === 'singles' ? tabActive : tabInactive}>Singles</button>
          <button onClick={() => { setView('doubles'); handlePlaySelect(PLAYBOOKS.doubles[0]); }} style={view === 'doubles' ? tabActive : tabInactive}>Doubles</button>
        </div>

        <div style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: '20px' }}>
          {PLAYBOOKS[view].map((play, i) => (
            <button key={i} onClick={() => handlePlaySelect(play)} style={{...playBtn, borderLeft: currentScenario.name === play.name ? '4px solid #3498db' : '4px solid transparent', backgroundColor: currentScenario.name === play.name ? '#2c3e50' : 'transparent'}}>
              {play.name}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #444', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['#f1c40f', '#e74c3c', '#ffffff'].map(c => (
              <div key={c} onClick={() => setDrawColor(c)} style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: c, border: drawColor === c ? '2px solid white' : 'none', cursor: 'pointer' }} />
            ))}
            <span style={{ fontSize: '12px', marginLeft: '10px' }}>Pencil Color</span>
          </div>
          
          <button onClick={() => setIsDrawing(!isDrawing)} style={{...toolBtn, backgroundColor: isDrawing ? '#e74c3c' : '#27ae60'}}>{isDrawing ? "🔒 STOP DRAWING" : "✏️ START DRAWING"}</button>
          <button onClick={resetPositions} style={{...toolBtn, backgroundColor: '#7f8c8d'}}>🔄 RESET PLAYERS</button>
          <button onClick={handleExport} style={{...toolBtn, backgroundColor: '#3498db'}}>📸 EXPORT PNG</button>
          <button onClick={() => setUserArrows([])} style={{...toolBtn, background: 'none', color: '#e74c3c', border: '1px solid #e74c3c'}}>🗑️ CLEAR BOARD</button>
        </div>
      </div>

      {/* MAIN COURT */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#2c3e50', padding: '10px 30px', borderRadius: '30px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{currentScenario.name}</h2>
        </div>
        
        <Stage width={400} height={600} ref={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => isDrawingNow.current = false}>
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
                {p.label && <Text text={p.label} y={15} x={-25} width={50} align="center" fill="white" fontSize={11} fontStyle="bold" />}
              </Group>
            ))}
          </Layer>
        </Stage>
        <div style={tipBox}><strong>COACH ANALYSIS:</strong> {currentScenario.tip}</div>
      </div>
    </div>
  );
}

const tabActive = { flex: 1, padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const tabInactive = { flex: 1, padding: '10px', backgroundColor: '#485460', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const playBtn = { width: '100%', textAlign: 'left', padding: '12px', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', transition: '0.2s' };
const toolBtn = { width: '100%', padding: '12px', marginBottom: '8px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
const tipBox = { marginTop: '20px', padding: '15px', backgroundColor: '#1e272e', borderRadius: '10px', width: '380px', borderLeft: '5px solid #3498db', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' };

export default App;