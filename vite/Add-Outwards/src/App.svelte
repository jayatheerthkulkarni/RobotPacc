<script>
  import axios from "axios";
  import Navigation from "./lib/Navigation.svelte";

  // ✅ Form fields
  let itemcode = "";
  let phone = "";
  let uuidout = "";
  let referece = "";       // Optional text column
  let issueqty = "";
  let salevalue = "";
  let partsavgtot = "";
  let profits = "";
  let profitpercentage = "";

  // ✅ UI feedback states
  let error = "";
  let success = "";

  // ✅ Submission handler
  async function addOutward() {
    // Reset messages
    error = "";
    success = "";

    // ✅ Basic required fields check (adjust as you prefer)
    if (!itemcode.trim() || !phone.trim() || !uuidout.trim()) {
      error = "Please fill out the required fields (Item Code, Phone, UUID).";
      return;
    }

    try {
      // POST request to /api/add-outward
      await axios.post("http://localhost:5000/api/add-outward", {
        itemcode,
        phone,
        uuidout,
        referece,
        // Convert numeric fields to numbers, or they'll arrive as strings
        issueqty: Number(issueqty),
        salevalue: Number(salevalue),
        partsavgtot: Number(partsavgtot),
        profits: Number(profits),
        profitpercentage: Number(profitpercentage)
      });

      success = "✅ Outward record added successfully!";
      resetForm();
    } catch (err) {
      console.error("Error in addOutward:", err);
      error = err.response?.data?.error || "❌ Failed to add outward record. Check API and DB.";
    }
  }

  // ✅ Clear form fields
  function resetForm() {
    itemcode = "";
    phone = "";
    uuidout = "";
    referece = "";
    issueqty = "";
    salevalue = "";
    partsavgtot = "";
    profits = "";
    profitpercentage = "";
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Outward Entry</h2>

  {#if success}
    <p class="message success">{success}</p>
  {/if}
  {#if error}
    <p class="message error">{error}</p>
  {/if}

  <form on:submit|preventDefault={addOutward}>
    <div class="grid">
      <!-- REQUIRED FIELDS (example) -->
      <div class="input-group">
        <label for="itemcode">Item Code *</label>
        <input id="itemcode" type="text" bind:value={itemcode} required />
      </div>
      <div class="input-group">
        <label for="phone">Customer Phone *</label>
        <input id="phone" type="text" bind:value={phone} required />
      </div>
      <div class="input-group">
        <label for="uuidout">UUID (Out) *</label>
        <input id="uuidout" type="text" bind:value={uuidout} required />
      </div>

      <!-- OPTIONAL / EXTRA FIELDS -->
      <div class="input-group">
        <label for="referece">Reference</label>
        <input id="referece" type="text" bind:value={referece} />
      </div>
      <div class="input-group">
        <label for="issueqty">Issue Qty</label>
        <input id="issueqty" type="number" bind:value={issueqty} />
      </div>
      <div class="input-group">
        <label for="salevalue">Sale Value</label>
        <input id="salevalue" type="number" bind:value={salevalue} />
      </div>
      <div class="input-group">
        <label for="partsavgtot">Parts Avg Tot</label>
        <input id="partsavgtot" type="number" bind:value={partsavgtot} />
      </div>
      <div class="input-group">
        <label for="profits">Profits</label>
        <input id="profits" type="number" bind:value={profits} />
      </div>
      <div class="input-group">
        <label for="profitpercentage">Profit %</label>
        <input id="profitpercentage" type="number" bind:value={profitpercentage} />
      </div>
    </div>

    <button type="submit" class="submit-btn">Add Outward Entry</button>
  </form>
</div>

<style>
  /* Container styling */
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

  /* Messages for success/error */
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

  /* Responsive grid of inputs */
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
