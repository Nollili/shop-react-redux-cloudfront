import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

/**
 * Product API queries and mutations
 * 
 * This file contains all React Query hooks for product-related API operations:
 * - Fetching product lists and individual products
 * - Creating and updating products
 * - Cache management for optimal performance
 */

// Fetch all available products with stock information
// Used on main shop page and admin product list
export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios.get<AvailableProduct[]>(
        `${API_PATHS.product}/product/available`
      );
      return res.data;
    }
  );
}

// Invalidate available products cache to force refresh
// Called after creating/updating/deleting products to show changes immediately
export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

// Fetch single product by ID for editing
// Only runs when ID is provided (enabled: !!id)
export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axios.get<AvailableProduct>(
        `${API_PATHS.bff}/product/${id}`
      );
      return res.data;
    },
    { enabled: !!id } // Only fetch if ID exists
  );
}

// Remove specific product from cache
// Used after successful operations to clear stale data
export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

// Create or update product mutation
// Handles both new product creation and existing product updates
export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) => {
    // Determine operation based on presence of product ID
    if (!values.id) {
      // Creating new product - use POST /products endpoint
      // This calls the createProduct Lambda function which:
      // 1. Generates a new UUID for the product
      // 2. Stores product data in DynamoDB products table
      // 3. Creates corresponding stock entry in stock table
      return axios.post<AvailableProduct>(`${API_PATHS.product}/products`, values);
    } else {
      // Updating existing product - use PUT endpoint (if implemented)
      // Note: Update functionality would need corresponding Lambda function
      return axios.put<AvailableProduct>(`${API_PATHS.product}/products/${values.id}`, values);
    }
  });
}

// Delete product mutation
// Removes product from database (if delete endpoint is implemented)
export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
