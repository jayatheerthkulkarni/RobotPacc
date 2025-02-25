<script>
	import Navigation from "./lib/Navigation.svelte";
	import axios from "axios";
	import flatpickr from "flatpickr";
	import "flatpickr/dist/flatpickr.min.css"; // Import the default stylesheet
	// Optionally, import a theme:
	// import "flatpickr/dist/themes/material_blue.css";

	let itemcode = "";
	let itemname = "";
	let itemdesc = "";
	let itemused = "";
	let qty = "";
	let dtpur = ""; // UI date in dd/mm/yyyy
	let expiry = ""; // UI date in dd/mm/yyyy
	let avgcost = "";
	let minstock = "";
	let maxstock = "";
	let latestprice = "";
	let lowest = "";
	let highest = "";
	let message = "";
	let error = "";

	let dtpurPicker; // Flatpickr instance for purchase date
	let expiryPicker; // Flatpickr instance for expiry date

	// Converts UI date (dd/mm/yyyy) to API format (mm-dd-yyyy)
	function convertToApiDate(dateString) {
		if (!dateString) return "";
		const parts = dateString.split("/");
		if (parts.length !== 3) return "Invalid Date";
		let [day, month, year] = parts;
		if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
			return "Invalid Date";
		}
		return `${month.padStart(2, "0")}-${day.padStart(2, "0")}-${year}`;
	}

	// Validates a dd/mm/yyyy date string
	function isValidDate(dateString) {
		if (!dateString) return false;
		const parts = dateString.split("/");
		if (parts.length !== 3) return false;
		let [day, month, year] = parts;
		day = parseInt(day, 10);
		month = parseInt(month, 10);
		year = parseInt(year, 10);
		if (!day || !month || !year) return false;

		if (month < 1 || month > 12) return false;
		if (day < 1 || day > 31) return false;

		// Handle February and leap years
		if (month === 2) {
			const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
			if (day > (isLeap ? 29 : 28)) return false;
		}

		// Handle months with 30 days
		if ([4, 6, 9, 11].includes(month) && day > 30) return false;

		return true;
	}

	// Parses a dd/mm/yyyy date string into a Date object
	function parseDate(dateString) {
		const parts = dateString.split("/");
		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10);
		const year = parseInt(parts[2], 10);
		return new Date(year, month - 1, day);
	}

	function initDatePicker(node, isDtpur) {
		const picker = flatpickr(node, {
			dateFormat: "d/m/Y", // Display format in the input (DD/MM/YYYY)
			// NO altInput or altFormat needed
			onChange: (selectedDates, dateStr, instance) => {
				if (selectedDates.length > 0) {
					// dateStr is already in DD/MM/YYYY format!
					if (isDtpur) {
						dtpur = dateStr; // Update the Svelte variable directly
					} else {
						expiry = dateStr; // Update the Svelte variable directly
					}
				} else {
					if (isDtpur) {
						dtpur = "";
					} else {
						expiry = "";
					}
				}
			},
		});

		if (isDtpur) {
			dtpurPicker = picker;
		} else {
			expiryPicker = picker;
		}

		return {
			destroy() {
				picker.destroy();
			},
		};
	}

	async function addItem() {
		message = "";
		error = "";

		// Basic input validation
		if (
			!itemcode.trim() ||
			!itemname.trim() ||
			!itemdesc.trim() ||
			!itemused.trim() ||
			!qty ||
			isNaN(Number(qty)) ||
			!dtpur ||
			!expiry ||
			!avgcost ||
			isNaN(Number(avgcost)) ||
			!minstock ||
			isNaN(Number(minstock)) ||
			!maxstock ||
			isNaN(Number(maxstock)) ||
			!latestprice ||
			isNaN(Number(latestprice)) ||
			!lowest ||
			isNaN(Number(lowest)) ||
			!highest ||
			isNaN(Number(highest))
		) {
			error = "Please fill in all fields with valid data.";
			return;
		}

		// Date Validation (using dd/mm/yyyy)
		if (!isValidDate(dtpur)) {
			error = "Invalid Purchase Date. Use dd/mm/yyyy format.";
			return;
		}
		if (!isValidDate(expiry)) {
			error = "Invalid Expiry Date. Use dd/mm/yyyy format.";
			return;
		}

		// Date comparison
		const purchaseDate = parseDate(dtpur);
		const expiryDate = parseDate(expiry);
		if (expiryDate <= purchaseDate) {
			error = "Expiry Date must be after Purchase Date.";
			return;
		}

		try {
			// Convert UI dates to API-friendly format
			const response = await axios.post("http://localhost:5000/api/add-item", {
				itemcode,
				itemname,
				itemdesc,
				itemused,
				qty: Number(qty),
				dtpur: convertToApiDate(dtpur),
				expiry: convertToApiDate(expiry),
				avgcost: Number(avgcost),
				minstock: Number(minstock),
				maxstock: Number(maxstock),
				latestprice: Number(latestprice),
				lowest: Number(lowest),
				highest: Number(highest),
			});

			message = "✅ Item added successfully!";
			resetForm();
		} catch (err) {
			console.error("API Error:", err);
			if (err.response) {
				error = err.response.data.error || `Server Error: ${err.response.status}`;
			} else if (err.request) {
				error = "No response received from server. Check network.";
			} else {
				error = `Request Error: ${err.message}`;
			}
		}
	}

	function resetForm() {
		itemcode = "";
		itemname = "";
		itemdesc = "";
		itemused = "";
		qty = "";
		dtpur = "";
		expiry = "";
		avgcost = "";
		minstock = "";
		maxstock = "";
		latestprice = "";
		lowest = "";
		highest = "";
		// Clear Flatpickr instances
		if (dtpurPicker) {
			dtpurPicker.clear();
		}
		if (expiryPicker) {
			expiryPicker.clear();
		}
	}
