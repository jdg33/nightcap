import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Wine, Menu, X, GlassWater, List, ShoppingBasket, Glasses as Glass, Plus, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
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

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, setSession, signOut } = useAuthStore();

  useEffect(() => {
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

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <nav className="bg-white shadow-lg relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 text-gray-900 hover:text-purple-600 font-semibold"
                >
                  <Wine className="h-6 w-6 mr-2 text-purple-600" />
                  <span>Nightcap</span>
                </Link>

                <div className="hidden md:flex items-center space-x-8 ml-8">
                  <Link
                    to="/"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600"
                  >
                    <GlassWater className="h-5 w-5 mr-2" />
                    <span>Cocktails</span>
                  </Link>
                  <Link
                    to="/ingredients"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600"
                  >
                    <List className="h-5 w-5 mr-2" />
                    <span>Ingredients</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
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
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="md:hidden">
                  <Link
                    to="/"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <GlassWater className="h-5 w-5 inline mr-2" />
                    Cocktails
                  </Link>
                  <Link
                    to="/ingredients"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <List className="h-5 w-5 inline mr-2" />
                    Ingredients
                  </Link>
                </div>
                
                {session ? (
                  <>
                    <Link
                      to="/my-bar"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBasket className="h-5 w-5 inline mr-2" />
                      My Bar
                    </Link>
                    <Link
                      to="/available"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Glass className="h-5 w-5 inline mr-2" />
                      What Can I Make?
                    </Link>
                    <div className="border-t border-gray-200 my-2" />
                    <Link
                      to="/create-cocktail"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="h-5 w-5 inline mr-2" />
                      New Cocktail
                    </Link>
                    <Link
                      to="/create-ingredient"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="h-5 w-5 inline mr-2" />
                      New Ingredient
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <LogOut className="h-5 w-5 inline mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CocktailList />} />
            <Route path="/cocktail/:id" element={<CocktailDetail />} />
            <Route path="/ingredients" element={<IngredientList />} />
            <Route path="/ingredient/:id" element={<IngredientDetail />} />
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
      </div>
    </Router>
  );
}

export default App;