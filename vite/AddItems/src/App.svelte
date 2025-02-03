<!-- This is the main navigation menu -->
<!-- Home route -->
<!-- Navigates to the main dashboard -->
<script>
  import Navbar from "./lib/Navbar.svelte"; 
</script>

<Navbar/>

<div class="form">
  <h3>Inventory Management</h3>

  <div class="container">
    <!-- Add Items Route -->
    <!-- Navigates to the Add Items page -->
    <a href="/add-items" class="action-link">
      <button class="action-btn primary">
        <span class="material-icons">1.</span>
        Add Items
      </button>
    </a>

    <!-- Add Suppliers Route -->
    <!-- Navigates to the Add Suppliers page -->
    <a href="/add-suppliers" class="action-link">
      <button class="action-btn secondary">
        <span class="material-icons">2.</span>
        Add Suppliers
      </button>
    </a>

    <!-- Add Category Route -->
    <!-- Navigates to the Add Category page -->
    <a href="/add-category" class="action-link">
      <button class="action-btn tertiary">
        <span class="material-icons">3.</span>
        Add Category
      </button>
    </a>

    <!-- Inwards Route -->
    <!-- Navigates to the Inwards page for stock receiving -->
    <a href="/inwards" class="action-link">
      <button class="action-btn quaternary">
        <span class="material-icons">4.</span>
        Inwards
      </button>
    </a>

    <!-- Outwards Route -->
    <!-- Navigates to the Outwards page for stock dispatch -->
    <a href="/outwards" class="action-link">
      <button class="action-btn quinary">
        <span class="material-icons">5.</span>
        Outwards
      </button>
    </a>
  </div>
</div>

<style>
  .form {
    width: 90%;
    max-width: 800px;
    min-height: 60vh;
    margin: 5% auto;
    padding: 2rem;
    border-radius: 16px;
    background: #f8f9fa;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h3 {
    font-weight: 500;
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 2rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #3498db;
  }

  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  .action-link {
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .action-link:hover {
    transform: translateY(-3px);
  }

  .action-btn {
    width: 100%;
    padding: 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
  }

  .action-btn .material-icons {
    font-size: 1.4rem;
  }

  .primary {
    background: #3498db;
    color: white;
  }

  .primary:hover {
    background: #2980b9;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }

  .secondary {
    background: #2ecc71;
    color: white;
  }

  .secondary:hover {
    background: #27ae60;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  }

  .tertiary {
    background: #9b59b6;
    color: white;
  }

  .tertiary:hover {
    background: #8e44ad;
    box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
  }

  .quaternary {
    background: #e67e22;
    color: white;
  }

  .quaternary:hover {
    background: #d35400;
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4);
  }

  .quinary {
    background: #c0392b;
    color: white;
  }

  .quinary:hover {
    background: #a93226;
    box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4);
  }

  @media (max-width: 768px) {
    .form {
      width: 95%;
      margin: 10% auto;
    }
    
    .container {
      grid-template-columns: 1fr;
    }
    
    h3 {
      font-size: 1.75rem;
    }
  }
</style>
