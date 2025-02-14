<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let items = [];
  let errorMessage = "";
  let successMessage = "";
  let loading = false;

  // Fetch the pmaster table data
  async function fetchItems() {
      try {
          const response = await axios.get("http://localhost:5000/api/pmaster");
          items = response.data;
      } catch (error) {
          console.error("Error fetching items:", error);
          errorMessage = "❌ Failed to fetch items.";
      }
  }

  // Decrease or increase quantity
  async function updateQuantity(itemcode, change) {
      try {
          const item = items.find(i => i.itemcode === itemcode);
          if (!item) return;

          const newQty = item.qty + change;
          if (newQty < 0) {
              errorMessage = "❌ Quantity cannot be negative!";
              return;
          }

          await axios.patch("http://localhost:5000/api/update-quantity", {
              itemcode,
              qty: newQty
          });

          successMessage = `✅ Quantity updated to ${newQty}`;
          item.qty = newQty;
      } catch (error) {
          console.error("Error updating quantity:", error);
          errorMessage = "❌ Failed to update quantity.";
      }
  }

  // Delete an item from pmaster
  async function deleteItem(itemcode) {
      if (!confirm("Are you sure you want to delete this item?")) return;

      try {
          await axios.delete(`http://localhost:5000/api/delete-item/${itemcode}`);
          items = items.filter(i => i.itemcode !== itemcode);
          successMessage = "✅ Item deleted successfully!";
      } catch (error) {
          console.error("Error deleting item:", error);
          errorMessage = "❌ Failed to delete item.";
      }
  }

  onMount(fetchItems);
</script>

<Navigation />

<div class="container">
  <h2>Manage Inventory</h2>

  {#if errorMessage}
      <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
      <div class="message success">{successMessage}</div>
  {/if}

  <table>
      <thead>
          <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Actions</th>
          </tr>
      </thead>
      <tbody>
          {#each items as item}
              <tr>
                  <td>{item.itemcode}</td>
                  <td>{item.itemname}</td>
                  <td>{item.itemdesc}</td>
                  <td>{item.qty}</td>
                  <td>
                      <button on:click={() => updateQuantity(item.itemcode, -1)}>-</button>
                      <button on:click={() => updateQuantity(item.itemcode, 1)}>+</button>
                      <button class="delete-btn" on:click={() => deleteItem(item.itemcode)}>🗑 Delete</button>
                  </td>
              </tr>
          {/each}
      </tbody>
  </table>
</div>

<style>
  .container {
      width: 90%;
      max-width: 800px;
      margin: 3% auto;
      padding: 1rem;
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 1rem;
  }

  .message {
      text-align: center;
      padding: 0.8rem;
      border-radius: 8px;
      font-weight: 500;
      margin-bottom: 1rem;
  }

  .success {
      background: #2ecc71;
      color: white;
  }

  .error {
      background: #e74c3c;
      color: white;
  }

  table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
  }

  th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
  }

  th {
      background: #3498db;
      color: white;
  }

  button {
      padding: 5px 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 2px;
  }

  button:hover {
      opacity: 0.8;
  }

  .delete-btn {
      background: #e74c3c;
      color: white;
  }
</style>
