import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { getEntities } from './src/entities';
import MovePaddle from './src/systems/MovePaddle';
import Physics from './src/systems/Physics';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [running, setRunning] = useState(true);
  const [go, setGo] = useState(false);
  const [win, setWin] = useState(false);
  const [gameEngine, setGameEngine] = useState<any>(null);

  const onEvent = (e: any) => {
    if (e.type === 'game-over') {
      setRunning(false);
      setGo(true);
    } else if (e.type === 'win') {
      setRunning(false);
      setWin(true);
    }
  };

  const reset = () => {
    setGo(false);
    setWin(false);
    setRunning(true);
    if (gameEngine) {
      gameEngine.swap(getEntities());
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />
        <GameEngine
          ref={(ref) => setGameEngine(ref)}
          style={styles.gameContainer}
          systems={[MovePaddle, Physics]}
          entities={getEntities()}
          running={running}
          onEvent={onEvent}
        />
        
        {(go || win) && (
          <View style={styles.overlay}>
            <Text style={styles.title}>{go ? 'GAME OVER' : 'YOU WIN!'}</Text>
            <TouchableOpacity onPress={reset} style={styles.button}>
              <Text style={styles.buttonText}>{go ? 'TRY AGAIN' : 'PLAY AGAIN'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gameContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
