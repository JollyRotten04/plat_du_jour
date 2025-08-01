// Components...
import { useState,useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Router'; // or './AppRoutes';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css'


function App() {
  const [currentPage, setCurrentPage] = useState<string>('');

  useEffect(() => {
      console.log(`Current page is: ${currentPage}`);
  }, [currentPage]);

  function setterCurrentPage(value: string) {
    setCurrentPage(value);
  }

  return (
    // Super Container
    <div className='flex flex-1'>  
      
      {/* Main Content */}
      <div className='flex flex-col h-full w-full overflow-x-hidden'>

        <Router>
          <div className='flex flex-col h-full w-full'>

            <Header setterCurrentPage={setterCurrentPage} />

            {/* Main Content */}
            {AppRoutes(currentPage)}

            {/* Footer Component */}
            <Footer />
          </div>
        </Router>
      </div>
    </div>
  )
}

export default App
