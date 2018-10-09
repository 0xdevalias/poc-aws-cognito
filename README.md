# PoC-AWS-Cognito

Playing around with setting up authentication using AWS Cognito.

While there is a lot of cool stuff here.. there are also quite a few annoying quirks/things that just aren't possible/easy to implement right now (eg. social logins + cognito user pools + react UI). Depending on your needs.. it may be better to look elsewhere for now, or perhaps stick to the Amplify CLI 'built stack' assuming it JustWorks(tm)?

## AWS Cognito

We can manually create the user pool ourselves using [AWS Cognito through the AWS Console](https://console.aws.amazon.com/cognito/users/), this would be good for playing around and learning what bits we want/need before trying to 'enforce' them through Infrastructure as Code.

* https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html

Unfortunately, it seems it's not currently possible to export these settings as a CloudFormation template:

* https://stackoverflow.com/questions/44503800/how-to-export-cognito-user-pool-settings-to-cloudformation-template

## Amplify (CLI, JS)

This is designed to help us to easily add feature sets to our applications, for example, authentication. It can handle both the backend features (from the CLI) and frontend (from the JS):

* https://github.com/aws-amplify/amplify-cli
* https://aws-amplify.github.io/amplify-js/media/authentication_guide

```
amplify init

amplify auth add
```

This seems to create a verbose (~300 lines) CloudFormation template.. it probably doesn't need to be so big, but there are a lot of parameters and options passed in. I feel like we could do better manually.. though the 'fully integrated' aspect of this would be nice. Learning from what is done here + what we played with above would probably be useful.

You can then wire it into a React/similar frontend, or use the hosted auth UI, etc:

* https://aws-amplify.github.io/amplify-js/media/authentication_guide#using-components-in-react
* https://aws-amplify.github.io/amplify-js/media/authentication_guide#using-amazon-cognito-hosted-ui
* https://aws-amplify.github.io/amplify-js/media/authentication_guide#launching-the-hosted-ui-in-react

## CloudFormation

This will likely be the basis for any manual tuning we decided to do, but it will still be rather verbose.

The main CloudFormation features are:

* [AWS::Cognito::UserPool](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html)
  * [AWS::Cognito::UserPoolClient](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html)
  * [AWS::Cognito::UserPoolGroup](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolgroup.html)
  * [AWS::Cognito::UserPoolUser](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpooluser.html)
  * [AWS::Cognito::UserPoolUserToGroupAttachment](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolusertogroupattachment.html)
* [AWS::Cognito::IdentityPool](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-identitypool.html)
  * [AWS::Cognito::IdentityPoolRoleAttachment](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-identitypoolroleattachment.html)

Though we will likely also need to configure some things related to Email (AWS SES), SMS (AWS SNS), etc. Best to use the Amplify template as a basis for understanding what is required, then manually tune.

Other references:

* https://gist.github.com/singledigit/2c4d7232fa96d9e98a3de89cf6ebe7a5

## AWS SAM

* Ref
  * https://github.com/awslabs/serverless-application-model/issues/617#issuecomment-427708422
  * https://github.com/awslabs/serverless-application-model/pull/546

## AWS CDK

We can see an example of using Cognito from CDK in the following example:

* https://github.com/awslabs/aws-cdk/tree/master/examples/cdk-examples-typescript/chat-app

## Setting up a React testbed

We'll use [`create-react-app`](https://github.com/facebook/create-react-app#creating-an-app) + some `npm` magic to setup a frontend testbed to play with, and then use [Amplify-JS' React Components](https://aws-amplify.github.io/amplify-js/media/authentication_guide#using-components-in-react) to wire in the frontend:

```
npm init react-app poc-aws-cognito

cd poc-aws-cognito

npm i aws-amplify aws-amplify-react
```

[Configure AmplifyJS](https://aws-amplify.github.io/amplify-js/media/authentication_guide#configure-your-app) in the react app for auth (or [manually](https://aws-amplify.github.io/amplify-js/media/authentication_guide#manual-setup)), configure any desired [social login (federation)](https://aws-amplify.github.io/amplify-js/media/authentication_guide.html#enabling-federated-identities), and wire in the authenticator component:

* https://aws-amplify.github.io/amplify-js/media/authentication_guide#using-components-in-react
* https://aws-amplify.github.io/amplify-js/media/authentication_guide#using-authenticator-component
* [`withAuthenticator`](https://github.com/aws-amplify/amplify-js/blob/master/packages/aws-amplify-react/src/Auth/index.jsx#L37)

`index.js`:
```javascript
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

// ..snip..

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'ap-southeast-2',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'ap-southeast-2_ABC123A12',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'abcdefghijklmnopqrstuvwxyz',
  }
});

const AppWithAuth = withAuthenticator(App);

ReactDOM.render(<AppWithAuth/>, document.getElementById('root'));

// ..snip..
```

This should be enough to get your basic React test bed setup, using the built in AmplifyJS UI components/flows. When you start the app, you should see a basic sign in form, with options to create account/reset password/etc (as configured):

```
npm start
```

Once you login with a valid account, you should see a menubar at the top of the screen ([Greetings component](https://aws-amplify.github.io/amplify-js/media/authentication_guide.html#customize-greeting-message)) including a 'hello' message and a signout button. You can then go and use any of the 'auth' features you may want:

* [Auth docs](https://aws-amplify.github.io/amplify-js/api/classes/authclass.html)

Note that not all of the code examples/documentation seem to be updated yet, so read about how to properly use the modularised modules here:

* https://github.com/aws-amplify/amplify-js/wiki/Amplify-modularization

TODO: Work through some more of this..

## Adding Social Login (Hosted Auth UI)

* https://aws-amplify.github.io/amplify-js/media/authentication_guide.html#using-amazon-cognito-hosted-ui
  * Configure
  * Launch (`withOAuth`)

## Adding Social Login (React Auth UI)

If we want to add things like Facebook social login, we first need to create an app there, and configure it appropriately to match our Cognito settings:

* https://developers.facebook.com/apps/
* https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html

In particular, if using the hosted web auth, make sure we whitelist the appropriate 'OAuth Redirect URI' (eg. https://foo.example.com/oauth2/idpresponse)

It doesn't currently appear possible to use the React UI components to implement social login in the same way as the hosted UI:

* https://github.com/aws-amplify/amplify-js/issues/1143#issuecomment-404931008
  * "For now as I know you have to use Cognito Hosted UI to create external federated users in the cognito user pools."
* https://github.com/aws-amplify/amplify-js/issues/1143#issuecomment-416302388
  * "Currently we are working with the Cognito team to provide the api to sign in the User Pool with federated providers without using the Hosted UI. We are not sure about when it will be implemented but we will try to make it ASAP."
* https://github.com/aws-amplify/amplify-js/issues/1521
* https://github.com/aws-amplify/amplify-js/issues/1521#issuecomment-420796542
  * "for now the only way to get federated with Cognito User Pool is through Cognito Hosted UI and it brings bad user experience. The Cognito Service team is currently working on to provide another way to do that without Hosted UI and once they are done(the similar way like Auth.federatedSignIn() which is used to federate with Cognito Identity Pool), we can integrate it into Amplify ASAP."


`index.js`:
```javascript
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

// ..snip..

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'ap-southeast-2:abc123ab-abc1-abc2-abc3-abc123abc123',

    // REQUIRED - Amazon Cognito Region
    region: 'ap-southeast-2',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'ap-southeast-2_ABC123A12',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'abcdefghijklmnopqrstuvwxyz',
  }
});

const federated = {
  // google_client_id: '',
  facebook_app_id: '1234567890123456',
  // amazon_client_id: ''
};

const AppWithAuth = withAuthenticator(App);

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));

// ..snip..
```

## Potential Issues / Concerns

A user who signs up with a standard user account, and a social provider (eg. Facebook), will end up with duplicated accounts:

* https://forums.aws.amazon.com/thread.jspa?threadID=261470
* https://github.com/amazon-archives/amazon-cognito-identity-js/issues/560#issuecomment-340906289
* https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/admin-link-provider-for-user.html
  * "This allows you to create a link from the existing user account to an external federated user identity that has not yet been used to sign in, so that the federated user identity can be used to sign in as the existing user account."
  * Basically we need to do this before they create an account..
  * Could add a lambda check to see if a user with the linked email already exists?
  * It looks like this will update the 'identities' field on the user..
* https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/admin-disable-provider-for-user.html

Add:
```
aws cognito-idp admin-link-provider-for-user \
--user-pool-id ap-southeast-2_ABC123A12 \
--destination-user ProviderName=Cognito,ProviderAttributeName=UNUSED,ProviderAttributeValue=11111111-2222-3333-4444-555555555555 \
--source-user ProviderName=Facebook,ProviderAttributeName=Cognito_Subject,ProviderAttributeValue=10160899012520414
```
