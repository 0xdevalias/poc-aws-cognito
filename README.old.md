# PoC-AWS-Cognito

Playing around with setting up authentication using AWS Cognito.

## Setting up a React testbed

We'll use [`create-react-app`](https://github.com/facebook/create-react-app#creating-an-app) + some `npm` magic to setup a frontend testbed to play with.

```
npm init react-app poc-aws-cognito
```

## AWS Cognito

We can manually create the user pool ourselves using [AWS Cognito through the AWS Console](https://console.aws.amazon.com/cognito/users/), this would be good for playing around and learning what bits we want/need.

It seems it's not currently possible to export these settings as a CloudFormation template:

* https://stackoverflow.com/questions/44503800/how-to-export-cognito-user-pool-settings-to-cloudformation-template

## CloudFormation

* TODO
* https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html

## AWS SAM

* TODO

## Amplify-CLI

* https://github.com/aws-amplify/amplify-cli
* https://aws-amplify.github.io/amplify-js/media/authentication_guide

```
amplify init

amplify auth add
```

This seems to create a verbose (~300 lines) CloudFormation template.. it probably doesn't need to be so big, but there are a lot of parameters and options passed in. I feel like we could do better manually.. though the 'fully integrated' aspect of this would be nice.

## AWS CDK

* TODO
