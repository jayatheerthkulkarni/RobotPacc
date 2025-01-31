<script>
    import Navigation from "./lib/Navigation.svelte";
  
    // Form fields for Customer
    let customerid = "";
    let customername = "";
    let customernumber = "";
  
    // Handle form submission
    async function handleSubmit(event) {
        event.preventDefault();
  
        // Build the payload for customer data
        const payload = {
            customerid,
            customername,
            customernumber
        };
  
        try {
            const response = await fetch("http://localhost:5000/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
  
            if (!response.ok) {
                console.error("Server responded with an error:", response.status);
                return;
            }
  
            const data = await response.json();
            console.log("Customer added successfully:", data);
  
            // Simple feedback or reset form fields
            alert("Customer added successfully!");
            customerid = "";
            customername = "";
            customernumber = "";
  
        } catch (err) {
            console.error("Error adding customer:", err);
        }
    }
  </script>
  
  <svelte:head>
    <title>Add New Customer</title>
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
        input[type="date"],
        input[type="email"],
        textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            margin-bottom: 8px;
            color: #333;
            box-sizing: border-box;
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
  
  <h1>Add New Customer</h1>
  
  <form on:submit|preventDefault={handleSubmit}>
    <div>
        <label for="customerid">Customer ID:</label>
        <input
            id="customerid"
            bind:value={customerid}
            type="text"
            required
        />
    </div>
    <div>
        <label for="customername">Customer Name:</label>
        <input
            id="customername"
            bind:value={customername}
            type="text"
            required
        />
    </div>
    <div>
        <label for="customernumber">Phone Number:</label>
        <input
            id="customernumber"
            bind:value={customernumber}
            type="text"
        />
    </div>
  
    <button type="submit">Add Customer</button>
  </form>