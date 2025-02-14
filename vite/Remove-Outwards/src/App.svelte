<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let outwards = [];
  let errorMessage = "";
  let successMessage = "";
  // Object to store temporary updated values for each record, keyed by uuidout
  let updatedValues = {};

  // Fetch outwards records from the backend
  async function fetchOutwards() {
    try {
      const response = await axios.get("http://localhost:5000/api/outwardsdata");
      outwards = response.data;
      // Initialize updatedValues for each record
      outwards.forEach(record => {
        updatedValues[record.uuidout] = {
          issueqty: record.issueqty,
          salevalue: record.salevalue,
          partsavgtot: record.partsavgtot,
          profits: record.profits,
          profitpercentage: record.profitpercentage
        };
      });
    } catch (error) {
      console.error("Error fetching outwards records:", error);
      errorMessage = "❌ Failed to fetch outwards records.";
    }
  }

  // Delete an outwards record by uuidout
  async function deleteOutward(uuidout) {
    if (!confirm("Are you sure you want to delete this outwards record?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/delete-outward/${uuidout}`);
      outwards = outwards.filter(record => record.uuidout !== uuidout);
      delete updatedValues[uuidout];
      successMessage = "✅ Outwards record deleted successfully!";
    } catch (error) {
      console.error("Error deleting outwards record:", error);
      errorMessage = "❌ Failed to delete outwards record.";
    }
  }

  // Update outwards record quantities
  async function updateOutward(uuidout) {
    const values = updatedValues[uuidout];
    try {
      await axios.patch(`http://localhost:5000/api/update-outward/${uuidout}`, values);
      // Update the local outwards record with new values
      const record = outwards.find(r => r.uuidout === uuidout);
      if (record) {
        record.issueqty = values.issueqty;
        record.salevalue = values.salevalue;
        record.partsavgtot = values.partsavgtot;
        record.profits = values.profits;
        record.profitpercentage = values.profitpercentage;
      }
      successMessage = "✅ Outwards record updated successfully!";
    } catch (error) {
      console.error("Error updating outwards record:", error);
      errorMessage = "❌ Failed to update outwards record.";
    }
  }

  onMount(fetchOutwards);
</script>

<Navigation />

<div class="container">
  <h2>Manage Outwards</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <table>
    <thead>
      <tr>
        <th>UUID (Out)</th>
        <th>Item Code</th>
        <th>Customer Phone</th>
        <th>Reference</th>
        <th>Issued Qty</th>
        <th>Sale Value</th>
        <th>Parts Avg Total</th>
        <th>Profits</th>
        <th>Profit %</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each outwards as record}
        <tr>
          <td>{record.uuidout}</td>
          <td>{record.itemcode}</td>
          <td>{record.phone}</td>
          <td>{record.referece}</td>
          <td>
            <input
              type="number"
              bind:value={updatedValues[record.uuidout].issueqty}
            />
          </td>
          <td>
            <input
              type="number"
              bind:value={updatedValues[record.uuidout].salevalue}
            />
          </td>
          <td>
            <input
              type="number"
              bind:value={updatedValues[record.uuidout].partsavgtot}
            />
          </td>
          <td>
            <input
              type="number"
              bind:value={updatedValues[record.uuidout].profits}
            />
          </td>
          <td>
            <input
              type="number"
              bind:value={updatedValues[record.uuidout].profitpercentage}
            />
          </td>
          <td>
            <button on:click={() => updateOutward(record.uuidout)}>Update</button>
            <button class="delete-btn" on:click={() => deleteOutward(record.uuidout)}>
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
    width: 70px;
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
