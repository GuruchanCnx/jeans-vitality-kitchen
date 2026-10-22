import React, { useState } from 'react';
import { 
  ChefHat, Menu, X, Utensils, Calendar, BookOpen, Heart, 
  Sparkles, ShoppingCart, Droplets, Contrast, Moon, Sun, 
  Bell, BellRing, Minus, Plus, ChevronRight, LayoutGrid,
  FolderHeart
} from 'lucide-react';

/**
 * Sticky Hamburger Menu Navbar Component
 * Specifically optimized for iPad Air 2, tablets, phones, and desktops.
 * Prevents horizontal layout bleed and consolidates Contrast, Theme, Font Size,
 * Collections, Notifications, and all navigation links inside the accessible hamburger menu.
 */
export const Header = ({
  title = "Jean's Vitality Kitchen",
  subtitle = "High-Protein Senior Nutrition & Vitality",
  links,
  currentPath = '#meal-plan',
  theme = 'light',
  onToggleTheme,
  highContrast = false,
  onToggleHighContrast,
  fontSize = 'medium',
  onIncreaseFontSize,
  onDecreaseFontSize,
  onNavigate,
  onOpenNotifications,
  onOpenCollections
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Default senior navigation links
  const defaultLinks = [
    { name: 'Weekly Dashboard', href: '#meal-plan', icon: LayoutGrid },
    { name: 'Recipe Cards', href: '#recipes', icon: ChefHat },
    { name: '7-Day Schedule', href: '#schedule', icon: Calendar },
    { name: 'Shopping List', href: '#shopping-list', icon: ShoppingCart },
    { name: 'Hydration Tracker', href: '#water-tracker', icon: Droplets },
    { name: 'Kitchen Tips', href: '#tips', icon: BookOpen },
    { name: 'Nutrition Targets', href: '#nutrition', icon: Heart },
  ];

  const navLinks = links || defaultLinks;

  const handleLinkClick = (href, e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      if (targetId === 'home' || targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        id="main-sticky-header"
        className={`sticky top-0 z-50 w-full max-w-full overflow-x-clip transition-colors duration-200 border-b shadow-sm box-border ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : theme === 'light'
              ? 'bg-white/95 text-stone-900 border-amber-200/80 shadow-[0_4px_20px_rgba(217,119,6,0.08)]'
              : 'bg-slate-900/95 text-white border-slate-800'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(16px)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 box-border">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 w-full">
            
            {/* Logo & Site Title - Flexibly responsive to never force overflow */}
            <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0 flex-1">
              <a
                id="header-brand-logo"
                href="#home"
                onClick={(e) => handleLinkClick('#home', e)}
                className="group flex items-center space-x-2 sm:space-x-3 rounded-2xl transition-transform active:scale-95 min-w-0 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                aria-label="Jean's Vitality Kitchen Home"
              >
                {/* Fallback solid background color prevents blank box on Safari 15 */}
                <div 
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-600 text-white shadow-md transition-transform group-hover:scale-105 shrink-0"
                  style={{ backgroundColor: '#d97706' }}
                >
                  <ChefHat className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                
                <div className="flex flex-col text-left min-w-0 truncate">
                  <span className={`text-sm sm:text-lg md:text-xl font-black tracking-tight leading-tight truncate ${
                    highContrast ? 'text-amber-300' : theme === 'light' ? 'text-stone-900' : 'text-white'
                  }`}>
                    <span className="hidden sm:inline">Jean's Vitality Kitchen</span>
                    <span className="sm:hidden truncate">Jean's Kitchen</span>
                  </span>
                  {subtitle && (
                    <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 truncate hidden xs:inline-block">
                      {subtitle}
                    </span>
                  )}
                </div>
              </a>
            </div>

            {/* Right Action Bar: Theme, Notifications & Sticky Hamburger Menu */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-auto pl-1">
              
              {/* Quick High Contrast Toggle in Top Navbar */}
              {onToggleHighContrast && (
                <button
                  type="button"
                  id="header-contrast-toggle-btn"
                  onClick={onToggleHighContrast}
                  className={`flex items-center space-x-1 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black border transition-all active:scale-95 min-h-[44px] ${
                    highContrast
                      ? 'bg-amber-400 text-stone-950 border-white ring-2 ring-amber-400 shadow-xs'
                      : theme === 'light'
                        ? 'bg-amber-50 hover:bg-amber-100 text-stone-800 border-amber-200 shadow-2xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  aria-pressed={highContrast}
                  aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                  title={highContrast ? 'High Contrast Mode: Active (Click to toggle)' : 'Enable High Contrast Mode'}
                >
                  <Contrast className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{highContrast ? 'Contrast ON' : 'Contrast'}</span>
                </button>
              )}

              {/* Quick Theme Toggle Button in Top Navbar */}
              {onToggleTheme && (
                <button
                  type="button"
                  id="header-theme-toggle-btn"
                  onClick={onToggleTheme}
                  className={`flex items-center space-x-1.5 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black border transition-all active:scale-95 min-h-[44px] ${
                    highContrast
                      ? 'bg-amber-400 text-black border-white'
                      : theme === 'light'
                        ? 'bg-amber-50 hover:bg-amber-100 text-stone-900 border-amber-200 shadow-2xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                  aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="hidden md:inline font-bold">Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="hidden md:inline font-bold">Light</span>
                    </>
                  )}
                </button>
              )}

              {/* Quick Notification Bell Button */}
              {onOpenNotifications && (
                <button
                  type="button"
                  id="header-notification-bell-btn"
                  onClick={onOpenNotifications}
                  className={`flex items-center space-x-1 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 min-h-[44px] ${
                    highContrast
                      ? 'bg-amber-400 text-black border-white'
                      : theme === 'light'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                  aria-label="Open iOS and Android notification alerts"
                  title="iOS & Android Reminders & Chimes"
                >
                  <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden md:inline">Alerts</span>
                </button>
              )}

              {/* Quick Recipe Collections Button in Top Navbar */}
              {onOpenCollections && (
                <button
                  type="button"
                  id="header-collections-btn"
                  onClick={onOpenCollections}
                  className={`flex items-center space-x-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 min-h-[44px] ${
                    highContrast
                      ? 'bg-amber-400 text-stone-950 border-white ring-2 ring-amber-400'
                      : theme === 'light'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                  aria-label="Open saved recipe collections"
                  title="Recipe Collections (Breakfast Favorites, Easy Dinners, etc.)"
                >
                  <FolderHeart className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden lg:inline">Collections</span>
                </button>
              )}

              {/* Sticky Accessible Hamburger Menu Button - Fixed layout bleeding */}
              <button
                type="button"
                id="main-hamburger-menu-btn"
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-expanded={isMenuOpen}
                aria-controls="hamburger-nav-drawer"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu and controls"}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm border transition-all active:scale-95 shadow-xs shrink-0 ${
                  isMenuOpen
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-500/40'
                    : highContrast
                      ? 'bg-stone-950 text-white border-amber-400 hover:bg-stone-900'
                      : theme === 'light'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                        : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                }`}
                style={{ minHeight: '44px' }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 shrink-0" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5 shrink-0" aria-hidden="true" />
                )}
                <span className="font-extrabold uppercase tracking-wide">
                  {isMenuOpen ? 'Close' : 'Menu'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-in Hamburger Menu Overlay & Drawer */}
      {isMenuOpen && (
        <div 
          id="hamburger-nav-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            id="hamburger-nav-drawer"
            className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 max-w-[90vw] overflow-y-auto shadow-2xl flex flex-col z-50 transition-transform duration-300 ${
              highContrast
                ? 'bg-black text-white border-l-2 border-amber-400'
                : theme === 'light'
                  ? 'bg-white text-stone-900 border-l border-amber-200'
                  : 'bg-slate-900 text-white border-l border-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header */}
            <div className="p-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <div 
                  className="p-2 rounded-xl bg-amber-600 text-white"
                  style={{ backgroundColor: '#d97706' }}
                >
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base">Menu & Settings</h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Jean's Vitality Kitchen</p>
                </div>
              </div>

              <button
                type="button"
                id="close-drawer-btn"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Senior Accessibility Controls Panel inside Menu */}
            <div className="p-5 space-y-4 border-b border-amber-200 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Senior Accessibility Settings
              </span>

              {/* High Contrast Mode Toggle */}
              {onToggleHighContrast && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <Contrast className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black">High Contrast Mode</h4>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400">Bold text & high visibility borders</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="drawer-contrast-toggle"
                    onClick={onToggleHighContrast}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                      highContrast
                        ? 'bg-amber-400 text-black border-black shadow-xs'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-300 dark:border-slate-600'
                    }`}
                  >
                    {highContrast ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}

              {/* Theme Toggle (Light / Dark) */}
              {onToggleTheme && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    {theme === 'light' ? (
                      <Sun className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <Moon className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black">Color Theme</h4>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400">
                        {theme === 'light' ? 'Gentle Light Theme' : 'Relaxing Dark Theme'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="drawer-theme-toggle"
                    onClick={onToggleTheme}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-600"
                  >
                    <span>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</span>
                  </button>
                </div>
              )}

              {/* Font Size Adjusters */}
              {onIncreaseFontSize && onDecreaseFontSize && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-2xs">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black">Display Text Size</h4>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400">
                      Current: <strong className="text-amber-600 dark:text-amber-400">{fontSize.toUpperCase()}</strong>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={onDecreaseFontSize}
                      className="p-2 rounded-xl border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-800 active:scale-95"
                      aria-label="Decrease text size"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-7 text-center font-black text-xs text-amber-600">
                      {fontSize === 'small' ? 'A' : fontSize === 'medium' ? 'A+' : fontSize === 'large' ? 'A++' : 'MAX'}
                    </span>
                    <button
                      type="button"
                      onClick={onIncreaseFontSize}
                      className="p-2 rounded-xl border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-800 active:scale-95"
                      aria-label="Increase text size"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile / Tablet Notifications Trigger */}
              {onOpenNotifications && (
                <button
                  type="button"
                  id="drawer-notifications-btn"
                  onClick={() => {
                    onOpenNotifications();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-2xs text-left hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black">iOS & Android Alerts</h4>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400">Hydration & meal reminders</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              )}

              {/* Recipe Collections Trigger in Drawer */}
              {onOpenCollections && (
                <button
                  type="button"
                  id="drawer-collections-btn"
                  onClick={() => {
                    onOpenCollections();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-2xs text-left hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <FolderHeart className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black">Recipe Collections</h4>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400">Breakfast favorites & custom lists</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>

            {/* Navigation Links Area */}
            <div className="p-5 flex-1 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-3">
                Navigation Menu
              </span>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.href;

                return (
                  <a
                    key={link.name}
                    id={`drawer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    href={link.href}
                    onClick={(e) => handleLinkClick(link.href, e)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm sm:text-base font-bold transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-md'
                        : theme === 'light'
                          ? 'text-stone-800 hover:bg-amber-50 hover:text-amber-900 border border-stone-100'
                          : 'text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />}
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  </a>
                );
              })}
            </div>

            {/* Bottom Drawer CTA */}
            <div className="p-5 border-t border-amber-200 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-950/50">
              <a
                href="#meal-plan"
                onClick={(e) => handleLinkClick('#meal-plan', e)}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all active:scale-95"
                style={{ backgroundColor: '#d97706' }}
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Open Weekly Meal Plan</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
