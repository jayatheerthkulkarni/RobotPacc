<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let suppliers = [];
  let errorMessage = "";
  let successMessage = "";
  let loading = false;

  // Fetch suppliers from the backend
  async function fetchSuppliers() {
    try {
      const response = await axios.get("http://localhost:5000/api/suppliers");
      suppliers = response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      errorMessage = "❌ Failed to fetch suppliers.";
    }
  }

  // Delete a supplier by phone
  async function deleteSupplier(phone) {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/delete-supplier/${phone}`);
      suppliers = suppliers.filter(supplier => supplier.phone !== phone);
      successMessage = "✅ Supplier deleted successfully!";
    } catch (error) {
      console.error("Error deleting supplier:", error);
      errorMessage = "❌ Failed to delete supplier.";
    }
  }

  onMount(fetchSuppliers);
</script>

<Navigation />

<div class="container">
  <h2>Manage Suppliers</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <table>
    <thead>
      <tr>
        <th>Phone</th>
        <th>Supplier Name</th>
        <th>Contact Person</th>
        <th>Email</th>
        <th>Address</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each suppliers as supplier}
        <tr>
          <td>{supplier.phone}</td>
          <td>{supplier.supname}</td>
          <td>{supplier.contactperson}</td>
          <td>{supplier.email}</td>
          <td>{supplier.address}</td>
          <td>
            <button class="delete-btn" on:click={() => deleteSupplier(supplier.phone)}>
              🗑 Delete
            </button>
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
