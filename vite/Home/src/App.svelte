<script>
  import Navbar from './lib/navbar.svelte';
  import axios from 'axios';
  import { onMount } from 'svelte';

  let stockOverview = { total_items: 0, low_stock: 0, expired_items: 0 };
  let salesSummary = { total_sales: 0, total_profits: 0, avg_profit_margin: 0 };
  let topSellingItems = [];
  let recentMovements = [];
  let error = null;
  let loading = true;

  async function fetchData() {
    try {
      console.log("Fetching API Data...");
      const [stockRes, salesRes, topSellingRes, recentMovRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/stock-overview'),
        axios.get('http://localhost:5000/api/sales-summary'),
        axios.get('http://localhost:5000/api/top-selling'),
        axios.get('http://localhost:5000/api/recent-movements')
      ]);

      // Use data if available, otherwise fallback to default values
      stockOverview = stockRes.status === "fulfilled" ? stockRes.value.data : stockOverview;
      salesSummary = salesRes.status === "fulfilled" ? salesRes.value.data : salesSummary;
      topSellingItems = topSellingRes.status === "fulfilled" ? topSellingRes.value.data : [];
      recentMovements = recentMovRes.status === "fulfilled" ? recentMovRes.value.data : [];

    } catch (err) {
      error = 'Failed to load data.';
      console.error("Fetch Error:", err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchData);
</script>

<Navbar />

<div class="container">
  {#if loading}
    <p class="loading">Loading...</p>
  {:else}
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <section class="dashboard-section">
      <h2>Stock Overview</h2>
      <div class="dashboard">
        <!-- Stock Overview -->
        <div class="card">
          <h3>Total Items</h3>
          <p>{stockOverview.total_items || 0}</p>
        </div>
        <div class="card">
          <h3>Low Stock Items</h3>
          <p>{stockOverview.low_stock || 0}</p>
        </div>
        <div class="card">
          <h3>Expired Items</h3>
          <p>{stockOverview.expired_items || 0}</p>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <h2>Sales Summary</h2>
      <div class="dashboard">
        <!-- Sales Summary -->
        <div class="card">
          <h3>Total Sales</h3>
          <p>₹{salesSummary.total_sales || 0}</p>
        </div>
        <div class="card">
          <h3>Total Profits</h3>
          <p>₹{salesSummary.total_profits || 0}</p>
        </div>
        <div class="card">
          <h3>Avg. Profit Margin</h3>
          <p>{salesSummary.avg_profit_margin ? salesSummary.avg_profit_margin.toFixed(2) + "%" : "0%"}</p>
        </div>
      </div>
    </section>

    <section class="list-section">
      <h2>Top Selling Items</h2>
      {#if topSellingItems.length > 0}
        <ul class="list">
          {#each topSellingItems as item}
            <li>{item.itemcode}: {item.total_sold} units sold</li>
          {/each}
        </ul>
      {:else}
        <p class="placeholder">No top-selling items yet.</p>
      {/if}
    </section>

    <section class="list-section">
      <h2>Recent Inventory Movements</h2>
      {#if recentMovements.length > 0}
        <ul class="list">
          {#each recentMovements as move}
            <li>
              <strong>{move.itemcode}</strong> - {move.type} - {move.qty} units
            </li>
          {/each}
        </ul>
      {:else}
        <p class="placeholder">No recent movements.</p>
      {/if}
    </section>
  {/if}
</div>

<style>
  /* --- General Styles --- */
  .container {
    max-width: 1200px;
    margin: 30px auto; /* Increased top margin */
    padding: 30px; /* Increased padding */
    font-family: sans-serif; /* Cleaner font */
    background-color: #f8f9fa; /* Light, off-white background */
    border-radius: 15px; /* Rounded container */
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08); /* Softer container shadow */
  }

  .dashboard-section, .list-section {
    margin-bottom: 40px; /* Increased section margin */
  }

  h2 {
    color: #343a40; /* Darker heading color */
    margin-bottom: 20px; /* Increased heading margin */
    border-bottom: 2px solid #dee2e6; /* Subtle bottom border for headings */
    padding-bottom: 10px;
  }

  h3 {
    color: #495057; /* Slightly lighter heading color */
    margin-top: 0;
    margin-bottom: 1rem;
  }

  p, ul, li {
    color: #6c757d; /* Softer text color */
    font-size: 1rem; /* Consistent font size */
    line-height: 1.6; /* Improved line height for readability */
  }

  /* --- Dashboard Layout --- */
  .dashboard {
    display: flex;
    gap: 25px; /* Slightly increased gap */
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .card {
    background: #fff; /* White cards */
    padding: 2rem; /* Increased card padding */
    border-radius: 12px; /* More rounded card corners */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Softer card shadow */
    flex: 1 1 280px; /* Adjusted flex basis */
    min-width: 240px; /* Adjusted min width */
    text-align: center;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Smooth transitions */
  }

  .card:hover {
    transform: translateY(-5px); /* Slight lift on hover */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); /* Increased shadow on hover */
  }

  .card h3 {
    margin-bottom: 0.75rem;
    font-size: 1.3rem; /* Slightly larger card heading */
    color: #495057;
  }

  .card p {
    font-size: 1.5rem; /* Larger value text in cards */
    font-weight: 600; /* Semi-bold value text */
    color: #007bff; /* Primary color for values */
    margin-bottom: 0;
  }

  /* --- List Styles --- */
  .list {
    margin-top: 20px;
    padding: 0;
    list-style: none;
  }

  .list li {
    padding: 15px 20px; /* Adjusted list item padding */
    background: #fff; /* White list items */
    margin-bottom: 10px; /* Increased list item margin */
    border-radius: 8px; /* Rounded list item corners */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Subtle list item shadow */
    border-left: 4px solid #007bff; /* Accent border on list items */
  }

  .list li:last-child {
    margin-bottom: 0; /* Remove margin from the last list item */
  }

  .list strong {
    font-weight: 600;
    color: #343a40; /* Strong text color */
  }

  .placeholder {
    text-align: center;
    font-style: italic;
    color: #999; /* Lighter placeholder text */
    padding: 15px;
    background-color: #f8f9fa; /* Placeholder background */
    border-radius: 8px;
    margin-top: 10px;
  }

  /* --- Loading and Error States --- */
  .loading, .error {
    font-size: 1.2rem;
    text-align: center;
    margin-top: 30px;
    padding: 15px;
    border-radius: 8px;
  }

  .loading {
    color: #007bff; /* Primary color for loading */
    background-color: #e7f3ff; /* Light blue background for loading */
  }

  .error {
    color: #dc3545; /* Danger color for error */
    background-color: #f8d7da; /* Light red background for error */
    border: 1px solid #f5c6cb; /* Error border */
  }
</style>