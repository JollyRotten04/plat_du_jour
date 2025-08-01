// src/Router.tsx or src/AppRoutes.tsx

import { Routes, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import RecipesPage from './views/LandingPage/RecipesPage';

export default function AppRoutes(currentPage: string) {

  return (
    <Routes>
      <Route path="/" element={LandingPage (currentPage)} />
      <Route path="/recipes" element={RecipesPage (currentPage)} />
      <Route path="/diets" element={''} />
      <Route path="/articles" element={''} />
      <Route path="/login" element={''} />
    </Routes>
  );
}
