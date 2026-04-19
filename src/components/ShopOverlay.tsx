import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: 'WEAPON' | 'THEME' | 'AD' | 'SKIN_BALL' | 'SKIN_PADDLE';
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'missile_3', name: '3x ROCKETS', icon: '🚀', cost: 5, type: 'WEAPON', description: 'Refill 3 precision missiles' },
  { id: 'mine_2', name: '2x MINES', icon: '💣', cost: 5, type: 'WEAPON', description: 'Refill 2 sticky explosive mines' },
  { id: 'theme_neon', name: 'NEON THEME', icon: '⚡', cost: 25, type: 'THEME', description: 'Glow-in-the-dark paddle' },
  { id: 'theme_inferno', name: 'INFERNO', icon: '🔥', cost: 50, type: 'THEME', description: 'Molten lava style' },
  { id: 'ad_reward', name: 'FREE STARS', icon: '📺', cost: 0, type: 'AD', description: 'Watch ad to get +5 Stars' },
  
  // PADDLE SKINS
  { id: 'PADDLE_US', name: 'USA PADDLE', icon: '🇺🇸', cost: 50, type: 'SKIN_PADDLE', description: 'Stars & Stripes paddle skin' },
  { id: 'PADDLE_BR', name: 'BRAZIL PADDLE', icon: '🇧🇷', cost: 50, type: 'SKIN_PADDLE', description: 'Green & Gold paddle skin' },
  { id: 'PADDLE_IN', name: 'INDIA PADDLE', icon: '🇮🇳', cost: 50, type: 'SKIN_PADDLE', description: 'Saffron & Green paddle skin' },
  { id: 'PADDLE_GB', name: 'UK PADDLE', icon: '🇬🇧', cost: 50, type: 'SKIN_PADDLE', description: 'Union Jack paddle skin' },
  { id: 'PADDLE_BD', name: 'BD PADDLE', icon: '🇧🇩', cost: 50, type: 'SKIN_PADDLE', description: 'Green & Red paddle skin' },
  { id: 'PADDLE_JP', name: 'JAPAN PADDLE', icon: '🇯🇵', cost: 50, type: 'SKIN_PADDLE', description: 'Rising Sun paddle skin' },

  // BALL SKINS
  { id: 'BALL_US', name: 'USA BALL', icon: '🏀', cost: 50, type: 'SKIN_BALL', description: 'Stars & Stripes ball skin' },
  { id: 'BALL_BR', name: 'BRAZIL BALL', icon: '⚽', cost: 50, type: 'SKIN_BALL', description: 'Green & Gold ball skin' },
  { id: 'BALL_IN', name: 'INDIA BALL', icon: '🟠', cost: 50, type: 'SKIN_BALL', description: 'Saffron & Green ball skin' },
  { id: 'BALL_GB', name: 'UK BALL', icon: '🔴', cost: 50, type: 'SKIN_BALL', description: 'Union Jack ball skin' },
  { id: 'BALL_BD', name: 'BD BALL', icon: '🟢', cost: 50, type: 'SKIN_BALL', description: 'Green & Red ball skin' },
  { id: 'BALL_JP', name: 'JAPAN BALL', icon: '⚪', cost: 50, type: 'SKIN_BALL', description: 'Rising Sun ball skin' },
];

interface ShopOverlayProps {
  starBalance: number;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  onEquipTheme: (themeId: string) => void;
  onEquipSkin: (type: 'BALL' | 'PADDLE', skinId: string | null) => void;
  unlockedThemes: string[];
  currentTheme: string;
  unlockedSkins: string[];
  currentPaddleSkin: string | null;
  currentBallSkin: string | null;
}

const ShopOverlay: React.FC<ShopOverlayProps> = ({ 
  starBalance, 
  onClose, 
  onBuy,
  onEquipTheme,
  onEquipSkin,
  unlockedThemes,
  currentTheme,
  unlockedSkins,
  currentPaddleSkin,
  currentBallSkin,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Trigger pulse when balance increases
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [starBalance]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>⭐ STAR SHOP</Text>
          <Animated.View style={[styles.balanceBadge, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.balanceText}>⭐ {starBalance}</Text>
          </Animated.View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {SHOP_ITEMS.map((item) => {
            const isTheme = item.type === 'THEME';
            const isSkin = item.type === 'SKIN_BALL' || item.type === 'SKIN_PADDLE';
            const isUnlocked = isTheme ? unlockedThemes.includes(item.id) : (isSkin ? unlockedSkins.includes(item.id) : false);
            
            let isEquipped = false;
            if (isTheme) isEquipped = currentTheme === item.id;
            else if (item.type === 'SKIN_PADDLE') {
              const iso = item.id.replace('PADDLE_', '');
              isEquipped = currentPaddleSkin === iso;
            } else if (item.type === 'SKIN_BALL') {
              const iso = item.id.replace('BALL_', '');
              isEquipped = currentBallSkin === iso;
            }

            const canAfford = starBalance >= item.cost || item.type === 'AD';

            const handlePress = () => {
              if (isTheme && isUnlocked) {
                if (!isEquipped) onEquipTheme(item.id);
              } else if (isSkin && isUnlocked) {
                if (!isEquipped) {
                  const type = item.type === 'SKIN_BALL' ? 'BALL' : 'PADDLE';
                  const iso = item.id.replace(`${type}_`, '');
                  onEquipSkin(type, iso);
                } else {
                  // If already equipped, clicking again un-equips to "Classic"
                  const type = item.type === 'SKIN_BALL' ? 'BALL' : 'PADDLE';
                  onEquipSkin(type, null);
                }
              } else if (canAfford && !isUnlocked && item.type !== 'AD') {
                onBuy(item);
              } else if (item.type === 'AD') {
                onBuy(item);
              }
            };

            return (
              <TouchableOpacity
                key={item.id}
                onPress={handlePress}
                style={[
                  styles.itemCard,
                  (!canAfford && item.type !== 'AD' && !isUnlocked) && styles.disabled,
                  isEquipped && styles.equipped,
                  isUnlocked && !isEquipped && styles.unlocked,
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
                <View style={[styles.priceBox, isEquipped && styles.priceBoxEquipped]}>
                  {isEquipped ? (
                    <Text style={[styles.priceText, { color: '#00E676' }]}>✔ ACTIVE</Text>
                  ) : isUnlocked ? (
                    <Text style={styles.priceText}>EQUIP</Text>
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
    paddingBottom: 60, // Space for global ad
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
    fontSize: 24,
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
    opacity: 0.4,
  },
  unlocked: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  equipped: {
    borderColor: '#00E676',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
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
  priceBoxEquipped: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  priceText: {
    color: '#FFEE58',
    fontSize: 13,
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
