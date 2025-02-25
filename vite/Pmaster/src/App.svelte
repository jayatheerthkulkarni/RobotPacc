<script>
    import Navigation from "./lib/Navigation.svelte";
    import axios from "axios";
    import { onMount } from "svelte";
    import * as XLSX from "xlsx";
    import { derived, writable } from 'svelte/store';
  
    // Stores
    const items = writable([]);
    const loading = writable(false);
    const error = writable("");
    const selectedOption = writable("all");
    const sortColumn = writable(null);
    const sortDirection = writable("none");
    const editingItem = writable(null); // Holds the itemcode of the item being edited, or null
    const editedValues = writable({});    // Holds temporary edited values
    const modalText = writable({ field: null, text: null });
  
    const sortableColumns = [
      "itemcode",
      "itemname",
      "itemdesc",
      "itemused",
      "qty",
      "dtpur",
      "expiry",
      "avgcost",
      "minstock",
      "maxstock",
      "latestprice",
      "lowest",
      "highest",
    ];
  
    // Derived store for sorted items
    const sortedItems = derived(
      [items, sortColumn, sortDirection],
      ([$items, $sortColumn, $sortDirection]) => {
        if (!$sortColumn || $sortDirection === "none") {
          return $items;
        }
        return sortItems([...$items], $sortColumn, $sortDirection);
      }
    );
  
    // Helper Functions
    function formatDateForDisplay(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  
    function openModal(text, field) {
      $modalText = { text, field };
    }
  
    function closeModal() {
      $modalText = { field: null, text: null };
    }
  
    function sortItems(itemsArray, column, direction) {
      let sortedItems = [...itemsArray];
      sortedItems.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        if (valA == null || valA === "") valA = direction === "asc" ? Infinity : -Infinity;
        if (valB == null || valB === "") valB = direction === "asc" ? Infinity : -Infinity;
        if (["qty", "avgcost", "minstock", "maxstock", "latestprice", "lowest", "highest"].includes(column)) {
          const numA = Number(valA);
          const numB = Number(valB);
          return direction === "asc" ? numA - numB : numB - numA;
        } else if (column === "dtpur" || column === "expiry") {
          const dateA = new Date(valA);
          const dateB = new Date(valB);
          if (isNaN(dateA)) return direction === "asc" ? 1 : -1;
          if (isNaN(dateB)) return direction === "asc" ? -1 : 1;
          return direction === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          return direction === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        }
      });
      return sortedItems;
    }
  
    // Data Fetching and View Switching
    async function fetchItems() {
      $error = "";
      $loading = true;
      try {
        let url;
        if ($selectedOption === "expired") {
          url = "http://localhost:5000/api/expired-items";
        } else if ($selectedOption === "lowstock") {
          url = "http://localhost:5000/api/low-stock-items";
        } else {
          url = "http://localhost:5000/api/pmaster";
        }
        const response = await axios.get(url);
        $items = response.data;
      } catch (err) {
        $error = "Failed to fetch: " + err.message;
      } finally {
        $loading = false;
      }
    }
  
    onMount(fetchItems);
  
    function changeView(option) {
      $selectedOption = option;
      resetSort();
      fetchItems();
    }
  
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
  
    // Excel Download
    function downloadAsExcel() {
      try {
        const formattedData = $items.map(item => ({
          ...item,
          dtpur: formatDateForDisplay(item.dtpur),
          expiry: formatDateForDisplay(item.expiry),
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = $selectedOption === "expired" ? "ExpiredItems.xlsx" :
          $selectedOption === "lowstock" ? "LowStockItems.xlsx" :
            "AllItems.xlsx";
        document.body.appendChild(link); // Ensure link is in DOM before clicking
        link.click();
        document.body.removeChild(link); // Clean up
      } catch (err) {
        console.error("Excel export failed:", err);
        $error = "Excel export failed: " + err.message;
      }
    }
  
    // Edit and Delete Handlers
    function startEdit(item) {
      $editingItem = item.itemcode;
      $editedValues = { ...item };
    }
  
    function cancelEdit() {
      $editingItem = null;
      $editedValues = {};
    }
  
    async function saveEdit(item) {
      $loading = true;
      try {
        const response = await axios.patch(`http://localhost:5000/api/update-item/${item.itemcode}`, $editedValues);
        if (response.status === 200) {
          $items = $items.map((i) => i.itemcode === item.itemcode ? { ...i, ...$editedValues } : i);
          $editingItem = null;
          $editedValues = {};
          $error = "";
        } else {
          $error = `Update failed: ${response.data.error || "Unknown error"}`;
        }
      } catch (err) {
        $error = "Update error: " + err.message;
      } finally {
        $loading = false;
      }
    }
  
    async function deleteItem(item) {
      if (!confirm(`Delete ${item.itemcode}?`)) return;
      $loading = true;
      try {
        const response = await axios.delete(`http://localhost:5000/api/delete-item/${item.itemcode}`);
        if (response.status === 200) {
          $items = $items.filter(i => i.itemcode !== item.itemcode);
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
  
    function handleInputChange(event, field) {
      $editedValues = { ...$editedValues, [field]: event.target.value };
    }
  
    function navigateToAddItems() {
      window.location.href = '/pmaster/additems';
    }
  </script>
  
  <Navigation />
  
  <div class="container" style="height: 75vh; display: flex; flex-direction: column;">
    <div class="filter-bar">
      <button class:active={$selectedOption === 'all'} on:click={() => changeView('all')}>
        All Items
      </button>
      <button class:active={$selectedOption === 'expired'} on:click={() => changeView('expired')}>
        Expired Items
      </button>
      <button class:active={$selectedOption === 'lowstock'} on:click={() => changeView('lowstock')}>
        Low Stock Items
      </button>
      <button class="btn-download" on:click={downloadAsExcel}>
        <i class="fas fa-file-excel"></i> Download Excel
      </button>
    </div>
  
    {#if $error}
      <div class="alert alert-error">{$error}</div>
    {:else if $loading}
      <div class="alert alert-info">Loading...</div>
    {:else if $sortedItems.length === 0}
      <div class="alert alert-warning">No items found.</div>
    {:else}
      <div class="table-responsive" style="flex: 1; overflow-y: auto;">
        <table class="table">
          <thead>
            <tr>
              <th class="sticky-col first-col" on:click={() => sortData("itemcode")}>
                Item Code {getSortIndicator("itemcode")}
              </th>
              <th class="sticky-col second-col" on:click={() => sortData("itemname")}>
                Name {getSortIndicator("itemname")}
              </th>
              <th class="sticky-col" on:click={() => sortData("itemdesc")}>
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
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {#each $sortedItems as item (item.itemcode)}
              <tr>
                <td class="sticky-col first-col" on:click={() => openModal(item.itemcode, 'Item Code')}>{item.itemcode}</td>
                <td class="sticky-col second-col" on:click={() => openModal(item.itemname, 'Name')}>{item.itemname}</td>
                <td class="description-cell">
                  {#if $editingItem === item.itemcode}
                    <textarea value={$editedValues.itemdesc} on:input={(e) => handleInputChange(e, "itemdesc")}></textarea>
                  {:else}
                    <span class="description-text" on:click={() => openModal(item.itemdesc, 'Description')}>{item.itemdesc}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="text" value={$editedValues.itemused} on:input={(e) => handleInputChange(e, "itemused")}>
                  {:else}
                    <span on:click={() => openModal(item.itemused, 'Used')}>{item.itemused}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.qty} on:input={(e) => handleInputChange(e, "qty")}>
                  {:else}
                    <span on:click={() => openModal(item.qty, 'Qty')}>{item.qty}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="text" value={$editedValues.dtpur} on:input={(e) => handleInputChange(e, "dtpur")}>
                  {:else}
                    <span on:click={() => openModal(formatDateForDisplay(item.dtpur), 'Purchase Date')}>{formatDateForDisplay(item.dtpur)}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="text" value={$editedValues.expiry} on:input={(e) => handleInputChange(e, "expiry")}>
                  {:else}
                    <span on:click={() => openModal(formatDateForDisplay(item.expiry), 'Expiry')}>{formatDateForDisplay(item.expiry)}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.avgcost} on:input={(e) => handleInputChange(e, "avgcost")}>
                  {:else}
                    <span on:click={() => openModal(item.avgcost, 'Avg Cost (₹)')}>{item.avgcost}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.minstock} on:input={(e) => handleInputChange(e, "minstock")}>
                  {:else}
                    <span on:click={() => openModal(item.minstock, 'Min Stock')}>{item.minstock}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.maxstock} on:input={(e) => handleInputChange(e, "maxstock")}>
                  {:else}
                    <span on:click={() => openModal(item.maxstock, 'Max Stock')}>{item.maxstock}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.latestprice} on:input={(e) => handleInputChange(e, "latestprice")}>
                  {:else}
                    <span on:click={() => openModal(item.latestprice, 'Latest Price')}>{item.latestprice}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.lowest} on:input={(e) => handleInputChange(e, "lowest")}>
                  {:else}
                    <span on:click={() => openModal(item.lowest, 'Lowest (₹)')}>{item.lowest}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <input type="number" value={$editedValues.highest} on:input={(e) => handleInputChange(e, "highest")}>
                  {:else}
                    <span on:click={() => openModal(item.highest, 'Highest (₹)')}>{item.highest}</span>
                  {/if}
                </td>
                <td>
                  {#if $editingItem === item.itemcode}
                    <button class="btn btn-save" on:click={() => saveEdit(item)}>Save</button>
                    <button class="btn btn-cancel" on:click={cancelEdit}>Cancel</button>
                  {:else}
                    <button class="btn btn-edit" on:click={() => startEdit(item)}>
                      <i class="fas fa-edit"></i>
                    </button>
                  {/if}
                </td>
                <td>
                  <button class="btn btn-delete" on:click={() => deleteItem(item)}>
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
      <button class="btn btn-add" on:click={navigateToAddItems}>Add Items</button>
    </div>
  
    {#if $modalText.text}
      <div class="modal">
        <div class="modal-content">
          <span class="close" on:click={closeModal}>×</span>
          <h4>{$modalText.field}:</h4>
          <p>{$modalText.text}</p>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    /* General Styles */
    :global(body) {
      font-family: 'Inter', sans-serif;
      background-color: #f5f7fb;
      color: #374151;
      margin: 0;
      padding: 0;
    }
  
    .container {
      max-width: 1600px;
      margin: 2rem auto;
      padding: 1rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }
  
    /* Filter Bar */
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.5rem 1rem;
      background-color: #e0e7ff;
      border-radius: 0.375rem;
    }
  
    .filter-bar button {
      background-color: transparent;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
      transition: background-color 0.2s ease, color 0.2s ease;
      margin: 0 0.25rem;
    }
    .filter-bar button:hover {
      background-color: #c7d2fe;
    }
    .filter-bar button.active {
      background-color: #6366f1;
      color: white;
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
  
    /* Alerts */
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
  
    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
      width: 100%;
    }
  
    .table {
      width: 100%;
      min-width: 1500px;
      border-collapse: collapse;
      margin-top: 1rem;
      border: 1px solid #e2e8f0;
    }
  
    .table th,
    .table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      white-space: nowrap;
    }
  
    .table thead th {
      background-color: #edf2f7;
      color: #4a5568;
      font-weight: 600;
      cursor: pointer;
      position: sticky;
      top: 0;
      border-top: 1px solid #e2e8f0;
    }
  
    .table tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .table tbody tr:hover {
      background-color: #f0f4f8;
    }
  
    /* Sticky Columns */
    .sticky-col {
      position: sticky;
      background-color: white;
      z-index: 1;
      border-right: 1px solid #e2e8f0;
    }
    .first-col {
      left: 0;
      min-width: 100px;
    }
    .second-col {
      left: 100px;
      min-width: 150px;
    }
    .table thead th.sticky-col {
      z-index: 2;
    }
  
    /* Description Cell */
    .description-cell {
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
      cursor: pointer;
    }
  
    .description-text {
      display: block;
      padding-right: 15px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  
    /* Buttons */
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
  
    .btn-save, .btn-cancel {
      margin-right: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }
  
    .btn-edit {
      background-color: #60a5fa;
      color: white;
      margin-right: 0.25rem;
    }
  
    .btn-delete {
      background-color: #f87171;
      color: white;
    }
    .btn-save {
      background-color: #28a745;
      color: white;
    }
    .btn-cancel {
      background-color: #dc3545;
      color: white;
    }
  
    .btn:hover {
      transform: translateY(-1px);
    }
  
    .btn-edit:hover {
      background-color: #3b82f6;
    }
  
    .btn-delete:hover {
      background-color: #ef4444;
    }
    .btn-save:hover {
      background-color: #218838;
    }
  
    .btn-cancel:hover {
      background-color: #c82333;
    }
  
    /* Font Awesome Icons */
    :global(.fa-edit) {
      margin-right: 0.25rem;
    }
    :global(.fa-trash) {
      margin-right: 0.25rem;
    }
    :global(.fa-file-excel) {
      margin-right: 0.5rem;
    }
  
    /* Input fields within table */
    .table input[type="text"],
    .table input[type="number"] {
      width: 100%;
      padding: 0.25rem;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      box-sizing: border-box;
      font-size: 0.875rem;
    }
  
    /* Add Items Button */
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
  
    /* Add cursor style to table data */
    .table td {
      cursor: pointer;
    }
  
    /* The Modal (background) */
    .modal {
      display: block; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 100; /* Sit on top */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
    }
  
    /* Modal Content/Box */
    .modal-content {
      position: relative;
      background-color: #fefefe;
      margin: 15% auto; /* 15% from the top and centered */
      padding: 20px;
      border: 1px solid #888;
      width: 80%; /* Could be more or less, depending on screen size */
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
      animation-name: animatetop;
      animation-duration: 0.4s;
    }
  
    /* Add Animation */
    @keyframes animatetop {
      from {
        top: -300px;
        opacity: 0;
      }
      to {
        top: 15%;
        opacity: 1;
      }
    }
  
    /* The Close Button */
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }
  
    .close:hover,
    .close:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
  
    .modal-content h4 {
      margin-top: 0;
      font-size: 1.2rem;
      font-weight: bold;
    }
  
    .modal-content p {
      margin-bottom: 0;
      white-space: pre-line;
      word-wrap: break-word;
    }
    .description-cell {
      max-width: 300px; /* Increase max width */
      white-space: normal; /* Allow wrapping */
      word-wrap: break-word; /* Ensure long words break */
    }
  </style>