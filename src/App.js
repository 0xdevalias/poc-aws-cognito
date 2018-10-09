import React, { Component } from 'react';
import Auth from '@aws-amplify/auth';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    window.auth = Auth;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>

        <div>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>

          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer">
            Learn React
          </a>

          <p>
            TODO: Playground with amplify authed stuff
          </p>
        </div>
      </div>
    );
  }
}

export default App;
