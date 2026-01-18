import { RouterProvider } from 'react-router-dom';
import router from './router/router';

// Main App component
// Provides router to the application
function App() {
  return <RouterProvider router={router}   />;
}

export default App;