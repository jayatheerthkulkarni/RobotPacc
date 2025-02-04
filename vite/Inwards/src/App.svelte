<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { debounce } from "lodash";

  // Form fields
  let itemcode = "";
  let phone = "";       // Selected supplier's phone (Supplier ID is based on phone)
  let uuidin = "";      // Supplier ID (UUID)
  let reciveqty = 0;
  let acceptqty = 0;

  // Search queries
  let itemSearchQuery = "";
  let supplierSearchQuery = "";

  // Suggestions arrays
  let itemSuggestions = [];
  let supplierSuggestions = [];

  // UI / feedback
  let successMessage = "";
  let errorMessage = "";
  let loading = false;

  // Flags to confirm valid selection
  let itemValid = false;
  let supplierValid = false;

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
      itemSuggestions = response.data;
    } catch (error) {
      console.error("Error searching items:", error);
      errorMessage = "❌ Failed to fetch item suggestions.";
    }
  }, 300);

  $: searchItems(itemSearchQuery);

  // ------------- Supplier search (debounced) -----------
  const searchSuppliers = debounce(async (query) => {
    if (!query) {
      supplierSuggestions = [];
      return;
    }
    try {
      // Must exist in your backend as GET /api/search-supplier
      const response = await axios.get(
        `http://localhost:5000/api/search-supplier?query=${encodeURIComponent(query)}`
      );
      supplierSuggestions = response.data;
    } catch (error) {
      console.error("Error searching suppliers:", error);
      errorMessage = "❌ Failed to fetch supplier suggestions.";
    }
  }, 300);

  $: searchSuppliers(supplierSearchQuery);

  // ------------ Handle item selection -------------
  function selectItem(item) {
    itemcode = item.itemcode;
    itemSearchQuery = `${item.itemcode} - ${item.itemname}`;
    itemSuggestions = [];
    itemValid = true;
  }

  // ------------ Handle supplier selection -------------
  function selectSupplier(sup) {
    phone = sup.phone; // Using phone as Supplier ID
    uuidin = phone; // Set UUID (Supplier ID) based on supplier's phone
    supplierSearchQuery = `${sup.phone} - ${sup.supname}`;
    supplierSuggestions = [];
    supplierValid = true;
  }

  // ------------- Add Inward record -------------
  async function addInward() {
    errorMessage = "";
    successMessage = "";

    // Basic validation
    if (!itemcode || !phone || !uuidin || !reciveqty || !acceptqty) {
      errorMessage = "❌ Please fill in all required fields.";
      return;
    }
    if (!itemValid) {
      errorMessage = "❌ Please select a valid item.";
      return;
    }
    if (!supplierValid) {
      errorMessage = "❌ Please select a valid supplier.";
      return;
    }

    loading = true;
    try {
      await axios.post("http://localhost:5000/api/add-inward", {
        itemcode,
        phone,
        uuidin,
        reciveqty,
        acceptqty,
      });
      successMessage = "✅ Inward record added successfully!";

      // Reset
      itemcode = "";
      phone = "";
      uuidin = "";
      reciveqty = 0;
      acceptqty = 0;
      itemSearchQuery = "";
      supplierSearchQuery = "";
      itemSuggestions = [];
      supplierSuggestions = [];
      itemValid = false;
      supplierValid = false;
    } catch (error) {
      console.error("Error adding inward:", error);
      errorMessage = error.response?.data?.error || "❌ Failed to add inward.";
    }
    loading = false;
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Inwards</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={addInward}>
    <!-- Supplier Search Field -->
    <div class="search-field">
      <label>Search Supplier (Phone Number):</label>
      <input
        type="text"
        placeholder="Type supplier phone number"
        bind:value={supplierSearchQuery}
      />
      {#if supplierSuggestions.length > 0}
        <ul class="suggestions">
          {#each supplierSuggestions as sup}
            <li on:click={() => selectSupplier(sup)}>
              {sup.phone} - {sup.supname}
            </li>
          {/each}
        </ul>
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
      {#if itemSuggestions.length > 0}
        <ul class="suggestions">
          {#each itemSuggestions as it}
            <li on:click={() => selectItem(it)}>
              {it.itemcode} - {it.itemname}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Additional Fields -->
    <input
      type="text"
      bind:value={uuidin}
      placeholder="Supplier ID (UUID) *"
      required
      readonly
    />

    <div class="input-group">
      <!-- Labeled field for Received Quantity -->
      <div class="field-container">
        <label for="reciveqty">Received Quantity *</label>
        <input
          id="reciveqty"
          type="number"
          bind:value={reciveqty}
          required
          min="0"
        />
      </div>

      <!-- Labeled field for Accepted Quantity -->
      <div class="field-container">
        <label for="acceptqty">Accepted Quantity *</label>
        <input
          id="acceptqty"
          type="number"
          bind:value={acceptqty}
          required
          min="0"
        />
      </div>
    </div>

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add Inward"}
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
    top: 60px; /* ensure it appears below the input field */
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
