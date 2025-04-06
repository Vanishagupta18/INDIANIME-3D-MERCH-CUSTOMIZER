import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { RouterProvider } from 'react-router-dom'
// import { createBrowserRouter } from 'react-router-dom'
// import Layout from './layout.jsx'
// import { Route, createRoutesFromElements } from 'react-router-dom'

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path='/' element={<Layout />}>
//       </Route>
//   )
// )

createRoot(document.getElementById('root')).render(
  <StrictMode>
  {/* <RouterProvider router={router}/> */}
  <App />
  </StrictMode>,
)
