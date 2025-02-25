<script>
    import Navigation from "./lib/Navigation.svelte";
    import axios from "axios";
    import { onMount } from "svelte";
    import * as XLSX from "xlsx";
    import { writable } from "svelte/store";

    // Stores
    const suppliers = writable([]);
    const loading = writable(false);
    const error = writable("");
    const editingSupplier = writable(null); // Holds the phone of the supplier being edited
    const editedValues = writable({}); // Holds temporary edited values
    const modalText = writable({ field: null, text: null }); // Holds the text and field for the modal

    // Fetch suppliers
    async function fetchSuppliers() {
        $error = "";
        $loading = true;
        try {
            const response = await axios.get("http://localhost:5000/api/suppliers");
            $suppliers = response.data;
        } catch (err) {
            $error = "Failed to fetch suppliers: " + err.message;
        } finally {
            $loading = false;
        }
    }

    onMount(fetchSuppliers);

    // Edit functions
    function startEdit(supplier) {
        $editingSupplier = supplier.phone;
        $editedValues = { ...supplier };
    }

    function cancelEdit() {
        $editingSupplier = null;
        $editedValues = {};
    }

    async function saveEdit(supplier) {
        $loading = true;
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/update-supplier/${supplier.phone}`,
                $editedValues
            );
            if (response.status === 200) {
                $suppliers = $suppliers.map((s) =>
                    s.phone === supplier.phone ? { ...s, ...$editedValues } : s
                );
                $editingSupplier = null;
                $editedValues = {};
                $error = "";
            } else {
                $error = `Update failed: ${response.data.error || "Unknown error"}`;
            }
        } catch (err) {
            $error = "Update error: " + err.message;
        } finally {
            $loading = false;
        }
    }

    async function deleteSupplier(supplier) {
        if (!confirm(`Delete supplier ${supplier.supname}?`)) return;
        $loading = true;
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/delete-supplier/${supplier.phone}`
            );
            if (response.status === 200) {
                $suppliers = $suppliers.filter((s) => s.phone !== supplier.phone);
                $error = "";
            } else {
                $error = `Delete failed: ${response.data.error || "Unknown error"}`;
            }
        } catch (err) {
            $error = "Delete error: " + err.message;
        } finally {
            $loading = false;
        }
    }

    function handleInputChange(event, field) {
        $editedValues = { ...$editedValues, [field]: event.target.value };
    }

    function navigateToAddSuppliers() {
        window.location.href = "/suppliers/add-suppliers";
    }

    // Excel download
    function downloadAsExcel() {
        try {
            const worksheet = XLSX.utils.json_to_sheet($suppliers);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Suppliers.xlsx";
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Excel export failed:", err);
            $error = "Excel export failed: " + err.message;
        }
    }

    // Modal functions
    function openModal(text, field) {
        $modalText = { text, field };
    }

    function closeModal() {
        $modalText = { field: null, text: null };
    }
</script>

<Navigation />

