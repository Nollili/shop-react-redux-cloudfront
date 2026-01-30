#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const deploy_web_app_stack_1 = require("../lib/deploy-web-app-stack/deploy-web-app-stack");
const hello_lambda_stack_1 = require("../lib/hello-lambda-stack/hello-lambda-stack");
const index_1 = require("../lib/todo/index");
const hello_s3_stack_1 = require("../lib/hello-s3/hello-s3-stack");
const index_2 = require("../lib/product-service-stack/index");
const app = new cdk.App();
new deploy_web_app_stack_1.DeployWebAppStack(app, 'DeployWebAppStack', {
/* If you don't specify 'env', this stack will be environment-agnostic.
 * Account/Region-dependent features and context lookups will not work,
 * but a single synthesized template can be deployed anywhere. */
/* Uncomment the next line to specialize this stack for the AWS Account
 * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
/* Uncomment the next line if you know exactly what Account and Region you
 * want to deploy the stack to. */
// env: { account: '123456789012', region: 'us-east-1' },
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
new index_1.TodoStack(app, 'TodoStack');
new hello_lambda_stack_1.HelloLambdaStack(app, 'HelloLambdaStack');
new hello_s3_stack_1.HelloS3Stack(app, 'HelloS3Stack', {});
new index_2.ProductServiceStack(app, 'ProductServiceStack');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLDJGQUFxRjtBQUNyRixxRkFBZ0Y7QUFDaEYsNkNBQThDO0FBQzlDLG1FQUE4RDtBQUM5RCw4REFBeUU7QUFFekUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSx3Q0FBaUIsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUU7QUFDOUM7O2lFQUVpRTtBQUVqRTttRUFDbUU7QUFDbkUsNkZBQTZGO0FBRTdGO2tDQUNrQztBQUNsQyx5REFBeUQ7QUFFekQsOEZBQThGO0NBQy9GLENBQUMsQ0FBQztBQUNILElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDaEMsSUFBSSxxQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxJQUFJLDZCQUFZLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQyxJQUFJLDJCQUFtQixDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IERlcGxveVdlYkFwcFN0YWNrIH0gZnJvbSAnLi4vbGliL2RlcGxveS13ZWItYXBwLXN0YWNrL2RlcGxveS13ZWItYXBwLXN0YWNrJztcbmltcG9ydCB7IEhlbGxvTGFtYmRhU3RhY2sgfSBmcm9tICcuLi9saWIvaGVsbG8tbGFtYmRhLXN0YWNrL2hlbGxvLWxhbWJkYS1zdGFjayc7XG5pbXBvcnQgeyBUb2RvU3RhY2sgfSBmcm9tICcuLi9saWIvdG9kby9pbmRleCc7XG5pbXBvcnQgeyBIZWxsb1MzU3RhY2sgfSBmcm9tICcuLi9saWIvaGVsbG8tczMvaGVsbG8tczMtc3RhY2snO1xuaW1wb3J0IHsgUHJvZHVjdFNlcnZpY2VTdGFjayB9IGZyb20gJy4uL2xpYi9wcm9kdWN0LXNlcnZpY2Utc3RhY2svaW5kZXgnO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xubmV3IERlcGxveVdlYkFwcFN0YWNrKGFwcCwgJ0RlcGxveVdlYkFwcFN0YWNrJywge1xuICAvKiBJZiB5b3UgZG9uJ3Qgc3BlY2lmeSAnZW52JywgdGhpcyBzdGFjayB3aWxsIGJlIGVudmlyb25tZW50LWFnbm9zdGljLlxuICAgKiBBY2NvdW50L1JlZ2lvbi1kZXBlbmRlbnQgZmVhdHVyZXMgYW5kIGNvbnRleHQgbG9va3VwcyB3aWxsIG5vdCB3b3JrLFxuICAgKiBidXQgYSBzaW5nbGUgc3ludGhlc2l6ZWQgdGVtcGxhdGUgY2FuIGJlIGRlcGxveWVkIGFueXdoZXJlLiAqL1xuXG4gIC8qIFVuY29tbWVudCB0aGUgbmV4dCBsaW5lIHRvIHNwZWNpYWxpemUgdGhpcyBzdGFjayBmb3IgdGhlIEFXUyBBY2NvdW50XG4gICAqIGFuZCBSZWdpb24gdGhhdCBhcmUgaW1wbGllZCBieSB0aGUgY3VycmVudCBDTEkgY29uZmlndXJhdGlvbi4gKi9cbiAgLy8gZW52OiB7IGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OIH0sXG5cbiAgLyogVW5jb21tZW50IHRoZSBuZXh0IGxpbmUgaWYgeW91IGtub3cgZXhhY3RseSB3aGF0IEFjY291bnQgYW5kIFJlZ2lvbiB5b3VcbiAgICogd2FudCB0byBkZXBsb3kgdGhlIHN0YWNrIHRvLiAqL1xuICAvLyBlbnY6IHsgYWNjb3VudDogJzEyMzQ1Njc4OTAxMicsIHJlZ2lvbjogJ3VzLWVhc3QtMScgfSxcblxuICAvKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9jZGsvbGF0ZXN0L2d1aWRlL2Vudmlyb25tZW50cy5odG1sICovXG59KTtcbm5ldyBUb2RvU3RhY2soYXBwLCAnVG9kb1N0YWNrJyk7XG5uZXcgSGVsbG9MYW1iZGFTdGFjayhhcHAsICdIZWxsb0xhbWJkYVN0YWNrJyk7XG5uZXcgSGVsbG9TM1N0YWNrKGFwcCwgJ0hlbGxvUzNTdGFjaycsIHt9KTtcbm5ldyBQcm9kdWN0U2VydmljZVN0YWNrKGFwcCwgJ1Byb2R1Y3RTZXJ2aWNlU3RhY2snKTsiXX0=