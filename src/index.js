import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

Amplify.configure({
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    // identityPoolId: 'ap-southeast-2:abc123ab-abc1-abc2-abc3-abc123abc123',

    // REQUIRED - Amazon Cognito Region
    region: 'ap-southeast-2',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    // identityPoolRegion: 'XX-XXXX-X',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'ap-southeast-2_ABC123A12',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'abcdefghijklmnopqrstuvwxyz',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: false,

    // OPTIONAL - Configuration for cookie storage
    // cookieStorage: {
    //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
    //   domain: '.yourdomain.com',
    //   // OPTIONAL - Cookie path
    //   path: '/',
    //   // OPTIONAL - Cookie expiration in days
    //   expires: 365,
    //   // OPTIONAL - Cookie secure flag
    //   secure: true
    // },

    // OPTIONAL - customized storage object
    // storage: new MyStorage(),

    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    // authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
});

const federated = {
  // google_client_id: '',
  facebook_app_id: '1234567890123456',
  // amazon_client_id: ''
};

const AppWithAuth = withAuthenticator(App);

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
