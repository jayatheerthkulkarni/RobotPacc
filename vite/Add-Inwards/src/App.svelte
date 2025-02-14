<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";

  // ✅ All fields from the database included
  let itemcode = "";
  let phone = "";
  let uuidin = "";
  let buildqty = "";       // ✅ Added this (MISSING)
  let reciveqty = "";
  let acceptqty = "";
  let rejectqty = "";      // ✅ Added this (MISSING)
  let yearmanufactor = "";

  let message = "";
  let error = "";

  async function addInward() {
    message = "";
    error = "";

    // ✅ Check if all required fields are filled
    if (!itemcode.trim() || !phone.trim() || !uuidin.trim() || !buildqty || !reciveqty || !acceptqty || !rejectqty || !yearmanufactor) {
      error = "Please fill in all required fields.";
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/add-inward", {
        itemcode,
        phone,
        uuidin,
        buildqty: Number(buildqty),   // ✅ Ensure it's a number
        reciveqty: Number(reciveqty),
        acceptqty: Number(acceptqty),
        rejectqty: Number(rejectqty), // ✅ Ensure it's a number
        yearmanufactor: Number(yearmanufactor),
      });

      message = "✅ Inward entry added successfully!";
      resetForm();
    } catch (err) {
      console.error("API Error:", err);
      error = err.response?.data?.error || "❌ Failed to add inward entry. Check API connection.";
    }
  }

  function resetForm() {
    itemcode = "";
    phone = "";
    uuidin = "";
    buildqty = "";
    reciveqty = "";
    acceptqty = "";
    rejectqty = "";
    yearmanufactor = "";
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Inward Entry</h2>

  {#if message}
    <p class="message success">{message}</p>
  {/if}
  {#if error}
    <p class="message error">{error}</p>
  {/if}

  <form on:submit|preventDefault={addInward}>
    <div class="grid">
      <div class="input-group">
        <label for="itemcode">Item Code *</label>
        <input id="itemcode" type="text" bind:value={itemcode} required />
      </div>

      <div class="input-group">
        <label for="phone">Supplier Phone *</label>
        <input id="phone" type="text" bind:value={phone} required />
      </div>

      <div class="input-group">
        <label for="uuidin">UUID (Unique ID) *</label>
        <input id="uuidin" type="text" bind:value={uuidin} required />
      </div>

      <div class="input-group">
        <label for="buildqty">Build Quantity *</label>
        <input id="buildqty" type="number" bind:value={buildqty} required />
      </div>

      <div class="input-group">
        <label for="reciveqty">Received Quantity *</label>
        <input id="reciveqty" type="number" bind:value={reciveqty} required />
      </div>

      <div class="input-group">
        <label for="acceptqty">Accepted Quantity *</label>
        <input id="acceptqty" type="number" bind:value={acceptqty} required />
      </div>

      <div class="input-group">
        <label for="rejectqty">Rejected Quantity *</label>
        <input id="rejectqty" type="number" bind:value={rejectqty} required />
      </div>

      <div class="input-group">
        <label for="yearmanufactor">Year of Manufacture *</label>
        <input id="yearmanufactor" type="number" bind:value={yearmanufactor} required />
      </div>
    </div>

    <button type="submit" class="submit-btn">Add Inward Entry</button>
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
