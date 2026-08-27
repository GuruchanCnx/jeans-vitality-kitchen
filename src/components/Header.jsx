import React, { useState } from 'react';
import { ChefHat, Menu, X, Utensils, Calendar, BookOpen, Heart, Sparkles } from 'lucide-react';

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
  fontSizeControls,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default placeholder navigation links
  const defaultLinks = [
    { name: 'Home', href: '#home', icon: Sparkles },
    { name: '7-Day Plan', href: '#meal-plan', icon: Calendar },
    { name: 'Recipes', href: '#recipes', icon: Utensils },
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
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 dark:bg-gray-900/85 border-b border-amber-100/60 dark:border-gray-800/80 shadow-xs transition-colors duration-200"
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
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all">
                <ChefHat className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {title}
                </span>
                {subtitle && (
                  <span className="hidden sm:inline-block text-xs font-medium text-amber-700/80 dark:text-amber-400/80">
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
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-amber-50/60 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-70" aria-hidden="true" />}
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

            {onToggleTheme && (
              <button
                id="header-theme-toggle"
                onClick={onToggleTheme}
                type="button"
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800 border border-amber-200/40 dark:border-gray-700/60 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="text-xs font-semibold uppercase">{theme === 'light' ? '🌙' : '☀️'}</span>
              </button>
            )}

            <a
              id="header-cta-button"
              href="#meal-plan"
              onClick={(e) => handleLinkClick('#meal-plan', e)}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl shadow-xs shadow-amber-600/20 hover:shadow-md transition-all active:scale-95"
            >
              View Plan
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
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 border border-amber-200/40 dark:border-gray-700/60 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
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
          className="md:hidden border-t border-amber-100/70 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-xl"
        >
          <div className="px-4 pt-3 pb-5 space-y-1.5">
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-amber-50/80 dark:hover:bg-gray-800/80'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
                  <span>{link.name}</span>
                </a>
              );
            })}

            {/* Mobile Actions Area */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              {fontSizeControls && (
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Text Size</span>
                  {fontSizeControls}
                </div>
              )}
              <a
                id="mobile-cta-button"
                href="#meal-plan"
                onClick={(e) => handleLinkClick('#meal-plan', e)}
                className="w-full flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                View 7-Day Meal Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
