import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Web3Controller} from "./ethereum/Web3Controller";
import {Provider} from "react-redux";
import {Store} from "./redux/ReduxStore";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const web3Controller = new Web3Controller(Store.dispatch);

ReactDOM.render(
  <React.StrictMode>
      <Provider store={Store}>
        <App />
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
