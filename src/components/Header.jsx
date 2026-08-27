import React, { useState } from 'react';
import { ChefHat, Menu, X, Utensils, Calendar, BookOpen, Heart, Sparkles, ShoppingCart, Droplets, Contrast } from 'lucide-react';

/**
 * Responsive Navigation Header Component
 * Displays the site title "Jean's Vitality Kitchen" and placeholders for navigation links.
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
  fontSizeControls,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default placeholder navigation links
  const defaultLinks = [
    { name: 'Home', href: '#home', icon: Sparkles },
    { name: '7-Day Plan', href: '#meal-plan', icon: Calendar },
    { name: 'Recipes', href: '#recipes', icon: Utensils },
    { name: 'Hydration', href: '#water-tracker', icon: Droplets },
    { name: 'Shopping List', href: '#shopping-list', icon: ShoppingCart },
    { name: 'Nutrition Guide', href: '#nutrition', icon: Heart },
    { name: 'Kitchen Tips', href: '#tips', icon: BookOpen },
  ];

  const navLinks = links || defaultLinks;

  const handleLinkClick = (href, e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    } else if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      if (targetId === 'home' || targetId === 'top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border-b border-amber-200/60 dark:border-slate-800/80 shadow-xs transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Site Title */}
          <div className="flex items-center space-x-3">
            <a
              id="header-brand-logo"
              href="#home"
              onClick={(e) => handleLinkClick('#home', e)}
              className="group flex items-center space-x-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl transition-transform active:scale-95"
            >
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/25 group-hover:scale-105 transition-all">
                <ChefHat className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {title}
                </span>
                {subtitle && (
                  <span className="hidden sm:inline-block text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {subtitle}
                  </span>
                )}
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            id="desktop-navigation"
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.href;

              return (
                <a
                  key={link.name}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-100 text-amber-950 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                      : 'text-stone-800 dark:text-slate-200 hover:text-amber-900 dark:hover:text-white hover:bg-amber-50/90 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Header Actions & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Custom actions slot or controls if passed */}
            {fontSizeControls && (
              <div className="hidden lg:flex items-center">
                {fontSizeControls}
              </div>
            )}

            {/* High-Contrast Toggle Button */}
            {onToggleHighContrast && (
              <button
                id="header-high-contrast-toggle"
                onClick={onToggleHighContrast}
                type="button"
                aria-pressed={highContrast}
                aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode for visual impairments'}
                title={highContrast ? 'High Contrast Mode: Active (Click to disable)' : 'Enable High Contrast Mode (Enhanced readability for visual impairments)'}
                className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 border active:scale-95 ${
                  highContrast
                    ? 'bg-stone-950 text-amber-300 border-amber-400 dark:bg-amber-400 dark:text-stone-950 dark:border-white shadow-md ring-2 ring-amber-400/40'
                    : 'text-stone-800 dark:text-slate-200 hover:bg-amber-100/70 dark:hover:bg-slate-800 border-amber-300/70 dark:border-slate-700'
                }`}
              >
                <Contrast className={`w-4 h-4 ${highContrast ? 'text-amber-300 dark:text-stone-950' : 'text-amber-700 dark:text-amber-400'}`} aria-hidden="true" />
                <span className="hidden xl:inline">{highContrast ? 'Contrast: ON' : 'High Contrast'}</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                id="header-theme-toggle"
                onClick={onToggleTheme}
                type="button"
                className="p-2.5 rounded-xl text-stone-800 dark:text-slate-200 hover:bg-amber-100/70 dark:hover:bg-slate-800 border border-amber-300/70 dark:border-slate-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="text-sm font-bold">{theme === 'light' ? '🌙' : '☀️'}</span>
              </button>
            )}

            <a
              id="header-cta-button"
              href="#meal-plan"
              onClick={(e) => handleLinkClick('#meal-plan', e)}
              className="hidden sm:inline-flex items-center justify-center px-4.5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 dark:from-amber-500 dark:to-orange-500 rounded-xl shadow-xs shadow-amber-600/30 hover:shadow-md transition-all active:scale-95"
            >
              View 7-Day Plan
            </a>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                id="mobile-menu-toggle-button"
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-menu"
                aria-label="Toggle navigation menu"
                className="p-2.5 rounded-xl text-stone-900 dark:text-slate-100 hover:bg-amber-100/70 dark:hover:bg-slate-800 border border-amber-300/70 dark:border-slate-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden border-t border-amber-200/80 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200 shadow-2xl"
        >
          <div className="px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.href;

              return (
                <a
                  key={link.name}
                  id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/80'
                      : 'text-stone-800 dark:text-slate-100 hover:bg-amber-50/90 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
                  <span>{link.name}</span>
                </a>
              );
            })}

            {/* Mobile Actions Area */}
            <div className="pt-4 mt-3 border-t border-amber-100 dark:border-slate-800 flex flex-col gap-3">
              {fontSizeControls && (
                <div className="flex justify-between items-center px-2 py-1">
                  <span className="text-sm font-bold text-stone-800 dark:text-slate-200">Text Size</span>
                  {fontSizeControls}
                </div>
              )}
              {onToggleHighContrast && (
                <div className="flex justify-between items-center px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <Contrast className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-bold text-stone-800 dark:text-slate-200">High Contrast</span>
                  </div>
                  <button
                    id="mobile-high-contrast-toggle"
                    onClick={onToggleHighContrast}
                    type="button"
                    aria-pressed={highContrast}
                    aria-label="Toggle high contrast mode"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      highContrast
                        ? 'bg-stone-950 text-amber-300 border-amber-400 dark:bg-amber-400 dark:text-stone-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-amber-300 dark:border-slate-700'
                    }`}
                  >
                    {highContrast ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
              <a
                id="mobile-cta-button"
                href="#meal-plan"
                onClick={(e) => handleLinkClick('#meal-plan', e)}
                className="w-full flex items-center justify-center px-4 py-3.5 text-base font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl shadow-md transition-all"
              >
                View 7-Day Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

