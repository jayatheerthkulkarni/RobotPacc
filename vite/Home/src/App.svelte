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

{#if loading}
  <p class="loading">Loading...</p>
{:else}
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <section class="dashboard">
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
  </section>

  <section class="dashboard">
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
  </section>

  <!-- Top Selling Items -->
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

  <!-- Recent Movements -->
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
{/if}

<style>
  .dashboard {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 20px;
  }
  .card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    flex: 1;
    text-align: center;
    font-size: 1.2rem;
  }
  .loading {
    font-size: 1.5rem;
    text-align: center;
    color: #555;
    margin-top: 20px;
  }
  .error {
    color: red;
    font-weight: bold;
    text-align: center;
    font-size: 1.2rem;
  }
  .placeholder {
    text-align: center;
    font-style: italic;
    color: #777;
  }
  .list {
    margin: 20px;
    padding: 0;
    list-style: none;
  }
  .list li {
    padding: 8px;
    background: #f1f1f1;
    margin-bottom: 5px;
    border-radius: 5px;
  }
</style>
