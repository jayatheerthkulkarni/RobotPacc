<script>
  import { onMount } from 'svelte';
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { writable, derived } from 'svelte/store';
  import * as XLSX from "xlsx";

  // Stores
  const inwards = writable([]);
  const loading = writable(false);
  const error = writable("");
  const sortColumn = writable(null);
  const sortDirection = writable("none");

  const sortableColumns = [
    "itemcode", "phone", "uuidin", "buildqty", "reciveqty", "acceptqty", "rejectqty", "yearmanufactor", "additionalprice"
  ];

  // Derived store for sorted items
  const sortedInwards = derived(
    [inwards, sortColumn, sortDirection],
    ([$inwards, $sortColumn, $sortDirection]) => {
      if (!$sortColumn || $sortDirection === "none") {
        return $inwards;
      }
      return sortItems([...$inwards], $sortColumn, $sortDirection);
    }
  );

  // Delete Handler
  async function deleteInward(uuidin) {
    if (!confirm(`Delete inward record with UUID ${uuidin}?`)) return;
    $loading = true;
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete-inward/${uuidin}`);
      if (response.status === 200) {
        // Optimistically update the UI
        inwards.update(currentInwards => currentInwards.filter(inward => inward.uuidin !== uuidin));
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

  // Helper Function
  function formatDateForDisplay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Data Fetching
  async function fetchInwards() {
    $error = "";
    $loading = true;
    try {
      const response = await axios.get("http://localhost:5000/api/inwardsdata");
      $inwards = response.data;
    } catch (err) {
      $error = "Failed to fetch inwards: " + err.message;
    } finally {
      $loading = false;
    }
  }

  onMount(fetchInwards);


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

      if (["buildqty", "reciveqty", "acceptqty", "rejectqty", "yearmanufactor", "additionalprice"].includes(column)) {
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
      const formattedData = $inwards.map(item => ({
        ...item,
        //dtpur: formatDateForDisplay(item.dtpur), // If you have date fields
        //expiry: formatDateForDisplay(item.expiry), // If you have date fields
      }));
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inwards Data");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "InwardsData.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Excel export failed:", err);
      $error = "Excel export failed: " + err.message;
    }
  }

  function navigateToAddInwards() {
    window.location.href = '/inwards/add-inwards';
  }

</script>

<Navigation />

<div class="container" style="height: 75vh; display: flex; flex-direction: column;">
  <div class="header">
    <h2>Inwards Records</h2>
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
  {:else if $inwards.length === 0}
    <div class="alert alert-warning">No inwards records found.</div>
  {:else}
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th on:click={() => sortData("itemcode")}>
              Item Code {getSortIndicator("itemcode")}
            </th>
            <th on:click={() => sortData("phone")}>
              Phone {getSortIndicator("phone")}
            </th>
            <th on:click={() => sortData("uuidin")}>
              UUID {getSortIndicator("uuidin")}
            </th>
            <th on:click={() => sortData("buildqty")}>
              Build Qty {getSortIndicator("buildqty")}
            </th>
            <th on:click={() => sortData("reciveqty")}>
              Received Qty {getSortIndicator("reciveqty")}
            </th>
            <th on:click={() => sortData("acceptqty")}>
              Accepted Qty {getSortIndicator("acceptqty")}
            </th>
            <th on:click={() => sortData("rejectqty")}>
              Reject Qty {getSortIndicator("rejectqty")}
            </th>
            <th on:click={() => sortData("yearmanufactor")}>
              Year Manufactured {getSortIndicator("yearmanufactor")}
            </th>
            <th on:click={() => sortData("additionalprice")}>
              Price {getSortIndicator("additionalprice")}
            </th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {#each $sortedInwards as inward (inward.uuidin)}
            <tr>
              <td>{inward.itemcode}</td>
              <td>{inward.phone}</td>
              <td>{inward.uuidin}</td>
              <td>{inward.buildqty}</td>
              <td>{inward.reciveqty}</td>
              <td>{inward.acceptqty}</td>
              <td>{inward.rejectqty}</td>
              <td>{inward.yearmanufactor}</td>
              <td>{inward.additionalprice}</td>
              <td>
                <button class="btn btn-delete" on:click={() => deleteInward(inward.uuidin)}>
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
    <button class="btn btn-add" on:click={navigateToAddInwards}>Add Inwards</button>
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
</style>