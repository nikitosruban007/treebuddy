
import { StyleSheet } from 'react-native';

// TreeBuddy eco-friendly color palette
export const colors = {
  // Primary eco colors
  primary: '#2D5016',      // Deep forest green
  secondary: '#4A7C2C',    // Medium green
  accent: '#7CB342',       // Light green
  
  // Tree growth stages
  seedling: '#8BC34A',     // Light green for seedling
  young: '#689F38',        // Medium green for young tree
  adult: '#33691E',        // Dark green for adult tree
  
  // Background colors
  background: '#F5F5DC',   // Beige/cream background
  backgroundDark: '#1B1B1B', // Dark mode background
  card: '#FFFFFF',         // White card
  cardDark: '#2C2C2C',     // Dark card
  
  // Text colors
  text: '#1B5E20',         // Dark green text
  textLight: '#FFFFFF',    // White text
  textSecondary: '#558B2F', // Secondary text
  
  // UI elements
  border: '#C5E1A5',       // Light green border
  success: '#4CAF50',      // Success green
  warning: '#FF9800',      // Warning orange
  error: '#F44336',        // Error red
  
  // Brown tones for earth
  earth: '#795548',        // Brown
  earthLight: '#A1887F',   // Light brown
  earthDark: '#5D4037',    // Dark brown
  
  // Additional UI
  grey: '#9E9E9E',
  greyLight: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',
};

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    width: '100%',
    marginVertical: 8,
  },
});
