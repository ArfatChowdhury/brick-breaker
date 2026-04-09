import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';

interface ScoreBoardProps {
  score: number;
  lives: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, lives }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.label}>LIVES</Text>
        <Text style={styles.value}>{'❤️'.repeat(lives)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statBox: {
    alignItems: 'center',
  },
  label: {
    color: '#9E9E9E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScoreBoard;
