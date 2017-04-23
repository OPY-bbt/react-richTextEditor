import React from 'react';
import ReactDOM from 'react-dom';

import { AppContainer } from 'react-hot-loader';
// AppContainer is a necessary wrapper component for HMR

import Index from './containers/index';

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
		<Index />
    </AppContainer>,
    document.getElementById('root')
  );
};

render();


// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./containers/index', () => {
    render()
  });
}