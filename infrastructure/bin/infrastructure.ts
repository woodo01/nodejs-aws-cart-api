#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CartAppCdkStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new CartAppCdkStack(app, 'CartAppCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
