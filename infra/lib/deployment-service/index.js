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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentService = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const constructs_1 = require("constructs");
const path = './resources/build';
class DeploymentService extends constructs_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        const hostingBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'FrontendBucket', {
            blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        const distribution = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'CloudfrontDistribution', {
            defaultBehavior: {
                origin: aws_cdk_lib_1.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(hostingBucket),
                viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });
        new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
            sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset(path)],
            destinationBucket: hostingBucket,
            distribution,
            distributionPaths: ['/*'],
        });
        new aws_cdk_lib_1.CfnOutput(this, 'CloudFrontURL', {
            value: distribution.distributionDomainName,
        });
    }
}
exports.DeploymentService = DeploymentService;
__exportStar(require("../deployment-service"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQU9xQjtBQUNyQiwyQ0FBdUM7QUFFdkMsTUFBTSxJQUFJLEdBQUcsbUJBQW1CLENBQUM7QUFFakMsTUFBYSxpQkFBa0IsU0FBUSxzQkFBUztJQUM5QyxZQUFZLEtBQWdCLEVBQUUsRUFBVTtRQUN0QyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sYUFBYSxHQUFHLElBQUksb0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzlELGlCQUFpQixFQUFFLG9CQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNyRCxhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO1NBQ3JDLENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQWMsQ0FBQyxZQUFZLENBQ2xELElBQUksRUFDSix3QkFBd0IsRUFDeEI7WUFDRSxlQUFlLEVBQUU7Z0JBQ2YsTUFBTSxFQUFFLG9DQUFzQixDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FDbkUsYUFBYSxDQUNkO2dCQUNELG9CQUFvQixFQUFFLDRCQUFjLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCO2FBQzVFO1lBQ0QsaUJBQWlCLEVBQUUsWUFBWTtZQUMvQixjQUFjLEVBQUU7Z0JBQ2Q7b0JBQ0UsVUFBVSxFQUFFLEdBQUc7b0JBQ2Ysa0JBQWtCLEVBQUUsR0FBRztvQkFDdkIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDaEM7YUFDRjtTQUNGLENBQ0YsQ0FBQztRQUVGLElBQUksK0JBQWlCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQy9ELE9BQU8sRUFBRSxDQUFDLCtCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsaUJBQWlCLEVBQUUsYUFBYTtZQUNoQyxZQUFZO1lBQ1osaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkMsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0I7U0FDM0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBekNELDhDQXlDQztBQUVELHdEQUFzQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGF3c19jbG91ZGZyb250LFxuICBhd3NfY2xvdWRmcm9udF9vcmlnaW5zLFxuICBhd3NfczMsXG4gIGF3c19zM19kZXBsb3ltZW50LFxuICBDZm5PdXRwdXQsXG4gIFJlbW92YWxQb2xpY3ksXG59IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5jb25zdCBwYXRoID0gJy4vcmVzb3VyY2VzL2J1aWxkJztcblxuZXhwb3J0IGNsYXNzIERlcGxveW1lbnRTZXJ2aWNlIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBob3N0aW5nQnVja2V0ID0gbmV3IGF3c19zMy5CdWNrZXQodGhpcywgJ0Zyb250ZW5kQnVja2V0Jywge1xuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IGF3c19zMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgYXdzX2Nsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgICdDbG91ZGZyb250RGlzdHJpYnV0aW9uJyxcbiAgICAgIHtcbiAgICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgICAgb3JpZ2luOiBhd3NfY2xvdWRmcm9udF9vcmlnaW5zLlMzQnVja2V0T3JpZ2luLndpdGhPcmlnaW5BY2Nlc3NDb250cm9sKFxuICAgICAgICAgICAgaG9zdGluZ0J1Y2tldFxuICAgICAgICAgICksXG4gICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGF3c19jbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0Um9vdE9iamVjdDogJ2luZGV4Lmh0bWwnLFxuICAgICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGh0dHBTdGF0dXM6IDQwNCxcbiAgICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBuZXcgYXdzX3MzX2RlcGxveW1lbnQuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnQnVja2V0RGVwbG95bWVudCcsIHtcbiAgICAgIHNvdXJjZXM6IFthd3NfczNfZGVwbG95bWVudC5Tb3VyY2UuYXNzZXQocGF0aCldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IGhvc3RpbmdCdWNrZXQsXG4gICAgICBkaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQ2xvdWRGcm9udFVSTCcsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgKiBmcm9tICcuLi9kZXBsb3ltZW50LXNlcnZpY2UnO1xuIl19