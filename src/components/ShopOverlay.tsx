import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: 'WEAPON' | 'THEME' | 'AD';
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'missile_3', name: '3x ROCKETS', icon: '🚀', cost: 5, type: 'WEAPON', description: 'Precision missiles' },
  { id: 'mine_2', name: '2x MINES', icon: '💣', cost: 5, type: 'WEAPON', description: 'Sticky explosive mines' },
  { id: 'theme_neon', name: 'NEON THEME', icon: '⚡', cost: 25, type: 'THEME', description: 'Glow-in-the-dark paddle' },
  { id: 'theme_inferno', name: 'INFERNO', icon: '🔥', cost: 50, type: 'THEME', description: 'Molten lava style' },
  { id: 'ad_reward', name: 'FREE STARS', icon: '📺', cost: 0, type: 'AD', description: 'Watch to get +5 Stars' },
];

interface ShopOverlayProps {
  starBalance: number;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  unlockedThemes: string[];
}

const ShopOverlay: React.FC<ShopOverlayProps> = ({ 
  starBalance, 
  onClose, 
  onBuy,
  unlockedThemes 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>STAR SHOP</Text>
          <View style={styles.balanceBadge}>
            <Text style={styles.balanceText}>⭐ {starBalance}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {SHOP_ITEMS.map((item) => {
            const isTheme = item.type === 'THEME';
            const isUnlocked = isTheme && unlockedThemes.includes(item.id);
            const canAfford = starBalance >= item.cost || item.type === 'AD';

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => (canAfford && !isUnlocked) && onBuy(item)}
                style={[
                  styles.itemCard, 
                  (!canAfford && item.type !== 'AD') && styles.disabled,
                  isUnlocked && styles.unlocked
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.itemIconBox}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                <View style={styles.priceBox}>
                  {isUnlocked ? (
                    <Text style={styles.priceText}>OWNED</Text>
                  ) : (
                    <Text style={styles.priceText}>
                      {item.type === 'AD' ? 'FREE' : `⭐ ${item.cost}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>BACK TO GAME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    backgroundColor: '#1E1E26',
    borderRadius: 30,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3F3F4F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  title: {
    color: '#FFEE58',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  balanceBadge: {
    backgroundColor: 'rgba(255, 238, 88, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEE58',
  },
  balanceText: {
    color: '#FFEE58',
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    gap: 12,
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A35',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  disabled: {
    opacity: 0.5,
  },
  unlocked: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  itemIconBox: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  itemDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  priceBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  priceText: {
    color: '#FFEE58',
    fontSize: 14,
    fontWeight: '900',
  },
  closeBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  closeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default ShopOverlay;