<div class="container" style="height: 75vh; display: flex; flex-direction: column;">
    <div class="header">
        <h2>Suppliers</h2>
        <button class="btn-download" on:click={downloadAsExcel}>
            <i class="fas fa-file-excel"></i> Download Excel
        </button>
    </div>

    {#if $error}
        <div class="alert alert-error">{$error}</div>
    {:else if $loading}
        <div class="alert alert-info">Loading...</div>
    {:else if $suppliers.length === 0}
        <div class="alert alert-warning">No suppliers found.</div>
    {:else}
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th class="sticky-col first-col">Phone</th>
                        <th class="sticky-col second-col">Item Code</th>
                        <th>Supplier Name</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Notes</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $suppliers as supplier (supplier.phone)}
                        <tr>
                            <td class="sticky-col first-col" on:click={() => openModal(supplier.phone, 'Phone')}>{supplier.phone}</td>
                            <td class="sticky-col second-col" on:click={() => openModal(supplier.itemcode, 'Item Code')}>{supplier.itemcode}</td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <input
                                        type="text"
                                        value={$editedValues.supname}
                                        on:input={(e) => handleInputChange(e, "supname")}
                                    />
                                {:else}
                                    <span on:click={() => openModal(supplier.supname, 'Supplier Name')}>{supplier.supname}</span>
                                {/if}
                            </td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <input
                                        type="text"
                                        value={$editedValues.contactperson}
                                        on:input={(e) => handleInputChange(e, "contactperson")}
                                    />
                                {:else}
                                    <span on:click={() => openModal(supplier.contactperson, 'Contact Person')}>{supplier.contactperson}</span>
                                {/if}
                            </td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <input
                                        type="email"
                                        value={$editedValues.email}
                                        on:input={(e) => handleInputChange(e, "email")}
                                    />
                                {:else}
                                    <span on:click={() => openModal(supplier.email, 'Email')}>{supplier.email}</span>
                                {/if}
                            </td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <textarea
                                        value={$editedValues.address}
                                        on:input={(e) => handleInputChange(e, "address")}
                                    ></textarea>
                                {:else}
                                    <span on:click={() => openModal(supplier.address, 'Address')}>{supplier.address}</span>
                                {/if}
                            </td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <textarea
                                        value={$editedValues.notes}
                                        on:input={(e) => handleInputChange(e, "notes")}
                                    ></textarea>
                                {:else}
                                    <span on:click={() => openModal(supplier.notes, 'Notes')}>{supplier.notes}</span>
                                {/if}
                            </td>
                            <td>
                                {#if $editingSupplier === supplier.phone}
                                    <button class="btn btn-save" on:click={() => saveEdit(supplier)}>
                                        Save
                                    </button>
                                    <button class="btn btn-cancel" on:click={cancelEdit}>
                                        Cancel
                                    </button>
                                {:else}
                                    <button
                                        class="btn btn-edit"
                                        on:click={() => startEdit(supplier)}
                                    >
                                        <i class="fas fa-edit"></i>
                                    </button>
                                {/if}
                            </td>
                            <td>
                                <button
                                    class="btn btn-delete"
                                    on:click={() => deleteSupplier(supplier)}
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
    <div style="margin-top: 1rem; text-align: center;">
        <button class="btn btn-add" on:click={navigateToAddSuppliers}>
            Add Suppliers
        </button>
    </div>

    {#if $modalText.text}
        <div class="modal">
            <div class="modal-content">
                <span class="close" on:click={closeModal}>×</span>
                <h4>{$modalText.field}:</h4>
                <p>{$modalText.text}</p>
            </div>
        </div>
    {/if}
</div>

<style>
    /* General Styles */
    :global(body) {
        font-family: "Inter", sans-serif;
        background-color: #f5f7fb;
        color: #374151;
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 1600px;
        margin: 2rem auto;
        padding: 1rem;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    /* Header */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .header h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
    }

    /* Alerts */
    .alert {
        padding: 0.75rem 1.25rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        text-align: center;
    }
    .alert-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .alert-info {
        background-color: #cce5ff;
        color: #004085;
        border: 1px solid #b8daff;
    }
    .alert-warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
    }

    /* Table Styles */
    .table-responsive {
        overflow-x: auto;
        width: 100%;
    }

    .table {
        width: 100%;
        min-width: 1500px;
        border-collapse: collapse;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
    }

    .table th,
    .table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        white-space: nowrap;
    }

    .table thead th {
        background-color: #edf2f7;
        color: #4a5568;
        font-weight: 600;
        position: sticky;
        top: 0;
        border-top: 1px solid #e2e8f0;
    }

    .table tbody tr:nth-child(even) {
        background-color: #f9fafb;
    }
    .table tbody tr:hover {
        background-color: #f0f4f8;
    }

    /* Sticky Columns */
    .sticky-col {
        position: sticky;
        background-color: white;
        z-index: 1;
        border-right: 1px solid #e2e8f0;
    }
    .first-col {
        left: 0;
        min-width: 100px;
    }
    .second-col {
        left: 100px;
        min-width: 120px;
    }
    .table thead th.sticky-col {
        z-index: 2;
    }

    /* Description Cell */
    .description-cell {
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 250px;
        cursor: pointer;
    }

    .description-text {
        display: block;
        padding-right: 15px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Buttons */
    .btn {
        padding: 0.5rem 0.75rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease, transform 0.1s ease;
    }

    .btn-save,
    .btn-cancel {
        margin-right: 0.5rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
    }

    .btn-edit {
        background-color: #60a5fa;
        color: white;
        margin-right: 0.25rem;
    }

    .btn-delete {
        background-color: #f87171;
        color: white;
    }
    .btn-save {
        background-color: #28a745;
        color: white;
    }
    .btn-cancel {
        background-color: #dc3545;
        color: white;
    }

    .btn:hover {
        transform: translateY(-1px);
    }

    .btn-edit:hover {
        background-color: #3b82f6;
    }

    .btn-delete:hover {
        background-color: #ef4444;
    }
    .btn-save:hover {
        background-color: #218838;
    }

    .btn-cancel:hover {
        background-color: #c82333;
    }

    /* Download Button */
    .btn-download {
        background-color: #34d399;
        color: white;
        border: none;
        border-radius: 0.375rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        transition: background-color 0.2s ease;
    }
    .btn-download:hover {
        background-color: #10b981;
    }

    /* Add Suppliers Button */
    .btn-add {
        background-color: #4299e1;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease;
    }
    .btn-add:hover {
        background-color: #3182ce;
    }

    /* Input fields within table */
    .table input[type="text"],
    .table input[type="email"],
    .table textarea {
        width: 100%;
        padding: 0.25rem;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        box-sizing: border-box;
        font-size: 0.875rem;
    }

    .table textarea {
        resize: vertical;
        min-height: 60px;
    }

    /* The Modal (background) */
    .modal {
        display: block; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 100; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
    }

    /* Modal Content/Box */
    .modal-content {
        position: relative;
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        animation-name: animatetop;
        animation-duration: 0.4s;
    }

    /* Add Animation */
    @keyframes animatetop {
        from {
            top: -300px;
            opacity: 0;
        }
        to {
            top: 15%;
            opacity: 1;
        }
    }

    /* The Close Button */
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }

    .modal-content h4 {
        margin-top: 0;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .modal-content p {
        margin-bottom: 0;
        white-space: pre-line;
        word-wrap: break-word;
    }
	/* Add cursor style to table data */
	.table td {
		cursor: pointer;
	}
</style>