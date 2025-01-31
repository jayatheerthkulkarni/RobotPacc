<script>
  import Navigation from "./lib/Navigation.svelte";

  // Form fields for Supplier
  let suppliercode = "";
  let suppliername = "";
  let contactperson = "";
  let phone = "";
  let email = "";
  let address = "";
  let notes = "";


  // Handle form submission
  async function handleSubmit(event) {
      event.preventDefault();

      // Build the payload for supplier data
      const payload = {
          suppliercode,
          suppliername,
          contactperson,
          phone,
          email,
          address,
          notes
      };

      try {
          const response = await fetch("http://localhost:5000/suppliers", { // Changed endpoint to /suppliers
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });

          if (!response.ok) {
              console.error("Server responded with an error:", response.status);
              return;
          }

          const data = await response.json();
          console.log("Supplier added successfully:", data);

          // Simple feedback or reset form fields
          alert("Supplier added successfully!");
          suppliercode = "";
          suppliername = "";
          contactperson = "";
          phone = "";
          email = "";
          address = "";
          notes = "";


      } catch (err) {
          console.error("Error adding supplier:", err);
      }
  }
</script>

<svelte:head>
  <title>Add New Supplier</title>
  <style>
      /* General Styles - keeping the provided styles, adjust as needed */
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
      input[type="date"],
      input[type="email"], /* Added email type */
      textarea /* Added textarea for notes */
       {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 8px;
          color: #333;
          box-sizing: border-box; /* Important for consistent width with padding */
      }

      input[type="text"]:focus,
      input[type="number"]:focus,
      input[type="date"]:focus,
      input[type="email"]:focus,
      textarea:focus {
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

<h1>Add New Supplier</h1>

<form on:submit|preventDefault={handleSubmit}>
  <div>
      <label for="suppliercode">Supplier Code:</label>
      <input
          id="suppliercode"
          bind:value={suppliercode}
          type="text"
          required
      />
  </div>
  <div>
      <label for="suppliername">Supplier Name:</label>
      <input
          id="suppliername"
          bind:value={suppliername}
          type="text"
          required
      />
  </div>
  <div>
      <label for="contactperson">Contact Person:</label>
      <input
          id="contactperson"
          bind:value={contactperson}
          type="text"
      />
  </div>
  <div>
      <label for="phone">Phone:</label>
      <input
          id="phone"
          bind:value={phone}
          type="text"
      />
  </div>
  <div>
      <label for="email">Email:</label>
      <input
          id="email"
          bind:value={email}
          type="email"
      />
  </div>
  <div>
      <label for="address">Address:</label>
      <input
          id="address"
          bind:value={address}
          type="text"
      />
  </div>
  <div>
      <label for="notes">Notes:</label>
      <textarea
          id="notes"
          bind:value={notes}
          rows="4"
      ></textarea>
  </div>

  <button type="submit">Add Supplier</button>
</form>