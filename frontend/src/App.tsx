import React from 'react';
import Chat from './components/Chat';
import './App.scss';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Chat />
    </div>
  );
};

export default App;