</script>

<Navigation />

<div class="form-container">
	<h2>Add New Item</h2>

	{#if message}
		<p class="message success">{message}</p>
	{/if}
	{#if error}
		<p class="message error">{error}</p>
	{/if}

	<form on:submit|preventDefault={addItem}>
		<div class="grid">
			<div class="input-group">
				<label for="itemcode">Item Code <span class="required">*</span></label>
				<input
					id="itemcode"
					type="text"
					bind:value={itemcode}
					required
					placeholder="Enter item code"
				/>
			</div>

			<div class="input-group">
				<label for="itemname">Item Name <span class="required">*</span></label>
				<input
					id="itemname"
					type="text"
					bind:value={itemname}
					required
					placeholder="Enter item name"
				/>
			</div>

			<div class="input-group">
				<label for="itemdesc">Item Description <span class="required">*</span></label>
				<input
					id="itemdesc"
					type="text"
					bind:value={itemdesc}
					required
					placeholder="Enter item description"
				/>
			</div>

			<div class="input-group">
				<label for="itemused">Usage Type <span class="required">*</span></label>
				<input
					id="itemused"
					type="text"
					bind:value={itemused}
					required
					placeholder="Enter usage type (e.g., Raw, Finished)"
				/>
			</div>

			<div class="input-group">
				<label for="qty">Quantity <span class="required">*</span></label>
				<input
					id="qty"
					type="number"
					bind:value={qty}
					required
					placeholder="Enter quantity"
					min="0"
				/>
			</div>

			<!-- Use Flatpickr for date inputs -->
			<div class="input-group">
				<label for="dtpur">Purchase Date <span class="required">*</span></label>
				<input
					id="dtpur"
					type="text"
					placeholder="dd/mm/yyyy"
					use:initDatePicker={true}
					readonly
				/>
				{#if dtpur}
					<p class="date-display">Selected Date: {dtpur}</p>
				{/if}
			</div>

			<div class="input-group">
				<label for="expiry">Expiry Date <span class="required">*</span></label>
				<input
					id="expiry"
					type="text"
					placeholder="dd/mm/yyyy"
					use:initDatePicker={false}
					readonly
				/>
				{#if expiry}
					<p class="date-display">Selected Date: {expiry}</p>
				{/if}
			</div>

			<div class="input-group">
				<label for="avgcost">Average Cost <span class="required">*</span></label>
				<input
					id="avgcost"
					type="number"
					bind:value={avgcost}
					required
					placeholder="Enter average cost"
					min="0"
				/>
			</div>

			<div class="input-group">
				<label for="minstock">Min Stock <span class="required">*</span></label>
				<input
					id="minstock"
					type="number"
					bind:value={minstock}
					placeholder="Enter minimum stock level"
					min="0"
					required
				/>
			</div>

			<div class="input-group">
				<label for="maxstock">Max Stock <span class="required">*</span></label>
				<input
					id="maxstock"
					type="number"
					bind:value={maxstock}
					placeholder="Enter maximum stock level"
					min="0"
					required
				/>
			</div>

			<div class="input-group">
				<label for="latestprice">Latest Price <span class="required">*</span></label>
				<input
					id="latestprice"
					type="number"
					bind:value={latestprice}
					placeholder="Enter latest price"
					min="0"
					required
				/>
			</div>

			<div class="input-group">
				<label for="lowest">Lowest Price <span class="required">*</span></label>
				<input
					id="lowest"
					type="number"
					bind:value={lowest}
					placeholder="Enter lowest price"
					min="0"
					required
				/>
			</div>

			<div class="input-group">
				<label for="highest">Highest Price <span class="required">*</span></label>
				<input
					id="highest"
					type="number"
					bind:value={highest}
					placeholder="Enter highest price"
					min="0"
					required
				/>
			</div>
		</div>

		<button type="submit" class="submit-btn">Add Item</button>
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

	.required {
		color: red;
	}

	input {
		padding: 0.8rem;
		border-radius: 8px;
		border: 1px solid #dcdde1;
		font-size: 1rem;
		transition: all 0.3s ease;
		background-color: #fff;
	}

	/* Style for Flatpickr input */
	.flatpickr-input[readonly] {
		background-color: #fff; /* Ensure background is white even when readonly */
		cursor: pointer; /* Change cursor to indicate it's clickable */
	}

	.date-display {
		font-size: 0.9rem;
		color: #777;
		margin-top: 0.25rem;
	}

	input::placeholder {
		color: #999;
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
			padding: 1.5rem;
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>