import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Wine, Menu, X, GlassWater, List, ShoppingBasket, Glasses as Glass, Plus, LogOut, Moon, Sun } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { useDarkModeStore } from './store/darkModeStore';
import { statusBar, splashScreen, haptics, isNative } from './lib/ios';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import CocktailList from './components/CocktailList';
import IngredientList from './components/IngredientList';
import IngredientDetail from './components/IngredientDetail';
import AvailableCocktails from './components/AvailableCocktails';
import CocktailDetail from './components/CocktailDetail';
import CreateCocktail from './components/CreateCocktail';
import CreateIngredient from './components/CreateIngredient';
import EditCocktail from './components/EditCocktail';
import EditIngredient from './components/EditIngredient';
import CocktailGenerator from './components/CocktailGenerator';
import BottomTabBar from './components/BottomTabBar';

function NavContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, setSession, signOut } = useAuthStore();
  const { isDarkMode, toggle: toggleDarkMode } = useDarkModeStore();
  const location = useLocation();

  const handleSignOut = async () => {
    await haptics.light();
    await signOut();
    setIsMenuOpen(false);
  };

  const showNewCocktailButton = location.pathname === '/';
  const showNewIngredientButton = location.pathname === '/ingredients';

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-bold text-lg transition-colors"
            >
              <Wine className="h-7 w-7 mr-2 text-amber-600 dark:text-amber-500" />
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 bg-clip-text text-transparent">Nightcap</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1 ml-8">
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-all font-medium"
              >
                <GlassWater className="h-5 w-5 mr-2" />
                <span>Cocktails</span>
              </Link>
              <Link
                to="/ingredients"
                className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-all font-medium"
              >
                <List className="h-5 w-5 mr-2" />
                <span>Ingredients</span>
              </Link>
              <Link
                to="/generate"
                className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-all font-medium"
              >
                <Wine className="h-5 w-5 mr-2" />
                <span>Generate</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                await haptics.light();
                toggleDarkMode();
              }}
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-all"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {session && (
              <>
                {showNewCocktailButton && (
                  <Link
                    to="/create-cocktail"
                    className="hidden md:flex items-center btn-primary"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Cocktail
                  </Link>
                )}
                {showNewIngredientButton && (
                  <Link
                    to="/create-ingredient"
                    className="hidden md:flex items-center btn-primary"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Ingredient
                  </Link>
                )}
              </>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-all focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-xl z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="md:hidden">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <GlassWater className="h-5 w-5 inline mr-3" />
                Cocktails
              </Link>
              <Link
                to="/ingredients"
                className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <List className="h-5 w-5 inline mr-3" />
                Ingredients
              </Link>
              <Link
                to="/generate"
                className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wine className="h-5 w-5 inline mr-3" />
                Generate
              </Link>
            </div>

            {session ? (
              <>
                <Link
                  to="/my-bar"
                  className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBasket className="h-5 w-5 inline mr-3" />
                  My Bar
                </Link>
                <Link
                  to="/available"
                  className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Glass className="h-5 w-5 inline mr-3" />
                  What Can I Make?
                </Link>
                <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
                {showNewCocktailButton && (
                  <Link
                    to="/create-cocktail"
                    className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-5 w-5 inline mr-3" />
                    New Cocktail
                  </Link>
                )}
                {showNewIngredientButton && (
                  <Link
                    to="/create-ingredient"
                    className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-5 w-5 inline mr-3" />
                    New Ingredient
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                >
                  <LogOut className="h-5 w-5 inline mr-3" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function App() {
  const { setSession } = useAuthStore();
  const { isDarkMode } = useDarkModeStore();

  useEffect(() => {
    // Initialize iOS features
    const initializeApp = async () => {
      if (isNative) {
        await splashScreen.hide();
        if (isDarkMode) {
          await statusBar.setLight();
        } else {
          await statusBar.setDark();
        }
      }
    };

    initializeApp();

    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  // Apply dark mode class to html element and update status bar
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (isNative) {
        statusBar.setLight();
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (isNative) {
        statusBar.setDark();
      }
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen">
        <NavContent />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 pb-24 md:pb-12">
          <Routes>
            <Route path="/" element={<CocktailList />} />
            <Route path="/cocktail/:id" element={<CocktailDetail />} />
            <Route path="/ingredients" element={<IngredientList />} />
            <Route path="/ingredient/:id" element={<IngredientDetail />} />
            <Route path="/generate" element={<CocktailGenerator />} />
            <Route path="/login" element={<Auth />} />

            {/* Protected Routes */}
            <Route
              path="/my-bar"
              element={
                <ProtectedRoute>
                  <IngredientList userOnly />
                </ProtectedRoute>
              }
            />
            <Route
              path="/available"
              element={
                <ProtectedRoute>
                  <AvailableCocktails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-cocktail"
              element={
                <ProtectedRoute>
                  <CreateCocktail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-ingredient"
              element={
                <ProtectedRoute>
                  <CreateIngredient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cocktail/:id/edit"
              element={
                <ProtectedRoute>
                  <EditCocktail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ingredient/:id/edit"
              element={
                <ProtectedRoute>
                  <EditIngredient />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <div className="md:hidden">
          <BottomTabBar />
        </div>
      </div>
    </Router>
  );
}

export default App;