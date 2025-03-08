document.addEventListener("DOMContentLoaded", function () {
    const classificationSelect = document.getElementById("classificationList");
    const inventoryTable = document.getElementById("inventoryDisplay");

    async function fetchInventory(classificationId) {
        try {
          const response = await fetch(`/inv/getInventory/${classificationId}`); 
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          buildInventoryList(data); 
        } catch (error) {
          console.error("Error fetching inventory:", error);
          inventoryTable.innerHTML = `<tbody><tr><td colspan="5">Error loading inventory data.</td></tr></tbody>`;
        }
      }

    classificationSelect.addEventListener("change", function () {
        const classificationId = this.value;
        if (classificationId) {
            fetchInventory(classificationId);
        } else {
            inventoryTable.innerHTML = ""; 
        }
    });

    if (classificationSelect.value) {
        fetchInventory(classificationSelect.value);
    }
});

function buildInventoryList(data) { 
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Year</th><th>Make</th><th>Model</th><th>Price</th><th>Actions</th></tr>'; 
    dataTable += '</thead>'; 
    dataTable += '<tbody>'; 
    if (data.length === 0) {
      dataTable += `<tr><td colspan="5">No inventory items found for this classification.</td></tr>`;
    } else {
      data.forEach(function (element) { 
        console.log(element.inv_id + ", " + element.inv_model); 
        dataTable += `<tr>`;
        dataTable += `<td>${element.inv_year}</td>`;
        dataTable += `<td>${element.inv_make}</td>`;
        dataTable += `<td>${element.inv_model}</td>`;
        dataTable += `<td>$${parseFloat(element.inv_price).toFixed(2)}</td>`;
        dataTable += `<td>`;
        dataTable += `<a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a> | `;
        dataTable += `<a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a>`;
        dataTable += `</td></tr>`;
      }); 
    }
    dataTable += '</tbody>'; 
    inventoryDisplay.innerHTML = dataTable; 
  }