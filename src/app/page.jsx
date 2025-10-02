// src/app/page.jsx

"use client"; // CRUCIAL: Tells Next.js this must run in the browser

import React, { useState, useEffect } from 'react';
// Use the relative path that worked for you (e.g., '../lib/supabaseClient' or './lib/supabaseClient')
import { supabase } from './lib/supabaseClient'; 

// ===============================================
// MAIN APPLICATION COMPONENT
// ===============================================
function TaskAppPage() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // --- AUTHENTICATION & SESSION MANAGEMENT (Logic remains untouched) ---
  useEffect(() => {
    // Set a dark background for the body
    document.body.style.backgroundColor = '#181a1f'; 
    document.body.style.color = '#e4e4e7';

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        const role = session.user.app_metadata.role || 'user';
        setUserRole(role);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
          const role = session.user.app_metadata.role || 'user';
          setUserRole(role);
        } else {
          setUserRole(null);
          setTasks([]);
        }
      }
    );
    return () => {
        subscription.unsubscribe();
        document.body.style.backgroundColor = ''; // Clean up on unmount
        document.body.style.color = '';
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session, userRole]);

  const handleAuth = async (isSignUp, email, password) => {
    setMessage('');
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }

    const authPromise = isSignUp 
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password });

    const { error } = await authPromise;

    if (error) {
      setMessage(`Auth Error: ${error.message}`);
    } else {
      setMessage(`Successfully ${isSignUp ? 'registered' : 'logged in'}!`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage('Logged out successfully.');
  };

  // --- CRUD OPERATIONS (Logic remains untouched) ---
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(`Error fetching tasks: ${error.message}`);
      setTasks([]);
    } else {
      setTasks(data);
    }
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    setMessage('');
    setLoading(true);
    
    const { error } = await supabase
      .from('tasks')
      .insert({ 
          title: newTaskTitle, 
          user_id: session.user.id
      });

    if (error) {
      setMessage(`Error creating task: ${error.message}`);
    } else {
      setMessage('Task created!');
      setNewTaskTitle('');
      fetchTasks();
    }
    setLoading(false);
  };

  const handleToggleComplete = async (taskId, isComplete) => {
    setMessage('');
    const { error } = await supabase
      .from('tasks')
      .update({ is_complete: !isComplete })
      .eq('id', taskId); 

    if (error) {
      setMessage(`Error updating task: ${error.message}`);
    } else {
      setMessage('Task updated!');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    setMessage('');
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId); 

    if (error) {
      setMessage(`Error deleting task: ${error.message}. Only admins can delete.`);
    } else {
      setMessage('Task deleted!');
      fetchTasks();
    }
  };

  if (loading && !session) return <div style={styles.loadingContainer}>Loading application...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainCard}>
        <h1 style={styles.title}>Backend Developer (Intern) Task App</h1>
        <p style={{...styles.message, color: message.includes('Error') ? '#ff7b72' : '#7bff7b'}}>
          {message}
        </p>
        
        {/* --- UI RENDER: AUTH vs. DASHBOARD --- */}
        {!session ? (
          <AuthForm onAuth={handleAuth} />
        ) : (
          <div style={styles.dashboard}>
            <header style={styles.dashboardHeader}>
              <h2 style={styles.subtitle}>Protected Dashboard | Role: <span style={styles.roleText}>{userRole?.toUpperCase()}</span></h2>
              <button 
                onClick={handleLogout} 
                style={styles.logoutButton}
              >
                Logout ({session.user.email})
              </button>
            </header>
            
            <TaskForm 
              newTaskTitle={newTaskTitle} 
              setNewTaskTitle={setNewTaskTitle} 
              handleCreateTask={handleCreateTask} 
              loading={loading}
            />

            {loading ? (
              <p style={{textAlign: 'center', color: '#8b949e'}}>Loading tasks...</p>
            ) : (
              <TaskList 
                tasks={tasks} 
                userRole={userRole} 
                currentUserId={session.user.id}
                handleToggleComplete={handleToggleComplete}
                handleDeleteTask={handleDeleteTask}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper UI Components ---
const AuthForm = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={styles.authCard}>
      <h3 style={styles.cardTitle}>User Registration & Login</h3>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        style={styles.input}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        style={styles.input}
      />
      <div style={styles.authButtonContainer}>
        <button 
          onClick={() => onAuth(false, email, password)} 
          style={{...styles.button, backgroundColor: '#38a169'}} // Green for Login
        >
          Log In
        </button>
        <button 
          onClick={() => onAuth(true, email, password)} 
          style={{...styles.button, backgroundColor: '#3182ce'}} // Blue for Register
        >
          Register
        </button>
      </div>
    </div>
  );
};

const TaskForm = ({ newTaskTitle, setNewTaskTitle, handleCreateTask, loading }) => (
    <form onSubmit={handleCreateTask} style={styles.taskForm}>
        <input 
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={loading}
            style={styles.taskInput}
        />
        <button 
            type="submit" 
            disabled={loading || !newTaskTitle} 
            style={styles.taskAddButton}
        >
            Add Task
        </button>
    </form>
);

const TaskList = ({ tasks, userRole, currentUserId, handleToggleComplete, handleDeleteTask }) => (
    <div style={styles.taskList}>
        <h3 style={styles.taskListTitle}>
            {userRole === 'admin' ? 
                `Admin View: Showing ALL ${tasks.length} Tasks` : 
                `My Tasks: Showing ${tasks.length} Tasks`
            }
        </h3>
        {tasks.map((task) => (
            <div key={task.id} style={styles.taskItem}>
                <span 
                    style={{ 
                        ...styles.taskTitle,
                        textDecoration: task.is_complete ? 'line-through' : 'none',
                        color: task.user_id !== currentUserId && userRole === 'admin' ? '#8b949e' : '#e4e4e7'
                    }}
                    onClick={() => handleToggleComplete(task.id, task.is_complete)}
                >
                    {task.title}
                    {userRole === 'admin' && task.user_id !== currentUserId && 
                      <em style={styles.taskOwnerNote}> (Other User)</em>
                    }
                </span>
                
                {/* Delete button only shows for admin (RBAC UX) */}
                {userRole === 'admin' && (
                    <button 
                        onClick={() => handleDeleteTask(task.id)} 
                        style={styles.deleteButton}
                    >
                        Delete
                    </button>
                )}
            </div>
        ))}
        {tasks.length === 0 && <p style={{textAlign: 'center', color: '#8b949e'}}>No tasks found. Create one above!</p>}
    </div>
);


// --- STYLES OBJECT (CSS-in-JS) ---
const styles = {
    pageContainer: {
        minHeight: '100vh',
        padding: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    mainCard: {
        width: '100%',
        maxWidth: '700px',
        backgroundColor: '#22272e',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
        border: '1px solid #30363d',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#58a6ff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '18px',
        fontWeight: '600',
    },
    roleText: {
        color: '#ffdd77', // Highlight the role
    },
    message: {
        fontWeight: '500',
        marginBottom: '20px',
        minHeight: '20px',
        textAlign: 'center',
    },
    authCard: {
        padding: '20px',
        backgroundColor: '#2d333b',
        borderRadius: '8px',
        border: '1px solid #484f58',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#e4e4e7',
    },
    input: {
        width: 'calc(100% - 24px)', // Account for padding
        padding: '12px',
        marginBottom: '15px',
        backgroundColor: '#181a1f',
        border: '1px solid #484f58',
        borderRadius: '6px',
        color: '#e4e4e7',
        fontSize: '16px',
    },
    button: {
        flex: 1,
        padding: '12px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontSize: '16px',
    },
    authButtonContainer: {
        display: 'flex',
        gap: '15px',
        marginTop: '15px',
    },
    dashboard: {
        paddingTop: '10px',
    },
    dashboardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '15px',
        borderBottom: '1px solid #30363d',
        marginBottom: '20px',
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#cf222e',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    taskForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        alignItems: 'center',
    },
    taskInput: {
        flexGrow: 1,
        padding: '12px',
        backgroundColor: '#181a1f',
        border: '1px solid #484f58',
        borderRadius: '6px',
        color: '#e4e4e7',
        fontSize: '16px',
    },
    taskAddButton: {
        padding: '12px 20px',
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontSize: '16px',
    },
    taskList: {
        marginTop: '15px',
    },
    taskListTitle: {
        fontSize: '16px',
        fontWeight: '600',
        borderBottom: '1px solid #30363d',
        paddingBottom: '8px',
        marginBottom: '10px',
    },
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#2d333b',
        borderRadius: '6px',
        marginBottom: '8px',
        borderLeft: '4px solid #58a6ff',
    },
    taskTitle: {
        flexGrow: 1,
        fontWeight: '500',
        cursor: 'pointer',
    },
    taskOwnerNote: {
        fontSize: '12px',
        marginLeft: '10px',
        color: '#8b949e',
    },
    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#cf222e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
    },
    loadingContainer: {
        fontSize: '20px',
        textAlign: 'center',
        paddingTop: '50px',
        color: '#58a6ff',
    }
};

export default TaskAppPage;