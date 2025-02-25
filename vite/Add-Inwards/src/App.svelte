<script>
    import Navigation from "./lib/Navigation.svelte";
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.min.css";
    import { onMount } from 'svelte';
    import axios from 'axios'; // Import Axios
  
    let itemCodes = [];
    let supplierPhones = [];
  
    let itemCode = "";
    let supplierPhone = "";
    let uuid = "";
    let buildQuantity = 0;
    let receivedQuantity = 0;
    let acceptedQuantity = 0;
    let rejectedQuantity = 0;
    let yearOfManufacture = "";
    let purchasePrice = 0;
    let message = "";
    let error = "";
    let loading = true; // Add a loading state
  
    const baseURL = 'http://localhost:5000'; // Define the base URL
  
    async function fetchItemCodes() {
        try {
            const response = await axios.get(`${baseURL}/api/items`); // Full URL
            console.log("Data from /api/items:", response.data); // Log response.data
  
            itemCodes = response.data.map(item => item.itemcode);
            console.log("itemCodes after mapping:", itemCodes);
        } catch (e) {
            console.error("Could not fetch item codes:", e);
            error = "Failed to load item codes.";
        } finally {
            loading = false;
        }
    }
  
    async function fetchSupplierPhones() {
        try {
            const response = await axios.get(`${baseURL}/api/suppliers`); // Full URL
            console.log("Data from /api/suppliers:", response.data); // Log response.data
  
            supplierPhones = response.data.map(supplier => supplier.phone);
            console.log("supplierPhones after mapping:", supplierPhones);
        } catch (e) {
            console.error("Could not fetch supplier phones:", e);
            error = "Failed to load supplier phones.";
        } finally {
            loading = false;
        }
    }
  
    onMount(async () => {
        loading = true;
        await Promise.all([fetchItemCodes(), fetchSupplierPhones()]);
        loading = false;
    });
  
  
    function validateInput() {
        if (
            receivedQuantity > buildQuantity || 
            acceptedQuantity > receivedQuantity || 
            rejectedQuantity > acceptedQuantity ||
            receivedQuantity < 0 ||
            acceptedQuantity < 0 ||
            rejectedQuantity < 0 ||
            buildQuantity < 0 ||
            purchasePrice < 0
        ) {
            error = "Invalid input values. Ensure Build >= Received >= Accepted >= Rejected and no negatives.";
            return false;
        }
        error = "";
        return true;
    }
    
    async function addInwardEntry() {
      if (!validateInput()) return;
  
      try {
          const response = await axios.post(`${baseURL}/api/add-inward`, { //Full URL
  
              itemcode: itemCode,
              phone: supplierPhone,
              uuidin: uuid,
              buildqty: buildQuantity,
              reciveqty: receivedQuantity,
              acceptqty: acceptedQuantity,
              rejectqty: rejectedQuantity,
              yearmanufactor: yearOfManufacture,
              purchaseprice: purchasePrice
  
          }, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
  
          if (response.status === 200 || response.status === 201) { // Axios uses response.status
              message = "✅ Stock received successfully and item quantity updated.";
              error = "";
  
              // Clear the form
              itemCode = "";
              supplierPhone = "";
              uuid = "";
              buildQuantity = 0;
              receivedQuantity = 0;
              acceptedQuantity = 0;
              rejectedQuantity = 0;
              yearOfManufacture = "";
              purchasePrice = 0;
          } else {
              error = response.data.error || "Failed to add inward entry."; // Access error from response.data
              message = "";
              console.error("Failed to add inward entry:", response.data);
          }
      } catch (e) {
          error = "Network error occurred. Please try again.";
          message = "";
          console.error("Error adding inward entry:", e);
      }
  }
  </script>
  
  <Navigation />
  
  <div class="form-container">
    <h2>Add Inward Entry</h2>
    {#if message}<p class="message success">{message}</p>{/if}
    {#if error}<p class="message error">{error}</p>{/if}
  
    {#if loading}
        <p>Loading data...</p>
    {:else}
        <form on:submit|preventDefault={addInwardEntry}>
            <div class="grid">
                <div class="input-group">
                    <label>Item Code *</label>
                    <select bind:value={itemCode} required>
                        <option value="" disabled selected>-- Select Item --</option>
                        {#each itemCodes as code}
                            <option value={code}>{code}</option>
                        {/each}
                    </select>
                </div>
                <div class="input-group">
                    <label>Supplier Phone *</label>
                    <select bind:value={supplierPhone} required>
                        <option value="" disabled selected>-- Select Supplier --</option>
                        {#each supplierPhones as phone}
                            <option value={phone}>{phone}</option>
                        {/each}
                    </select>
                </div>
                <div class="input-group">
                    <label>UUID *</label>
                    <input type="text" bind:value={uuid} required placeholder="Enter UUID" />
                </div>
                <div class="input-group">
                    <label>Build Quantity *</label>
                    <input type="number" bind:value={buildQuantity} min="0" required />
                </div>
                <div class="input-group">
                    <label>Received Quantity *</label>
                    <input type="number" bind:value={receivedQuantity} min="0" required />
                </div>
                <div class="input-group">
                    <label>Accepted Quantity *</label>
                    <input type="number" bind:value={acceptedQuantity} min="0" required />
                </div>
                <div class="input-group">
                    <label>Rejected Quantity</label>
                    <input type="number" bind:value={rejectedQuantity} min="0" />
                </div>
                <div class="input-group">
                    <label>Year of Manufacture *</label>
                    <input type="text" bind:value={yearOfManufacture} required placeholder="Enter Year" />
                </div>
                <div class="input-group">
                    <label>Purchase Price *</label>
                    <input type="number" bind:value={purchasePrice} min="0" required />
                </div>
            </div>
            <button type="submit" class="submit-btn">Add Inward Entry</button>
        </form>
    {/if}
  </div>
  
  <style>
    .form-container {
        width: 90%;
        max-width: 600px;
        margin: auto;
        margin-top: 5%;
        padding: 2rem;
        border-radius: 12px;
        background-color: #f8f9fa;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    h2 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    .message {
        text-align: center;
        padding: 0.8rem;
        border-radius: 8px;
        font-weight: 500;
        margin-bottom: 1rem;
    }
    .success { background: #2ecc71; color: white; }
    .error { background: #e74c3c; color: white; }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
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
    input, select {  /* Apply same style to select */
        padding: 0.7rem;
        border-radius: 6px;
        border: 1px solid #dcdde1;
        font-size: 1rem;
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
        cursor: pointer;
    }
    .submit-btn:hover {
        background: #2980b9;
    }
  </style>