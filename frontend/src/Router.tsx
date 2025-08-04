// src/Router.tsx or src/AppRoutes.tsx

import { Routes, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import RecipesPage from './views/RecipesPage/RecipesPage';
import DietsPage from './views/DietsPage/DietsPage';
import ArticlesPage from './views/ArticlesPage/ArticlesPage';
import LoginPage from './views/LoginPage/LoginPage';

export default function AppRoutes(currentPage: string) {

  return (
    <Routes>
      <Route path="/" element={LandingPage (currentPage)} />
      <Route path="/recipes" element={RecipesPage (currentPage)} />
      <Route path="/diets" element={DietsPage (currentPage)} />
      <Route path="/articles" element={ArticlesPage (currentPage)} />
      <Route path="/login" element={LoginPage ()} />
    </Routes>
  );
}
