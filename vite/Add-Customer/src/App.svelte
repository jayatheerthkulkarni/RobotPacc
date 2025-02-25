<script>
  import Navigation from "./lib/Navigation.svelte";
  import axios from "axios";
  import { tick } from "svelte"; // Import tick for forcing updates if needed

  let phone = "";
  let cname = "";
  let successMessage = "";
  let errorMessage = "";
  let loading = false;

  async function addCustomer() {
    errorMessage = "";
    successMessage = "";

    // 1. Get values DIRECTLY from input elements (to avoid reactivity issues)
    const phoneInput = document.getElementById("phone");
    const cnameInput = document.getElementById("cname");

    const phoneValue = phoneInput ? phoneInput.value : "";
    const cnameValue = cnameInput ? cnameInput.value : "";


    // 2.  VALIDATION
    if (!phoneValue.trim() || !cnameValue.trim()) {
      errorMessage = "❌ Please fill in all required fields.";
      return;
    }


    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneValue.trim())) {
      errorMessage = "❌ Please enter a valid 10-digit phone number (numbers only).";
      return;
    }

    // 3. SUBMISSION
    loading = true;
    try {
      await axios.post("http://localhost:5000/api/add-customer", {
        phone: phoneValue.trim(), // Send trimmed, direct input value
        cname: cnameValue.trim(), // Send trimmed, direct input value
      });

      successMessage = "✅ Customer added successfully!";

      // Reset form fields after successful add
      phone = "";
      cname = "";

       // 4. Force UI update after reset if needed
       await tick(); //Ensures reactive updates are complete, especially for reset values

    } catch (error) {
      console.error("Error adding customer:", error);
      errorMessage = error.response?.data?.error || "❌ Failed to add customer.";
    }
    loading = false;
  }
</script>

<Navigation />

<div class="form-container">
  <h2>Add Customer</h2>

  {#if errorMessage}
    <div class="message error">{errorMessage}</div>
  {/if}
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <form on:submit|preventDefault={addCustomer}>
    <div class="input-group">
      <label for="phone">Phone Number <span class="required">*</span></label>
      <input
        type="tel"
        id="phone"
        bind:value={phone}
        placeholder="Phone Number"
        required
      />
    </div>

    <div class="input-group">
      <label for="cname">Customer Name <span class="required">*</span></label>
      <input
        type="text"
        id="cname"
        bind:value={cname}
        placeholder="Customer Name"
        required
      />
    </div>

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add Customer"}
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
    flex-direction: column; /* Stack label and input */
    gap: 0.5rem; /* Reduce gap between label and input */
  }

  label {
    font-weight: 500; /* Make labels more readable */
    color: #333; /* Darken label color */
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

  .required { /* Style for the required asterisk */
    color: red;
  }
</style>