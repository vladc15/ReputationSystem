import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider} from "react-router-dom"

import { Web3Provider } from './utils/Context';
import routes from "./routes/router"

import './styles/App.css';

const router = createBrowserRouter(routes)

function App() {
  
  return (
      <Web3Provider>
        {useMemo(() => (
          <RouterProvider router={router} />)
          , [])}
      </Web3Provider>
  )
}

export default App
