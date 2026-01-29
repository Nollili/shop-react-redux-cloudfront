#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const products = [
  {
    id: '19befc55-ea39-4ff0-8b63-e3a3c8b94f53',
    title: 'Classic White T-Shirt',
    description: '100% cotton, unisex, available in all sizes',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '889b35f2-4c60-4265-9ea7-b81ebbbdee39',
    title: 'Blue Denim Jeans',
    description: 'Slim fit, stretchable, various waist sizes',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1715758890151-2c15d5d482aa?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'f4850e7b-fc3d-40f3-a532-64919cec3e0b',
    title: 'Red Hoodie',
    description: 'Soft fleece, kangaroo pocket, drawstring hood',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1579269896398-4deb6cbdc320?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'c7630b15-10e5-4244-a003-8dcc2342d0c0',
    title: 'Black Leather Jacket',
    description: 'Genuine leather, biker style, limited edition',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1727524366429-27de8607d5f6?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '1169cf53-f439-4130-98d3-395ee35c6dcd',
    title: 'Green Chino Shorts',
    description: 'Lightweight, breathable, perfect for summer',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1667388624717-895854eea032?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

async function populateProducts() {
  console.log('Populating products table...');
  
  for (const product of products) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'products',
        Item: product
      }));
      console.log(`Added product: ${product.title}`);
    } catch (error) {
      console.error(`Error adding product ${product.title}:`, error);
    }
  }
}

async function populateStock() {
  console.log('Populating stock table...');
  
  const stockData = [
    { product_id: products[0].id, count: 50 },
    { product_id: products[1].id, count: 30 },
    { product_id: products[2].id, count: 25 },
    { product_id: products[3].id, count: 10 },
    { product_id: products[4].id, count: 40 }
  ];

  for (const stock of stockData) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'stock',
        Item: stock
      }));
      console.log(`Added stock for product: ${stock.product_id}, count: ${stock.count}`);
    } catch (error) {
      console.error(`Error adding stock for product ${stock.product_id}:`, error);
    }
  }
}

async function main() {
  try {
    await populateProducts();
    await populateStock();
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

main();