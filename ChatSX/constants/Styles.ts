export default {
  $COLORS: {
    PRIMARY: 'hsl(222, 53%, 15%)',
    SECONDARY: 'hsl(222, 47%, 31%)',
    TERTIARY: '#ffffff',
    MSG: '#777e8e',
    JOINED_BTN: '#e9ecf1',
    LIGHT_BLUE: '#0276fa',
    SELECTED_BLUE: '#e8f1fa',
    RED: 'red',
  },
  $FONT_SIZES: {
    XS: 10,
    SMALL: 12,
    REGULAR: 13,
    MEDIUM: 14,
    LARGE: 16,
    XL: 18,
    XXL: 20,
  },
  $FONT_WEIGHTS: {
    LIGHT: '200' as const,
    MEDIUM: '500' as const,
    BOLD: '700' as const,
  },
  $FONT_TYPES: {
    LIGHT: 'SofiaPro-Light',
    MEDIUM: 'SofiaPro-Medium',
    SEMI_BOLD: 'SofiaPro-SemiBold',
    BOLD: 'SofiaPro-Bold',
    BLACK: 'SofiaPro-Black',
  },
  $BACKGROUND_COLORS: {
    LIGHT: '#ffffff',
    DARK: '#000000',
  },
  $SHADOWS: {
    LIGHT: '0 5px 10px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 8px 30px rgba(0, 0, 0, 0.3)',
    HEAVY: '0 30px 60px rgba(0, 0, 0, 0.6)',
  },
  $MARGINS: {
    XS: 5,
    SMALL: 10,
    MEDIUM: 15,
    LARGE: 20,
  },
  $PADDINGS: {
    SMALL: 10,
    MEDIUM: 15,
    LARGE: 20,
  },
  $AVATAR: {
    WIDTH: 50,
    HEIGHT: 50,
    BORDER_RADIUS: 25,
  },
  $ALIGN_ROW: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  $TEXTVIEW_WIDTH: {
    REGULAR: 240,
  },
  $STATUS_BAR_STYLE: {
    default: 'default',
    'dark-content': 'dark-content',
    'light-content': 'light-content',
  },
};
