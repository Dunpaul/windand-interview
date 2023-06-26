To optimize the performance of the given SQL query, these steps cna be followed:

1. Indexing: Create an index on the "customer_id" and "order_date" columns. This will speed up the search for a specific customer_id and improve the sorting performance based on order_date.

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_order_date ON orders (order_date DESC);
```

2. Select Only Necessary Columns: Instead of selecting all columns using "*", specify the required columns explicitly. Selecting only the necessary columns can reduce the amount of data that needs to be fetched from the disk, improving query performance. For example:

```sql
SELECT id, customer_id, order_date, total_amount 
FROM orders 
WHERE customer_id = 123 
ORDER BY order_date DESC;
```

3. Limit the Number of Rows: If you only need a specific number of rows from the result set, consider using the LIMIT clause. Limiting the number of rows returned can improve query performance. For example, if you only want to retrieve the 10 most recent orders:

```sql
SELECT id, customer_id, order_date, total_amount 
FROM orders 
WHERE customer_id = 123 
ORDER BY order_date DESC 
LIMIT 10;
```

By following these optimization steps, an improvement is eminent in the performance of the given SQL query.