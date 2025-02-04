<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { debounce } from "lodash"; // Using Lodash's debounce function

  // Supplier form fields
  let supname = "";
  let contactperson = "";
  let phone = "";
  let email = "";
  let address = "";
  let itemcode = ""; // Actual item code to send to backend
  let notes = "";

  // UI state fields
  let searchQuery = "";
  let suggestions = [];
  let successMessage = "";
  let errorMessage = "";
  let loading = false;
  let itemValid = false; // Flag to mark that a valid item was chosen

  // Debounced function to search for items based on the user's query.
  const searchItems = debounce(async (query) => {
    // If no query, clear suggestions.
    if (!query) {
      suggestions = [];
      return;
    }
    try {
      // URL encode the query to prevent issues with special characters.
      const response = await axios.get(
        `http://localhost:5000/api/search-item?query=${encodeURIComponent(query)}`
      );
      suggestions = response.data;
    } catch (error) {
      console.error("Error fetching item suggestions:", error);
      errorMessage = "❌ Error fetching item suggestions.";
    }
  }, 300);

  // When the searchQuery changes, invoke the debounced search.
  $: searchItems(searchQuery);

  // When a suggestion is clicked, set the itemcode and mark it valid.
  function selectItem(item) {
    itemcode = item.itemcode;
    searchQuery = `${item.itemcode} - ${item.itemname}`;
    suggestions = [];
    itemValid = true;
  }

  // Submit the supplier form.
  async function addSupplier() {
    // Reset messages
    errorMessage = "";
    successMessage = "";

    // Trim and validate required fields
    if (
      !supname.trim() ||
      !contactperson.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !itemcode.trim()
    ) {
      errorMessage = "❌ Please fill in all required fields.";
      return;
    }

    // Ensure that the user has selected an item from the suggestions.
    if (!itemValid) {
      errorMessage = "❌ Please select a valid item from the suggestions.";
      return;
    }

    loading = true;
    try {
      // Post the supplier data to the backend.
      await axios.post("http://localhost:5000/api/add-supplier", {
        supname: supname.trim(),
        contactperson: contactperson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        itemcode: itemcode.trim(),
        notes: notes.trim(),
      });

      successMessage = "✅ Supplier added successfully!";
      
      // Reset form fields after a successful add.
      supname = "";
      contactperson = "";
      phone = "";
      email = "";
      address = "";
      itemcode = "";
      notes = "";
      searchQuery = "";
      suggestions = [];
      itemValid = false;
    } catch (error) {
      console.error("Error adding supplier:", error);
      errorMessage = error.response?.data?.error || "❌ Failed to add supplier.";
    }
    loading = false;
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Supplier</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={addSupplier}>
    <div class="input-group">
      <input type="text" bind:value={supname} placeholder="Supplier Name *" required />
      <input type="text" bind:value={contactperson} placeholder="Contact Person *" required />
    </div>

    <div class="input-group">
      <input type="tel" bind:value={phone} placeholder="Phone Number *" required />
      <input type="email" bind:value={email} placeholder="Email *" required />
    </div>

    <input type="text" bind:value={address} placeholder="Address *" required />

    <!-- Live Item Search Input -->
    <div class="item-search">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search Item Code or Name"
        autocomplete="off"
      />
      {#if suggestions.length > 0}
        <ul class="suggestions">
          {#each suggestions as item}
            <li on:click={() => selectItem(item)}>
              {item.itemcode} - {item.itemname}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Optional Notes Field -->
    <textarea bind:value={notes} placeholder="Notes (Optional)"></textarea>

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add Supplier"}
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
    position: relative;
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

  .input-group {
    display: flex;
    gap: 1rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #dcdde1;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  input:focus,
  textarea:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.4);
  }

  textarea {
    resize: none;
    height: 100px;
  }

  .item-search {
    position: relative;
  }

  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 0 0 8px 8px;
    z-index: 10;
  }

  .suggestions li {
    padding: 10px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .suggestions li:hover {
    background: #3498db;
    color: white;
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
