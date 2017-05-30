var style = require('./style/globalStyle.scss');

import React from 'react';
import ReactDOM  from 'react-dom';
import App from './App';

let ok = 2;
ReactDOM.render(
	<App />,
	document.getElementById('app')
);

if (module.hot) {
	module.hot.accept()
}
