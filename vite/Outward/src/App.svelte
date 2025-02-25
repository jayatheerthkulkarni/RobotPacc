<script>
  import { onMount } from 'svelte';
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { writable, derived } from 'svelte/store';
  import * as XLSX from "xlsx";

  // Stores
  const outwards = writable([]);
  const loading = writable(false);
  const error = writable("");
  const sortColumn = writable(null);
  const sortDirection = writable("none");

  const sortableColumns = [
    "itemcode", "phone", "uuidout", "referece", "issueqty", "salevalue", "partsavgtot", "profits", "profitpercentage", "price"
  ];

  // Derived store for sorted items
  const sortedOutwards = derived(
    [outwards, sortColumn, sortDirection],
    ([$outwards, $sortColumn, $sortDirection]) => {
      if (!$sortColumn || $sortDirection === "none") {
        return $outwards;
      }
      return sortItems([...$outwards], $sortColumn, $sortDirection);
    }
  );

  // Delete Handler
  async function deleteOutward(uuidout) {
    if (!confirm(`Delete outward record with UUID ${uuidout}?`)) return;
    $loading = true;
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete-outward/${uuidout}`);
      if (response.status === 200) {
        // Optimistically update the UI
        outwards.update(currentOutwards => currentOutwards.filter(outward => outward.uuidout !== uuidout));
        $error = "";
      } else {
        $error = `Delete failed: ${response.data.error || "Unknown error"}`;
      }
    } catch (err) {
      $error = "Delete error: " + err.message;
    } finally {
      $loading = false;
    }
  }

  // Data Fetching
  async function fetchOutwards() {
    $error = "";
    $loading = true;
    try {
      const response = await axios.get("http://localhost:5000/api/outwardsdata");
      $outwards = response.data;
    } catch (err) {
      $error = "Failed to fetch outwards: " + err.message;
    } finally {
      $loading = false;
    }
  }

  onMount(fetchOutwards);

  // Sorting Functions
  function resetSort() {
    $sortColumn = null;
    $sortDirection = "none";
  }

  function sortData(column) {
    if (!sortableColumns.includes(column)) return;
    if ($sortColumn === column) {
      if ($sortDirection === "asc") {
        $sortDirection = "desc";
      } else if ($sortDirection === "desc") {
        $sortDirection = "none";
        $sortColumn = null;
      } else {
        $sortDirection = "asc";
      }
    } else {
      $sortColumn = column;
      $sortDirection = "asc";
    }
  }

  function getSortIndicator(column) {
    if ($sortColumn === column) {
      if ($sortDirection === "asc") {
        return "↑";
      } else if ($sortDirection === "desc") {
        return "↓";
      }
    }
    return "↕";
  }

  function sortItems(itemsArray, column, direction) {
    let sortedItems = [...itemsArray];
    sortedItems.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      if (valA == null || valA === "") valA = direction === "asc" ? Infinity : -Infinity;
      if (valB == null || valB === "") valB = direction === "asc" ? Infinity : -Infinity;

      if (["issueqty", "salevalue", "partsavgtot", "profits", "profitpercentage", "price"].includes(column)) {
        const numA = Number(valA);
        const numB = Number(valB);
        return direction === "asc" ? numA - numB : numB - numA;
      } else {
        return direction === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      }
    });
    return sortedItems;
  }

  // Excel Download
  function downloadAsExcel() {
    try {
      const formattedData = $outwards.map(item => ({
        ...item,
        //dtpur: formatDateForDisplay(item.dtpur), // If you have date fields
        //expiry: formatDateForDisplay(item.expiry), // If you have date fields
      }));
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Outwards Data");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "OutwardsData.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Excel export failed:", err);
      $error = "Excel export failed: " + err.message;
    }
  }

  function navigateToAddOutwards() {
    window.location.href = '/outwards/add-outwards';
  }

</script>

<Navigation />

<div class="container" style="height: 75vh; display: flex; flex-direction: column;">
  <div class="header">
    <h2>Outwards Records</h2>
    <div>
      <button class="btn btn-download" on:click={downloadAsExcel}>
        <i class="fas fa-file-excel"></i> Download Excel
      </button>
    </div>
  </div>

  {#if $error}
    <div class="alert alert-error">{$error}</div>
  {:else if $loading}
    <div class="alert alert-info">Loading...</div>
  {:else if $outwards.length === 0}
    <div class="alert alert-warning">No outwards records found.</div>
  {:else}
    <div class="table-responsive">
      <table class="table">
        <thead class="sticky-header">
          <tr>
            <th on:click={() => sortData("itemcode")}>
              Item Code {getSortIndicator("itemcode")}
            </th>
            <th on:click={() => sortData("phone")}>
              Phone {getSortIndicator("phone")}
            </th>
            <th on:click={() => sortData("uuidout")}>
              UUID {getSortIndicator("uuidout")}
            </th>
            <th on:click={() => sortData("referece")}>
              Reference {getSortIndicator("referece")}
            </th>
            <th on:click={() => sortData("issueqty")}>
              Issue Qty {getSortIndicator("issueqty")}
            </th>
            <th on:click={() => sortData("salevalue")}>
              Sale Value {getSortIndicator("salevalue")}
            </th>
            <th on:click={() => sortData("partsavgtot")}>
              Parts Avg Total {getSortIndicator("partsavgtot")}
            </th>
            <th on:click={() => sortData("profits")}>
              Profits {getSortIndicator("profits")}
            </th>
            <th on:click={() => sortData("profitpercentage")}>
              Profit Percentage {getSortIndicator("profitpercentage")}
            </th>
            <th on:click={() => sortData("price")}>
              Price {getSortIndicator("price")}
            </th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {#each $sortedOutwards as outward (outward.uuidout)}
            <tr>
              <td>{outward.itemcode}</td>
              <td>{outward.phone}</td>
              <td>{outward.uuidout}</td>
              <td>{outward.referece}</td>
              <td>{outward.issueqty}</td>
              <td>{outward.salevalue}</td>
              <td>{outward.partsavgtot}</td>
              <td>{outward.profits}</td>
              <td>{outward.profitpercentage}</td>
              <td>{outward.price}</td>
              <td>
                <button class="btn btn-delete" on:click={() => deleteOutward(outward.uuidout)}>
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  <div style="margin-top: 1rem; text-align: center;">
    <button class="btn btn-add" on:click={navigateToAddOutwards}>Add Outwards</button>
  </div>
</div>

<style>
  /* Styles (you can copy the relevant parts from your pmaster component) */
  .container {
    width: 90%;
    max-width: 1600px;
    margin: 2rem auto;
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin-bottom: 1rem;
  }

  .alert {
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border-radius: 0.375rem;
    text-align: center;
  }
  .alert-error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  .alert-info {
    background-color: #cce5ff;
    color: #004085;
    border: 1px solid #b8daff;
  }
  .alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
  }

  .table-responsive {
    overflow-x: auto;
    flex: 1;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
  }

  .table thead th {
    background-color: #edf2f7;
    color: #4a5568;
    font-weight: 600;
    cursor: pointer;
  }

  .table tbody tr:nth-child(even) {
    background-color: #f9fafb;
  }

  .btn {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }

  .btn-delete {
    background-color: #f87171;
    color: white;
  }

  .btn-delete:hover {
    background-color: #ef4444;
  }
  .btn-add {
    background-color: #4299e1;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease;
  }
  .btn-add:hover {
    background-color: #3182ce;
  }

  .btn-download {
    background-color: #34d399;
    color: white;
    border: none;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease;
  }
  .btn-download:hover {
    background-color: #10b981;
  }

  /* Font Awesome Icons */
  :global(.fa-trash) {
    margin-right: 0.25rem;
  }
  :global(.fa-file-excel) {
    margin-right: 0.5rem;
  }

  /* Sticky Header Styling */
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 1; /* Ensure it stays on top of other content */
    background-color: #edf2f7; /* Match the header background */
  }

  /* Optional: Add a slight shadow for better visual separation */
  .sticky-header th {
    box-shadow: 0px 2px 2px -1px rgba(0,0,0,0.1);
  }
</style>