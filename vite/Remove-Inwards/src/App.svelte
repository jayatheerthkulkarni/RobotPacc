<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let inwards = [];
  let errorMessage = "";
  let successMessage = "";
  // Object to hold temporary updated quantities for each record, keyed by uuidin
  let updatedQuantities = {};

  // Fetch inwards records from the backend
  async function fetchInwards() {
    try {
      const response = await axios.get("http://localhost:5000/api/inwardsdata");
      inwards = response.data;
      // Initialize the updatedQuantities for each record
      inwards.forEach(record => {
        updatedQuantities[record.uuidin] = {
          buildqty: record.buildqty,
          reciveqty: record.reciveqty,
          acceptqty: record.acceptqty,
          rejectqty: record.rejectqty,
        };
      });
    } catch (error) {
      console.error("Error fetching inwards records:", error);
      errorMessage = "❌ Failed to fetch inwards records.";
    }
  }

  // Delete an inwards record by uuidin
  async function deleteInward(uuidin) {
    if (!confirm("Are you sure you want to delete this inwards record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/delete-inward/${uuidin}`);
      inwards = inwards.filter(record => record.uuidin !== uuidin);
      delete updatedQuantities[uuidin];
      successMessage = "✅ Inwards record deleted successfully!";
    } catch (error) {
      console.error("Error deleting inwards record:", error);
      errorMessage = "❌ Failed to delete inwards record.";
    }
  }

  // Update inwards record quantities
  async function updateInward(uuidin) {
    const qtys = updatedQuantities[uuidin];
    try {
      await axios.patch(`http://localhost:5000/api/update-inward/${uuidin}`, qtys);
      // Update the local inwards record with new quantities
      const record = inwards.find(r => r.uuidin === uuidin);
      if (record) {
        record.buildqty = qtys.buildqty;
        record.reciveqty = qtys.reciveqty;
        record.acceptqty = qtys.acceptqty;
        record.rejectqty = qtys.rejectqty;
      }
      successMessage = "✅ Inwards record updated successfully!";
    } catch (error) {
      console.error("Error updating inwards record:", error);
      errorMessage = "❌ Failed to update inwards record.";
    }
  }

  onMount(fetchInwards);
</script>

<Navigation />

<div class="container">
  <h2>Manage Inwards</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <table>
    <thead>
      <tr>
        <th>UUID</th>
        <th>Item Code</th>
        <th>Supplier Phone</th>
        <th>Build Qty</th>
        <th>Received Qty</th>
        <th>Accepted Qty</th>
        <th>Rejected Qty</th>
        <th>Year of Manufacture</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each inwards as record}
        <tr>
          <td>{record.uuidin}</td>
          <td>{record.itemcode}</td>
          <td>{record.phone}</td>
          <td>
            <input type="number" bind:value={updatedQuantities[record.uuidin].buildqty} />
          </td>
          <td>
            <input type="number" bind:value={updatedQuantities[record.uuidin].reciveqty} />
          </td>
          <td>
            <input type="number" bind:value={updatedQuantities[record.uuidin].acceptqty} />
          </td>
          <td>
            <input type="number" bind:value={updatedQuantities[record.uuidin].rejectqty} />
          </td>
          <td>{record.yearmanufactor}</td>
          <td>
            <button on:click={() => updateInward(record.uuidin)}>Update</button>
            <button class="delete-btn" on:click={() => deleteInward(record.uuidin)}>
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
    max-width: 1000px;
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

  input {
    width: 60px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
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
