<script>
    import Navigation from "./lib/Navigation.svelte";
  
    // Form fields bound to the Svelte component
    let itemcode = "";
    let itemname = "";
    let itemdesc = "";
    let itemused = "";
    let qty = 0;
    let dtpur = "";
    let expiry = "";
    let avgcost = 0;
    let minstock = 0;
    let maxstock = 0;
    let latestprice = 0;
    let lowest = 0;
    let highest = 0;
  
    // Handle form submission
    async function handleSubmit(event) {
      event.preventDefault();
  
      // Build the payload from data fields
      const payload = {
        itemcode,
        itemname,
        itemdesc,
        itemused,
        qty,
        dtpur,
        expiry,
        avgcost,
        minstock,
        maxstock,
        latestprice,
        lowest,
        highest
      };
  
      try {
        const response = await fetch("http://localhost:5000/pmaster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
          console.error("Server responded with an error:", response.status);
          return;
        }
  
        const data = await response.json();
        console.log("Item added successfully:", data);
  
        // Simple feedback or reset form fields
        alert("Item added successfully!");
        itemcode = "";
        itemname = "";
        itemdesc = "";
        itemused = "";
        qty = 0;
        dtpur = "";
        expiry = "";
        avgcost = 0;
        minstock = 0;
        maxstock = 0;
        latestprice = 0;
        lowest = 0;
        highest = 0;
  
      } catch (err) {
        console.error("Error adding item:", err);
      }
    }
  </script>
  
  <svelte:head>
    <title>Add New Item</title>
    <style>
      /* General Styles */
      body {
        font-family: system-ui, sans-serif;
        background-color: #f4f4f8;
        color: #333;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
  
      h1 {
        color: #3498db;
        margin-bottom: 20px;
        text-align: center;
      }
  
      /* Form Styles */
      form {
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        width: 80%;
        max-width: 700px;
        margin-bottom: 30px;
      }
  
      @media (max-width: 768px) {
        form {
          width: 95%;
          padding: 20px;
        }
      }
  
      div {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
      }
  
      label {
        font-weight: bold;
        margin-bottom: 8px;
        color: #555;
      }
  
      input[type="text"],
      input[type="number"],
      input[type="date"] {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 8px;
        color: #333;
      }
  
      input[type="text"]:focus,
      input[type="number"]:focus,
      input[type="date"]:focus {
        border-color: #3498db;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
        outline: none;
      }
  
  
      button[type="submit"] {
        background-color: #3498db;
        color: white;
        padding: 14px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
        transition: background-color 0.3s ease;
      }
  
      button[type="submit"]:hover {
        background-color: #2980b9;
      }
    </style>
  </svelte:head>
  
  <!-- Navigation component -->
  <Navigation />
  
  <h1>Add New Item</h1>
  
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="itemcode">Item Code:</label>
      <input
        id="itemcode"
        bind:value={itemcode}
        type="text"
        required
      />
    </div>
    <div>
      <label for="itemname">Item Name:</label>
      <input
        id="itemname"
        bind:value={itemname}
        type="text"
        required
      />
    </div>
    <div>
      <label for="itemdesc">Description:</label>
      <input
        id="itemdesc"
        bind:value={itemdesc}
        type="text"
        required
      />
    </div>
    <div>
      <label for="itemused">Item Used:</label>
      <input
        id="itemused"
        bind:value={itemused}
        type="text"
        required
      />
    </div>
    <div>
      <label for="qty">Quantity:</label>
      <input
        id="qty"
        bind:value={qty}
        type="number"
        required
      />
    </div>
    <div>
      <label for="dtpur">Purchase Date:</label>
      <input
        id="dtpur"
        bind:value={dtpur}
        type="date"
        required
      />
    </div>
    <div>
      <label for="expiry">Expiry Date:</label>
      <input
        id="expiry"
        bind:value={expiry}
        type="date"
        required
      />
    </div>
    <div>
      <label for="avgcost">Avg Cost:</label>
      <input
        id="avgcost"
        bind:value={avgcost}
        type="number"
        required
      />
    </div>
    <div>
      <label for="minstock">Min Stock:</label>
      <input
        id="minstock"
        bind:value={minstock}
        type="number"
        required
      />
    </div>
    <div>
      <label for="maxstock">Max Stock:</label>
      <input
        id="maxstock"
        bind:value={maxstock}
        type="number"
        required
      />
    </div>
    <div>
      <label for="latestprice">Latest Price:</label>
      <input
        id="latestprice"
        bind:value={latestprice}
        type="number"
        required
      />
    </div>
    <div>
      <label for="lowest">Lowest:</label>
      <input
        id="lowest"
        bind:value={lowest}
        type="number"
        required
      />
    </div>
    <div>
      <label for="highest">Highest:</label>
      <input
        id="highest"
        bind:value={highest}
        type="number"
        required
      />
    </div>
  
    <button type="submit">Add Item</button>
  </form>