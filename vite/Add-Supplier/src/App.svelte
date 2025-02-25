<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { onMount } from "svelte";
  import { tick } from 'svelte'; // Import tick for forced updates

  // Supplier form fields
  let supname = "";
  let contactperson = "";
  let phone = "";
  let email = "";
  let address = "";
  let selectedItemCode = "";
  let notes = "";

  // UI state fields
  let successMessage = "";
  let errorMessage = "";
  let loading = false;
  let items = [];

  async function fetchAllItems() {
    try {
      const response = await axios.get("http://localhost:5000/api/items");
      items = response.data;
    } catch (error) {
      console.error("Error fetching items:", error);
      errorMessage = "❌ Error fetching items for dropdown.";
    }
  }

  onMount(async () => { // Make onMount async
    await fetchAllItems(); // Wait for items to load
  });

  async function addSupplier() {
    errorMessage = "";
    successMessage = "";

    if (
      !supname.trim() ||
      !contactperson.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim()
    ) {
      errorMessage = "❌ Please fill in all required fields.";
      return;
    }

    //*** NEW CODE HERE ***/

    const phoneInput = document.getElementById('phone'); //Get Value from input directly
    const phoneValue = phoneInput ? phoneInput.value : ''; //Get Value from input directly

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    const trimmedPhone = phoneValue.trim(); // Trim the value just retrieved from the input

    console.log("Phone Number:", trimmedPhone); // Debugging
    console.log("Regex Test:", phoneRegex.test(trimmedPhone)); // Debugging

    if (!phoneRegex.test(trimmedPhone)) {
      errorMessage = "❌ Please enter a valid 10-digit phone number (numbers only).";
      return;
    }

    if (!selectedItemCode) {
      errorMessage = "❌ Please select an item from the list.";
      return;
    }

    loading = true;
    try {
      await axios.post("http://localhost:5000/api/add-supplier", {
        supname: supname.trim(),
        contactperson: contactperson.trim(),
        phone: trimmedPhone, //Use the value from the input box
        email: email.trim(),
        address: address.trim(),
        itemcode: selectedItemCode.trim(),
        notes: notes.trim(),
      });

      successMessage = "✅ Supplier added successfully!";

      supname = "";
      contactperson = "";
      phone = "";
      email = "";
      address = "";
      selectedItemCode = "";
      notes = "";
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
    <div class="form-row">
      <div class="form-group">
        <label for="supname">Supplier Name <span class="required">*</span></label>
        <input
          type="text"
          id="supname"
          bind:value={supname}
          placeholder="Supplier Name"
          required
        />
      </div>

      <div class="form-group">
        <label for="contactperson">Contact Person <span class="required">*</span></label>
        <input
          type="text"
          id="contactperson"
          bind:value={contactperson}
          placeholder="Contact Person"
          required
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="phone">Phone Number <span class="required">*</span></label>
        <input
          type="tel"
          id="phone"
          bind:value={phone}
          placeholder="Phone Number"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email <span class="required">*</span></label>
        <input type="email" id="email" bind:value={email} placeholder="Email" required />
      </div>
    </div>

    <div class="form-group">
      <label for="address">Address <span class="required">*</span></label>
      <input type="text" id="address" bind:value={address} placeholder="Address" required />
    </div>

    <div class="form-group">
      <label for="item">Select Item<span class="required">*</span></label>
      <select bind:value={selectedItemCode} id="item" required>
        <option value="">-- Select an Item --</option>
        {#each items as item}
          <option value={item.itemcode}>{item.itemcode} - {item.itemname}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="notes">Notes</label>
      <textarea id="notes" bind:value={notes} placeholder="Notes (Optional)"></textarea>
    </div>

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add Supplier"}
    </button>
  </form>
</div>

<style>
  .form-container {
    width: 90%;
    max-width: 800px;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 16px;
    background-color: #f8f9fa;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #dee2e6;
  }

  h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-weight: 600;
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

  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #34495e;
  }

  .required {
    color: red;
  }

  input,
  select,
  textarea {
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #dcdde1;
    font-size: 1rem;
    transition: all 0.3s ease;
    background-color: #fff;
  }

  input::placeholder {
    color: #999;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.4);
  }

  textarea {
    resize: vertical;
    height: 120px;
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

  /* Responsive styles */
  @media (max-width: 768px) {
    .form-container {
      width: 95%;
      padding: 1.5rem;
    }

    .form-row {
      flex-direction: column;
    }

    .form-group {
      width: 100%;
    }
  }
</style>