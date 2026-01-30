import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends cdk.Stack {
  public readonly productsTable: dynamodb.Table;
  public readonly stockTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Products table
    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Stock table
    this.stockTable = new dynamodb.Table(this, 'StockTable', {
      tableName: 'stock',
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Output table names
    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
    });

    new cdk.CfnOutput(this, 'StockTableName', {
      value: this.stockTable.tableName,
    });
  }
}