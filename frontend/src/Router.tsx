import { Routes, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import RecipesPage from './views/RecipesPage/RecipesPage';
import DietsPage from './views/DietsPage/DietsPage';
import ArticlesPage from './views/ArticlesPage/ArticlesPage';
import LoginPage from './views/LoginPage/LoginPage';
import ViewContentPage from './views/ViewContentPage/ViewContentPage';

export default function AppRoutes({ currentPage }: { currentPage: string }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage currentPage={currentPage} />} />
      <Route path="/recipes" element={<RecipesPage currentPage={currentPage} />} />
      <Route path="/diets" element={<DietsPage currentPage={currentPage} />} />
      <Route path="/articles" element={<ArticlesPage currentPage={currentPage} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/view-content/:contentType/:slug" element={<ViewContentPage currentPage={currentPage} />} />
    </Routes>
  );
}
