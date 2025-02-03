<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";
  import * as XLSX from "xlsx";  // <-- Important for Excel export

  let items = [];
  let loading = false;
  let error = "";
  let selectedOption = "all"; // default: view all items

  // Sorting state
  let sortColumn = null;
  let sortDirection = "asc";

  // Fetch items from either '/items' or '/expired-items'
  async function fetchItems() {
    error = "";
    loading = true;
    try {
      let url =
        selectedOption === "expired"
          ? "http://localhost:5000/api/expired-items"
          : "http://localhost:5000/api/pmaster";

      const response = await axios.get(url);
      items = response.data;

      // Re-apply sorting if we're already sorting by something
      if (sortColumn) {
        sortData(sortColumn, true);
      }
    } catch (err) {
      error = "Failed to fetch data. Check API connection. " + err.message;
    } finally {
      loading = false;
    }
  }

  // Runs once on component mount
  onMount(fetchItems);

  // Toggle between "all" items and "expired" items
  function changeView(option) {
    selectedOption = option;
    fetchItems();
  }

  // Sorting function (ascending/descending)
  function sortData(column, keepDirection = false) {
    // If user clicks the same column again, toggle direction
    if (!keepDirection) {
      if (sortColumn === column) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortDirection = "asc";
      }
    }

    sortColumn = column;

    // Clone array then sort
    items = items.slice().sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Numeric columns
      const numericCols = [
        "qty",
        "avgcost",
        "minstock",
        "maxstock",
        "latestprice",
        "lowest",
        "highest",
      ];
      if (numericCols.includes(column)) {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      // Date columns
      if (column === "dtpur" || column === "expiry") {
        const dateA = Date.parse(valA);
        const dateB = Date.parse(valB);
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }
        // fallback to string compare if invalid date
      }

      // Default: string comparison
      valA = valA?.toString().toLowerCase() ?? "";
      valB = valB?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Show an up/down arrow if this column is the current sort column
  function getSortIndicator(column) {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? "▲" : "▼";
  }

  // Download table data as Excel (XLSX) using SheetJS
  function downloadAsExcel() {
    try {
      // Convert array of objects to worksheet
      const worksheet = XLSX.utils.json_to_sheet(items);
      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      // Generate the Excel file in memory
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
      });
      // Convert array buffer to a blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      // Create a download link and click it
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = selectedOption === "expired"
        ? "ExpiredItems.xlsx"
        : "AllItems.xlsx";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export to Excel: " + err.message);
    }
  }
</script>

<!-- Nav Bar -->
<Navigation />

<div class="filter-bar">
  <button
    class:selected={selectedOption === "all"}
    on:click={() => changeView("all")}
  >
    All Items
  </button>
  <button
    class:selected={selectedOption === "expired"}
    on:click={() => changeView("expired")}
  >
    Expired Items
  </button>
  <!-- Download Button -->
  <button on:click={downloadAsExcel}>Download Excel</button>
</div>

<div class="table-container">
  {#if error}
    <p class="message error">{error}</p>
  {:else if loading}
    <p class="message loading">Loading items...</p>
  {:else if items.length === 0}
    <p class="message info">No items found.</p>
  {:else}
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th on:click={() => sortData("itemcode")}>
              Item Code {getSortIndicator("itemcode")}
            </th>
            <th on:click={() => sortData("itemname")}>
              Name {getSortIndicator("itemname")}
            </th>
            <th on:click={() => sortData("itemdesc")}>
              Description {getSortIndicator("itemdesc")}
            </th>
            <th on:click={() => sortData("itemused")}>
              Used {getSortIndicator("itemused")}
            </th>
            <th on:click={() => sortData("qty")}>
              Qty {getSortIndicator("qty")}
            </th>
            <th on:click={() => sortData("dtpur")}>
              Purchase Date {getSortIndicator("dtpur")}
            </th>
            <th on:click={() => sortData("expiry")}>
              Expiry {getSortIndicator("expiry")}
            </th>
            <th on:click={() => sortData("avgcost")}>
              Avg Cost (₹) {getSortIndicator("avgcost")}
            </th>
            <th on:click={() => sortData("minstock")}>
              Min Stock {getSortIndicator("minstock")}
            </th>
            <th on:click={() => sortData("maxstock")}>
              Max Stock {getSortIndicator("maxstock")}
            </th>
            <th on:click={() => sortData("latestprice")}>
              Latest Price {getSortIndicator("latestprice")}
            </th>
            <th on:click={() => sortData("lowest")}>
              Lowest (₹) {getSortIndicator("lowest")}
            </th>
            <th on:click={() => sortData("highest")}>
              Highest (₹) {getSortIndicator("highest")}
            </th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr>
              <td>{item.itemcode}</td>
              <td>{item.itemname}</td>
              <!-- Truncate 'itemdesc' text -->
              <td class="truncate" title={item.itemdesc}>{item.itemdesc}</td>
              <td>{item.itemused}</td>
              <td>{item.qty}</td>
              <td>{item.dtpur}</td>
              <td>{item.expiry}</td>
              <td>{item.avgcost}</td>
              <td>{item.minstock}</td>
              <td>{item.maxstock}</td>
              <td>{item.latestprice}</td>
              <td>{item.lowest}</td>
              <td>{item.highest}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  /* Basic reset or structure */
  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: sans-serif;
    background: #f7f7f7;
  }

  .filter-bar {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .filter-bar button {
    padding: 12px 20px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .filter-bar button:hover {
    background: #fafafa;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .filter-bar .selected {
    background: #007bff;
    color: #fff;
    border-color: #007bff;
  }

  .filter-bar .selected:hover {
    background: #0056b3;
  }

  .table-container {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .message {
    text-align: center;
    font-size: 1rem;
    margin-top: 20px;
    font-weight: 500;
  }

  .error {
    color: #c0392b;
  }

  .loading {
    color: #d35400;
  }

  .info {
    color: #16a085;
  }

  .table-responsive {
    overflow-x: auto;
    margin-top: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background-color: #3498db;
    color: #fff;
    user-select: none;  /* prevent text highlight on click */
    cursor: pointer;    /* indicates clickable for sorting */
  }

  th, td {
    text-align: left;
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
    white-space: nowrap; /* keep cells on a single line */
  }

  tbody tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }

  /* Truncate itemdesc, show full text in tooltip */
  .truncate {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
