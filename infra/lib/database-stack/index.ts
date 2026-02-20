import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * DatabaseStack - Creates DynamoDB tables for the shop application
 * 
 * This stack manages the data layer of the e-commerce application:
 * - Products table: stores product information (id, title, description, price, image)
 * - Stock table: stores inventory counts for each product (product_id, count)
 * 
 * Both tables use on-demand billing and are configured for development (DESTROY on stack deletion)
 */
export class DatabaseStack extends cdk.Stack {
  public readonly productsTable: dynamodb.Table;
  public readonly stockTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Products table - stores core product data
    // Schema: { id: string, title: string, description: string, price: number, image: string }
    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }, // Primary key: product UUID
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Pay only for actual usage
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete table when stack is destroyed (dev only)
    });

    // Stock table - stores inventory information
    // Schema: { product_id: string, count: number }
    // Links to products table via product_id foreign key
    this.stockTable = new dynamodb.Table(this, 'StockTable', {
      tableName: 'stock',
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING }, // Foreign key to products.id
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Pay only for actual usage
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete table when stack is destroyed (dev only)
    });

    // Output table names for reference by other stacks
    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      description: 'Name of the products DynamoDB table',
    });

    new cdk.CfnOutput(this, 'StockTableName', {
      value: this.stockTable.tableName,
      description: 'Name of the stock DynamoDB table',
    });
  }
}