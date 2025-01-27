<script>
  import Navbar from './lib/navbar.svelte';
  import axios from 'axios';
  import { onMount, onDestroy } from 'svelte';

  let totalProfits = 0;
  let lowStockItems = [];
  let avgCost = 0;
  let error = null;
  let intervalId;

  const fetchTotalProfits = async () => {
      try {
          const response = await axios.get('http://localhost:5000/profits-total');
          totalProfits = response.data.totalProfits;
      } catch (err) {
          error = 'Error fetching total profits';
          console.error(err);
      }
  };

  const fetchLowStockItems = async () => {
      try {
          const response = await axios.get('http://localhost:5000/low-stock-items');
          lowStockItems = response.data.lowStockItems;
      } catch (err) {
          error = 'Error fetching low stock items';
          console.error(err);
      }
  };

  const fetchAvgCost = async () => {
      try {
          const response = await axios.get('http://localhost:5000/avg-cost');
          avgCost = response.data.avgCost;
      } catch (err) {
          error = 'Error fetching average cost';
          console.error(err);
      }
  };

  onMount(() => {
      fetchTotalProfits();
      fetchLowStockItems();
      fetchAvgCost();
      intervalId = setInterval(() => {
          fetchTotalProfits();
          fetchLowStockItems();
          fetchAvgCost();
      }, 10000); // Fetch every 10 seconds
  });

  onDestroy(() => {
      clearInterval(intervalId);
  });
</script>

<Navbar />

<p class="dashboard__heading">Dashboard</p>

<div class="dashboard__content">
 <div class="grid-item">
   <h3>Total Profits</h3>
   <p>₹{totalProfits.toFixed(2)}</p>
 </div>
 <div class="grid-item">
   <h3>Low Stock Items</h3>
   {#if lowStockItems.length > 0}
     <ul>
       {#each lowStockItems as item}
         <li>{item.itemname} (Qty: {item.qty}, Min: {item.minstock})</li>
       {/each}
     </ul>
   {:else}
     <p>No items with low stock</p>
   {/if}
 </div>
 <div class="grid-item">
   <h3>Average Cost</h3>
   <p>₹{avgCost.toFixed(2)}</p>
 </div>
</div>

<style>
  .dashboard__heading {
      margin-left: 10px;
      font-size: 30px;
      padding: 20px 0;
  }

  .dashboard__content {
      background-color: rgb(229, 229, 229);
      width: 90%;
      margin: 0 auto;
      padding: 2%;
      border-radius: 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: minmax(150px, auto);
      gap: 20px;
  }

  .grid-item {
      background-color: rgb(207, 207, 207);
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .grid-item h3 {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
      font-weight: 300;
  }

  .grid-item p {
      margin: 0;
      font-size: 1.5rem;
  }

  .grid-item ul {
      list-style: none;
      padding: 0;
      margin: 0;
  }

  .grid-item li {
      font-size: 1rem;
  }
</style>