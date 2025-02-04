<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { debounce } from "lodash";

  // Form fields
  let itemcode = "";
  let phone = "";       // Selected customer's phone (Customer ID is based on phone)
  let uuidout = "";     // Customer ID (UUID)
  let issueqty = 0;
  let salevalue = 0;

  // Search queries
  let itemSearchQuery = "";
  let customerSearchQuery = "";

  // Suggestions arrays
  let itemSuggestions = [];
  let customerSuggestions = [];

  // UI / feedback
  let successMessage = "";
  let errorMessage = "";
  let loading = false;

  // Flags to confirm valid selection
  let itemValid = false;
  let customerValid = false;

  // ------------- Item search (debounced) --------------
  const searchItems = debounce(async (query) => {
    if (!query) {
      itemSuggestions = [];
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/search-item?query=${encodeURIComponent(query)}`
      );
      console.log("Items response:", response.data); // Debugging response
      itemSuggestions = response.data;
    } catch (error) {
      console.error("Error searching items:", error);
      errorMessage = "❌ Failed to fetch item suggestions.";
    }
  }, 300);

  $: searchItems(itemSearchQuery);

  // ------------- Customer search (debounced) -----------
  const searchCustomers = debounce(async (query) => {
    if (!query) {
      customerSuggestions = [];
      return;
    }
    try {
      // Must exist in your backend as GET /api/search-customer
      const response = await axios.get(
        `http://localhost:5000/api/search-customer?query=${encodeURIComponent(query)}`
      );
      console.log("Customers response:", response.data); // Debugging response
      customerSuggestions = response.data;
    } catch (error) {
      console.error("Error searching customers:", error);
      errorMessage = "❌ Failed to fetch customer suggestions.";
    }
  }, 300);

  $: searchCustomers(customerSearchQuery);

  // ------------ Handle item selection -------------
  function selectItem(item) {
    itemcode = item.itemcode;
    itemSearchQuery = `${item.itemcode} - ${item.itemname}`;
    itemSuggestions = [];
    itemValid = true;
  }

  // ------------ Handle customer selection -------------
  function selectCustomer(cust) {
    phone = cust.phone; // Using phone as Customer ID
    uuidout = phone;    // Set UUID (Customer ID) based on customer's phone
    customerSearchQuery = `${cust.phone} - ${cust.cname}`;
    customerSuggestions = [];
    customerValid = true;
  }

  // ------------- Add Outward record -------------
  async function addOutward() {
    errorMessage = "";
    successMessage = "";

    // Basic validation
    if (!itemcode || !phone || !uuidout || !issueqty || !salevalue) {
      errorMessage = "❌ Please fill in all required fields.";
      return;
    }
    if (!itemValid) {
      errorMessage = "❌ Please select a valid item.";
      return;
    }
    if (!customerValid) {
      errorMessage = "❌ Please select a valid customer.";
      return;
    }

    loading = true;
    try {
      await axios.post("http://localhost:5000/api/add-outward", {
        itemcode,
        phone,
        uuidout,
        issueqty,
        salevalue,
      });
      successMessage = "✅ Outward record added successfully!";

      // Reset
      itemcode = "";
      phone = "";
      uuidout = "";
      issueqty = 0;
      salevalue = 0;
      itemSearchQuery = "";
      customerSearchQuery = "";
      itemSuggestions = [];
      customerSuggestions = [];
      itemValid = false;
      customerValid = false;
    } catch (error) {
      console.error("Error adding outward:", error);
      errorMessage = error.response?.data?.error || "❌ Failed to add outward.";
    }
    loading = false;
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Outwards (to Customer)</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={addOutward}>
    <!-- Customer Search Field -->
    <div class="search-field">
      <label>Search Customer (Phone Number):</label>
      <input
        type="text"
        placeholder="Type customer phone number or name"
        bind:value={customerSearchQuery}
      />
      {#if customerSearchQuery}
        {#if customerSuggestions.length > 0}
          <ul class="suggestions">
            {#each customerSuggestions as cust}
              <li on:click={() => selectCustomer(cust)}>
                {cust.phone} - {cust.cname}
              </li>
            {/each}
          </ul>
        {:else}
          <p>No suggestions found.</p>
        {/if}
      {/if}
    </div>

    <!-- Item Search Field -->
    <div class="search-field">
      <label>Search Item:</label>
      <input
        type="text"
        placeholder="Type item code or name"
        bind:value={itemSearchQuery}
      />
      {#if itemSearchQuery}
        {#if itemSuggestions.length > 0}
          <ul class="suggestions">
            {#each itemSuggestions as it}
              <li on:click={() => selectItem(it)}>
                {it.itemcode} - {it.itemname}
              </li>
            {/each}
          </ul>
        {:else}
          <p>No suggestions found.</p>
        {/if}
      {/if}
    </div>

    <!-- Additional Fields -->
    <input
      type="text"
      bind:value={uuidout}
      placeholder="Customer ID (UUID) *"
      required
      readonly
    />

    <div class="input-group">
      <!-- Labeled field for Issue Quantity -->
      <div class="field-container">
        <label for="issueqty">Issue Quantity *</label>
        <input
          id="issueqty"
          type="number"
          bind:value={issueqty}
          required
          min="0"
        />
      </div>

      <!-- Labeled field for Sale Value -->
      <div class="field-container">
        <label for="salevalue">Sale Value *</label>
        <input
          id="salevalue"
          type="number"
          bind:value={salevalue}
          required
          min="0"
        />
      </div>
    </div>

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add Outward"}
    </button>
  </form>
</div>

<style>
  .form-container {
    width: 90%;
    max-width: 600px;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 12px;
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
    margin-bottom: 1rem;
  }
  .success {
    background: #2ecc71;
    color: white;
  }
  .error {
    background: #e74c3c;
    color: white;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-field {
    position: relative;
  }
  .search-field label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: bold;
  }

  .suggestions {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 0 0 8px 8px;
    z-index: 10;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .suggestions li {
    padding: 10px;
    cursor: pointer;
  }
  .suggestions li:hover {
    background: #3498db;
    color: white;
  }

  .input-group {
    display: flex;
    gap: 1rem;
  }

  .field-container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  label {
    margin-bottom: 0.4rem;
    font-weight: bold;
  }

  input {
    width: 100%;
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
</style>
