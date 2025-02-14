<!-- This is the main navigation menu -->
<!-- Home route -->
<!-- Navigates to the main dashboard -->
<script>
  import Navbar from "./lib/Navbar.svelte"; 
</script>

<Navbar/>

<div class="form">
  <h3>Remove Items</h3>

  <div class="container">
    <!-- Remove Items Route -->
    <!-- Navigates to the Remove Items page -->
    <a href="/remove-items" class="action-link">
      <button class="action-btn primary">
        <span class="material-icons">1.</span>
        Remove Items
      </button>
    </a>

    <!-- Remove Suppliers Route -->
    <!-- Navigates to the Remove Suppliers page -->
    <a href="/remove-suppliers" class="action-link">
      <button class="action-btn secondary">
        <span class="material-icons">2.</span>
        Remove Suppliers
      </button>
    </a>

    <!-- Remove Category Route -->
    <!-- Navigates to the Remove Category page -->
    <a href="/remove-customers" class="action-link">
      <button class="action-btn tertiary">
        <span class="material-icons">3.</span>
        Remove Customers
      </button>
    </a>

    <!-- Remove Inwards Route -->
    <!-- Navigates to the Remove Inwards page -->
    <a href="/remove-inwards" class="action-link">
      <button class="action-btn quaternary">
        <span class="material-icons">4.</span>
        Remove Inwards
      </button>
    </a>

    <!-- Remove Outwards Route -->
    <!-- Navigates to the Remove Outwards page -->
    <a href="/remove-outwards" class="action-link">
      <button class="action-btn quinary">
        <span class="material-icons">5.</span>
        Remove Outwards
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
    border-bottom: 2px solid #c0392b;
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
    background: #c0392b;
    color: white;
  }

  .primary:hover {
    background: #a93226;
    box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4);
  }

  .secondary {
    background: #d35400;
    color: white;
  }

  .secondary:hover {
    background: #e67e22;
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4);
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
    background: #27ae60;
    color: white;
  }

  .quaternary:hover {
    background: #2ecc71;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  }

  .quinary {
    background: #3498db;
    color: white;
  }

  .quinary:hover {
    background: #2980b9;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
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
