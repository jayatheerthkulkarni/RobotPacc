<script>
  import Navigation from "./lib/Navigation.svelte";
  import { onMount } from 'svelte';
  import axios from 'axios';

  let itemCodes = [];
  let customerPhones = [];

  let itemCode = "";
  let customerPhone = "";
  let uuid = "";
  let reference = "";
  let issueQuantity = 1;
  let saleValue = 1;
  let partsAverageTotal = 0;
  let price = 1;
  let message = "";
  let error = "";
  let loading = true;
  let availableQuantity = 0;
  let profits = 0;
  let profitPercentage = 0;
  let avgCost = 0;

  const baseURL = 'http://localhost:5000';

  function formatItemCode(item) {
    return `${item.itemcode} - ${item.itemname}`;
  }

  async function fetchItemCodes() {
    try {
      const response = await axios.get(`${baseURL}/api/items`);
      itemCodes = response.data.map(item => ({
        itemcode: item.itemcode,
        itemname: item.itemname,
        formatted: formatItemCode(item)
      }));
      console.log("Item codes fetched:", itemCodes);
    } catch (e) {
      console.error("Could not fetch item codes:", e);
      error = "Failed to load item codes.";
    }
  }

  async function fetchCustomerPhones() {
    try {
      const response = await axios.get(`${baseURL}/api/customers`);
      customerPhones = response.data.map(customer => customer.phone);
      console.log("Customer phones fetched:", customerPhones);
    } catch (e) {
      console.error("Could not fetch customer phones:", e);
      error = "Failed to load customer phones.";
    }
  }

  async function fetchAvailableQuantity() {
    if (itemCode) {
      try {
        const response = await axios.get(`${baseURL}/api/item/${itemCode}`);
        availableQuantity = response.data.qty || 0;
        avgCost = response.data.avgcost || 0;
        console.log(`Fetched item data: qty=${availableQuantity}, avgCost=${avgCost}`);
      } catch (e) {
        console.error("Could not fetch available quantity:", e);
        error = "Failed to load available quantity.";
        availableQuantity = 0;
        avgCost = 0;
      }
    } else {
      availableQuantity = 0;
      avgCost = 0;
    }
  }

  onMount(async () => {
    loading = true;
    await Promise.all([fetchItemCodes(), fetchCustomerPhones()]);
    loading = false;
  });

  $: if (itemCode) fetchAvailableQuantity();

  // Reactive profit preview using saleValue
  $: {
    const sale = Number(saleValue) || 0;
    const prc = Number(price) || 0;
    profits = sale && prc ? Math.ceil((prc * sale) - (avgCost * sale)) : 0;
    profitPercentage = sale && prc && (avgCost * sale) !== 0 ? Math.ceil((profits / (avgCost * sale)) * 100) : 0;
    console.log("Reactive update:", { profits, profitPercentage, sale, prc });
  }

  async function addOutwardEntry(event) {
    event.preventDefault();
    console.log("addOutwardEntry triggered with values:", { itemCode, customerPhone, uuid, issueQuantity, saleValue, price });

    error = "";
    message = "";

    if (!itemCode || !customerPhone || !uuid || !issueQuantity || !saleValue || !price) {
      error = "All fields marked with * are required.";
      console.log("Missing fields detected");
      return;
    }

    const parsedIssueQty = Number(issueQuantity);
    const parsedSaleValue = Number(saleValue);
    const parsedPrice = Number(price);

    if (isNaN(parsedIssueQty) || isNaN(parsedSaleValue) || isNaN(parsedPrice)) {
      error = "Please enter valid numbers for Issue Quantity, Sale Value, and Price.";
      console.log("Invalid numbers detected");
      return;
    }

    if (parsedIssueQty <= 0 || parsedSaleValue <= 0 || parsedPrice <= 0) {
      error = "Issue Quantity, Sale Value, and Price must be positive.";
      console.log("Negative or zero values detected");
      return;
    }

    if (parsedSaleValue > availableQuantity) {
      error = `Sale Value (${parsedSaleValue}) must be less than available stock (${availableQuantity}).`;
      console.log("Sale value exceeds stock:", { saleValue: parsedSaleValue, availableQuantity });
      return;
    }

    console.log("Submitting to server...");
    try {
      const response = await axios.post(`${baseURL}/api/add-outward`, {
        itemcode: itemCode,
        phone: customerPhone,
        uuidout: uuid,
        referece: reference,
        issueqty: parsedIssueQty,
        salevalue: parsedSaleValue,
        partsavgtot: partsAverageTotal,
        price: parsedPrice
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("API Response:", response.data);

      if (response.status === 201) {
        message = "✅ Stock issued successfully and item quantity updated.";
        error = "";
        profits = Math.ceil(response.data.profits);
        profitPercentage = Math.ceil(response.data.profitpercentage);
        availableQuantity = response.data.updatedQty;

        // Reset form
        itemCode = "";
        customerPhone = "";
        uuid = "";
        reference = "";
        issueQuantity = 1;
        saleValue = 1;
        partsAverageTotal = 0;
        price = 1;

        fetchAvailableQuantity();
      } else {
        error = response.data.error || "Failed to add outward entry.";
        message = "";
        console.error("Unexpected status:", response.status);
      }
    } catch (e) {
      error = "Network error occurred. Please try again.";
      message = "";
      console.error("Error adding outward entry:", e.message);
    }
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Outward Entry</h2>
  {#if message}<p class="message success animate__fadeIn">{message}</p>{/if}
  {#if error}<p class="message error animate__fadeIn">{error}</p>{/if}

  {#if loading}
    <div class="loading">
      <span class="spinner"></span>
      <p>Loading data...</p>
    </div>
  {:else}
    <form on:submit|preventDefault={addOutwardEntry}>
      <div class="grid">
        <div class="input-group">
          <label>Item Code <span class="required">*</span></label>
          <select bind:value={itemCode} required>
            <option value="" disabled selected>-- Select Item --</option>
            {#each itemCodes as item}
              <option value={item.itemcode}>{item.formatted}</option>
            {/each}
          </select>
          {#if availableQuantity !== null}
            <small class="stock-info">Available Quantity: {availableQuantity}</small>
          {/if}
        </div>
        <div class="input-group">
          <label>Customer Phone <span class="required">*</span></label>
          <select bind:value={customerPhone} required>
            <option value="" disabled selected>-- Select Customer --</option>
            {#each customerPhones as phone}
              <option value={phone}>{phone}</option>
            {/each}
          </select>
        </div>
        <div class="input-group">
          <label>UUID <span class="required">*</span></label>
          <input type="text" bind:value={uuid} required placeholder="Enter UUID" />
        </div>
        <div class="input-group">
          <label>Reference</label>
          <input type="text" bind:value={reference} placeholder="Enter Reference" />
        </div>
        <div class="input-group">
          <label>Issue Quantity <span class="required">*</span></label>
          <input type="number" bind:value={issueQuantity} min="1" step="1" required placeholder="e.g., 200" />
        </div>
        <div class="input-group">
          <label>Sale Value <span class="required">*</span></label>
          <input type="number" bind:value={saleValue} min="1" step="1" required placeholder="e.g., 5" />
        </div>
        <div class="input-group">
          <label>Parts Average Total</label>
          <input type="number" bind:value={partsAverageTotal} min="0" step="1" placeholder="e.g., 0" />
        </div>
        <div class="input-group">
          <label>Price <span class="required">*</span></label>
          <input type="number" bind:value={price} min="1" step="1" required placeholder="e.g., 100" />
        </div>
      </div>
      <button type="submit" class="submit-btn">Add Outward Entry</button>
    </form>

    {#if profits !== 0 || profitPercentage !== 0}
      <div class="results">
        <p class={profits >= 0 ? 'positive' : 'negative'}>Profits: {profits}</p>
        <p class={profitPercentage >= 0 ? 'positive' : 'negative'}>Profit Percentage: {profitPercentage}%</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }

  .form-container {
    width: 90%;
    max-width: 600px;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 12px;
    background-color: #f8f9fa;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    font-weight: 600;
  }

  .message {
    text-align: center;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 500;
    margin-bottom: 1rem;
    animation: fadeIn 0.3s ease-in;
  }
  .success {
    background: #2ecc71;
    color: white;
  }
  .error {
    background: #e74c3c;
    color: white;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .loading p {
    margin-top: 1rem;
    color: #718096;
    font-size: 1.1rem;
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
  .required {
    color: #e53e3e;
  }
  input, select {
    padding: 0.9rem;
    border-radius: 6px;
    border: 1px solid #dcdde1;
    font-size: 1rem;
    background: #fff;
    transition: border-color 0.3s ease;
  }
  input:focus, select:focus {
    border-color: #3498db;
    outline: none;
  }
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='%23718096'%3E%3Cpath d='M0 0l6 6 6-6z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 10px;
    padding-right: 2.5rem;
  }

  .stock-info {
    font-size: 0.85rem;
    color: #718096;
    margin-top: 0.4rem;
    font-style: italic;
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1.5rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  }
  .submit-btn:hover {
    background: linear-gradient(135deg, #63b3ed, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
  }
  .submit-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
  }

  .results {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: #eaf2ff;
    text-align: center;
  }
  .positive {
    color: #38a169;
    font-weight: 600;
  }
  .negative {
    color: #e53e3e;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .form-container {
      width: 95%;
      padding: 1.5rem;
    }
    .grid {
      grid-template-columns: 1fr;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate__fadeIn {
    animation: fadeIn 0.3s ease-in;
  }
</style>