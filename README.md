# PoC-AWS-Cognito

Playing around with setting up authentication using AWS Cognito.

While there is a lot of cool stuff here.. there are also quite a few annoying quirks/things that just aren't possible/easy to implement right now (eg. social logins + cognito user pools + react UI). Depending on your needs.. it may be better to look elsewhere for now, or perhaps stick to the Amplify CLI 'built stack' assuming it JustWorks(tm)?

## AWS Cognito

We can manually create the user pool ourselves using [AWS Cognito through the AWS Console](https://console.aws.amazon.com/cognito/users/), this would be good for playing around and learning what bits we want/need before trying to 'enforce' them through Infrastructure as Code.

* https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html

Unfortunately, it seems it's not currently possible to export these settings as a CloudFormation template:

* https://stackoverflow.com/questions/44503800/how-to-export-cognito-user-pool-settings-to-cloudformation-template

There are two main parts to Cognito:

* [Amazon Cognito User Pools](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/cognito-user-identity-pools.html) ([API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/Welcome.html))
* [Amazon Cognito Federated Identities (Identity Pool)](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/cognito-identity.html) ([API](https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/Welcome.html), [Auth Flow](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/authentication-flow.html), [Developer Authenticated Identities](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/developer-authenticated-identities.html))

The distinctions between both are pretty unclear at times, and depending on your usecase, you may need one/the other, or even both. Identity Pools are older, and don't have built in sign up and user/password type features (though can link to a User Pool identity as one of the linked identities). User pools are newer and have these signup/login features, but their support for federation/social login can be limited at the moment (eg. lack of API's, only available through hosted login UI, etc). Amplify seems to use both of these together to implement social login and similar.

## Amplify (CLI, JS)

This is designed to help us to easily add feature sets to our applications, for example, authentication. It can handle both the backend features (from the CLI) and frontend (from the JS):

* https://github.com/aws-amplify/amplify-cli
* https://aws-amplify.github.io/amplify-js/media/authentication_guide

```
amplify init

amplify auth add
```

This seems to create a verbose (~300 lines) CloudFormation template.. it probably doesn't need to be so big, but there are a lot of parameters and options passed in:

* https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-category-auth/provider-utils/awscloudformation/cloudformation-templates/auth-template.yml.ejs
  * SNSRole (AWS::IAM::Role)
  * UserPool (AWS::Cognito::UserPool)
  * UserPoolClientWeb (AWS::Cognito::UserPoolClient)
  * UserPoolClient (AWS::Cognito::UserPoolClient)
  * UserPoolClientRole (AWS::IAM::Role)
  * UserPoolClientLambda (AWS::Lambda::Function)
  * UserPoolClientLambdaPolicy (AWS::IAM::Policy)
  * UserPoolClientLogPolicy (AWS::IAM::Policy)
  * UserPoolClientInputs (Custom::LambdaCallout)
  * MFALambdaRole (AWS::IAM::Role)
  * MFALambda (AWS::Lambda::Function)
  * MFALambdaPolicy (AWS::IAM::Policy)
  * MFALogPolicy (AWS::IAM::Policy)
  * MFALambdaInputs (Custom::LambdaCallout)
  * OpenIdLambdaRole (AWS::IAM::Role)
  * OpenIdLambda (AWS::Lambda::Function)
  * OpenIdLambdaIAMPolicy (AWS::IAM::Policy)
  * OpenIdLogPolicy (AWS::IAM::Policy)
  * OpenIdLambdaInputs (Custom::LambdaCallout)
  * IdentityPool (AWS::Cognito::IdentityPool)
  * IdentityPoolRoleMap (AWS::Cognito::IdentityPoolRoleAttachment)

I feel like we could tune things better manually.. though the 'fully integrated' aspect of this would be nice. Learning from what is done here + what we played with above would probably be useful.

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

## How to make Cognito Passwordless / Magic Link

While it isn't currently natively supported (ref [1](https://github.com/aws/amazon-cognito-auth-js/issues/18), [2](https://stackoverflow.com/questions/45666794/aws-cognito-user-pool-without-a-password)), it should be possible to implement a ['passwordless'/magic token signin](https://aws.amazon.com/blogs/startups/increase-engagement-and-enhance-security-with-passwordless-authentication/) flow using [Custom Authentication Flow](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html#amazon-cognito-user-pools-custom-authentication-flow):

* API's: [InitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html)(CUSTOM_AUTH) -> [RespondToAuthChallenge](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html)
* Admin API's: [AdminInitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminInitiateAuth.html), [AdminRespondToAuthChallenge](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminRespondToAuthChallenge.html)
* [Lambda Triggers](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html): [DefineAuthChallenge](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-define-auth-challenge.html), [CreateAuthChallenge](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-create-auth-challenge.html), [VerifyAuthChallengeResponse](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-verify-auth-challenge-response.html)

To implement this, using the above API's/Lambda triggers, you would do something like:

* Initiate a custom auth flow passing along the username/device key ([InitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html)/[AdminInitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminInitiateAuth.html))
* Handle whatever needs to be done with [DefineAuthChallenge](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-define-auth-challenge.html) to say to use our 'passwordless' flow
* Within [CreateAuthChallenge](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-create-auth-challenge.html)
  * Lookup the user on the backend ([AdminGetUser](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminGetUser.html))
  * Extract their email address from the [user attributes](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminGetUser.html#CognitoUserPools-AdminGetUser-response-UserAttributes)
  * Generate a secret code and send it to the user via email/sms (using AWS SES/SNS, etc), this should store the token within the `privateChallengeParameters` attribute
* The user should receive an email with the secret token, ideally linked to a page on your frontend application that would then trigger the [VerifyAuthChallengeResponse](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/user-pool-lambda-verify-auth-challenge-response.html) step (via `RespondToAuthChallenge`)
  * Ensure that the secret code provided in the `challengeAnswer` matches the one previously stored in the `privateChallengeParameters`. If they match, set `answerCorrect` to `true`
* If this was the only step in the custom auth flow, the user should be successfully authenticated and receive their 'signed in token' back

It may be possible to leverage existing MFA features to skip having to implement the 'send email' flow described above. As part of the custom auth flow, you would return a challenge type of `SMS_MFA`. Theoretically this would then allow you to confirm the user just from the MFA code alone. One downside of this is that you probably wouldn't be able to use email for the sign in link.

It might be possible to leverage existing 'verify attribute' features to avoid having to manually handle the email/SMS flow, but since you may already need to be authenticated for this it might not work:

* [GetUserAttributeVerificationCode](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_GetUserAttributeVerificationCode.html)
* [VerifyUserAttribute](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_VerifyUserAttribute.html)

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

## Alternatives

* https://firebase.google.com/docs/auth/ ([pricing](https://firebase.google.com/pricing/), [UI](https://github.com/firebase/FirebaseUI-Web))
* https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-overview
* https://auth0.com/
* https://developers.facebook.com/products/account-creation
