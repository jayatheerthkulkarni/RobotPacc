<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";

  let itemcode = "";
  let itemname = "";
  let itemdesc = "";
  let itemused = "";
  let qty = "";
  let dtpur = "";
  let expiry = "";
  let avgcost = "";
  let minstock = "";
  let maxstock = "";
  let latestprice = "";
  let lowest = "";
  let highest = "";
  let message = "";
  let error = "";

  async function addItem() {
    message = "";
    error = "";

    if (
      !itemcode.trim() ||
      !itemname.trim() ||
      !qty ||
      !dtpur ||
      !expiry ||
      !avgcost
    ) {
      error = "Please fill in all required fields.";
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/add-item", {
        itemcode,
        itemname,
        itemdesc,
        itemused,
        qty: Number(qty),
        dtpur,
        expiry,
        avgcost: Number(avgcost),
        minstock: Number(minstock) || 0,
        maxstock: Number(maxstock) || 0,
        latestprice: Number(latestprice) || 0,
        lowest: Number(lowest) || 0,
        highest: Number(highest) || 0,
      });

      message = "✅ Item added successfully!";
      resetForm();
    } catch (err) {
      console.error("API Error:", err);
      error =
        err.response?.data?.error ||
        "❌ Failed to add item. Check API connection.";
    }
  }

  function resetForm() {
    itemcode = "";
    itemname = "";
    itemdesc = "";
    itemused = "";
    qty = "";
    dtpur = "";
    expiry = "";
    avgcost = "";
    minstock = "";
    maxstock = "";
    latestprice = "";
    lowest = "";
    highest = "";
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add New Item</h2>

  {#if message}
    <p class="message success">{message}</p>
  {/if}
  {#if error}
    <p class="message error">{error}</p>
  {/if}

  <form on:submit|preventDefault={addItem}>
    <div class="grid">
      <div class="input-group">
        <label for="itemcode">Item Code *</label>
        <input id="itemcode" type="text" bind:value={itemcode} required />
      </div>

      <div class="input-group">
        <label for="itemname">Item Name *</label>
        <input id="itemname" type="text" bind:value={itemname} required />
      </div>

      <div class="input-group">
        <label for="itemdesc">Item Description</label>
        <input id="itemdesc" type="text" bind:value={itemdesc} />
      </div>

      <div class="input-group">
        <label for="itemused">Usage Type</label>
        <input id="itemused" type="text" bind:value={itemused} />
      </div>

      <div class="input-group">
        <label for="qty">Quantity *</label>
        <input id="qty" type="number" bind:value={qty} required />
      </div>

      <div class="input-group">
        <label for="dtpur">Purchase Date *</label>
        <input id="dtpur" type="date" bind:value={dtpur} required />
      </div>

      <div class="input-group">
        <label for="expiry">Expiry Date *</label>
        <input id="expiry" type="date" bind:value={expiry} required />
      </div>

      <div class="input-group">
        <label for="avgcost">Average Cost *</label>
        <input id="avgcost" type="number" bind:value={avgcost} required />
      </div>

      <div class="input-group">
        <label for="minstock">Min Stock</label>
        <input id="minstock" type="number" bind:value={minstock} />
      </div>

      <div class="input-group">
        <label for="maxstock">Max Stock</label>
        <input id="maxstock" type="number" bind:value={maxstock} />
      </div>

      <div class="input-group">
        <label for="latestprice">Latest Price</label>
        <input id="latestprice" type="number" bind:value={latestprice} />
      </div>

      <div class="input-group">
        <label for="lowest">Lowest Price</label>
        <input id="lowest" type="number" bind:value={lowest} />
      </div>

      <div class="input-group">
        <label for="highest">Highest Price</label>
        <input id="highest" type="number" bind:value={highest} />
      </div>
    </div>

    <button type="submit" class="submit-btn">Add Item</button>
  </form>
</div>

<style>
  .form-container {
    width: 90%;
    max-width: 800px;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .message {
    text-align: center;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 500;
  }

  .success {
    background: #2ecc71;
    color: white;
  }

  .error {
    background: #e74c3c;
    color: white;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #34495e;
  }

  input {
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #dcdde1;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.4);
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1.5rem;
    border: none;
    border-radius: 8px;
    background: #3498db;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-btn:hover {
    background: #2980b9;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }

  @media (max-width: 768px) {
    .form-container {
      width: 95%;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
