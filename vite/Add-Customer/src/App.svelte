<script>
    import Navigation from "./lib/Navigation.svelte";
    import axios from "axios";
  
    let phone = "";
    let cname = "";
    let successMessage = "";
    let errorMessage = "";
    let loading = false;
  
    // Submit the customer data to the backend.
    async function addCustomer() {
      // Reset messages
      errorMessage = "";
      successMessage = "";
  
      // Validate that required fields are not empty
      if (!phone || !cname) {
        errorMessage = "❌ Please fill in all required fields.";
        return;
      }
  
      loading = true;
      try {
        // Send POST request to backend to add the customer
        await axios.post("http://localhost:5000/api/add-customer", {
          phone,
          cname,
        });
  
        successMessage = "✅ Customer added successfully!";
  
        // Reset form fields after successful add
        phone = "";
        cname = "";
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
        <input type="tel" bind:value={phone} placeholder="Phone Number *" required />
        <input type="text" bind:value={cname} placeholder="Customer Name *" required />
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
      gap: 1rem;
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
  