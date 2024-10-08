import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Id, KBColumn, KBMember, KBProject, KBTask, Toast } from './types';
import KanbanContext from './contexts/KanbanContext';
import ProjectsPage from './pages/ProjectsPage';
import BoardPage from './pages/BoardPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

import './App.css'
import { Button, Snackbar } from '@mui/material';
import { cacheItem } from './utils/CacheUtils';
import ProjectPage from './pages/ProjectPage';
import LandingPage from './pages/LandingPage';

function App() {
  const [currentUser, setCurrentUser] = useState<KBMember | null>(null);
  const [projects, setProjects] = useState<{ [key: string]: KBProject }>({});
  const [activeItem, setActiveItem] = useState<KBColumn | KBTask | null>(null);
  const [newItemId, setNewItemId] = useState<Id | null>(null);
  const [projectId, setProjectId] = useState<Id>('');
  const [boardId, setBoardId] = useState<Id>('');
  const [hasTouch] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [toast, setToast] = useState<Toast>({ open: false, message: '' });
  const [users, setUsers] = useState<KBMember[]>([]);

  const taskChannel = new BroadcastChannel('task_actions');
  const columnChannel = new BroadcastChannel('column_actions');
  const dragChannel = new BroadcastChannel('drag_actions');

  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')!);
    const users = JSON.parse(localStorage.getItem('users')!);
    if (user !== null) {
      const projects = JSON.parse(localStorage.getItem('projects')!);
      setCurrentUser(user)
      setProjects(projects);
    }
    if (users !== null) setUsers(users);
    else alert('Error parsing user from localStorage');
  }, []);

  useEffect(() => {
    if (Object.keys(projects).length !== 0) cacheItem('projects', projects);
  }, [projects]);

  useEffect(() => {
    if (users.length !== 0) cacheItem('users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser !== null) cacheItem('currentUser', currentUser);
  }, [currentUser])

  return <>
    <div>
      <KanbanContext.Provider value={{
        hasTouch,
        currentUser,
        setCurrentUser,
        newItemId,
        setNewItemId,
        activeItem,
        setActiveItem,
        projects,
        setProjects,
        projectId,
        setProjectId,
        boardId,
        setBoardId,
        toast,
        setToast,
        users,
        setUsers,
        taskChannel,
        columnChannel,
        dragChannel,
      }}>
        {location.pathname !== '/' && <Navbar />}
        <Routes>
          <Route path='/project/:projectId/board/:boardId' element={<BoardPage />} />
          <Route path='/project/:projectId' element={<ProjectPage />} />
          <Route path='/projects' element={<ProjectsPage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/' element={<LandingPage />} />
        </Routes>
        <Snackbar
          open={toast.open}
          autoHideDuration={toast.autoHide || 6000}
          message={toast.message}
          onClose={() => setToast({ open: false, message: '', })}
          anchorOrigin={toast.anchor}
          action={toast.action || <Button color="inherit" size="small" onClick={() => setToast({ open: false, message: '', })}>Close</Button>}
        />
      </KanbanContext.Provider>
    </div>
  </>
}

export default App
