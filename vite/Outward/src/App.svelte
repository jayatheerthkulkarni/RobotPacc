<script>
  import { onMount } from 'svelte';
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";

  let outwards = [];
  let errorMessage = "";
  let loading = false;
  let successMessage = "";

  // Fetch outwards records on component mount.
  async function loadOutwards() {
    loading = true;
    try {
      const response = await axios.get("http://localhost:5000/api/outwardsdata");
      outwards = response.data;
    } catch (error) {
      console.error("Error fetching outwards:", error);
      errorMessage = error.response?.data?.error || "Failed to load outwards records.";
    }
    loading = false;
  }

  // Call loadOutwards when component mounts.
  onMount(() => {
    loadOutwards();
  });

  // Download XLSX file from the backend.
  async function downloadXLSX() {
    try {
      const response = await axios.get("http://localhost:5000/api/download-outwards", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "outwards.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading XLSX:", error);
      errorMessage = error.response?.data?.error || "Failed to download XLSX file.";
    }
  }
</script>

<Navigation />

<div class="container">
  <!-- Header with title and download button -->
  <div class="header">
    <h2>Outwards Records</h2>
    <button class="download-btn" on:click={downloadXLSX}>
      Download XLSX
    </button>
  </div>

  {#if loading}
    <p>Loading outwards...</p>
  {:else if errorMessage}
    <div class="message error">{errorMessage}</div>
  {:else}
    {#if outwards.length > 0}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item Code</th>
            <th>Phone</th>
            <th>UUID</th>
            <th>Issue Qty</th>
            <th>Sale Value</th>
          </tr>
        </thead>
        <tbody>
          {#each outwards as record, index}
            <tr>
              <td>{index + 1}</td>
              <td>{record.itemcode}</td>
              <td>{record.phone}</td>
              <td>{record.uuidout}</td>
              <td>{record.issueqty}</td>
              <td>{record.salevalue}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No outwards records found.</p>
    {/if}
  {/if}
</div>

<style>
  .container {
    width: 90%;
    max-width: 1000px;
    margin: 2rem auto;
    padding: 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  h2 {
    margin: 0;
    color: #2c3e50;
  }

  .message.error {
    background: #e74c3c;
    color: white;
    padding: 0.8rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background: #3498db;
    color: white;
  }

  tr:nth-child(even) {
    background: #f9f9f9;
  }

  .download-btn {
    padding: 0.75rem 1.5rem;
    background: #2ecc71;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .download-btn:hover {
    background: #27ae60;
  }
</style>
