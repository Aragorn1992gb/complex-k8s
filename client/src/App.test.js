import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// comment the tests otherwise it will fail because of it tries to render Fib.js that make a call to the backend server Express, not running at that time
it('renders without crashing', () => {
  // const div = document.createElement('div');
  // ReactDOM.render(<App />, div);
  // ReactDOM.unmountComponentAtNode(div);
});
